const jp = require('../../index');

describe('sugar', () => {

    it('parent gets us parent value', () => {
        const data = {a: 1, b: 2, c: 3, z: {a: 100, b: 200}};
        const parent = jp.parent(data, '$.z.b');
        expect(parent).toEqual(data.z);
    });

    it('apply method sets values', () => {
        const data = {a: 1, b: 2, c: 3, z: {a: 100, b: 200}};
        jp.apply(data, '$..a', (v) => {
            return v + 1;
        });
        expect(data.a).toEqual(2);
        expect(data.z.a).toEqual(101);
    });

    it('value method gets us a value', () => {
        const data = {a: 1, b: 2, c: 3, z: {a: 100, b: 200}};
        const b = jp.value(data, '$..b');
        expect(b).toEqual(data.b);
    });

    it('value method sets us a value', () => {
        const data = {a: 1, b: 2, c: 3, z: {a: 100, b: 200}};
        const b = jp.value(data, '$..b', '5000');
        expect(b).toEqual(5000);
        expect(data.b).toEqual(5000);
    });

    it('value method sets new key and value', () => {
        const data = {};
        const a = jp.value(data, '$.a', 1);
        const c = jp.value(data, '$.b.c', 2);
        expect(a).toEqual(1);
        expect(data.a).toEqual(1);
        expect(c).toEqual(2);
        expect(data.b.c).toEqual(2);
    });

    it('value method sets new array value', () => {
        const data = {};
        const v1 = jp.value(data, '$.a.d[0]', 4);
        const v2 = jp.value(data, '$.a.d[1]', 5);
        expect(v1).toEqual(4);
        expect(v2).toEqual(5);
        expect(data.a.d).toEqual([4, 5]);
    });

});
