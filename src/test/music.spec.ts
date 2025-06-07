import 'chai/register-should.js';
import { cartBytesToMusicData, musicDataToCartBytes, musicDataToRuntimeBytes, MusicFrame, runtimeBytesToMusicData } from '../music.js';
// import { cartBytesToMusicData, runtimeBytesToMusicData, musicDataToCartBytes, musicDataToRuntimeBytes } from '../music.js';

describe('music', () => {
    describe('cartBytesToMusicData', () => {
        it('should deserialize music data from cart bytes as expected', () => {
            const cartBytes = new Uint8Array([
                0x00, 0x00, 0x01, 0x02, 0x03,
                0x00, 0x04, 0x05, 0x06, 0x07,
                0x00, 0x08, 0x09, 0x0a, 0x0b,
                0x00, 0x0c, 0x0d, 0x0e, 0x0f,
                0x00, 0x10, 0x11, 0x12, 0x13,
                0x00, 0x14, 0x15, 0x16, 0x17,
                0x00, 0x18, 0x19, 0x1a, 0x1b,
                0x00, 0x1c, 0x1d, 0x1e, 0x1f,
                0x00, 0x20, 0x21, 0x22, 0x23,
                0x00, 0x24, 0x25, 0x26, 0x27,
                0x00, 0x28, 0x29, 0x2a, 0x2b,
                0x00, 0x2c, 0x2d, 0x2e, 0x2f,
                0x00, 0x30, 0x31, 0x32, 0x33,
                0x00, 0x34, 0x35, 0x36, 0x37,
                0x00, 0x38, 0x39, 0x3a, 0x3b,
                0x00, 0x3c, 0x3d, 0x3e, 0x3f,
                0x00, 0x40, 0x41, 0x42, 0x43,
                0x00, 0x44, 0x45, 0x46, 0x47,
                0x00, 0x48, 0x49, 0x4a, 0x4b,
                0x00, 0x4c, 0x4d, 0x4e, 0x4f,
                0x00, 0x50, 0x51, 0x52, 0x53,
                0x00, 0x54, 0x55, 0x56, 0x57,
                0x00, 0x58, 0x59, 0x5a, 0x5b,
                0x00, 0x5c, 0x5d, 0x5e, 0x5f,
                0x00, 0x60, 0x61, 0x62, 0x63,
                0x00, 0x64, 0x65, 0x66, 0x67,
                0x00, 0x68, 0x69, 0x6a, 0x6b,
                0x00, 0x6c, 0x6d, 0x6e, 0x6f,
                0x00, 0x70, 0x71, 0x72, 0x73,
                0x00, 0x74, 0x75, 0x76, 0x77,
                0x00, 0x78, 0x79, 0x7a, 0x7b,
                0x00, 0x7c, 0x7d, 0x7e, 0x7f,
                0x0f, 0x00, 0x01, 0x02, 0x03,
                0x0f, 0x04, 0x05, 0x06, 0x07,
                0x0f, 0x08, 0x09, 0x0a, 0x0b,
                0x0f, 0x0c, 0x0d, 0x0e, 0x0f,
                0x0f, 0x10, 0x11, 0x12, 0x13,
                0x0f, 0x14, 0x15, 0x16, 0x17,
                0x0f, 0x18, 0x19, 0x1a, 0x1b,
                0x0f, 0x1c, 0x1d, 0x1e, 0x1f,
                0x0f, 0x20, 0x21, 0x22, 0x23,
                0x0f, 0x24, 0x25, 0x26, 0x27,
                0x0f, 0x28, 0x29, 0x2a, 0x2b,
                0x0f, 0x2c, 0x2d, 0x2e, 0x2f,
                0x0f, 0x30, 0x31, 0x32, 0x33,
                0x0f, 0x34, 0x35, 0x36, 0x37,
                0x0f, 0x38, 0x39, 0x3a, 0x3b,
                0x0f, 0x3c, 0x3d, 0x3e, 0x3f,
                0x0f, 0x40, 0x41, 0x42, 0x43,
                0x0f, 0x44, 0x45, 0x46, 0x47,
                0x0f, 0x48, 0x49, 0x4a, 0x4b,
                0x0f, 0x4c, 0x4d, 0x4e, 0x4f,
                0x0f, 0x50, 0x51, 0x52, 0x53,
                0x0f, 0x54, 0x55, 0x56, 0x57,
                0x0f, 0x58, 0x59, 0x5a, 0x5b,
                0x0f, 0x5c, 0x5d, 0x5e, 0x5f,
                0x0f, 0x60, 0x61, 0x62, 0x63,
                0x0f, 0x64, 0x65, 0x66, 0x67,
                0x0f, 0x68, 0x69, 0x6a, 0x6b,
                0x0f, 0x6c, 0x6d, 0x6e, 0x6f,
                0x0f, 0x70, 0x71, 0x72, 0x73,
                0x0f, 0x74, 0x75, 0x76, 0x77,
                0x0f, 0x78, 0x79, 0x7a, 0x7b,
                0x0f, 0x7c, 0x7d, 0x7e, 0x7f
            ]);

            const frames = cartBytesToMusicData(cartBytes);
            frames.length.should.equal(64);

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                frame.channels[0].should.equal((i * 4 + 0) % 128);
                frame.channels[1].should.equal((i * 4 + 1) % 128);
                frame.channels[2].should.equal((i * 4 + 2) % 128);
                frame.channels[3].should.equal((i * 4 + 3) % 128);
                frame.flags.loopStart.should.equal(i >= 32);
                frame.flags.loopEnd.should.equal(i >= 32);
                frame.flags.stop.should.equal(i >= 32);
            }
        });
    });

    describe('musicDataToCartBytes', () => {
        it('should serialize music data to cart bytes as expected', () => {
            const frames: MusicFrame[] = Array.from({ length: 64 }, (_, i) => ({
                channels: [
                    (i * 4 + 0) % 128,
                    (i * 4 + 1) % 128,
                    (i * 4 + 2) % 128,
                    (i * 4 + 3) % 128
                ],
                flags: {
                    loopStart: i >= 32,
                    loopEnd: i >= 32,
                    stop: i >= 32,
                    unused: i >= 32
                }
            }));

            const cartBytes = musicDataToCartBytes(frames);
            const cartBytesString = cartBytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            
            cartBytesString.should.equal('000001020300040506070008090a0b000c0d0e0f001011121300141516170018191a1b001c1d1e1f002021222300242526270028292a2b002c2d2e2f003031323300343536370038393a3b003c3d3e3f004041424300444546470048494a4b004c4d4e4f005051525300545556570058595a5b005c5d5e5f006061626300646566670068696a6b006c6d6e6f007071727300747576770078797a7b007c7d7e7f0f000102030f040506070f08090a0b0f0c0d0e0f0f101112130f141516170f18191a1b0f1c1d1e1f0f202122230f242526270f28292a2b0f2c2d2e2f0f303132330f343536370f38393a3b0f3c3d3e3f0f404142430f444546470f48494a4b0f4c4d4e4f0f505152530f545556570f58595a5b0f5c5d5e5f0f606162630f646566670f68696a6b0f6c6d6e6f0f707172730f747576770f78797a7b0f7c7d7e7f');
        });
    });

    describe('runtimeBytesToMusicData', () => {
        it('should deserialize music data from runtime bytes as expected', () => {
            const runtimeBytes = new Uint8Array(Array.from({ length: 256 }, (_, i) => {
                return i;
            }));

            const frames = runtimeBytesToMusicData(runtimeBytes);
            frames.length.should.equal(64);

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                frame.channels[0].should.equal((i * 4 + 0) % 128);
                frame.channels[1].should.equal((i * 4 + 1) % 128);
                frame.channels[2].should.equal((i * 4 + 2) % 128);
                frame.channels[3].should.equal((i * 4 + 3) % 128);
                frame.flags.loopStart.should.equal(i >= 32);
                frame.flags.loopEnd.should.equal(i >= 32);
                frame.flags.stop.should.equal(i >= 32);
                frame.flags.unused.should.equal(i >= 32);
            }
        });
    });

    describe('musicDataToRuntimeBytes', () => {
        it('should serialize music data to runtime bytes as expected', () => {
            const frames: MusicFrame[] = Array.from({ length: 64 }, (_, i) => ({
                channels: [
                    (i * 4 + 0) % 128,
                    (i * 4 + 1) % 128,
                    (i * 4 + 2) % 128,
                    (i * 4 + 3) % 128
                ],
                flags: {
                    loopStart: i >= 32,
                    loopEnd: i >= 32,
                    stop: i >= 32,
                    unused: i >= 32
                }
            }));

            const runtimeBytes = musicDataToRuntimeBytes(frames);
            const runtimeBytesString = runtimeBytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            
            runtimeBytesString.should.equal('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff');
        });
    });
});
