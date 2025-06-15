import { CartData } from "./cart-data.js";
import { cartBytesToSfxData, sfxDataToRuntimeBytes } from "./sfx.js";
import { cartBytesToMusicData, musicDataToRuntimeBytes } from "./music.js";

class StringReader {
    #string;
    #index = 0;

    get index(): number { return this.#index; }

    constructor(string: string) {
        this.#string = string;
    }

    isAtEnd(): boolean {
        return this.#index == this.#string.length;
    }

    readChar(): string {
        if (this.#index == this.#string.length)
            return '';

        const start = this.#index;
        const end = this.#index + 1;
        
        this.#index++;

        return this.#string.substring(start, end);
    }

    skip(distance: number = 1): void {
        this.#index = Math.min(this.#index + distance, this.#string.length);
    }

    peek(length: number = 1): string {
        const start = this.#index;
        const end = this.#index + length;
        return this.#string.substring(start, end);
    }
}

function parseExtendedHex(char: string): number {
    switch (char) {
        case '0': return 0x0;
        case '1': return 0x1;
        case '2': return 0x2;
        case '3': return 0x3;
        case '4': return 0x4;
        case '5': return 0x5;
        case '6': return 0x6;
        case '7': return 0x7;
        case '8': return 0x8;
        case '9': return 0x9;
        case 'a': return 0xa;
        case 'b': return 0xb;
        case 'c': return 0xc;
        case 'd': return 0xd;
        case 'e': return 0xe;
        case 'f': return 0xf;
        case 'g': return 0x0 + 0x80;
        case 'h': return 0x1 + 0x80;
        case 'i': return 0x2 + 0x80;
        case 'j': return 0x3 + 0x80;
        case 'k': return 0x4 + 0x80;
        case 'l': return 0x5 + 0x80;
        case 'm': return 0x6 + 0x80;
        case 'n': return 0x7 + 0x80;
        case 'o': return 0x8 + 0x80;
        case 'p': return 0x9 + 0x80;
        case 'q': return 0xa + 0x80;
        case 'r': return 0xb + 0x80;
        case 's': return 0xc + 0x80;
        case 't': return 0xd + 0x80;
        case 'u': return 0xe + 0x80;
        case 'v': return 0xf + 0x80;
        default: return 0x00;
    }
}

function isDecimal(char: string): boolean {
    return /[0-9]/.test(char);
}

function isHexadecimal(char: string): boolean {
    return /[0-9a-fA-F]/.test(char);
}

function isExtendedHexadecimal(char: string): boolean {
    return /[0-9a-vA-V]/.test(char);
}

function isWhitespace(char: string): boolean {
    return /^\s$/.test(char);
}

function isAlphanumeric(char: string): boolean {
    return /^[0-9a-zA-Z]$/.test(char);
}

function expect(reader: StringReader, expected: string, contextMessage?: string): void {
    const actual = reader.peek(expected.length);

    if (actual !== expected) {
        let errorMessage;
        if (contextMessage !== undefined)
            errorMessage = `Expected ${expected}, but found ${actual}`;
        else
            errorMessage = `${contextMessage}: Expected ${expected}, but found ${actual}`;

        throw new Error(errorMessage);
    }
}

function expectHexadecimal(reader: StringReader) {
    const nextChar = reader.peek();
    if (!isHexadecimal(nextChar))
        throw new Error(`Expected a hexadecimal number, but found "${nextChar}"`);
}

function expectExtendedHexadecimal(reader: StringReader) {
    const nextChar = reader.peek();
    if (!isExtendedHexadecimal(nextChar))
        throw new Error(`Expected an extended hexadecimal number, but found "${nextChar}"`);
}

function expectDecimal(reader: StringReader) {
    const nextChar = reader.peek();
    if (!isDecimal(nextChar))
        throw new Error(`Expected a decimal number, but found "${nextChar}"`);
}

function skipVerbatim(reader: StringReader, expected: string, contextMessage?: string) {
    expect(reader, expected, contextMessage);
    reader.skip(expected.length);
}

function skipWhitespace(reader: StringReader): void {
    while (isWhitespace(reader.peek())) {
        reader.skip();
    }
}

function skipHeader(reader: StringReader): void {
    skipVerbatim(reader, 'pico-8 cartridge // http://www.pico-8.com\n', 'Unknown header');
}

function readVersion(reader: StringReader): number {
    skipVerbatim(reader, 'version ');
    return readDecimal(reader);
}

function readSectionLabel(reader: StringReader): string {
    skipVerbatim(reader, '__', 'Section label start');
    
    let sectionName = '';
    while (isAlphanumeric(reader.peek())) {
        sectionName += reader.readChar();
    }
    
    skipVerbatim(reader, '__', 'Section label end');
    return `__${sectionName}__`;
}

function transposeByte(byte: number): number {
    return (byte & 0x0f) << 4 | (byte & 0xf0) >> 4;
}

function readDataSection(reader: StringReader, transposeBytes: boolean = false): Uint8Array {
    let bytes = [] as number[];

    do {
        while (isHexadecimal(reader.peek()) && !reader.isAtEnd()) {
            const value = readHexadecimal(reader, 2);
            bytes.push(transposeBytes ? transposeByte(value) : value);
        }

        skipWhitespace(reader);
    } while (isHexadecimal(reader.peek()));

    return new Uint8Array(bytes);
}

function newSectionEncountered(reader: StringReader): boolean {
    const str = reader.peek(10);
    return /^\n__(lua|gfx|gff|label|map|sfx|music)__(\s|$)/.test(str);
}

function readLuaSection(reader: StringReader): string {
    let luaCode = '';

    while (!reader.isAtEnd()) {
        luaCode += reader.readChar();

        if (reader.peek(1) === '\n') {
            if (newSectionEncountered(reader))
                break;
        }
    }

    skipWhitespace(reader);

    return luaCode;
}

function readGfxSection(reader: StringReader): Uint8Array {
    return readDataSection(reader, true);
}

function readLabelSection(reader: StringReader): Uint8Array {
    let bytes = [] as number[];

    do {
        while (isExtendedHexadecimal(reader.peek()) && !reader.isAtEnd()) {
            bytes.push(readExtendedHexadecimal(reader, 1));
        }

        skipWhitespace(reader);
    } while (isExtendedHexadecimal(reader.peek()));

    return new Uint8Array(bytes);
}

function readGffSection(reader: StringReader): Uint8Array {
    return readDataSection(reader);
}

function readMapSection(reader: StringReader): Uint8Array {
    return readDataSection(reader);
}

function readSfxSection(reader: StringReader): Uint8Array {
    const cartSfxBytes = readDataSection(reader);
    const sfxData = cartBytesToSfxData(cartSfxBytes);
    return sfxDataToRuntimeBytes(sfxData);
}

function readMusicSection(reader: StringReader): Uint8Array {
    let bytes = [] as number[];

    do {
        bytes.push(readHexadecimal(reader, 2));
        
        skipVerbatim(reader, ' ');

        bytes.push(readHexadecimal(reader, 2));
        bytes.push(readHexadecimal(reader, 2));
        bytes.push(readHexadecimal(reader, 2));
        bytes.push(readHexadecimal(reader, 2));

        skipWhitespace(reader);

    } while (isHexadecimal(reader.peek()));

    skipWhitespace(reader);

    const cartMusicBytes = new Uint8Array(bytes);
    const musicData = cartBytesToMusicData(cartMusicBytes);
    return musicDataToRuntimeBytes(musicData);
}

function readDecimal(reader: StringReader): number {
    expectDecimal(reader);

    let numString = '';
    while(isDecimal(reader.peek())) {
        numString += reader.readChar();
    }
    
    return parseInt(numString);
}

function readHexadecimal(reader: StringReader, numberOfDigits: number): number {
    let value = 0;
    for (let i = 0; i < numberOfDigits; i++) {
        expectHexadecimal(reader);
        const hexChar = reader.readChar();
        value *= 0x10;
        value += parseExtendedHex(hexChar);
    }

    return value;
}

function readExtendedHexadecimal(reader: StringReader, numberOfDigits: number): number {
    let value = 0;
    for (let i = 0; i < numberOfDigits; i++) {
        expectExtendedHexadecimal(reader);
        const hexChar = reader.readChar();
        value *= 0x10;
        value += parseExtendedHex(hexChar);
    }

    return value;
}

export function parseCart(cartString: string): CartData {
    const reader = new StringReader(cartString);
    const cartData = new CartData();

    skipHeader(reader);
    cartData.version = readVersion(reader);

    skipWhitespace(reader);

    while (!reader.isAtEnd()) {
        const sectionLabel = readSectionLabel(reader);
        
        skipWhitespace(reader)

        switch (sectionLabel) {
            case '__lua__':
                cartData.lua = readLuaSection(reader);
                break;
            case '__gfx__':
                cartData.gfx.set(readGfxSection(reader));
                break;
            case '__label__':
                cartData.label.set(readLabelSection(reader));
                break;
            case '__gff__':
                cartData.gff.set(readGffSection(reader));
                break;
            case '__map__':
                cartData.map.set(readMapSection(reader));
                break;
            case '__sfx__':
                cartData.sfx.set(readSfxSection(reader));
                break;
            case '__music__':
                cartData.music.set(readMusicSection(reader));
                break;
        }
    }

    return cartData;
}
