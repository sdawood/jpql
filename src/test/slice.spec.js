const slice = require('../slice').slice;

const data = ['a', 'b', 'c', 'd', 'e', 'f'];

describe('slice', () => {

    it('no params yields copy', () => {
        expect(slice(data)).toEqual(data);
    });

    it('no end param defaults to end', () => {
        expect(slice(data, 2)).toEqual(data.slice(2));
    });

    it('zero end param yields empty', () => {
        expect(slice(data, 0, 0)).toEqual([]);
    });

    it('first element with explicit params', () => {
        expect(slice(data, 0, 1, 1)).toEqual(['a']);
    });

    it('last element with explicit params', () => {
        expect(slice(data, -1, 6)).toEqual(['f']);
    });

    it('empty extents and negative step reverses', () => {
        expect(slice(data, null, null, -1)).toEqual(['f', 'e', 'd', 'c', 'b']);
    });

    it('meaningless negative step partial slice', () => {
        expect(slice(data, 2, 4, -1)).toEqual([]);
    });

    it('negative step partial slice no start defaults to end', () => {
        expect(slice(data, null, 2, -1)).toEqual(slice(data, data.length, 2, -1));
        expect(slice(data, null, 2, -1)).toEqual(['f', 'e', 'd']);
    });

    it('extents clamped end', () => {
        expect(slice(data, null, 100)).toEqual(data);
    });

    it('extents clamped beginning', () => {
        expect(slice(data, -100, 100)).toEqual(data);
    });

    it('backwards extents yields empty', () => {
        expect(slice(data, 2, 1)).toEqual([]);
    });

    it('zero step gets shot down', () => {
        expect(() => {
            slice(data, null, null, 0);
        }).toThrow();
    });

    it('slice with step > 1', () => {
        const results = slice(data, 0, 4, 2);
        expect(results).toEqual(['a', 'c']);
    });

    it('meaningless slice with start < end, step < 0', () => {
        const results = slice(data, 0, 2, -1);
        expect(results).toEqual([]);
    });

});

