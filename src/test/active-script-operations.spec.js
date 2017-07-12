const jpql = require('../');

describe('jsonpathql#active-script-operations', () => {

    it('active script expression operations ({}), default is GET', () => {
        const results = jpql.parse('$..book[({@.length-1}).title]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'title'
                            },
                            operation: 'member',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    active: {
                        map: {
                            script: '{@.length-1}',
                            value: '({@.length-1})'
                        },
                        reduce: {},
                        value: '({@.length-1})'
                    },
                    type: 'script_expression|active',
                    value: '({@.length-1})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operations with splat results behavior (*{}), default is GET', () => {
        const results = jpql.parse('$..book[(*{[@.length-1,@.length-2]}).title]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'title'
                            },
                            operation: 'member',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    active: {
                        map: {
                            operation: '*',
                            script: '{[@.length-1,@.length-2]}',
                            value: '(*{[@.length-1,@.length-2]})'
                        },
                        reduce: {},
                        value: '(*{[@.length-1,@.length-2]})'
                    },
                    type: 'script_expression|active',
                    value: '({[@.length-1,@.length-2]})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operations with splat results behavior is equivalent to promoting the results into list of scripts (*{}), default is GET', () => {
        const results = jpql.parse('$..book[({@.length-1}),({@.length-2})].title');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            expression: {
                                active: {
                                    map: {
                                        script: '{@.length-1}',
                                        value: '({@.length-1})'
                                    },
                                    reduce: {},
                                    value: '({@.length-1})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-1})'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        script: '{@.length-2}',
                                        value: '({@.length-2})'
                                    },
                                    reduce: {},
                                    value: '({@.length-2})'
                                },
                                type: 'script_expression|active',
                                value: '({@.length-2})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[async] active script expression operations with take(n) splat results behavior (#(n)*{}), default is GET', () => {
        const results = jpql.parse('$..book[(@(2)*{[@.length-1,@.length-2]}).title]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'title'
                            },
                            operation: 'member',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    active: {
                        map: {
                            async: '@',
                            operation: '*',
                            script: '{[@.length-1,@.length-2]}',
                            take: '2',
                            value: '(@(2)*{[@.length-1,@.length-2]})'
                        },
                        reduce: {},
                        value: '(@(2)*{[@.length-1,@.length-2]})'
                    },
                    type: 'script_expression|active',
                    value: '({[@.length-1,@.length-2]})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });


    it('active script expression operations with argument ({}):({}), default "~" (POST or PUT)', () => {
        const results = jpql.parse('$..book[?(@.title===null)].({title}):({"Not Available"})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.title===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{title}',
                            value: '({title})'
                        },
                        reduce: {
                            script: '{\"Not Available\"}',
                            value: '({\"Not Available\"})'
                        },
                        value: '({title}):({\"Not Available\"})'
                    },
                    type: 'script_expression|active',
                    value: '({title})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operations with argument ({}):({[]}) and array value, default "~" (POST or PUT), implementation should concat or push value to existing array if any', () => {
        const results = jpql.parse('$..book[?(@.title===null)].({tags}):({["Not Available"]})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.title===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{tags}',
                            value: '({tags})'
                        },
                        reduce: {
                            script: '{[\"Not Available\"]}',
                            value: '({[\"Not Available\"]})'
                        },
                        value: '({tags}):({[\"Not Available\"]})'
                    },
                    type: 'script_expression|active',
                    value: '({tags})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operations with argument (+{}):({}), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal', () => {
        const results = jpql.parse('$..book[?(@.title===null)].(+{tags}):({["Not Available"]})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.title===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '+',
                            script: '{tags}',
                            value: '(+{tags})'
                        },
                        reduce: {
                            script: '{[\"Not Available\"]}',
                            value: '({[\"Not Available\"]})'
                        },
                        value: '(+{tags}):({[\"Not Available\"]})'
                    },
                    type: 'script_expression|active',
                    value: '({tags})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[computed active script argument] active script expression operations with computed active script argument  (+{}):(={ @ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(={' +
            '@.firstName + " " + @.lastName' +
            '})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '+',
                            script: '{fullName}',
                            value: '(+{fullName})'
                        },
                        reduce: {
                            operation: '=',
                            script: '{@.firstName + \" \" + @.lastName}',
                            value: '(={@.firstName + \" \" + @.lastName})'
                        },
                        value: '(+{fullName}):(={@.firstName + \" \" + @.lastName})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[merge computed active script argument] active script expression operations with computed active script argument  (&{}):(={ @ }), merge "&" (PUT), implementation should merge {key: value} into partial, warn or err about overwriting existing value literal, and return merged sources', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(&{fullName}):(={' +
            '@.firstName + " " + @.lastName' +
            '})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '&',
                            script: '{fullName}',
                            value: '(&{fullName})'
                        },
                        reduce: {
                            operation: '=',
                            script: '{@.firstName + \" \" + @.lastName}',
                            value: '(={@.firstName + \" \" + @.lastName})'
                        },
                        value: '(&{fullName}):(={@.firstName + \" \" + @.lastName})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[async computed nested $ path result] active script expression operations with computed nested path argument with reference to true root (+{}:@={ $ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(@={' +
            '$..book[?(@.fulleName===null)][firstName, lastName]' +
            '})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '+',
                            script: '{fullName}',
                            value: '(+{fullName})'
                        },
                        reduce: {
                            async: '@',
                            operation: '=',
                            script: '{$..book[?(@.fulleName===null)][firstName, lastName]}',
                            value: '(@={$..book[?(@.fulleName===null)][firstName, lastName]})'
                        },
                        value: '(+{fullName}):(@={$..book[?(@.fulleName===null)][firstName, lastName]})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[async subscribe to nested @$ path result] active script expression operations with computed nested path argument with reference to script context "@$" (+{}):(=@{ @$ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(+{fullName}):(@(1)={@$[firstName, lastName]})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '+',
                            script: '{fullName}',
                            value: '(+{fullName})'
                        },
                        reduce: {
                            async: '@',
                            operation: '=',
                            script: '{@$[firstName, lastName]}',
                            take: '1',
                            value: '(@(1)={@$[firstName, lastName]})'
                        },
                        value: '(+{fullName}):(@(1)={@$[firstName, lastName]})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse nested path with context root reference "@$" and root reference "$", used by active script handler implementation for path lazy evaluation', () => {
        const results = jpql.parse('@$.profile[$.language["default"]]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root|active',
                    value: '@$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'profile'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                branch: {
                    path: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'language'
                            },
                            operation: 'member',
                            scope: 'child|branch'
                        },
                        {
                            expression: {
                                type: 'string_literal',
                                value: 'default'
                            },
                            operation: 'subscript',
                            scope: 'child|branch'
                        }
                    ],
                    scope: 'branch'
                },
                expression: {
                    type: 'root',
                    value: '$'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[async subscribe to nested path component == active script result] active script expression operations with computed nested active script expression with reference to parent script context value (+{}):(@={ ({@@}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(#tag+{fullName}):(@={' +
            '@@.firstName + " " + @@.lastName' + //@@ can be $branch or $node, implementation is free to chose
            '})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            label: 'tag',
                            operation: '+',
                            script: '{fullName}',
                            tag: '#',
                            value: '(#tag+{fullName})'
                        },
                        reduce: {
                            async: '@',
                            operation: '=',
                            script: '{@@.firstName + \" \" + @@.lastName}',
                            value: '(@={@@.firstName + \" \" + @@.lastName})'
                        },
                        value: '(#tag+{fullName}):(@={@@.firstName + \" \" + @@.lastName})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[async subscribe to component via active script optation take (10) (@(n){@})', () => {
        const results = jpql.parse('$..book[?(@.discount)].(@(10){title})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.discount)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            script: '{title}',
                            take: '10',
                            value: '(@(10){title})'
                        },
                        reduce: {},
                        value: '(@(10){title})'
                    },
                    type: 'script_expression|active',
                    value: '({title})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operations with argument ({}), set "=" (PUT), set overwrites existing key/value, implementation should warn or err if not found', () => {
        const results = jpql.parse('$..book[?(@.title===null)].(={tags}):({"Not Available"})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.title===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '=',
                            script: '{tags}',
                            value: '(={tags})'
                        },
                        reduce: {
                            script: '{\"Not Available\"}',
                            value: '({\"Not Available\"})'
                        },
                        value: '(={tags}):({\"Not Available\"})'
                    },
                    type: 'script_expression|active',
                    value: '({tags})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('active script expression operation without argument ({}), remove "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book.(-{fullName})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '-',
                            script: '{fullName}',
                            value: '(-{fullName})'
                        },
                        reduce: {},
                        value: '(-{fullName})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });


    it('filter expression followed by delete expression operation without argument ({}), key remove "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)][(-{fullName})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '-',
                            script: '{fullName}',
                            value: '(-{fullName})'
                        },
                        reduce: {},
                        value: '(-{fullName})'
                    },
                    type: 'script_expression|active',
                    value: '({fullName})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('filter expression followed by delete expression operation without key (-{}), sink hole "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)][(-{})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '-',
                            script: '{}',
                            value: '(-{})'
                        },
                        reduce: {},
                        value: '(-{})'
                    },
                    type: 'script_expression|active',
                    value: '({})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('deleting filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book[?-{@.fulleName===null}]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            operation: '-',
                            script: '{@.fulleName===null}',
                            value: '?-{@.fulleName===null}'
                        },
                        stream: {},
                        value: '?-{@.fulleName===null}'
                    },
                    type: 'filter_expression|active',
                    value: '({@.fulleName===null})'
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse mapping script, implementation should not set script return result into partial and return the script result as is and (without using the result to access the partial in default behavior)', () => {
        const results = jpql.parse('$..book[?(@.fulleName===null)].(=>{"Not Available!"})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'filter_expression',
                    value: '?(@.fulleName===null)'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            provider: '=>',
                            script: '{\"Not Available!\"}',
                            value: '(=>{\"Not Available!\"})'
                        },
                        reduce: {},
                        value: '(=>{\"Not Available!\"})'
                    },
                    type: 'script_expression|active',
                    value: '({\"Not Available!\"})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse mapping script, mergeAll (value or default if value is null or key does not exist) scenario, implementation chose to bind the script this reference to the partial instead of using "@', () => {
        const results = jpql.parse('$..book[fullName, ?(this.fulleName===null).(=>{"Not Available"})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'fullName'
                            }
                        },
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            active: {
                                                map: {
                                                    provider: '=>',
                                                    script: '{\"Not Available\"}',
                                                    value: '(=>{\"Not Available\"})'
                                                },
                                                reduce: {},
                                                value: '(=>{\"Not Available\"})'
                                            },
                                            type: 'script_expression|active',
                                            value: '({\"Not Available\"})'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'filter_expression',
                                value: '?(this.fulleName===null)'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse mapping script, for this key return that value, key has to exist in the data source, Mocking and Defaults', () => {
        const results = jpql.parse('$..book.reviews.(#{details}):(#retry @(10) &=> {"Temporary Not Available"})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'reviews'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{details}',
                            tag: '#',
                            value: '(#{details})'
                        },
                        reduce: {
                            async: '@',
                            label: 'retry',
                            operation: '&',
                            provider: '=>',
                            script: '{\"Temporary Not Available\"}',
                            tag: '#',
                            take: '10',
                            value: '(#retry @(10) &=> {\"Temporary Not Available\"})'
                        },
                        value: '(#{details}):(#retry @(10) &=> {\"Temporary Not Available\"})'
                    },
                    type: 'script_expression|active',
                    value: '({details})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse mapping script, mergeAll value or default scenario, implementation chose to bind the script this reference to the partial instead of using "@', () => {
        const results = jpql.parse('$..book[fullName, (=>{@.fullName ? undefined : "Not Available"})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'fullName'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        provider: '=>',
                                        script: '{@.fullName ? undefined : \"Not Available\"}',
                                        value: '(=>{@.fullName ? undefined : \"Not Available\"})'
                                    },
                                    reduce: {},
                                    value: '(=>{@.fullName ? undefined : \"Not Available\"})'
                                },
                                type: 'script_expression|active',
                                value: '({@.fullName ? undefined : \"Not Available\"})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('parse active script operation call receiving literal arguments', () => {
        const results = jpql.parse('$.store.book.(=>{push}):({ {"4": {title: "New Book"} } })');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            provider: '=>',
                            script: '{push}',
                            value: '(=>{push})'
                        },
                        reduce: {
                            script: '{ {\"4\": {title: \"New Book\"} } }',
                            value: '({ {\"4\": {title: \"New Book\"} } })'
                        },
                        value: '(=>{push}):({ {\"4\": {title: \"New Book\"} } })'
                    },
                    type: 'script_expression|active',
                    value: '({push})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse active script operation call receiving computed argument', () => {
        const results = jpql.parse('$.store.(#reminder @(3) =>{"Only" + $offercount() + "left on offer!"}):(#offerCount +=>{$$..book.onOffer.(#offerCount +=>{@.length})'); // length | $offerCount via embedded path | $reminder 3 times
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            label: 'reminder',
                            provider: '=>',
                            script: '{\"Only\" + $offercount() + \"left on offer!\"}',
                            tag: '#',
                            take: '3',
                            value: '(#reminder @(3) =>{\"Only\" + $offercount() + \"left on offer!\"})'
                        },
                        reduce: {
                            label: 'offerCount',
                            operation: '+',
                            provider: '=>',
                            script: '{$$..book.onOffer.(#offerCount +=>{@.length}',
                            tag: '#',
                            value: '(#offerCount +=>{$$..book.onOffer.(#offerCount +=>{@.length})'
                        },
                        value: '(#reminder @(3) =>{\"Only\" + $offercount() + \"left on offer!\"}):(#offerCount +=>{$$..book.onOffer.(#offerCount +=>{@.length})'
                    },
                    type: 'script_expression|active',
                    value: '({\"Only\" + $offercount() + \"left on offer!\"})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('parse active script operation call receiving computed argument via consuming a thiscribit', () => {
        const results = jpql.parse('$.store.(#reminder @(3) =>{"Only" + $offercount() + "left on offer!"}):(#offerCount ==>{})'); // length | $offerCount source piping #source ==> | $reminder 3 times
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            label: 'reminder',
                            provider: '=>',
                            script: '{\"Only\" + $offercount() + \"left on offer!\"}',
                            tag: '#',
                            take: '3',
                            value: '(#reminder @(3) =>{\"Only\" + $offercount() + \"left on offer!\"})'
                        },
                        reduce: {
                            label: 'offerCount',
                            operation: '=',
                            provider: '=>',
                            script: '{}',
                            tag: '#',
                            value: '(#offerCount ==>{})'
                        },
                        value: '(#reminder @(3) =>{\"Only\" + $offercount() + \"left on offer!\"}):(#offerCount ==>{})'
                    },
                    type: 'script_expression|active',
                    value: '({\"Only\" + $offercount() + \"left on offer!\"})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('tag component for later reference in the path and allowing access to individual sources before they get merged by the union expression', () => {
        const results = jpql.parse('$..category[comedy.(#comedy), (#action{action})].(@(10))'); // expressions key.(#tag) and (#tag{script returning key}) are interchangeable
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            active: {
                                                map: {
                                                    label: 'comedy',
                                                    tag: '#',
                                                    value: '(#comedy)'
                                                },
                                                reduce: {},
                                                value: '(#comedy)'
                                            },
                                            type: 'script_expression|active',
                                            value: '(undefined)'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'comedy'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        label: 'action',
                                        script: '{action}',
                                        tag: '#',
                                        value: '(#action{action})'
                                    },
                                    reduce: {},
                                    value: '(#action{action})'
                                },
                                type: 'script_expression|active',
                                value: '({action})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '10',
                            value: '(@(10))'
                        },
                        reduce: {},
                        value: '(@(10))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('empty tags generate a tag that is a function of the key, path and value. details are left to the implementation.', () => {
        const results = jpql.parse('$..category[comedy.(#comedy @(10)), (#action @(10) {action})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            active: {
                                                map: {
                                                    async: '@',
                                                    label: 'comedy',
                                                    tag: '#',
                                                    take: '10',
                                                    value: '(#comedy @(10))'
                                                },
                                                reduce: {},
                                                value: '(#comedy @(10))'
                                            },
                                            type: 'script_expression|active',
                                            value: '(undefined)'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'comedy'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        label: 'action',
                                        script: '{action}',
                                        tag: '#',
                                        take: '10',
                                        value: '(#action @(10) {action})'
                                    },
                                    reduce: {},
                                    value: '(#action @(10) {action})'
                                },
                                type: 'script_expression|active',
                                value: '({action})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('empty tags generate a tag that is a function of the key, path and value. details are left to the implementation.', () => {
        const results = jpql.parse('$..category[comedy.(#), (#{action})].(@(10))'); // expressions key.(#tag) and (#tag{script returning key}) are interchangeable
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            active: {
                                                map: {
                                                    tag: '#',
                                                    value: '(#)'
                                                },
                                                reduce: {},
                                                value: '(#)'
                                            },
                                            type: 'script_expression|active',
                                            value: '(undefined)'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                type: 'identifier',
                                value: 'comedy'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        script: '{action}',
                                        tag: '#',
                                        value: '(#{action})'
                                    },
                                    reduce: {},
                                    value: '(#{action})'
                                },
                                type: 'script_expression|active',
                                value: '({action})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '10',
                            value: '(@(10))'
                        },
                        reduce: {},
                        value: '(@(10))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('subscribe to path component updates, take top 10 splat action titles via active script operation "@(10)"', () => {
        const results = jpql.parse('$..category.sorted.(*{action, comedy}).title.(@(10))');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '*',
                            script: '{action, comedy}',
                            value: '(*{action, comedy})'
                        },
                        reduce: {},
                        value: '(*{action, comedy})'
                    },
                    type: 'script_expression|active',
                    value: '({action, comedy})'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '10',
                            value: '(@(10))'
                        },
                        reduce: {},
                        value: '(@(10))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: subscribe to path component updates, take top 10 from preceding partial', () => {
        const results = jpql.parse('$..category.sorted.(@(10))');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '10',
                            value: '(@(10))'
                        },
                        reduce: {},
                        value: '(@(10))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });


    it('subscribe to path component updates, take top 10 action titles via active script operation "@(10)"', () => {
        const results = jpql.parse('$..category.sorted.(@(10){action}).title');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            script: '{action}',
                            take: '10',
                            value: '(@(10){action})'
                        },
                        reduce: {},
                        value: '(@(10){action})'
                    },
                    type: 'script_expression|active',
                    value: '({action})'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'title'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: tag and asyncTake path components', () => {
        const results = jpql.parse('$..(@(10)).category.(#tagSorted).sorted');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '10',
                            value: '(@(10))'
                        },
                        reduce: {},
                        value: '(@(10))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            label: 'tagSorted',
                            tag: '#',
                            value: '(#tagSorted)'
                        },
                        reduce: {},
                        value: '(#tagSorted)'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('delete operation path component', () => {
        const results = jpql.parse('$..category.(-).sorted'); // equivalent to '$..category.sorted.(-)'
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        map: {
                            operation: '-',
                            value: '(-)'
                        },
                        reduce: {},
                        value: '(-)'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('Combo delete operation path component and add active script epxression', () => {
        const results = jpql.parse('$..category[(-).sorted,(+{reverseSorted}):(=>{@.reverse()})]'); //one off provider, equivalent to $..category[(-).sorted,(+=>{@.reverse()})]
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'sorted'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        operation: '-',
                                        value: '(-)'
                                    },
                                    reduce: {},
                                    value: '(-)'
                                },
                                type: 'script_expression|active',
                                value: '(undefined)'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        operation: '+',
                                        script: '{reverseSorted}',
                                        value: '(+{reverseSorted})'
                                    },
                                    reduce: {
                                        provider: '=>',
                                        script: '{@.reverse()}',
                                        value: '(=>{@.reverse()})'
                                    },
                                    value: '(+{reverseSorted}):(=>{@.reverse()})'
                                },
                                type: 'script_expression|active',
                                value: '({reverseSorted})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('all aboard active script expression tag, take, operation, map and reduce', () => {
        const results = jpql.parse('$..category[(-).sorted,(#reverse @(10) - {reverseSorted}):(#reversed @ => {@.reverse()})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'sorted'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        operation: '-',
                                        value: '(-)'
                                    },
                                    reduce: {},
                                    value: '(-)'
                                },
                                type: 'script_expression|active',
                                value: '(undefined)'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        label: 'reverse',
                                        operation: '-',
                                        script: '{reverseSorted}',
                                        tag: '#',
                                        take: '10',
                                        value: '(#reverse @(10) - {reverseSorted})'
                                    },
                                    reduce: {
                                        async: '@',
                                        label: 'reversed',
                                        provider: '=>',
                                        script: '{@.reverse()}',
                                        tag: '#',
                                        value: '(#reversed @ => {@.reverse()})'
                                    },
                                    value: '(#reverse @(10) - {reverseSorted}):(#reversed @ => {@.reverse()})'
                                },
                                type: 'script_expression|active',
                                value: '({reverseSorted})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('all aboard active script expression tag, take, operation, map and reduce', () => {
        const results = jpql.parse('$..category[(-).sorted,(# @ - {reverseSorted}):(#reversed @(10) => {@.reverse()})]');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            branch: {
                                path: [
                                    {
                                        expression: {
                                            type: 'identifier',
                                            value: 'sorted'
                                        },
                                        operation: 'member',
                                        scope: 'child|branch'
                                    }
                                ],
                                scope: 'branch'
                            },
                            expression: {
                                active: {
                                    map: {
                                        operation: '-',
                                        value: '(-)'
                                    },
                                    reduce: {},
                                    value: '(-)'
                                },
                                type: 'script_expression|active',
                                value: '(undefined)'
                            }
                        },
                        {
                            expression: {
                                active: {
                                    map: {
                                        async: '@',
                                        operation: '-',
                                        script: '{reverseSorted}',
                                        tag: '#',
                                        value: '(# @ - {reverseSorted})'
                                    },
                                    reduce: {
                                        async: '@',
                                        label: 'reversed',
                                        provider: '=>',
                                        script: '{@.reverse()}',
                                        tag: '#',
                                        take: '10',
                                        value: '(#reversed @(10) => {@.reverse()})'
                                    },
                                    value: '(# @ - {reverseSorted}):(#reversed @(10) => {@.reverse()})'
                                },
                                type: 'script_expression|active',
                                value: '({reverseSorted})'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });


    it('pipes ending with a throttling filter', () => {
        const results = jpql.parse('$..category.sorted.(#description =>{"Movie Category: {@.name, @,rating}"}).(@(1000)).(#throttle =>{[$login($username, $password), $taz(this), $register(this, 100s)]})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'sorted'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            label: 'description',
                            provider: '=>',
                            script: '{\"Movie Category: {@.name, @,rating}\"}',
                            tag: '#',
                            value: '(#description =>{\"Movie Category: {@.name, @,rating}\"})'
                        },
                        reduce: {},
                        value: '(#description =>{\"Movie Category: {@.name, @,rating}\"})'
                    },
                    type: 'script_expression|active',
                    value: '({\"Movie Category: {@.name, @,rating}\"})'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            async: '@',
                            take: '1000',
                            value: '(@(1000))'
                        },
                        reduce: {},
                        value: '(@(1000))'
                    },
                    type: 'script_expression|active',
                    value: '(undefined)'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            label: 'throttle',
                            provider: '=>',
                            script: '{[$login($username, $password), $taz(this), $register(this, 100s)]}',
                            tag: '#',
                            value: '(#throttle =>{[$login($username, $password), $taz(this), $register(this, 100s)]})'
                        },
                        reduce: {},
                        value: '(#throttle =>{[$login($username, $password), $taz(this), $register(this, 100s)]})'
                    },
                    type: 'script_expression|active',
                    value: '({[$login($username, $password), $taz(this), $register(this, 100s)]})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });
});

