export type SfxNote = {
    effect: number; // 0-7
    volume: number; // 0-7
    waveform: number; // 0-15
    pitch: number; // 0-63
};

export type SfxData = {
    useTracker: boolean;
    isWaveform: boolean;
    filters: {
        noiz: boolean;
        buzz: boolean;
        detune: number; // 0-3
        reverb: number; // 0-3
        dampen: number; // 0-3
        remainder: number;
    }
    duration: number;
    loopStart: number;
    loopEnd: number;
    notes: SfxNote[];
};

function readSfxFromCartBytes(bytes: Uint8Array): SfxData {
    const [ firstByte, secondByte, thirdByte, fourthByte ] = bytes;

    const notes: SfxNote[] = [];
    for (let i = 4; i < 84; i += 5) {
        const [ firstByte , secondByte, thirdByte, fourthByte, fifthByte ] = bytes.slice(i, i + 5);
        notes.push({
            pitch: firstByte,
            waveform: secondByte >> 4,
            volume: secondByte & 0x0f,
            effect: thirdByte >> 4
        });
        notes.push({
            pitch: ((thirdByte & 0x0f) << 4) | (fourthByte >> 4),
            waveform: fourthByte & 0x0f,
            volume: fifthByte >> 4,
            effect: fifthByte & 0x0f
        });
    }

    const ternaryFlags = firstByte >> 3;

    return {
        useTracker: (firstByte & 0x01) !== 0,
        isWaveform: (thirdByte & 0x80) !== 0,
        filters: {
            noiz: (firstByte & 0x02) !== 0,
            buzz: (firstByte & 0x04) !== 0,
            detune: Math.floor(ternaryFlags / 1) % 3,
            reverb: Math.floor(ternaryFlags / 3) % 3,
            dampen: Math.floor(ternaryFlags / 9) % 3,
            remainder: Math.floor(ternaryFlags / 27) % 3
        },
        duration: secondByte,
        loopStart: thirdByte & 0x7f,
        loopEnd: fourthByte,
        notes
    }
}

function readSfxFromRuntimeBytes(bytes: Uint8Array): SfxData {
    const notes: SfxNote[] = [];
    
    for (let i = 0; i < 32; i++) {
        const noteOffset = i * 2;
        const lowByte = bytes[noteOffset] ?? 0;
        const highByte = bytes[noteOffset + 1] ?? 0;

        notes.push({
            effect: highByte >> 4,
            volume: (highByte >> 1) & 0x07,
            waveform: ((highByte & 0x01) << 2) | (lowByte >> 6),
            pitch: lowByte & 0x3f
        });
    }

    const tailOffset = 64;
    const firstTailByte = bytes[tailOffset + 0] ?? 0;
    const secondTailByte = bytes[tailOffset + 1] ?? 0;
    const thirdTailByte = bytes[tailOffset + 2] ?? 0;
    const fourthTailByte = bytes[tailOffset + 3] ?? 0;

    const ternaryFlags = firstTailByte >> 3;

    return {
        useTracker: (firstTailByte & 0x01) !== 0,
        isWaveform: (thirdTailByte & 0x80) !== 0,
        filters: {
            noiz: (firstTailByte & 0x02) !== 0,
            buzz: (firstTailByte & 0x04) !== 0,
            detune: Math.floor(ternaryFlags / 1) % 3,
            reverb: Math.floor(ternaryFlags / 3) % 3,
            dampen: Math.floor(ternaryFlags / 9) % 3,
            remainder: Math.floor(ternaryFlags / 27) % 3
        },
        duration: secondTailByte,
        loopStart: thirdTailByte & 0x7f,
        loopEnd: fourthTailByte,
        notes
    };
}

export function cartBytesToSfxData(bytes: Uint8Array): SfxData[] {
    const sfxCount = Math.ceil(bytes.length / 84);
    const sfx: SfxData[] = new Array(sfxCount);
    
    for (let i = 0; i < sfxCount; i++) {
        const sfxOffset = i * 84;
        const sfxBytes = bytes.slice(sfxOffset, sfxOffset + 84);
        sfx[i] = readSfxFromCartBytes(sfxBytes);
    }

    return sfx;
}

