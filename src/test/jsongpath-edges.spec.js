const jpql = require('../index');
const data = require('./data/deep-store.json');
const _ = require('lodash');

describe('jsonGpath edges', () => {

    it('parse nested subscript expression with leading simple expression (integer)', () => {
        const results = jpql.nodes(data, '$..book[0..[name,rating]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'rating'
                ],
                value: 4
            }
        ]);
    });

    it('parse nested subscript expression with leading simple expression (string-literal)', () => {
        const results = jpql.nodes(data, '$..book.0["author"[.profile[name,twitter]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });

    it('parse nested subscript expression with leading simple expression (identifier) - active indices', () => {
        const results = jpql.nodes(data, '$..book[[author[.profile[name,twitter]]],[author[.profile[name,twitter]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Evelyn Waugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@EvelynWaugh'
            }
        ]);
    });

//  test('parse nested subscript expression with leading simple expression (keyword)', () => {
//    var results = jpql.nodes(data, '$..book.0[true[0[name,twitter]]]');
//    expect(results).toEqual([false]);
//  });

    it('parse nested subscript expression with leading active expression (array-slice)', () => {
        const results = jpql.nodes(data, '$..book[1:3[author[0..[name,twitter]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Evelyn Waugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@EvelynWaugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Herman Melville'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@Herman Melville'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (active-array-slice)', () => {
        const results = jpql.nodes(data, '$..book[({@.length-3}):({@.length-2})[author[..profile[name,twitter]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Evelyn Waugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@EvelynWaugh'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (script-expression)', () => {
        const results = jpql.nodes(data, '$..book[(@.length-4)[author[0.profile[name,twitter]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (active-script-expression)', () => {
        const results = jpql.nodes(data, '$..book[({@.length-4})[author[[profile[name,twitter]]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (star)', () => {
        const results = jpql.nodes(data, '$..book[*[author[[profile[name,twitter]]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Evelyn Waugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    1,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@EvelynWaugh'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Herman Melville'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@Herman Melville'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    3,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'J. R. R. Tolkien'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    3,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@J. R. R. Tolkien'
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression (filter-expression)', () => {
        const results = jpql.nodes(data, '$..book[?(@.isbn)[author[[profile[name,twitter]],[profile[twitter]]]]]');
        // no results for profile.index=1[profile, twitter]
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Herman Melville'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    2,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@Herman Melville'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    3,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'J. R. R. Tolkien'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    3,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@J. R. R. Tolkien'
            }
        ]);
    });

    it('parse nested subscript expression with a list of (filter-expression)', () => {
//    var results = jpql.paths(data, '$..book[?(@.isbn)[author[0.profile[name,twitter]]],?(@.price<20)[author[0[profile][name,twitter]]]]');
        const results = jpql.paths(data, '$..book[?(@.isbn)[author[0.profile[name,twitter]]]]');
        expect(results).toEqual([
            [
                '$',
                'store',
                'book',
                2,
                'author',
                0,
                'profile',
                'name'
            ],
            [
                '$',
                'store',
                'book',
                2,
                'author',
                0,
                'profile',
                'twitter'
            ],
            [
                '$',
                'store',
                'book',
                3,
                'author',
                0,
                'profile',
                'name'
            ],
            [
                '$',
                'store',
                'book',
                3,
                'author',
                0,
                'profile',
                'twitter'
            ]
        ]);
    });

    it('[Circular Reference Scenario] parse nested subscript expression with leading active expression ($)', () => {
        const _data = {
            i18n: {'default': 'english', language: ['english', 'french']},
            book: [{english: {description: 'english description'}, french: {description: 'french description'}}]
        };
        const results = jpql.nodes(_data, "$.book[*][$.i18n['default'],({$.i18n.language})]"); //$$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'i18n',
                    'default'
                ],
                value: 'english'
            },
            {
                path: [
                    '$',
                    'book',
                    0,
                    'english'
                ],
                value: {
                    description: 'english description'
                }
            },
            {
                path: [
                    '$',
                    'book',
                    0,
                    'french'
                ],
                value: {
                    description: 'french description'
                }
            }
        ]);
    });

    it('parse nested subscript expression with leading active expression ($) yielding multiple results (no result expansion)', () => {
        const _data = {
            i18n: {'default': 'english', language: ['english', 'french']},
            book: [{english: {description: 'english description'}, french: {description: 'french description'}}]
        };
        const results = jpql.nodes(_data, '$.book[*][english,$.i18n.language[*]]'); //$$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'book',
                    0,
                    'english'
                ],
                value: {
                    description: 'english description'
                }
            },
            {
                path: [
                    '$',
                    'i18n',
                    'language',
                    0
                ],
                value: 'english'
            },
            {
                path: [
                    '$',
                    'i18n',
                    'language',
                    1
                ],
                value: 'french'
            }
        ]);
    });

    it('[*] splat expanding results of active script expression with $$ root back reference', () => {

        const _data = {
            i18n: {'default': 'english', language: ['english', 'french']},
            book: [{english: {description: 'english description'}, french: {description: 'french description'}}]
        };
        const results = jpql.nodes(_data, '$.book[*][({$.i18n.default}),({$.i18n.language}).description]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'book',
                    0,
                    'english'
                ],
                value: {
                    description: 'english description'
                }
            },
            {
                path: [
                    '$',
                    'book',
                    0,
                    'english',
                    'description'
                ],
                value: 'english description'
            },
            {
                path: [
                    '$',
                    'book',
                    0,
                    'french',
                    'description'
                ],
                value: 'french description'
            }
        ]);
    });

    it('parse active filter expression with $$ root back reference, a taste of edge traversal', () => {
        const _data = {
            i18n: {'user_default': 'french'},
            book: [{language: 'english', title: 'english book'}, {language: 'french', title: 'french book'}]
        };
        const results = jpql.nodes(_data, '$.book[?($.i18n.user_default == @.language)]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'book',
                    1
                ],
                value: {
                    language: 'french',
                    title: 'french book'
                }
            }
        ]);
    });

    it('parse nested subscript expression with leading member component expression', () => {
        const results = jpql.nodes(data, '$..book[.author[.profile[name,twitter]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });

    it('parse nested subscript expression with leading descendant component expression', () => {
        const results = jpql.nodes(data, '$..book[0][..profile[name,twitter]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });

    it('parse nested subscript expression without leading expression (active-index)', () => {
        const results = jpql.nodes(data, '$..book[[author[.profile[name,twitter]]]]');
        expect(results).toEqual([
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'name'
                ],
                value: 'Nigel Rees'
            },
            {
                path: [
                    '$',
                    'store',
                    'book',
                    0,
                    'author',
                    0,
                    'profile',
                    'twitter'
                ],
                value: '@NigelRees'
            }
        ]);
    });
});