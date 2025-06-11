import 'chai/register-should.js';
import { readFileSync } from 'fs';
import { parseCart } from '../cart-parser.js';

const should = require('chai').should();

describe('cart-parser', function() {
    let cartData: ReturnType<typeof parseCart>;

    before(function () {
        const cartString = readFileSync('test_data/test_cart.p8', 'utf-8');
        cartData = parseCart(cartString);
    });

    it('should parse the lua section', function () {
        cartData.lua!.should.be.a('string');
        cartData.lua!.should.include('print("this is a test")');
        cartData.lua!.should.include('this concludes the test');
    });

    it('should parse the gfx section', function () {
        cartData.gfx.slice(0, 256).every(byte => byte == 0xab).should.be.true;
        cartData.gfx.slice(256).every(byte => byte == 0x00).should.be.true;
    });

    it('should parse the label section', function () {
        cartData.label.every((byte, i) => byte == (i % 2 == 0 ? 0xa : 0xc)).should.be.true;
    });

    it('should parse the gff section', function () {
        cartData.gff.slice(0, 256).every(byte => byte == 0xad).should.be.true;
        cartData.gff.slice(256).every(byte => byte == 0x00).should.be.true;
    });

    it('should parse the map section', function () {
        cartData.map.slice(0, 256).every(byte => byte == 0x01).should.be.true;
        cartData.map.slice(256).every(byte => byte == 0x00).should.be.true;
    });

    it('should parse the sfx section', function () {
        cartData.sfx.slice(0, 272).every(byte => byte == 0xaf).should.be.true;
        cartData.sfx.slice(272).every(byte => byte == 0x00).should.be.true;
    });

    it('should parse the music section', function () {
        cartData.music.slice(0, 256).every(byte => byte == 0xae).should.be.true;
        cartData.music.slice(256).every(byte => byte == 0x00).should.be.true;
    });
});
