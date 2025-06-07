export type MusicFrame = {
    channels: [ number, number, number, number ]; // 4 tracks per pattern
    flags: {
        loopStart: boolean;
        loopEnd: boolean;
        stop: boolean;
        unused: boolean;
    }
};

export function cartBytesToMusicData(bytes: Uint8Array): MusicFrame[] {
    const frames: MusicFrame[] = [];
    
    for (let i = 0; i < bytes.length; i += 5) {
        const firstByte = bytes[i + 0] ?? 0;
        const secondByte = bytes[i + 1] ?? 0;
        const thirdByte = bytes[i + 2] ?? 0;
        const fourthByte = bytes[i + 3] ?? 0;
        const fifthByte = bytes[i + 4] ?? 0;

        frames.push({
            channels: [ secondByte & 0x7f, thirdByte & 0x7f, fourthByte & 0x7f, fifthByte & 0x7f ],
            flags: {
                loopStart: (firstByte & 0x01) != 0,
                loopEnd: (firstByte & 0x02) != 0,
                stop: (firstByte & 0x04) != 0,
                unused: (firstByte & 0x08) != 0
            }
        });
    }

    return frames;
}

export function musicDataToCartBytes(musicData: MusicFrame[]): Uint8Array {
    const bytes = new Uint8Array(musicData.length * 5);

    for (let i = 0; i < musicData.length; i++) {
        const frame = musicData[i];
        const baseIndex = i * 5;

        bytes[baseIndex + 0] = (frame.flags.loopStart ? 0x01 : 0)
            | (frame.flags.loopEnd ? 0x02 : 0)
            | (frame.flags.stop ? 0x04 : 0)
            | (frame.flags.unused ? 0x08 : 0);
        bytes[baseIndex + 1] = frame.channels[0];
        bytes[baseIndex + 2] = frame.channels[1];
        bytes[baseIndex + 3] = frame.channels[2];
        bytes[baseIndex + 4] = frame.channels[3];
    }

    return bytes;
}

export function runtimeBytesToMusicData(bytes: Uint8Array): MusicFrame[] {
    const frames: MusicFrame[] = [];
    
    for (let i = 0; i < bytes.length; i += 4) {
        const firstByte = bytes[i + 0] ?? 0;
        const secondByte = bytes[i + 1] ?? 0;
        const thirdByte = bytes[i + 2] ?? 0;
        const fourthByte = bytes[i + 3] ?? 0;

        frames.push({
            channels: [ firstByte & 0x7f, secondByte & 0x7f, thirdByte & 0x7f, fourthByte & 0x7f ],
            flags: {
                loopStart: (firstByte & 0x80) != 0,
                loopEnd: (secondByte & 0x80) != 0,
                stop: (thirdByte & 0x80) != 0,
                unused: (fourthByte & 0x80) != 0
            }
        });
    }
    
    return frames;
}

export function musicDataToRuntimeBytes(musicData: MusicFrame[]): Uint8Array {
    const bytes = new Uint8Array(musicData.length * 4);

    for (let i = 0; i < musicData.length; i++) {
        const frame = musicData[i];
        const baseIndex = i * 4;

        bytes[baseIndex + 0] = (frame.channels[0] & 0x7f) | (frame.flags.loopStart ? 0x80 : 0);
        bytes[baseIndex + 1] = (frame.channels[1] & 0x7f) | (frame.flags.loopEnd ? 0x80 : 0);
        bytes[baseIndex + 2] = (frame.channels[2] & 0x7f) | (frame.flags.stop ? 0x80 : 0);
        bytes[baseIndex + 3] = (frame.channels[3] & 0x7f) | (frame.flags.unused ? 0x80 : 0);
    }

    return bytes;
}
