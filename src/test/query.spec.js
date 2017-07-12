const jp = require('../../index');

const data = require('./data/store.json');

describe('query', () => {

    it('first-level member', () => {
        const results = jp.nodes(data, '$.store');
        expect(results).toEqual([{path: ['$', 'store'], value: data.store}]);
    });

    it('authors of all books in the store', () => {
        const results = jp.nodes(data, '$.store.book[*].author');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 1, 'author'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 2, 'author'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. Tolkien'}
        ]);
    });

    it('all authors', () => {
        const results = jp.nodes(data, '$..author');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 1, 'author'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 2, 'author'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. Tolkien'}
        ]);
    });

    it('all things in store', () => {
        const results = jp.nodes(data, '$.store.*');
        expect(results).toEqual([
            {path: ['$', 'store', 'book'], value: data.store.book},
            {path: ['$', 'store', 'bicycle'], value: data.store.bicycle}
        ]);
    });

    it('price of everything in the store', () => {
        const results = jp.nodes(data, '$.store..price');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'price'], value: 8.95},
            {path: ['$', 'store', 'book', 1, 'price'], value: 12.99},
            {path: ['$', 'store', 'book', 2, 'price'], value: 8.99},
            {path: ['$', 'store', 'book', 3, 'price'], value: 22.99},
            {path: ['$', 'store', 'bicycle', 'price'], value: 19.95}
        ]);
    });

    it('last book in order via expression', () => {
        const results = jp.nodes(data, '$..book[(@.length-1)]');
        expect(results).toEqual([{path: ['$', 'store', 'book', 3], value: data.store.book[3]}]);
    });

    it('first two books via union', () => {
        const results = jp.nodes(data, '$..book[0,1]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0], value: data.store.book[0]},
            {path: ['$', 'store', 'book', 1], value: data.store.book[1]}
        ]);
    });

    it('first two books via slice', () => {
        const results = jp.nodes(data, '$..book[0:2]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0], value: data.store.book[0]},
            {path: ['$', 'store', 'book', 1], value: data.store.book[1]}
        ]);
    });

    it('filter all books with isbn number', () => {
        const results = jp.nodes(data, '$..book[?(@.isbn)]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 2], value: data.store.book[2]},
            {path: ['$', 'store', 'book', 3], value: data.store.book[3]}
        ]);
    });

    it('filter all books with a price less than 10', () => {
        const results = jp.nodes(data, '$..book[?(@.price<10)]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0], value: data.store.book[0]},
            {path: ['$', 'store', 'book', 2], value: data.store.book[2]}
        ]);
    });

    it('all elements', () => {
        const results = jp.nodes(data, '$..*');

        expect(results).toEqual([
            {path: ['$', 'store'], value: data.store},
            {path: ['$', 'store', 'book'], value: data.store.book},
            {path: ['$', 'store', 'bicycle'], value: data.store.bicycle},
            {path: ['$', 'store', 'book', 0], value: data.store.book[0]},
            {path: ['$', 'store', 'book', 1], value: data.store.book[1]},
            {path: ['$', 'store', 'book', 2], value: data.store.book[2]},
            {path: ['$', 'store', 'book', 3], value: data.store.book[3]},
            {path: ['$', 'store', 'book', 0, 'category'], value: 'reference'},
            {path: ['$', 'store', 'book', 0, 'author'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 0, 'title'], value: 'Sayings of the Century'},
            {path: ['$', 'store', 'book', 0, 'price'], value: 8.95},
            {path: ['$', 'store', 'book', 1, 'category'], value: 'fiction'},
            {path: ['$', 'store', 'book', 1, 'author'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 1, 'title'], value: 'Sword of Honour'},
            {path: ['$', 'store', 'book', 1, 'price'], value: 12.99},
            {path: ['$', 'store', 'book', 2, 'category'], value: 'fiction'},
            {path: ['$', 'store', 'book', 2, 'author'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 2, 'title'], value: 'Moby Dick'},
            {path: ['$', 'store', 'book', 2, 'isbn'], value: '0-553-21311-3'},
            {path: ['$', 'store', 'book', 2, 'price'], value: 8.99},
            {path: ['$', 'store', 'book', 3, 'category'], value: 'fiction'},
            {path: ['$', 'store', 'book', 3, 'author'], value: 'J. R. R. Tolkien'},
            {path: ['$', 'store', 'book', 3, 'title'], value: 'The Lord of the Rings'},
            {path: ['$', 'store', 'book', 3, 'isbn'], value: '0-395-19395-8'},
            {path: ['$', 'store', 'book', 3, 'price'], value: 22.99},
            {path: ['$', 'store', 'bicycle', 'color'], value: 'red'},
            {path: ['$', 'store', 'bicycle', 'price'], value: 19.95}
        ]);
    });

    it('all elements via subscript wildcard', () => {
        expect(jp.nodes(data, '$..[*]')).toEqual(jp.nodes(data, '$..*'));
    });

    it('object subscript wildcard', () => {
        const results = jp.query(data, '$.store[*]');
        expect(results).toEqual([data.store.book, data.store.bicycle]);
    });

    it('no match returns empty array', () => {
        const results = jp.nodes(data, '$..bookz');
        expect(results).toEqual([]);
    });

    it('member numeric literal gets first element', () => {
        const results = jp.nodes(data, '$.store.book.0');
        expect(results).toEqual([{path: ['$', 'store', 'book', 0], value: data.store.book[0]}]);
    });

    it('descendant numeric literal gets first element', () => {
        const results = jp.nodes(data, '$.store.book..0');
        expect(results).toEqual([{path: ['$', 'store', 'book', 0], value: data.store.book[0]}]);
    });

    it('root element gets us original obj', () => {
        const results = jp.nodes(data, '$');
        expect(results).toEqual([{path: ['$'], value: data}]);
    });

    it('subscript double-quoted string', () => {
        const results = jp.nodes(data, '$["store"]');
        expect(results).toEqual([{path: ['$', 'store'], value: data.store}]);
    });

    it('subscript single-quoted string', () => {
        const results = jp.nodes(data, "$['store']");
        expect(results).toEqual([{path: ['$', 'store'], value: data.store}]);
    });

    it('leading member component', () => {
        const results = jp.nodes(data, "store");
        expect(results).toEqual([{path: ['$', 'store'], value: data.store}]);
    });

    it('union of three array slices', () => {
        const results = jp.query(data, "$.store.book[0:1,1:2,2:3]");
        expect(results).toEqual(data.store.book.slice(0, 3));
    });

    it('slice with step > 1', () => {
        const results = jp.query(data, "$.store.book[0:4:2]");
        expect(results).toEqual([data.store.book[0], data.store.book[2]]);
    });

    it('slice with step < 0', () => {
        const results = jp.query(data, "$.store.book[4:0:-1]");
        expect(results).toEqual([
            data.store.book[3],
            data.store.book[2],
            data.store.book[1],
        ]);
    });

    it('slice with start < end, step < 0', () => {
        const results = jp.paths(data, "$.store.book[0:2:-1]");
        expect(results).toEqual([]);
    });

    it('union of subscript string literal keys', () => {
        const results = jp.nodes(data, "$.store['book','bicycle']");
        expect(results).toEqual([
            {path: ['$', 'store', 'book'], value: data.store.book},
            {path: ['$', 'store', 'bicycle'], value: data.store.bicycle},
        ]);
    });

    it('union of subscript string literal three keys', () => {
        const results = jp.nodes(data, "$.store.book[0]['title','author','price']");
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title},
            {path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author},
            {path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price}
        ]);
    });

    it('union of subscript integer three keys followed by member-child-identifier', () => {
        const results = jp.nodes(data, "$.store.book[1,2,3]['title']");
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title},
            {path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title},
            {path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title}
        ]);
    });

    it('union of subscript integer three keys followed by union of subscript string literal three keys', () => {
        const results = jp.nodes(data, "$.store.book[0,1,2,3]['title','author','price']");
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title},
            {path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author},
            {path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price},
            {path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title},
            {path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author},
            {path: ['$', 'store', 'book', 1, 'price'], value: data.store.book[1].price},
            {path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title},
            {path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author},
            {path: ['$', 'store', 'book', 2, 'price'], value: data.store.book[2].price},
            {path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title},
            {path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author},
            {path: ['$', 'store', 'book', 3, 'price'], value: data.store.book[3].price}
        ]);
    });

    it('union of subscript 4 array slices followed by union of subscript string literal three keys', () => {
        const results = jp.nodes(data, "$.store.book[0:1,1:2,2:3,3:4]['title','author','price']");
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title},
            {path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author},
            {path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price},
            {path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title},
            {path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author},
            {path: ['$', 'store', 'book', 1, 'price'], value: data.store.book[1].price},
            {path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title},
            {path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author},
            {path: ['$', 'store', 'book', 2, 'price'], value: data.store.book[2].price},
            {path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title},
            {path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author},
            {path: ['$', 'store', 'book', 3, 'price'], value: data.store.book[3].price}
        ]);
    });


    it('nested parentheses eval', () => {
        const pathExpression = '$..book[?( @.price && (@.price + 20 || false) )]';
        const results = jp.query(data, pathExpression);
        expect(results).toEqual(data.store.book);
    });

    it('array indexes from 0 to 100', () => {
        const data = [];
        for (let i = 0; i <= 100; ++i) {
            data[i] = Math.random();
        }

        for (let i = 0; i <= 100; ++i) {
            const results = jp.query(data, `$[${i.toString()}]`);
            expect(results).toEqual([data[i]]);
        }
    });

    it('descendant subscript numeric literal', () => {
        const data = [0, [1, 2, 3], [4, 5, 6]];
        const results = jp.query(data, '$..[0]');
        expect(results).toEqual([0, 1, 4]);
    });

    it('descendant subscript numeric literal', () => {
        const data = [0, 1, [2, 3, 4], [5, 6, 7, [8, 9, 10]]];
        const results = jp.query(data, '$..[0,1]');
        expect(results).toEqual([
            0,
            2,
            5,
            8,
            1,
            3,
            6,
            9
        ]);
    });

    it('throws for no input', () => {
        expect(() => {
            jp.query();
        }).toThrow(/needs to be an object/);
    });

    it('throws for bad input', () => {
        expect(() => {
            jp.query("string", "string");
        }).toThrow(/needs to be an object/);
    });

    it('throws for bad input', () => {
        expect(() => {
            jp.query({}, null);
        }).toThrow(/we need a path/);
    });

});