describe('jsonpathql#active filter component', () => {
    it('async: subscribe to filtered path component updates', () => {
        const results = jpql.parse('$..book.?#tagPending{@.title===null}');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            label: 'tagPending',
                            script: '{@.title===null}',
                            tag: '#',
                            value: '?#tagPending{@.title===null}'
                        },
                        stream: {},
                        value: '?#tagPending{@.title===null}'
                    },
                    type: 'filter_expression|active',
                    value: '({@.title===null})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: subscribe to filtered path component updates, take 10', () => {
        const results = jpql.parse('$..book.? #error @(10) {@$.title===null}');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            async: '@',
                            label: 'error',
                            script: '{@$.title===null}',
                            tag: '#',
                            take: '10',
                            value: '? #error @(10) {@$.title===null}'
                        },
                        stream: {},
                        value: '? #error @(10) {@$.title===null}'
                    },
                    type: 'filter_expression|active',
                    value: '({@$.title===null})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: subscribe to filtered path component updates with tagged argument passing, take 10', () => {
        const results = jpql.parse('$..book.?@(10){$title==="mybook"}:(#title @(1) {@.title.toLowerCase()})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            async: '@',
                            script: '{$title===\"mybook\"}',
                            take: '10',
                            value: '?@(10){$title===\"mybook\"}'
                        },
                        stream: {
                            async: '@',
                            label: 'title',
                            script: '{@.title.toLowerCase()}',
                            tag: '#',
                            take: '1',
                            value: '(#title @(1) {@.title.toLowerCase()})'
                        },
                        value: '?@(10){$title===\"mybook\"}:(#title @(1) {@.title.toLowerCase()})'
                    },
                    type: 'filter_expression|active',
                    value: '({$title===\"mybook\"})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: subscribe to filtered path component updates without splatting the list of tagged arguments, implementation should call the filter for each, take 10', () => {
        const results = jpql.parse('$..book.?@(10){$lang in ["english", "french"]}:(#primarySecondaryLang @(1) {[@.language.primary.toLowerCase(), @.language.primary.toLowerCase()]})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            async: '@',
                            script: '{$lang in [\"english\", \"french\"]}',
                            take: '10',
                            value: '?@(10){$lang in [\"english\", \"french\"]}'
                        },
                        stream: {
                            async: '@',
                            label: 'primarySecondaryLang',
                            script: '{[@.language.primary.toLowerCase(), @.language.primary.toLowerCase()]}',
                            tag: '#',
                            take: '1',
                            value: '(#primarySecondaryLang @(1) {[@.language.primary.toLowerCase(), @.language.primary.toLowerCase()]})'
                        },
                        value: '?@(10){$lang in [\"english\", \"french\"]}:(#primarySecondaryLang @(1) {[@.language.primary.toLowerCase(), @.language.primary.toLowerCase()]})'
                    },
                    type: 'filter_expression|active',
                    value: '({$lang in [\"english\", \"french\"]})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('async: subscribe to filtered path component updates with splatting list of tagged arguments, implementation should assign the arguments array to an injected variable $tag, take 10', () => {
        const results = jpql.parse('$..book.?<= #englishFromAmazon @(10) +=>{"english" in $lang}:(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            async: '@',
                            flag: '<=',
                            label: 'englishFromAmazon',
                            operation: '+',
                            provider: '=>',
                            script: '{\"english\" in $lang}',
                            tag: '#',
                            take: '10',
                            value: '?<= #englishFromAmazon @(10) +=>{\"english\" in $lang}'
                        },
                        stream: {
                            async: '@',
                            label: 'primarySecondaryLang',
                            operation: '*',
                            provider: '=>',
                            script: '{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]}',
                            tag: '#',
                            take: '1',
                            value: '(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})'
                        },
                        value: '?<= #englishFromAmazon @(10) +=>{\"english\" in $lang}:(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})'
                    },
                    type: 'filter_expression|active',
                    value: '({\"english\" in $lang})'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[Structure Matching] positive lookahead filter expression, shorthand for filter expression with ANDed or ORed @.key expressions', () => {
        const results = jpql.parse('$..book[?={@}].discount'); //equivalent to $..book[?(@.discount)]' but effectively uses the next component as a structural template to mach the current object against
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            flag: '=',
                            script: '{@}',
                            value: '?={@}'
                        },
                        stream: {},
                        value: '?={@}'
                    },
                    type: 'filter_expression|active',
                    value: '({@})'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'discount'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[Structure Matching] negative lookahead filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book[?!{@}][invalid, deprecated, obsolete]'); //equivalent to $..book[?(!@.invalid && !@.deprecated && !@.onbsolete )]
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            flag: '!',
                            script: '{@}',
                            value: '?!{@}'
                        },
                        stream: {},
                        value: '?!{@}'
                    },
                    type: 'filter_expression|active',
                    value: '({@})'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'invalid'
                            }
                        },
                        {
                            expression: {
                                type: 'identifier',
                                value: 'deprecated'
                            }
                        },
                        {
                            expression: {
                                type: 'identifier',
                                value: 'obsolete'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('[Structure Matching] positive lookbehind filter expression, shorthand for filter expression with ANDed or ORed @.key expressions', () => {
        const results = jpql.parse('$..book[?<={@}].discount'); //equivalent to $..book[?(@.discount)]' but effectively uses the previous component as a structural template to mach the current object against
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            flag: '<=',
                            script: '{@}',
                            value: '?<={@}'
                        },
                        stream: {},
                        value: '?<={@}'
                    },
                    type: 'filter_expression|active',
                    value: '({@})'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'discount'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('[Structure Matching] negative lookbehind filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', () => {
        const results = jpql.parse('$..book[?<!{@}][invalid, deprecated, obsolete]'); //equivalent to $..book[?(!@.invalid && !@.deprecated && !@.onbsolete )]
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    active: {
                        filter: {
                            flag: '<!',
                            script: '{@}',
                            value: '?<!{@}'
                        },
                        stream: {},
                        value: '?<!{@}'
                    },
                    type: 'filter_expression|active',
                    value: '({@})'
                },
                operation: 'subscript',
                scope: 'child'
            },
            {
                expression: {
                    type: 'union',
                    value: [
                        {
                            expression: {
                                type: 'identifier',
                                value: 'invalid'
                            }
                        },
                        {
                            expression: {
                                type: 'identifier',
                                value: 'deprecated'
                            }
                        },
                        {
                            expression: {
                                type: 'identifier',
                                value: 'obsolete'
                            }
                        }
                    ]
                },
                operation: 'subscript',
                scope: 'child'
            }
        ]);
    });

    it('regex path component', () => {
        const results = jpql.parse('$..book.category..({/^[aA]ction/g})');
        expect(results).toEqual([
            {
                expression: {
                    type: 'root',
                    value: '$'
                }
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'book'
                },
                operation: 'member',
                scope: 'descendant'
            },
            {
                expression: {
                    type: 'identifier',
                    value: 'category'
                },
                operation: 'member',
                scope: 'child'
            },
            {
                expression: {
                    active: {
                        map: {
                            script: '{/^[aA]ction/g}',
                            value: '({/^[aA]ction/g})'
                        },
                        reduce: {},
                        value: '({/^[aA]ction/g})'
                    },
                    type: 'script_expression|active',
                    value: '({/^[aA]ction/g})'
                },
                operation: 'member',
                scope: 'descendant'
            }
        ]);
    });
});

