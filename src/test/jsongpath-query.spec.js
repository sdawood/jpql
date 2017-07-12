const jpql = require('../index');
const deepStore = require('./data/deep-store.json');
const graphJSON = require('./data/graph-like.json');
const _ = require('lodash');

/**
 * Walking an edge is a genral case of moving to the path next component.
 * In otherwords, jsonpath is a special case of walking graph edges, but since the graph is limited to a tree, where every child has one and only one parent,
 * walking from parent to child is implicitely waking the edge === 'has'.
 * Within an edge expression - by convention surrounded by [ and ] - a child can walk an edge to the parent using $, or to a remote relative using $.path.to.relative.
 * navigation is exclusively within the sub-graph we accessed as $ earlier, which provides an inherent scoping security aspect.
 * within the edge expression ( member, filter, script, slice, ... ) child can access:
 * 1. @ == immediate parent
 * 2. $ + MEMBER_COMPONENTS. $ == sub-graph root, require root ref to be accessible in partial handlers. Can yield multiple values that would be reduced into a union component
 * 3. $parent == immediate node before branch for easy access to sibling branches even in the case of a $root branch we can still reference the parent with original jsonpath @ semantics
 * Obviously relative backwards path from child to parent are a no brainer in case of JSON, since in a json tree there is one and only one parent
 * in "json" mode:
 * - @$$ can easily point back to the grandparent
 * - @$$$ grand grand parent, etc ...
 * - only active components are possible to evaluate
 * - * means jump one up
 * - .* means jump one up
 * - .. is an less efficient, unless an Observable is implemented with .takeUntil
 * - @.parent.grandparent[-1:]
 * - backward path require parent reference to walk back up the evaluated path so far
 * - with parent.absolutePath available to scripts, a script expression can evaluate to jp.stringify(parent.path.slice(-3)) to find the 3rd grandparent -> test stringify
 * */


