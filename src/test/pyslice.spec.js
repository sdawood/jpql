const slice = require('../slice').slice;
const list = [1, 2, 3, 4, 5];

//
//  * slice(list) // => [1, 2, 3, 4, 5]
//  * slice(list, 2) // => [3, 4, 5]
//  * slice(list, 2, 4) // => [3, 4]
//  * slice(list, -2) // => [4, 5]
//  * slice(list, null, -1) // => [1, 2, 3, 4]
//  * slice(list, null, null, 2) // => [1, 3, 5]
//  * slice(list, null, null, -2) // => [5, 3, 1]
//  * slice('kids a devil I tell ya', 7, -10, -1) // => 'lived'
//

describe('pyslice', () => {

    it('no args yields a copy', () => {
        expect(slice(list)).toEqual(list);
    });

    it('to==null defaults to length', () => {
        expect(slice(list, 2)).toEqual([3, 4, 5]);
    });

    it('from, to', () => {
        expect(slice(list, 2, 4)).toEqual([3, 4]);
    });

    it('to == null default to length, -ve from', () => {
        expect(slice(list, -2)).toEqual([4, 5]);
    });

    it('from == null defaults to 0, -ve to', () => {
        expect(slice(list, null, -1)).toEqual([1, 2, 3, 4]);
    });

    it('+ve step, from == null defaults to 0, to == null defaults to length ', () => {
        expect(slice(list, null, null, 2)).toEqual([1, 3, 5]);
    });

    it('to == null defaults to length, step > 1', () => {
        expect(slice(list, 2)).toEqual([3, 4, 5]);
    });

    it('-ve step, from > to', () => {
        expect(slice(list, 4, 2, -1)).toEqual([5, 4]);
    });

    it('from == null defaults to length,  to == null defaults to 0, -ve step ', () => {

        /**
         * slice:: null null -2
         * slice::defaulted:: 5 0 -2
         * slice::normalized:: 5 0 -2
         * equivalent::slice:: 1:6:2.reversed()
         * */
        expect(slice(list, null, null, -2), [5, 3]);
    });

    it('slice with +from, -to', () => {
        expect(slice('kids a devil I tell ya', 7, -10, 1)).toEqual('devil');
    });

    it('slice meaningless extent, normalize to 7, 12, -1', () => {
        expect(slice('kids a devil I tell ya', 7, -10, -1)).toEqual('');
    });

    it('slice meaningless extents by -ve step', () => {
        expect(slice(list, -4, -2, -1)).toEqual([]);
    });

    it('slice -from < -to, +ve step', () => {
        expect(slice(list, -4, -2, 1)).toEqual([2, 3]);
    });

    it('slice -from < -to by -ve step', () => {
        expect(slice(list, -2, -4, -1)).toEqual([4, 3]);
    });

    it('-2, -4, -1 normalized to 3, 1, -1', () => {
        expect(slice(list, 3, 1, -1)).toEqual([4, 3]);
    });

    it('slice meaningless extents by +ve step', () => {
        expect(slice(list, -2, -4, 1)).toEqual([]);
    });
});
