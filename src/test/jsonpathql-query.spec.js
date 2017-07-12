const jp = require('../../index');
const traverse = require('traverse');
const data = require('./data/deep-store.json');


describe('jsonpath#query', () => {

    it('- leading member', () => {
        const results = jp.nodes(data, 'store');
        expect(results).toEqual([{path: ['$', 'store'], value: data.store}]);
    });

    it('authors of all books in the store', () => {
        const results = jp.nodes(data, '$.store.book[*].author..name');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien'}
        ]);
    });

    it('authors of all books in the store via STAR followed by subscript', () => {
        const results = jp.nodes(data, '$..*[author]..name');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien'}
        ]);
    });

    it('all books [author,title] via subscript expression with leading * (loose structure matching)', () => {
        const results = jp.nodes(data, '$..*[author,title]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author},
            {path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title},
            {path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author},
            {path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title},
            {path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author},
            {path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title},
            {path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author},
            {path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title}
        ]);
    });

    it('authors of all books in the store via branches', () => {
        const results = jp.nodes(data, '$.store.book[0.author..name,1.author..name,2.author..name,3.author..name]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees'},
            {path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh'},
            {path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville'},
            {path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien'}
        ]);
    });

    it('selective branches via nested descendant branches', () => {

        const results = jp.nodes(data, '$.store.book[0..[..name,..twitter],1..[..name,..twitter]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Nigel Rees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@NigelRees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Evelyn Waugh"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@EvelynWaugh"
            }
        ]);
    });

    it('selective branches via nested branches', () => {

        const results = jp.nodes(data, '$.store.book[.author[.profile[name,twitter]],.author[.profile[name,twitter]]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Nigel Rees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@NigelRees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Evelyn Waugh"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@EvelynWaugh"
            }
        ]);
    });


    it('all books with [isbn,title] via subscript expression with leading * strict structure matching via filter', () => {
        const results = jp.nodes(data, '$..*[?(@.isbn && @.title)][isbn,title]');
        expect(results).toEqual([
            {path: ['$', 'store', 'book', 2, 'isbn'], value: data.store.book[2].isbn},
            {path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title},
            {path: ['$', 'store', 'book', 3, 'isbn'], value: data.store.book[3].isbn},
            {path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title}
        ]);
    });