describe('jsonGpath', () => {

    it('[negative] member active script producing jsonpath starting with "[": ".[]" is not a valid jsonpath', () => {
        expect(() => {
            jpql.nodes(graphJSON, 'nodes.({"[\'123\'].profile"}).({"birthdate"}).({"month"})');
        }).toThrow(/Parse error on line 1/);
    });

    it('problem with jsonpath macro-style template inside script with leading subscript expression, evaluate as  $[["123"].id] === $[0["123"].id] with active position handler', () => {
        const results = jpql.nodes(graphJSON, 'nodes[({"[\'123\'].id"})].({"profile"}).({"birthdate"}).({"month"})');
        expect(results).toEqual([]);
    });

    it('$node == $parent always refers to the previous node, active scripts returning strings as template placeholders', () => {
        const results = jpql.nodes(graphJSON, 'nodes["123"].({"profile"}).({"birthdate"}).({"month"})');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            }
        ]);
    });

    it('$node == $parent always refers to the previous node, active scripts as template placeholders', () => {
        const results = jpql.nodes(graphJSON, '$.({"nodes[\'123\']"}).({"profile"}).({"birthdate"}).({"month"})');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            }
        ]);
    });

    it('dynamic path as a function of node values, $node == $parent always refers to the previous node', () => {
        const results = jpql.nodes({nodes: [1, [2, 0, [3, 0, 0, [4, 0, 0, 0, ['x']]]]]}, 'nodes[({$parent[0]})][({$parent[0]})][({$parent[0]})][({$parent[0]})][0]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    1,
                    2,
                    3,
                    4,
                    0
                ],
                value: "x"
            }
        ]);
    });

    it('ActiveScripts can replace a full json path and evaluate and embedded path. Templates in action', () => {
        const results = jpql.nodes(graphJSON, '({"nodes[\'123\'].profile[name,birthdate[month]]"})');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "name"
                ],
                value: "user-123-tester"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            }
        ]);
    });

    it('all profile months via descendant @ filter followed by active scripts as template placeholders with branching', () => {
        const results = jpql.nodes(graphJSON, 'nodes..[?(@.profile)][({"\'profile\'"})[({"\'birthdate\'"})[({"\'month\'"})]]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 11
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            },
            {
                path: [
                    "$",
                    "nodes",
                    "222",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 2
            },
            {
                path: [
                    "$",
                    "nodes",
                    "333",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 3
            }
        ]);
    });

    it('[$key enables subscript-descendant-string_literal] all profile months via descendant $key filter followed by active scripts as template placeholders with branching', () => {
        const results = jpql.nodes(graphJSON, 'nodes..[?($key === "profile")][({"\'birthdate\'"})[({"\'month\'"})]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 11
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            },
            {
                path: [
                    "$",
                    "nodes",
                    "222",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 2
            },
            {
                path: [
                    "$",
                    "nodes",
                    "333",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 3
            }
        ]);
    });


    it('Retrieve references to nodes by ID from root $', () => {
        const results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[({"\'" + $parent$.friends[0] + "\'"})]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "id"
                ],
                value: 123
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "name"
                ],
                value: "user-123-tester"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111"
                ],
                value: {
                    friends: [
                        222,
                        123
                    ],
                    id: 111,
                    profile: {
                        birthdate: {
                            day: 1,
                            month: 11
                        },
                        name: "user-111-popular"
                    }
                }
            }
        ]);
    });

    it('Retrieve references to nodes with exhaustive filter, retrieve friend by ID, $parent$ (parent of parent reference)', () => {
        const results = jpql.nodes(graphJSON, 'nodes["111"][id,profile[name,birthdate[month]],$.nodes[?($parent$.friends.indexOf(@.id) > -1)]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "id"
                ],
                value: 111
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "name"
                ],
                value: "user-111-popular"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 11
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123"
                ],
                value: {
                    friends: [
                        111
                    ],
                    id: 123,
                    profile: {
                        birthdate: {
                            day: 3,
                            month: 12
                        },
                        name: "user-123-tester"
                    }
                }
            },
            {
                path: [
                    "$",
                    "nodes",
                    "222"
                ],
                value: {
                    friends: [
                        111
                    ],
                    id: 222,
                    profile: {
                        birthdate: {
                            day: 2,
                            month: 2
                        },
                        name: "user-222-newbie"
                    }
                }
            }
        ]);
    });

    it('Retrieve references to nodes with sub query returning single result, retrieve only friend by ID', () => {
        const results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[({$quoteAll($parent$.friends)})]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "id"
                ],
                value: 123
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "name"
                ],
                value: "user-123-tester"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111"
                ],
                value: {
                    friends: [
                        222,
                        123
                    ],
                    id: 111,
                    profile: {
                        birthdate: {
                            day: 1,
                            month: 11
                        },
                        name: "user-111-popular"
                    }
                }
            }
        ]);
    });

    it('Subscript descendant $ throws', () => {
        expect(() => {
            jpql.nodes(graphJSON, 'nodes["123"]..[$.nodes[({$quoteAll($parent.friends)})]]');
        }).toThrow(/Unsupported query component: subscript-descendant-root/);
    });


    it('Retrieve references to nodes with sub query returning multiple result, retrieve friends by ID', () => {
        const results = jpql.nodes(graphJSON, 'nodes["111"][id,profile[name,birthdate[month]],$.nodes[({$quoteAll($parent$.friends)})]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "id"
                ],
                value: 111
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "name"
                ],
                value: "user-111-popular"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 11
            },
            {
                path: [
                    "$",
                    "nodes",
                    "222"
                ],
                value: {
                    friends: [
                        111
                    ],
                    id: 222,
                    profile: {
                        birthdate: {
                            day: 2,
                            month: 2
                        },
                        name: "user-222-newbie"
                    }
                }
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123"
                ],
                value: {
                    friends: [
                        111
                    ],
                    id: 123,
                    profile: {
                        birthdate: {
                            day: 3,
                            month: 12
                        },
                        name: "user-123-tester"
                    }
                }
            }
        ]);
    });

    it('Conditional Graph Edges with branch-root reference, $parent$ and $quoteAll === $.nodes["111"]', () => {
        const results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[({$quoteAll($parent$.friends[0])})]]');
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "id"
                ],
                value: 123
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "name"
                ],
                value: "user-123-tester"
            },
            {
                path: [
                    "$",
                    "nodes",
                    "123",
                    "profile",
                    "birthdate",
                    "month"
                ],
                value: 12
            },
            {
                path: [
                    "$",
                    "nodes",
                    "111"
                ],
                value: {
                    friends: [
                        222,
                        123
                    ],
                    id: 111,
                    profile: {
                        birthdate: {
                            day: 1,
                            month: 11
                        },
                        name: "user-111-popular"
                    }
                }
            }
        ]);
    });


    it('Single computed Graph Edges via identifier expression', () => {
        const _data = {
            store: {
                book: [{
                    language: 'en',
                    author: [{profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]
                }]
            }
        };
        /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
        const path = "$.store.book[0[author.0.profile[({$.store.book[0].language + '_name'})]]]";

        const results = jpql.nodes(_data, path);
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "en_name"
                ],
                value: "name in english"
            }
        ]);
    });

    it('Single computed Graph Edges via string expression', () => {
        const _data = {
            store: {
                book: [{
                    language: 'en',
                    author: [{profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]
                }]
            }
        };

        /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
        const path = "$.store.book[0[author.0.profile[({'\"' + $.store.book[0].language + '_name'+ '\"'})]]]";

        const results = jpql.nodes(_data, path);
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "store",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "en_name"
                ],
                value: "name in english"
            }
        ]);
    });

    it('List of computed Graph Edges via string expressions', () => {
        const _data = {
            i18n: {'default': 'english', language: ['en', 'fr']},
            book: [{author: [{profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]}]
        };

        /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
//    var path = "$.book[.author[.profile[({'\"' + $.i18n.language[0] + '_name' + '\"'}), ({'\"' + $.i18n.language[1] + '_name' + '\"'})]]]";
        const path = "$.book[.author[.profile[({'\"' + $.i18n.language[1] + '_name'+ '\"'}),({'\"' + $.i18n.language[0] + '_name'+ '\"'})]]]";

        const results = jpql.nodes(_data, path);
        expect(results).toEqual([
            {
                path: [
                    "$",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "fr_name"
                ],
                value: "name in french"
            },
            {
                path: [
                    "$",
                    "book",
                    0,
                    "author",
                    0,
                    "profile",
                    "en_name"
                ],
                value: "name in english"
            }
        ]);
    });
})
