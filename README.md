# p8-data-cart

This small library provides simple tools for generating data carts for the [Pico-8](https://www.lexaloffle.com/pico-8.php).

## What is a Data Cart?
A data cart is a cart prepared to place any arbitrary data in the cart section of the Pico-8's memory (addresses 0x0000 - 0x4300) when the cart is loaded.

This allows you to leverage this memory for novel use cases, such as compressed graphics, proprietary configuration formats or polygonal mesh data.

The only limit is your imagination and your ability to fit what you need in 16,75 KiB.

## Installation

```sh
npm install p8-data-cart
```

## Usage
Using the tools provided by this library, you can easily pack arbitrary data into the Pico-8's .p8 cart format. When storing data other than traditional `gfx`/`map`/`gff`/`sfx`/`music` data, the corresponding resources will appear as garbage when loaded by the Pico-8. It is then up to you to make use of this data on the Pico-8 side to achieve the desired effect.

### Example: Polygon Data
```typescript
import { readFileSync, writeFileSync } from 'fs';
import { CartData, writeCart } from 'p8-data-cart';

const shapes = [
    // Star shape
    [
        -0.33867, -0.11005,
        ...
        -0.12912, 0.04222
    ],
    // Heart shape
    [
        0.27532, -0.04442,
        ...
        0.29499, -0.09758
    ]
];

function buildPayload(shapes: number[][]): Uint8Array {
    // Pack shapes into a binary format that will be
    // decoded by a lua script when running on the Pico-8
    ...
}

const payload = buildPayload(shapes);
const luaScript = readFileSync('shapes.lua', 'utf-8');

const cartData = new CartData();
cartData.data.set(payload);
cartData.lua = luaScript;

writeFileSync('shapes.p8', writeCart(cartData));
```

### Example: Selectively Using Sections for Traditional Resource Data
```typescript
import { readFileSync, writeFileSync } from 'fs';
import { CartData, parseCart, writeCart } from 'p8-data-cart';

const payload = new Uint8Array([ 0 ]);
const resourceCartData = parseCart(readFileSync('resources.p8', 'utf-8'));

if (payload.length > 0x3200)
    throw new Error('Payload can be no longer than 0x3200 bytes as it must not overlap sfx memory');

const cartData = new CartData();
cartData.data.set(payload);
cartData.sfx.set(resourceCartData.sfx); // Copy sfx from resource cart

writeFileSync('my-cart.p8', 'utf-8');
```

### Limitations
The maximum payload size is limited to __16,75 KiB__ (0x4300 bytes), as this is the amount of memory that the cart gets mapped to when loaded by the Pico-8. The `lua` and `label` sections do not count towards this limitation.

## `CartData`

__WIP:__
Provides multiple views of runtime formatted data, `data` provides a continuous view of the full span, while the specific section

### Data Views
There are six properties of type `Uint8Array` that all share the same backing buffer. These typed arrays provide views of the cart's data payload. Each representing a specific range of the Pico-8's runtime memory.

- `data`
  - Full view of the entire payload.
  - Maps to runtime memory addresses `0x0000` - `0x4300`.
- `gfx`
  - Represents the cart's `__gfx__` section, traditionally used to store sprites.
  - Maps to runtime memory addresses `0x0000` - `0x2000`.
  - Note that the memory at `0x1000` - `0x2000` is shared with the tilemap in the Pico-8 runtime.
- `map`
  - Represents the cart's `__map__` section, traditionally used to store tilemap data.
  - Maps to runtime memory addresses `0x2000` - `0x3000`.
- `gff`
  - Represents the cart's `__gff__` section, traditionally used to store user defined sprite flags.
  - Maps to runtime memory addresses `0x3000` - `0x3100`.
- `music`
  - Represents the cart's `__music__` section, traditionally used to store music patterns.
  - Maps to runtime memory addresses `0x3100` - `0x3200`.
- `sfx`
  - Represents the cart's `__sfx__` section, traditionally used to store sound effects.
  - Maps to runtime memory addresses `0x3200` - `0x4300`.

### Other Properties
- `version`: number
  - Describes what p8 format version this cart uses.
- `lua`: string
  - Represents the cart's `__lua__` section, which contains the cart's lua script.
- `label`: Uint8Array
  - Represents the cart's `__label__` section, which is used to store the cart's thumbnail picture. This is not mapped to Pico-8 memory at runtime and cannot be used for payload delivery.

## License

[MIT](https://opensource.org/license/mit)
