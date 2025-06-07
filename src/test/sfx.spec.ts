import 'chai/register-should.js';
import { parseCart } from '../cart-parser';
import { cartBytesToSfxData, runtimeBytesToSfxData, sfxDataToCartBytes, sfxDataToRuntimeBytes } from '../sfx.js';

const should = require('chai').should();

describe('sfx', () => {
    describe('cartBytesToSfxData', () => {
        it('should deserialize sfx data from cart bytes as expected', () => {
            const cartBytes = new Uint8Array([
                0x40, 0x41, 0x42, 0x43, 0x00, 0x40, 0x00, 0x24, 0x10, 0x04, 0x42, 0x00, 0x64, 0x30, 0x08, 0x44,
                0x00, 0xa4, 0x50, 0x0c, 0x46, 0x00, 0xe4, 0x70, 0x10, 0x40, 0x11, 0x24, 0x11, 0x14, 0x42, 0x11,
                0x64, 0x31, 0x18, 0x44, 0x11, 0xa4, 0x51, 0x1c, 0x46, 0x11, 0xe4, 0x71, 0x20, 0x40, 0x22, 0x24,
                0x12, 0x24, 0x42, 0x22, 0x64, 0x32, 0x28, 0x44, 0x22, 0xa4, 0x52, 0x2c, 0x46, 0x22, 0xe4, 0x72,
                0x30, 0x40, 0x33, 0x24, 0x13, 0x34, 0x42, 0x33, 0x64, 0x33, 0x38, 0x44, 0x33, 0xa4, 0x53, 0x3c,
                0x46, 0x33, 0xe4, 0x73
            ]);

            const sfxData = cartBytesToSfxData(cartBytes);
            sfxData.length.should.equal(1);
            
            const sfx = sfxData[0];
            sfx.useTracker.should.be.false;
            sfx.isWaveform.should.be.false;
            sfx.filters.noiz.should.be.false;
            sfx.filters.buzz.should.be.false;
            sfx.filters.detune.should.equal(2);
            sfx.filters.reverb.should.equal(2);
            sfx.filters.dampen.should.equal(0);
            sfx.duration.should.equal(65);
            sfx.loopStart.should.equal(66);
            sfx.loopEnd.should.equal(67);

            sfx.notes.length.should.equal(32);
            for (let i = 0; i < sfx.notes.length; i++) {
                const note = sfx.notes[i];
                note.pitch.should.equal(i * 2);
                note.waveform.should.equal(4);
                note.volume.should.equal(i % 8);
                note.effect.should.equal(Math.floor(i / 8));
            }
        });
    });

    describe('sfxDataToCartBytes', () => {
        it('should serialize sfx data to cart bytes as expected', () => {
            const sfxData = [{
                useTracker: false,
                isWaveform: false,
                filters: {
                    noiz: false,
                    buzz: false,
                    detune: 2,
                    reverb: 2,
                    dampen: 0
                },
                duration: 65,
                loopStart: 66,
                loopEnd: 67,
                notes: Array.from({ length: 32 }, (_, i) => ({
                    pitch: i * 2,
                    waveform: 4,
                    volume: i % 8,
                    effect: Math.floor(i / 8)
                }))
            }];

            const cartBytes = sfxDataToCartBytes(sfxData);
            cartBytes.length.should.equal(84);

            const cartBytesString = cartBytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            cartBytesString.should.equal('4041424300400024100442006430084400a4500c4600e47010401124111442116431184411a4511c4611e47120402224122442226432284422a4522c4622e47230403324133442336433384433a4533c4633e473');
        });
    });

    describe('runtimeBytesToSfxData', () => {
        it('should deserialize sfx data from runtime bytes as expected', () => {
            const runtimeBytes = new Uint8Array([
                0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
                0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
                0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
                0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27,
                0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
                0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
                0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f,
                0x40, 0x41, 0x42, 0x43
            ]);

            const sfxData = runtimeBytesToSfxData(runtimeBytes);
            sfxData.length.should.equal(1);
            
            const sfx = sfxData[0];
            sfx.useTracker.should.be.false;
            sfx.isWaveform.should.be.false;
            sfx.filters.noiz.should.be.false;
            sfx.filters.buzz.should.be.false;
            sfx.filters.detune.should.equal(2);
            sfx.filters.reverb.should.equal(2);
            sfx.filters.dampen.should.equal(0);
            sfx.duration.should.equal(65);
            sfx.loopStart.should.equal(66);
            sfx.loopEnd.should.equal(67);

            sfx.notes.length.should.equal(32);
            for (let i = 0; i < sfx.notes.length; i++) {
                const note = sfx.notes[i];
                note.pitch.should.equal(i * 2);
                note.waveform.should.equal(4);
                note.volume.should.equal(i % 8);
                note.effect.should.equal(Math.floor(i / 8));
            }
        });
    });

    describe('sfxDataToRuntimeBytes', () => {
        it('should serialize sfx data to runtime bytes as expected', () => {
            const sfxData = [{
                useTracker: false,
                isWaveform: false,
                filters: {
                    noiz: false,
                    buzz: false,
                    detune: 2,
                    reverb: 2,
                    dampen: 0
                },
                duration: 65,
                loopStart: 66,
                loopEnd: 67,
                notes: Array.from({ length: 32 }, (_, i) => ({
                    pitch: i * 2,
                    waveform: 4,
                    volume: i % 8,
                    effect: Math.floor(i / 8)
                }))
            }];

            const runtimeBytes = sfxDataToRuntimeBytes(sfxData);
            runtimeBytes.length.should.equal(68);

            const runtimeBytesString = runtimeBytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            runtimeBytesString.should.equal('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40414243');
        });
    });
});