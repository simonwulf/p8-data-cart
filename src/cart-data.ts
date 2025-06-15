export class CartData {
    private _version: number;
    private _lua: string;
    private _data: Uint8Array;
    private _gfx: Uint8Array;
    private _gff: Uint8Array;
    private _label: Uint8Array;
    private _map: Uint8Array;
    private _sfx: Uint8Array;
    private _music: Uint8Array;

    constructor() {
        this._version = 42;
        this._lua = '';
        
        const buffer = new ArrayBuffer(0x4300);

        this._data = new Uint8Array(buffer);
        this._gfx = new Uint8Array(buffer, 0x0000, 0x2000);
        this._map = new Uint8Array(buffer, 0x2000, 0x1000);
        this._gff = new Uint8Array(buffer, 0x3000, 0x0100);
        this._music = new Uint8Array(buffer, 0x3100, 0x0100);
        this._sfx = new Uint8Array(buffer, 0x3200, 0x1100);

        this._label = new Uint8Array(128 * 128);
    }

    get version(): number {
        return this._version;
    }

    set version(value: number) {
        this._version = value;
    }

    get lua(): string {
        return this._lua;
    }

    set lua(value: string) {
        this._lua = value;
    }

    get data(): Uint8Array {
        return this._data;
    }

    get gfx(): Uint8Array {
        return this._gfx;
    }

    get gff(): Uint8Array {
        return this._gff;
    }

    get label(): Uint8Array {
        return this._label;
    }

    get map(): Uint8Array {
        return this._map;
    }

    get sfx(): Uint8Array {
        return this._sfx;
    }

    get music(): Uint8Array {
        return this._music;
    }
}
