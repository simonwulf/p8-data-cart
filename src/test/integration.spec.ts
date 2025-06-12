import { CartData } from "../cart-data.js";
import { parseCart } from "../cart-parser.js";
import { writeCart } from "../cart-writer.js";

describe('parser + writer integration', () => {
    it('should yield the same cart data when parsed as what was written', () => {
        for (let offset = 0; offset < 256; offset++) {
            const cartData = new CartData();
            for (let i = 0; i < cartData.data.length; i++) {
                cartData.data[i] = (i + offset) % 256;
            }
            
            const cartString = writeCart(cartData);
            const parsedCartData = parseCart(cartString);

            const writtenCartDataString = Array.from(cartData.data).map(b => b.toString(16).padStart(2, '0')).join();
            const parsedCartDataString = Array.from(parsedCartData.data).map(b => b.toString(16).padStart(2, '0')).join();

            parsedCartDataString.should.equal(writtenCartDataString);
        }
    });
});
