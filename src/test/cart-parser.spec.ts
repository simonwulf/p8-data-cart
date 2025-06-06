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
        should.exist(cartData.gfx);
        cartData.gfx!.length.should.equal(256);
        cartData.gfx!.every(byte => byte == 0xab).should.be.true;
    });

    it('should parse the label section', function () {
        should.exist(cartData.label);
        cartData.label!.length.should.equal(128 * 128);
        cartData.label!.every(byte => byte == 0xac).should.be.true;
    });

    it('should parse the gff section', function () {
        should.exist(cartData.gff);
        cartData.gff!.length.should.equal(256);
        cartData.gff!.every(byte => byte == 0xad).should.be.true;
    });

    it('should parse the map section', function () {
        should.exist(cartData.map);
        cartData.map!.length.should.equal(256);
        cartData.map!.every(byte => byte == 0x01).should.be.true;
    });

    it('should parse the sfx section', function () {
        should.exist(cartData.sfx);
        cartData.sfx!.length.should.equal(272);
        cartData.sfx!.every(byte => byte == 0xaf).should.be.true;
    });

    it('should parse the music section', function () {
        should.exist(cartData.music);
        cartData.music!.length.should.equal(256);
        cartData.music!.every(byte => byte == 0xae).should.be.true;
    });
});
