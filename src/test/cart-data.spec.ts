import { CartData } from "../cart-data.js";

const should = require('chai').should();

describe('cart-data', () => {
    describe('constructor', () => {
        it('should create an instance with all fields populated', () => {
            const cartData = new CartData();
            should.exist(cartData.data);
            should.exist(cartData.lua);
            should.exist(cartData.gfx);
            should.exist(cartData.gff);
            should.exist(cartData.label);
            should.exist(cartData.map);
            should.exist(cartData.sfx);
            should.exist(cartData.music);
        });
    });

    describe('data', () => {
        it('should have a length matching the length of cart data in the pico-8\'s runtime memory map', () => {
            const cartData = new CartData();
            should.exist(cartData.data);
            cartData.data.length.should.equal(0x4300);
        });

        it ('should provide a comprehensive view of all sections', () => {
            const cartData = new CartData();
            const modulus = 11;

            cartData.data.set(Array.from({ length: 0x4300 }, (_, i) => i % modulus));

            cartData.gfx[0x0000].should.equal(0x0000 % modulus);
            cartData.map[0x0000].should.equal(0x2000 % modulus);
            cartData.gff[0x0000].should.equal(0x3000 % modulus);
            cartData.sfx[0x0000].should.equal(0x3200 % modulus);
            cartData.music[0x0000].should.equal(0x3100 % modulus);
        });
    });

    describe('lua', () => {
        it('should be initialized to an empty string', () => {
            const cartData = new CartData();
            should.exist(cartData.lua);
            cartData.lua.should.equal('');
        });

        it('should allow setting a Lua script', () => {
            const cartData = new CartData();
            cartData.lua = 'print("Hello, world!")';
            cartData.lua.should.equal('print("Hello, world!")');
        });
    });

    describe('gfx', () => {
        it('should be mapped to the gfx section of data', () => {
            const cartData = new CartData();
            
            should.exist(cartData.gfx);
            cartData.gfx.length.should.equal(0x2000);
            
            cartData.gfx[0x0000] = 0xab;
            cartData.gfx[0x0100] = 0xcd;

            cartData.data[0x0000].should.equal(0xab);
            cartData.data[0x0100].should.equal(0xcd);
        });
    });

    describe('map', () => {
        it('should be mapped to the map section of data', () => {
            const cartData = new CartData();
            
            should.exist(cartData.map);
            cartData.map.length.should.equal(0x1000);
            
            cartData.map[0x0000] = 0xab;
            cartData.map[0x0100] = 0xcd;

            cartData.data[0x2000].should.equal(0xab);
            cartData.data[0x2100].should.equal(0xcd);
        });
    });

    describe('gff', () => {
        it('should be mapped to the gff section of data', () => {
            const cartData = new CartData();

            should.exist(cartData.gff);
            cartData.gff.length.should.equal(0x0100);

            cartData.gff[0x0000] = 0xab;
            cartData.gff[0x0050] = 0xcd;

            cartData.data[0x3000].should.equal(0xab);
            cartData.data[0x3050].should.equal(0xcd);
        });
    });

    describe('sfx', () => {
        it('should be mapped to the sfx section of data', () => {
            const cartData = new CartData();
            
            should.exist(cartData.sfx);
            cartData.sfx.length.should.equal(0x1100);
            
            cartData.sfx[0x0000] = 0xab;
            cartData.sfx[0x0100] = 0xcd;

            cartData.data[0x3200].should.equal(0xab);
            cartData.data[0x3300].should.equal(0xcd);
        });
    });

    describe('music', () => {
        it('should be mapped to the music section of data', () => {
            const cartData = new CartData();
            
            should.exist(cartData.music);
            cartData.music.length.should.equal(0x0100);
            
            cartData.music[0x0000] = 0xab;
            cartData.music[0x0050] = 0xcd;

            cartData.data[0x3100].should.equal(0xab);
            cartData.data[0x3150].should.equal(0xcd);
        });
    });

    describe('label', () => {
        it('should be initialized with correct size', () => {
            const cartData = new CartData();
            
            should.exist(cartData.label);
            cartData.label.length.should.equal(128 * 128);
            
            cartData.label[0x0000] = 0xab;
            cartData.label[0x1000] = 0xcd;

            cartData.label[0x0000].should.equal(0xab);
            cartData.label[0x1000].should.equal(0xcd);
        });
    });
});
