const jp = require('../../index');

describe('stringify', () => {

    it('simple path stringifies', () => {
        const string = jp.stringify(['$', 'a', 'b', 'c']);
        expect(string).toEqual('$.a.b.c');
    });

    it('numeric literals end up as subscript numbers', () => {
        const string = jp.stringify(['$', 'store', 'book', 0, 'author']);
        expect(string).toEqual('$.store.book[0].author');
    });

    it('simple path with no leading root stringifies', () => {
        const string = jp.stringify(['a', 'b', 'c']);
        expect(string).toEqual('$.a.b.c');
    });

    it('simple parsed path stringifies', () => {
        const path = [
            {scope: 'child', operation: 'member', expression: {type: 'identifier', value: 'a'}},
            {scope: 'child', operation: 'member', expression: {type: 'identifier', value: 'b'}},
            {scope: 'child', operation: 'member', expression: {type: 'identifier', value: 'c'}}
        ];
        const string = jp.stringify(path);
        expect(string).toEqual('$.a.b.c');
    });

    it('keys with hyphens get subscripted', () => {
        const string = jp.stringify(['$', 'member-search']);
        expect(string).toEqual('$["member-search"]');
    });

    it('complicated path round trips', () => {
        const pathExpression = '$..*[0:2].member["string-xyz"]';
        const path = jp.parse(pathExpression);
        const string = jp.stringify(path);
        expect(string).toEqual(pathExpression);
    });

    it('complicated path with filter exp round trips', () => {
        const pathExpression = '$..*[0:2].member[?(@.val > 10)]';
        const path = jp.parse(pathExpression);
        const string = jp.stringify(path);
        expect(string).toEqual(pathExpression);
    });

    it('throws for no input', () => {
        expect(() => {
            jp.stringify();
        }).toThrow(/we need a path/);
    });

});