export function sfxDataToCartBytes(sfxData: SfxData[]): Uint8Array {
    const bytes = new Uint8Array(sfxData.length * 84);

    for (let i = 0; i < sfxData.length; i++) {
        const sfx = sfxData[i];
        const baseIndex = i * 84;

        const ternaryFlags = sfx.filters.detune * 1
                           + sfx.filters.reverb * 3
                           + sfx.filters.dampen * 9
                           + sfx.filters.remainder * 27;

        let firstByte = 0x00;
        firstByte |= (sfx.useTracker ? 0x01 : 0x00);
        firstByte |= (sfx.filters.noiz ? 0x02 : 0x00);
        firstByte |= (sfx.filters.buzz ? 0x04 : 0x00);
        firstByte |= ternaryFlags << 3;

        const secondByte = sfx.duration;
        const thirdByte = (sfx.isWaveform ? 0x80 : 0) | (sfx.loopStart & 0x7f);
        const fourthByte = sfx.loopEnd;

        bytes[baseIndex + 0] = firstByte;
        bytes[baseIndex + 1] = secondByte;
        bytes[baseIndex + 2] = thirdByte;
        bytes[baseIndex + 3] = fourthByte;

        for (let j = 0; j < 32; j += 2) {
            const noteA = sfx.notes[j]   ?? { pitch: 0, waveform: 0, volume: 0, effect: 0 };
            const noteB = sfx.notes[j+1] ?? { pitch: 0, waveform: 0, volume: 0, effect: 0 };
            const noteBaseIndex = baseIndex + 4 + (j / 2) * 5;

            bytes[noteBaseIndex + 0] = noteA.pitch;
            bytes[noteBaseIndex + 1] = (noteA.waveform << 4) | (noteA.volume & 0x0f);
            bytes[noteBaseIndex + 2] = (noteA.effect << 4) | (noteB.pitch >> 4);
            bytes[noteBaseIndex + 3] = (noteB.pitch << 4) | (noteB.waveform & 0x0f);
            bytes[noteBaseIndex + 4] = (noteB.volume << 4) | (noteB.effect & 0x0f);
        }
    }

    return bytes;
}

export function runtimeBytesToSfxData(bytes: Uint8Array): SfxData[] {
    const sfx: SfxData[] = [];

    for (let i = 0; i < 64; i++) {
        const sfxOffset = i * 68;
        if (sfxOffset >= bytes.length) // Allow for incomplete SFX data, will pad with zeroes
            break;

        const sfxBytes = bytes.slice(sfxOffset, sfxOffset + 68);
        sfx.push(readSfxFromRuntimeBytes(sfxBytes));
    }

    return sfx;
}

export function sfxDataToRuntimeBytes(sfxData: SfxData[]): Uint8Array {
    const result = new Uint8Array(sfxData.length * 68);

    for (let i = 0; i < sfxData.length; i++) {
        const sfx = sfxData[i];
        const sfxOffset = i * 68;

        for (let n = 0; n < 32; n++) {
            const note = sfx.notes[n] ?? { effect: 0, volume: 0, waveform: 0, pitch: 0 };
            const noteOffset = sfxOffset + n * 2;

            result[noteOffset + 0] = (note.waveform << 6) | (note.pitch & 0x3F);
            result[noteOffset + 1] = ((note.effect & 0x0F) << 4)
                | ((note.volume & 0x07) << 1)
                | ((note.waveform >> 2) & 0x01);
        }

        const tailOffset = sfxOffset + 64;
        const ternaryFlags = sfx.filters.detune * 1
                           + sfx.filters.reverb * 3
                           + sfx.filters.dampen * 9
                           + sfx.filters.remainder * 27;

        let firstTailByte = 0x00;
        firstTailByte |= (sfx.useTracker ? 0x01 : 0x00);
        firstTailByte |= (sfx.filters.noiz ? 0x02 : 0x00);
        firstTailByte |= (sfx.filters.buzz ? 0x04 : 0x00);
        firstTailByte |= ternaryFlags << 3;

        const secondTailByte = sfx.duration & 0xFF;
        const thirdTailByte = (sfx.isWaveform ? 0x80 : 0) | (sfx.loopStart & 0x7F);
        const fourthTailByte = sfx.loopEnd & 0xFF;

        result[tailOffset + 0] = firstTailByte;
        result[tailOffset + 1] = secondTailByte;
        result[tailOffset + 2] = thirdTailByte;
        result[tailOffset + 3] = fourthTailByte;
    }

    return result;
}
