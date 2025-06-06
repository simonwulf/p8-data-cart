import { CartData } from "./cart-data.js";
import { runtimeBytesToSfxData, sfxDataToCartBytes } from "./sfx.js";

function writeHeader(): string {
    return 'pico-8 cartridge // http://www.pico-8.com';
}

function writeVersion(versionNumber: number): string {
    return 'version ' + versionNumber;
}

function writeNybble(value: number): string {
    switch (value) {
        case 0x0: return '0';
        case 0x1: return '1';
        case 0x2: return '2';
        case 0x3: return '3';
        case 0x4: return '4';
        case 0x5: return '5';
        case 0x6: return '6';
        case 0x7: return '7';
        case 0x8: return '8';
        case 0x9: return '9';
        case 0xa: return 'a';
        case 0xb: return 'b';
        case 0xc: return 'c';
        case 0xd: return 'd';
        case 0xe: return 'e';
        case 0xf: return 'f';
        default:
            throw new Error('Cannot write value as a nybble: ' + value);
    }
}

function writeByteExtended(value: number): string {
    switch (value) {
        case 0x0: return '0';
        case 0x1: return '1';
        case 0x2: return '2';
        case 0x3: return '3';
        case 0x4: return '4';
        case 0x5: return '5';
        case 0x6: return '6';
        case 0x7: return '7';
        case 0x8: return '8';
        case 0x9: return '9';
        case 0xa: return 'a';
        case 0xb: return 'b';
        case 0xc: return 'c';
        case 0xd: return 'd';
        case 0xe: return 'e';
        case 0xf: return 'f';
        case 0x80: return 'g';
        case 0x81: return 'h';
        case 0x82: return 'i';
        case 0x83: return 'j';
        case 0x84: return 'k';
        case 0x85: return 'l';
        case 0x86: return 'm';
        case 0x87: return 'n';
        case 0x88: return 'o';
        case 0x89: return 'p';
        case 0x8a: return 'q';
        case 0x8b: return 'r';
        case 0x8c: return 's';
        case 0x8d: return 't';
        case 0x8e: return 'u';
        case 0x8f: return 'v';
        default:
            throw new Error('Cannot write value as extended hexadecimal number: ' + value);
    }
}

function writeByte(value: number): string {
    const integerValue = Math.floor(value);
    return writeNybble(integerValue >> 4) + writeNybble(integerValue & 0xf);
}

function transposeByte(value: number): number {
    return (value & 0xf0) >> 4 | (value & 0x0f) << 4;
}

function writeDataSection(bytes: ArrayLike<number>, bytesPerLine: number, transposeBytes: boolean = false): string {
    let sectionString = '';

    for (let i = 0; i < bytes.length; i++) {
        const byteValue = transposeBytes ? transposeByte(bytes[i]) : bytes[i];
        
        if (i > 0 && i % bytesPerLine === 0)
            sectionString += '\n';

        sectionString += writeByte(byteValue);
    }
    
    return sectionString;
}

function writeDataSectionExtended(bytes: ArrayLike<number>, bytesPerLine: number): string {
    let sectionString = '';

    for (let i = 0; i < bytes.length; i++) {
        const byteValue = bytes[i];

        if (i > 0 && i % bytesPerLine === 0)
            sectionString += '\n';
        
        sectionString += writeByteExtended(byteValue);
    }
    
    return sectionString;
}

function writeLuaSection(luaCode: string): string {
    return '__lua__\n' + luaCode;
}

function writeGfxSection(bytes: ArrayLike<number>): string {
    return '__gfx__\n' + writeDataSection(bytes, 64, true);
}

function writeLabelSection(bytes: ArrayLike<number>): string {
    return '__label__\n' + writeDataSectionExtended(bytes, 128);
}

function writeGffSection(bytes: ArrayLike<number>): string {
    return '__gff__\n' + writeDataSection(bytes, 128);
}

function writeMapSection(bytes: ArrayLike<number>): string {
    return '__map__\n' + writeDataSection(bytes, 128);
}

function writeSfxSection(bytes: ArrayLike<number>): string {
    const sfxData = runtimeBytesToSfxData(new Uint8Array(bytes));
    const cartBytes = sfxDataToCartBytes(sfxData);
    return '__sfx__\n' + writeDataSection(cartBytes, 84);
}

function writeMusicSection(bytes: ArrayLike<number>): string {
    if (bytes.length % 5 !== 0)
        throw Error('Music data length must be a multiple of 5');

    let musicSectionString = '__music__';

    for (let i = 0; i < bytes.length; i += 5) {
        musicSectionString += '\n';
        musicSectionString += writeByte(bytes[i + 0]);
        musicSectionString += ' ';
        musicSectionString += writeByte(bytes[i + 1]);
        musicSectionString += writeByte(bytes[i + 2]);
        musicSectionString += writeByte(bytes[i + 3]);
        musicSectionString += writeByte(bytes[i + 4]);
    }
    
    return musicSectionString;
}

export function writeCart(cartData: CartData): string {
    let cartContents = '';

    cartContents += writeHeader() + '\n';
    cartContents += writeVersion(39) + '\n';

    if (cartData.lua !== undefined)
        cartContents += writeLuaSection(cartData.lua) + '\n';

    if (cartData.gfx !== undefined)
        cartContents += writeGfxSection(cartData.gfx) + '\n';
    
    if (cartData.label !== undefined)
        cartContents += writeLabelSection(cartData.label) + '\n\n';

    if (cartData.gff !== undefined)
        cartContents += writeGffSection(cartData.gff) + '\n';

    if (cartData.map !== undefined)
        cartContents += writeMapSection(cartData.map) + '\n';

    if (cartData.sfx !== undefined)
        cartContents += writeSfxSection(cartData.sfx) + '\n';

    if (cartData.music !== undefined)
        cartContents += writeMusicSection(cartData.music) + '\n';

    return cartContents;
}
