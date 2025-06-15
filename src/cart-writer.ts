import { CartData } from "./cart-data.js";
import { musicDataToCartBytes, runtimeBytesToMusicData } from "./music.js";
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

function trimEmptyLines(bytes: Uint8Array, bytesPerLine: number): Uint8Array {
    let zeroTrailIndex = -1;
    for (let i = bytes.length - 1; i >= 0; i--) {
        if (bytes[i] !== 0) {
            zeroTrailIndex = i + 1;
            break;
        }
    }

    if (zeroTrailIndex === -1)
        return new Uint8Array(0);

    const stopIndex = Math.ceil(zeroTrailIndex / bytesPerLine) * bytesPerLine;
    return bytes.slice(0, stopIndex);
}

function writeDataSection(bytes: Uint8Array, bytesPerLine: number, transposeBytes: boolean = false): string {
    bytes = trimEmptyLines(bytes, bytesPerLine);
    
    let sectionString = '';
    for (let i = 0; i < bytes.length; i++) {
        const byteValue = transposeBytes ? transposeByte(bytes[i]) : bytes[i];
        
        if (i > 0 && i % bytesPerLine === 0)
            sectionString += '\n';

        sectionString += writeByte(byteValue);
    }
    
    return sectionString;
}

function writeDataSectionExtended(bytes: Uint8Array, bytesPerLine: number): string {
    bytes = trimEmptyLines(bytes, bytesPerLine);

    let sectionString = '';
    for (let i = 0; i < bytes.length; i++) {
        const byteValue = bytes[i];

        if (i > 0 && i % bytesPerLine === 0)
            sectionString += '\n';
        
        sectionString += writeByteExtended(byteValue);
    }
    
    return sectionString;
}

function writeSection(label: string, content: string): string {
    if (!content)
        return '';

    return `__${label}__\n${content}\n`;
}

function writeLuaSection(luaCode: string): string {
    return writeSection('lua', luaCode);
}

function writeGfxSection(bytes: Uint8Array): string {
    return writeSection('gfx', writeDataSection(bytes, 64, true));
}

function writeLabelSection(bytes: Uint8Array): string {
    return writeSection('label', writeDataSectionExtended(bytes, 128));
}

function writeGffSection(bytes: Uint8Array): string {
    return writeSection('gff', writeDataSection(bytes, 128));
}

function writeMapSection(bytes: Uint8Array): string {
    return writeSection('map', writeDataSection(bytes, 128));
}

function writeSfxSection(bytes: Uint8Array): string {
    const sfxData = runtimeBytesToSfxData(new Uint8Array(bytes));
    const cartBytes = sfxDataToCartBytes(sfxData);
    return writeSection('sfx', writeDataSection(cartBytes, 84));
}

function writeMusicSection(bytes: Uint8Array): string {
    bytes = trimEmptyLines(bytes, 4);
    
    const musicData = runtimeBytesToMusicData(bytes);
    const cartBytes = musicDataToCartBytes(musicData);

    let musicDataString = '';
    for (let i = 0; i < cartBytes.length; i += 5) {
        musicDataString += writeByte(cartBytes[i + 0]);
        musicDataString += ' ';
        musicDataString += writeByte(cartBytes[i + 1]);
        musicDataString += writeByte(cartBytes[i + 2]);
        musicDataString += writeByte(cartBytes[i + 3]);
        musicDataString += writeByte(cartBytes[i + 4]);
        musicDataString += '\n';
    }
    
    return writeSection('music', musicDataString);
}

export function writeCart(cartData: CartData): string {
    let cartContents = '';

    cartContents += writeHeader() + '\n';
    cartContents += writeVersion(cartData.version) + '\n';

    if (cartData.lua !== undefined)
        cartContents += writeLuaSection(cartData.lua);

    if (cartData.gfx !== undefined)
        cartContents += writeGfxSection(cartData.gfx);
    
    if (cartData.label !== undefined)
        cartContents += writeLabelSection(cartData.label);

    if (cartData.gff !== undefined)
        cartContents += writeGffSection(cartData.gff);

    if (cartData.map !== undefined)
        cartContents += writeMapSection(cartData.map);

    if (cartData.sfx !== undefined)
        cartContents += writeSfxSection(cartData.sfx);

    if (cartData.music !== undefined)
        cartContents += writeMusicSection(cartData.music);

    return cartContents;
}
