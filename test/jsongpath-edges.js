var assert = require('chai').assert;
var jpql = require('../lib/index');
var data = require('./data/deep-store.json');
var _ = require('lodash');

suite('jsonGpath edges', function() {

  test('[Y] parse nested subscript expression with leading simple expression (integer)', function () {
    var results = jpql.nodes(data, "$..book[0..[name,rating]]");
    assert.deepEqual(results, [
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
          "rating"
        ],
        "value": 4
      }
    ]);
  });

  test('parse nested subscript expression with leading simple expression (string-literal)', function () {
    var results = jpql.nodes(data, "$..book.0['author'[.profile[name,twitter]]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });

  test('parse nested subscript expression with leading simple expression (identifier) - active indices', function () {
    var results = jpql.nodes(data, "$..book[[author[.profile[name,twitter]]],[author[.profile[name,twitter]]]]");
    assert.deepEqual(results, [
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

//  test('parse nested subscript expression with leading simple expression (keyword)', function () {
//    var results = jpql.nodes(data, "$..book.0[true[0[name,twitter]]]");
//    assert.deepEqual(results, [false]);
//  });

  test('parse nested subscript expression with leading active expression (array-slice)', function () {
    var results = jpql.nodes(data, "$..book[1:3[author[0..[name,twitter]]]]");
    assert.deepEqual(results, [
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
          2,
          "author",
          0,
          "profile",
          "twitter"
        ],
        "value": "@Herman Melville"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (active-array-slice)', function () {
    var results = jpql.nodes(data, "$..book[({@.length-3}):({@.length-2})[author[..profile[name,twitter]]]]");
    assert.deepEqual(results, [
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

  test('parse nested subscript expression with leading active expression (script-expression)', function () {
    var results = jpql.nodes(data, "$..book[(@.length-4)[author[0.profile[name,twitter]]]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (active-script-expression)', function () {
    var results = jpql.nodes(data, "$..book[({@.length-4})[author[[profile[name,twitter]]]]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (star)', function () {
    var results = jpql.nodes(data, "$..book[*[author[[profile[name,twitter]]]]]");
    assert.deepEqual(results, [
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
          2,
          "author",
          0,
          "profile",
          "twitter"
        ],
        "value": "@Herman Melville"
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
          "twitter"
        ],
        "value": "@J. R. R. Tolkien"
      }
    ]);
  });

  test('parse nested subscript expression with leading active expression (filter-expression)', function () {
    var results = jpql.nodes(data, "$..book[?(@.isbn)[author[[profile[name,twitter]],[profile[twitter]]]]]");
    // no results for profile.index=1[profile, twitter]
    assert.deepEqual(results, [
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
          2,
          "author",
          0,
          "profile",
          "twitter"
        ],
        "value": "@Herman Melville"
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
          "twitter"
        ],
        "value": "@J. R. R. Tolkien"
      }
    ]);
  });

  test('parse nested subscript expression with a list of (filter-expression)', function () {
//    var results = jpql.paths(data, "$..book[?(@.isbn)[author[0.profile[name,twitter]]],?(@.price<20)[author[0[profile][name,twitter]]]]");
    var results = jpql.paths(data, "$..book[?(@.isbn)[author[0.profile[name,twitter]]]]");
    assert.deepEqual(results, [
      [
        "$",
        "store",
        "book",
        2,
        "author",
        0,
        "profile",
        "name"
      ],
      [
        "$",
        "store",
        "book",
        2,
        "author",
        0,
        "profile",
        "twitter"
      ],
      [
        "$",
        "store",
        "book",
        3,
        "author",
        0,
        "profile",
        "name"
      ],
      [
        "$",
        "store",
        "book",
        3,
        "author",
        0,
        "profile",
        "twitter"
      ]
    ]);
  });

  test('parse nested subscript expression with leading active expression ($)', function () {
    var results = jpql.nodes(data, "$..book[*][$.i18n.descriptionTag]"); //$$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading member component expression', function () {
    var results = jpql.nodes(data, "$..book[.author[.profile[name,twitter]]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });

  test('parse nested subscript expression with leading descendant component expression', function () {
    var results = jpql.nodes(data, "$..book[0][..profile[name,twitter]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });

  test('parse nested subscript expression without leading expression (active-index)', function () {
    var results = jpql.nodes(data, "$..book[[author[.profile[name,twitter]]]]");
    assert.deepEqual(results, [
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
      }
    ]);
  });
});