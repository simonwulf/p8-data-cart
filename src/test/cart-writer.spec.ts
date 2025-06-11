import { CartData } from '../cart-data';
import { writeCart } from '../cart-writer';

const should = require('chai').should();

describe('cart-writer', () => {
    describe('normal-operation', () => {
        let cartString: string;

        before(() => {
            const cartData = new CartData();

            cartData.lua = 'print("this is a test")\n';

            cartData.gfx.set(Array.from<number>({ length: 256 }).fill(0xab));
            cartData.map.set(Array.from<number>({ length: 256 }).fill(0x01));
            cartData.gff.set(Array.from<number>({ length: 256 }).fill(0xad));
            cartData.sfx.set(Array.from<number>({ length: 272 }).fill(0xaf));
            cartData.music.set(Array.from<number>({ length: 256 }).fill(0xae));
            
            cartData.label.set(Array.from<number, number>({ length: 128 * 128 }, (_, i) => (i % 2) == 0 ? 0x0a : 0x8c));

            cartString = writeCart(cartData);
            console.log(cartString);
        });

        it('should write the lua section as expected', () => {
            cartString.should.match(/__lua__\nprint\("this is a test"\)\n/);
        });

        it('should write the gfx section as expected', () => {
            cartString.should.match(/__gfx__\n((ba){64}\n){4}(?![0-9a-f])/);
        });

        it('should write the map section as expected', () => {
            cartString.should.match(/__map__\n((01){128}\n){2}(?![0-9a-f])/);
        });

        it('should write the gff section as expected', () => {
            cartString.should.match(/__gff__\n((ad){128}\n){2}(?![0-9a-f])/);
        });

        it('should write the sfx section as expected', () => {
            cartString.should.match(/__sfx__\n(afafafaf(2f67a2f67a){16}\n){4}(?![0-9a-f])/);
        });

        it('should write the music section as expected', () => {
            cartString.should.match(/__music__\n(0f 2e2e2e2e\n){64}(?![0-9a-f])/);
        });

        it('should write the label section as expected', () => {
            cartString.should.match(/__label__\n((as){64}\n){128}(?![0-9a-v])/);
        });
    });

    describe('blank-sections', () => {
        let cartString: string;

        before(() => {
            cartString = writeCart(new CartData());
        });

        it('should not write a lua section', () => {
            cartString.should.not.contain('__lua__');
        });

        it('should not write a gfx section', () => {
            cartString.should.not.contain('__lua__');
        });

        it('should not write a map section', () => {
            cartString.should.not.contain('__map__');
        });

        it('should not write a gff section', () => {
            cartString.should.not.contain('__gff__');
        });

        it('should not write a sfx section', () => {
            cartString.should.not.contain('__sfx__');
        });

        it('should not write a music section', () => {
            cartString.should.not.contain('__music__');
        });

        it('should not write a label section', () => {
            cartString.should.not.contain('__label__');
        });
    });
});