//  test('all books with [isbn,title] via subscript expression with leading * (strict structure matching) via $has filter', () => {
//    var results = jp.nodes(data, '$..*[?($has("isbn", "title"))][isbn,title]');
//    expect(results).toEqual([
//      { path: ['$', 'store', 'book', 2, 'isbn'], value: data.store.book[2].isbn },
//      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
//      { path: ['$', 'store', 'book', 3, 'isbn'], value: data.store.book[3].isbn },
//      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title }
//    ]);
//  });

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

    it('first two authors via nested subscripts', () => {
        const results = jp.nodes(data, '$..book[0[author[0].profile[name,twitter]],1[author[0].profile[name,twitter]]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Nigel Rees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@NigelRees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Evelyn Waugh"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@EvelynWaugh"
            }
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
            {
                path: ['$', 'store'],
                value: {
                    book: [
                        {
                            category: 'reference',
                            author: [{
                                profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                                rating: 4
                            }],
                            title: 'Sayings of the Century',
                            price: 8.95
                        },
                        {
                            category: 'fiction',
                            author: [{
                                profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                                rating: 4
                            }],
                            title: 'Sword of Honour',
                            price: 12.99
                        },
                        {
                            category: 'fiction',
                            author: [{
                                profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                                rating: 4
                            }],
                            title: 'Moby Dick',
                            isbn: '0-553-21311-3',
                            price: 8.99
                        },
                        {
                            category: 'fiction',
                            author: [{
                                profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                                rating: 4
                            }],
                            title: 'The Lord of the Rings',
                            isbn: '0-395-19395-8',
                            price: 22.99
                        }],
                    bicycle: {color: 'red', price: 19.95}
                }
            },
            {
                path: ['$', 'store', 'book'],
                value: [
                    {
                        category: 'reference',
                        author: [{
                            profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                            rating: 4
                        }],
                        title: 'Sayings of the Century',
                        price: 8.95
                    },
                    {
                        category: 'fiction',
                        author: [{
                            profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                            rating: 4
                        }],
                        title: 'Sword of Honour',
                        price: 12.99
                    },
                    {
                        category: 'fiction',
                        author: [{
                            profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                            rating: 4
                        }],
                        title: 'Moby Dick',
                        isbn: '0-553-21311-3',
                        price: 8.99
                    },
                    {
                        category: 'fiction',
                        author: [{
                            profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                            rating: 4
                        }],
                        title: 'The Lord of the Rings',
                        isbn: '0-395-19395-8',
                        price: 22.99
                    }]
            },
            {
                path: ['$', 'store', 'bicycle'],
                value: {color: 'red', price: 19.95}
            },
            {
                path: ['$', 'store', 'book', 0],
                value: {
                    category: 'reference',
                    author: [{
                        profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                        rating: 4
                    }],
                    title: 'Sayings of the Century',
                    price: 8.95
                }
            },
            {
                path: ['$', 'store', 'book', 1],
                value: {
                    category: 'fiction',
                    author: [{
                        profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                        rating: 4
                    }],
                    title: 'Sword of Honour',
                    price: 12.99
                }
            },
            {
                path: ['$', 'store', 'book', 2],
                value: {
                    category: 'fiction',
                    author: [{
                        profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                        rating: 4
                    }],
                    title: 'Moby Dick',
                    isbn: '0-553-21311-3',
                    price: 8.99
                }
            },
            {
                path: ['$', 'store', 'book', 3],
                value: {
                    category: 'fiction',
                    author: [{
                        profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                        rating: 4
                    }],
                    title: 'The Lord of the Rings',
                    isbn: '0-395-19395-8',
                    price: 22.99
                }
            },
            {
                path: ['$', 'store', 'book', 0, 'category'],
                value: 'reference'
            },
            {
                path: ['$', 'store', 'book', 0, 'author'],
                value: [{
                    profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                    rating: 4
                }]
            },
            {
                path: ['$', 'store', 'book', 0, 'title'],
                value: 'Sayings of the Century'
            },
            {path: ['$', 'store', 'book', 0, 'price'], value: 8.95},
            {
                path: ['$', 'store', 'book', 0, 'author', 0],
                value: {
                    profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 0, 'author', 0, 'profile'],
                value: {name: 'Nigel Rees', twitter: '@NigelRees'}
            },
            {
                path: ['$', 'store', 'book', 0, 'author', 0, 'rating'],
                value: 4
            },
            {
                path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'],
                value: 'Nigel Rees'
            },
            {
                path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'twitter'],
                value: '@NigelRees'
            },
            {
                path: ['$', 'store', 'book', 1, 'category'],
                value: 'fiction'
            },
            {
                path: ['$', 'store', 'book', 1, 'author'],
                value: [{
                    profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                    rating: 4
                }]
            },
            {
                path: ['$', 'store', 'book', 1, 'title'],
                value: 'Sword of Honour'
            },
            {path: ['$', 'store', 'book', 1, 'price'], value: 12.99},
            {
                path: ['$', 'store', 'book', 1, 'author', 0],
                value: {
                    profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 1, 'author', 0, 'profile'],
                value: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'}
            },
            {
                path: ['$', 'store', 'book', 1, 'author', 0, 'rating'],
                value: 4
            },
            {
                path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'],
                value: 'Evelyn Waugh'
            },
            {
                path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'twitter'],
                value: '@EvelynWaugh'
            },
            {
                path: ['$', 'store', 'book', 2, 'category'],
                value: 'fiction'
            },
            {
                path: ['$', 'store', 'book', 2, 'author'],
                value: [{
                    profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                    rating: 4
                }]
            },
            {
                path: ['$', 'store', 'book', 2, 'title'],
                value: 'Moby Dick'
            },
            {
                path: ['$', 'store', 'book', 2, 'isbn'],
                value: '0-553-21311-3'
            },
            {path: ['$', 'store', 'book', 2, 'price'], value: 8.99},
            {
                path: ['$', 'store', 'book', 2, 'author', 0],
                value: {
                    profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 2, 'author', 0, 'profile'],
                value: {name: 'Herman Melville', twitter: '@Herman Melville'}
            },
            {
                path: ['$', 'store', 'book', 2, 'author', 0, 'rating'],
                value: 4
            },
            {
                path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'],
                value: 'Herman Melville'
            },
            {
                path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'twitter'],
                value: '@Herman Melville'
            },
            {
                path: ['$', 'store', 'book', 3, 'category'],
                value: 'fiction'
            },
            {
                path: ['$', 'store', 'book', 3, 'author'],
                value: [{
                    profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                    rating: 4
                }]
            },
            {
                path: ['$', 'store', 'book', 3, 'title'],
                value: 'The Lord of the Rings'
            },
            {
                path: ['$', 'store', 'book', 3, 'isbn'],
                value: '0-395-19395-8'
            },
            {path: ['$', 'store', 'book', 3, 'price'], value: 22.99},
            {
                path: ['$', 'store', 'book', 3, 'author', 0],
                value: {
                    profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 3, 'author', 0, 'profile'],
                value: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'}
            },
            {
                path: ['$', 'store', 'book', 3, 'author', 0, 'rating'],
                value: 4
            },
            {
                path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'],
                value: 'J. R. R. Tolkien'
            },
            {
                path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'twitter'],
                value: '@J. R. R. Tolkien'
            },
            {path: ['$', 'store', 'bicycle', 'color'], value: 'red'},
            {path: ['$', 'store', 'bicycle', 'price'], value: 19.95}]);
    });

    it('all elements via subscript wildcard', () => {
        const results = jp.nodes(data, '$..*');
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

    it('* Circular Reference Case descendant numeric literal gets first element', () => {
        const results = jp.nodes(data, '$.store.book..0');

        /** demonestrates a case of circular reference since book[0].athuor[0] is included twice, shoulw be extracted as $ref
         *  - traverse doesn't detect a circular reference since the reference is not a direct parent of the node but a leaf of a sibling */
        expect(results).toEqual([
            {
                path: ['$', 'store', 'book', 0],
                value: {
                    category: 'reference',
                    author: [{
                        profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                        rating: 4
                    }],
                    title: 'Sayings of the Century',
                    price: 8.95
                }
            },
            {
                path: ['$', 'store', 'book', 0, 'author', 0],
                value: {
                    profile: {name: 'Nigel Rees', twitter: '@NigelRees'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 1, 'author', 0],
                value: {
                    profile: {name: 'Evelyn Waugh', twitter: '@EvelynWaugh'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 2, 'author', 0],
                value: {
                    profile: {name: 'Herman Melville', twitter: '@Herman Melville'},
                    rating: 4
                }
            },
            {
                path: ['$', 'store', 'book', 3, 'author', 0],
                value: {
                    profile: {name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien'},
                    rating: 4
                }
            }]);
    });

    it('branches via active index', () => {

        const results = jp.nodes(data, '$..book[[*],[title,price],[title,price]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "category"
                ],
                "value": "reference"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author"
                ],
                "value": [
                    {
                        "profile": {
                            "name": "Nigel Rees",
                            "twitter": "@NigelRees"
                        },
                        "rating": 4
                    }
                ]
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "title"
                ],
                "value": "Sayings of the Century"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "price"
                ],
                "value": 8.95
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "title"
                ],
                "value": "Sword of Honour"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "price"
                ],
                "value": 12.99
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "price"
                ],
                "value": 8.99
            }
        ]);
    });

    it('branches with good old script expression', () => {

        const results = jp.nodes(data, '$..book.0[("title")]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "title"
                ],
                "value": "Sayings of the Century"
            }
        ]);
    });

    it('branches with list of script expression via leading index', () => {

        const results = jp.query(data, '$..book[0.("title"),1.("title")]');
        expect(results).toEqual([
            data.store.book[0].title,
            data.store.book[1].title
        ]);
    });

    it('child member script expression', () => {
        const results = jp.nodes(data, '$..book.(@.length-1).title');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "title"
                ],
                "value": "The Lord of the Rings"
            }
        ]);
    });

    it('branch out and in via active index, single subscript and subscript list branch cases', () => {
        const results = jp.nodes(data, '$..book[.author,[author][0].profile.name,.author[0].profile.name]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author"
                ],
                "value": [
                    {
                        "profile": {
                            "name": "Nigel Rees",
                            "twitter": "@NigelRees"
                        },
                        "rating": 4
                    }
                ]
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Evelyn Waugh"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Herman Melville"
            }
        ]);
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
        const data = ['0-0', '1-0', ['2-0', '2-1', '2-2'], ['3-0', '3-1', 3 - 2, ['3-3-0', '3-3-1', '3-3-2']]];
        const results = jp.query(data, '$..[0,1]');
        expect(results).toEqual([
            "0-0",
            "2-0",
            "3-0",
            "3-3-0",
            "1-0",
            "2-1",
            "3-1",
            "3-3-1"
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

    it('[header, details, footer] all books [author,title] via list of subscript expression with first level STAR expression, header, details, footer style', () => {
        const results = jp.nodes(data, '$..book.0..author[*..name,*,*..twitter]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Nigel Rees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0
                ],
                "value": {
                    "profile": {
                        "name": "Nigel Rees",
                        "twitter": "@NigelRees"
                    },
                    "rating": 4
                }
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "twitter"
                ],
                "value": "@NigelRees"
            }
        ]);
    });

    it('[all except] all author details via except the twitter handle using a filter-out', () => {
        const results = jp.nodes(data, '$..book.*..author[.profile..[?($key !== "twitter")]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Nigel Rees"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Evelyn Waugh"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "Herman Melville"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "author",
                    0,
                    "profile",
                    "name"
                ],
                "value": "J. R. R. Tolkien"
            }
        ]);
    });

    it('all books [author,title] via list of subscript expression with first level filter expression', () => {
        const results = jp.nodes(data, '$..book[?(@.isbn).title,?(@.isbn).price]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "title"
                ],
                "value": "The Lord of the Rings"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "price"
                ],
                "value": 8.99
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "price"
                ],
                "value": 22.99
            }
        ]);
    });

    it('all books [author,title] via list of subscript expression with first level slice expression', () => {
        const results = jp.nodes(data, '$..book[0:2.title,2:4.title]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "title"
                ],
                "value": "Sayings of the Century"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "title"
                ],
                "value": "Sword of Honour"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "title"
                ],
                "value": "The Lord of the Rings"
            }
        ]);
    });

    it('all books [author,title] via list of subscript expression with first level active slice expression', () => {
        const results = jp.nodes(data, '$..book[(#slice {@.length-3}):({@.length-1}).title, (#slice {@.length-3}):({@.length-1}).price]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "title"
                ],
                "value": "Sword of Honour"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "price"
                ],
                "value": 12.99
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "price"
                ],
                "value": 8.99
            }
        ]);
    });

    it('all books [title] via single subscript expression with first level active slice expression', () => {
        const results = jp.nodes(data, '$..book[(#slice {@.length-4}):({@.length})[title,price]]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "title"
                ],
                "value": "Sayings of the Century"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    0,
                    "price"
                ],
                "value": 8.95
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "title"
                ],
                "value": "Sword of Honour"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    1,
                    "price"
                ],
                "value": 12.99
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "price"
                ],
                "value": 8.99
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "title"
                ],
                "value": "The Lord of the Rings"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    3,
                    "price"
                ],
                "value": 22.99
            }
        ]);
    });

    it('all books [author,title] via list of subscript expression with first level script expression', () => {
        const results = jp.nodes(data, '$..book[(@.length-2).title,(@.length-2).price]');
        expect(results).toEqual([
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "title"
                ],
                "value": "Moby Dick"
            },
            {
                "path": [
                    "$",
                    "store",
                    "book",
                    2,
                    "price"
                ],
                "value": 8.99
            }
        ]);
    });

    it('all books [author,title] via list of subscript expression with first level active script expression', () => {
        const results = jp.query(data, '$..book[({@.length-2}).title,({@.length-2}).price]');
        expect(results).toEqual([
            data.store.book[2].title,
            data.store.book[2].price
        ]);
    });

    it('[?subscript-child-call_expression] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', () => {
        expect(() => {
            jp.query(data, '$..book[(delay: 100).title,(delay: 100 ).price]');
        }).toThrow("Unsupported query component: subscript-child-call_expression");
    });

    it('[?subscript-child-call_expression] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', () => {
        expect(() => {
            jp.query(data, '$..book[(delay: 100).title,(delay: 100 ).price]');
        }).toThrow("Unsupported query component: subscript-child-call_expression");
    });

    it('[?] in call expression, spaces are illegal between the opening ( and the key, and between the key and the ":", parsed as an invalid script expressionl', () => {
        const results = jp.query(data, '$..book[( delay: 100).title,( delay: 100 ).price]');
        expect(results).toEqual([]);
    });

    it('[?subscript-child-call_expression] subscript-style call expression with identifier style key', () => {
        expect(() => {
            jp.query(data, '$..book(take: 2).title');
        }).toThrow("Unsupported query component: subscript-child-call_expression"); //subscript style call
    });

    it('[?subscript-child-call_expression] subscript-style call expression with keyword literal style key coerces into string', () => {
        expect(() => {
            jp.query(data, "$..book(true: 2).title");
        }).toThrow("Unsupported query component: subscript-child-call_expression"); //subscript style call
    });

    it('just a member followed by a script expression, while implementation can produce the same result, the parser does not consider this a call expression, not to be confused with book(take: 2)', () => {
        const results = jp.query(data, '$..book.(2).title');
        expect(results).toEqual([data.store.book[2].title]);
    });

    it('[?subscript-descendant-call_expression] descendant call expression', () => {
        expect(() => {
            jp.query(data, '$.store.*..(take: 1).name');
        }).toThrow("Unsupported query component: subscript-descendant-call_expression"); //first of each category
    });

    it('active script expressions listables are still members :: SCRIPT', () => {
        const results = jp.query(data, '$..book.(@.length-1).title');
        expect(results).toEqual([
            "The Lord of the Rings"
        ]);
    });

    it('active script expressions listables are still members :: ACTIVE_SCRIPT', () => {
        const results = jp.query(data, '$..book.({@.length-1}).title');
        expect(results).toEqual([
            "The Lord of the Rings"
        ]);
    });


});

