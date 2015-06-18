/**
 * Created by sdawood on 18/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 ^                       ITGO
 *                       HOME
 10               $.R.e.a.c.[T].a.z.*
 9                      ^  ^
 8                     (@)(#)
 7
 6                       $
 5                "<=""-::+""=>"
 4
 3                      ><
 2                     DATA
 1                     TAZ
 0   1   2   3   4   5   6   7   8   9   10  $   @*/

var assert = require('chai').assert;
var ligufy = require('../lib/ligula/ligulapm_modules/builtins/ligulafunction').liqufy;
var evaluate = require('../lib/ligula/ligulapm_modules/builtins/static-evaluate');

suite('#ligula', function() {

  test('ligufy javascript function', function() {
    var func = function($$x, $$y, $z, $w, $$async) {
      console.log(arguments);
    };
    var liqulafunc = ligufy('$foo', func);
    assert.deepEqual(liqulafunc, {
      "$tag": "$foo",
      "ast": {
        "body": [
          {
            "declarations": [
              {
                "id": {
                  "name": "$foo",
                  "type": "Identifier"
                },
                "init": {
                  "body": {
                    "body": [
                      {
                        "expression": {
                          "arguments": [
                            {
                              "name": "arguments",
                              "type": "Identifier"
                            }
                          ],
                          "callee": {
                            "computed": false,
                            "object": {
                              "name": "console",
                              "type": "Identifier"
                            },
                            "property": {
                              "name": "log",
                              "type": "Identifier"
                            },
                            "type": "MemberExpression"
                          },
                          "type": "CallExpression"
                        },
                        "type": "ExpressionStatement"
                      }
                    ],
                    "type": "BlockStatement"
                  },
                  "defaults": [],
                  "expression": false,
                  "generator": false,
                  "id": null,
                  "params": [
                    {
                      "name": "$$x",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$y",
                      "type": "Identifier"
                    },
                    {
                      "name": "$z",
                      "type": "Identifier"
                    },
                    {
                      "name": "$w",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$async",
                      "type": "Identifier"
                    }
                  ],
                  "type": "FunctionExpression"
                },
                "type": "VariableDeclarator"
              }
            ],
            "kind": "var",
            "type": "VariableDeclaration"
          }
        ],
        "type": "Program"
      },
      "provides": {
        "$w": true,
        "$z": true
      },
      "requires": {
        "#async": true,
        "#x": true,
        "#y": true
      },
      "script": "var $foo = function ($$x, $$y, $z, $w, $$async) {\n      console.log(arguments);\n    }"
    });
  });

  test('eval ligula script function', function() {
    var func = function($$source, $$take, $$async, $partial) {
      return $$source.slice(0, $$take);
    };
    var liqulafunc = ligufy('$take', func);
    assert.deepEquals(liqulafunc, {
      "$tag": "$take",
      "ast": {
        "body": [
          {
            "declarations": [
              {
                "id": {
                  "name": "$take",
                  "type": "Identifier"
                },
                "init": {
                  "body": {
                    "body": [
                      {
                        "argument": {
                          "arguments": [
                            {
                              "raw": "0",
                              "type": "Literal",
                              "value": 0
                            },
                            {
                              "name": "$$take",
                              "type": "Identifier"
                            }
                          ],
                          "callee": {
                            "computed": false,
                            "object": {
                              "name": "$$source",
                              "type": "Identifier"
                            },
                            "property": {
                              "name": "slice",
                              "type": "Identifier"
                            },
                            "type": "MemberExpression"
                          },
                          "type": "CallExpression"
                        },
                        "type": "ReturnStatement"
                      }
                    ],
                    "type": "BlockStatement"
                  },
                  "defaults": [],
                  "expression": false,
                  "generator": false,
                  "id": null,
                  "params": [
                    {
                      "name": "$$source",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$take",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$async",
                      "type": "Identifier"
                    },
                    {
                      "name": "$partial",
                      "type": "Identifier"
                    }
                  ],
                  "type": "FunctionExpression"
                },
                "type": "VariableDeclarator"
              }
            ],
            "kind": "var",
            "type": "VariableDeclaration"
          }
        ],
        "type": "Program"
      },
      "provides": {
        "$partial": true
      },
      "requires": {
        "#async": true,
        "#source": true,
        "#take": true
      },
      "script": "var $take = function ($$source, $$take, $$async, $partial) {\n      return $$source.slice(0, $$take);\n    }"
    });

    var context = {$$source: [0, 1, 2, 3, 4], $$take: 2};
    var results = evaluate(liqulafunc.script, context);
    asset.deepEquals(result, [false]);

  });

  test('eval ligula script expression', function() {
    var func = function($$source, $$take, $$async, $partial) {
      return $$source.slice(0, $$take);
    };
    var liqulafunc = ligufy('$take', func);
    assert.deepEquals(liqulafunc, {
      "$tag": "$take",
      "ast": {
        "body": [
          {
            "declarations": [
              {
                "id": {
                  "name": "$take",
                  "type": "Identifier"
                },
                "init": {
                  "body": {
                    "body": [
                      {
                        "argument": {
                          "arguments": [
                            {
                              "raw": "0",
                              "type": "Literal",
                              "value": 0
                            },
                            {
                              "name": "$$take",
                              "type": "Identifier"
                            }
                          ],
                          "callee": {
                            "computed": false,
                            "object": {
                              "name": "$$source",
                              "type": "Identifier"
                            },
                            "property": {
                              "name": "slice",
                              "type": "Identifier"
                            },
                            "type": "MemberExpression"
                          },
                          "type": "CallExpression"
                        },
                        "type": "ReturnStatement"
                      }
                    ],
                    "type": "BlockStatement"
                  },
                  "defaults": [],
                  "expression": false,
                  "generator": false,
                  "id": null,
                  "params": [
                    {
                      "name": "$$source",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$take",
                      "type": "Identifier"
                    },
                    {
                      "name": "$$async",
                      "type": "Identifier"
                    },
                    {
                      "name": "$partial",
                      "type": "Identifier"
                    }
                  ],
                  "type": "FunctionExpression"
                },
                "type": "VariableDeclarator"
              }
            ],
            "kind": "var",
            "type": "VariableDeclaration"
          }
        ],
        "type": "Program"
      },
      "provides": {
        "$partial": true
      },
      "requires": {
        "#async": true,
        "#source": true,
        "#take": true
      },
      "script": "var $take = function ($$source, $$take, $$async, $partial) {\n      return $$source.slice(0, $$take);\n    }"
    });

    var context = {$$source: [0, 1, 2, 3, 4], $$take: 2};
    var results = evaluate(liqulafunc.script, context);
    asset.deepEquals(result, [false]);

  });
});