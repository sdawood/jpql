var util = require('util');
var assert = require('assert');
var expect = require('chai').expect;
var jp = require('../');
var traverse = require('traverse');
var data = require('./data/deep-store.json');

function log() {
  var args = Array.prototype.slice.call(arguments);
  args.forEach(function(arg, index) {
    console.log(util.inspect(arg, false, null));
  });
}

suite('jsonpath#query', function() {

  test('[Y] - leading member', function() {
    var results = jp.nodes(data, 'store');
    assert.deepEqual(results, [ { path: ['$', 'store'], value: data.store } ]);
  });

  test('authors of all books in the store', function() {
    var results = jp.nodes(data, '$.store.book[*].author..name');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees' },
      { path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh' },
      { path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville' },
      { path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien' }
    ]);
  });

  test('[Y] authors of all books in the store via STAR followed by subscript', function() {
    var results = jp.nodes(data, '$..*[author]..name');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees' },
      { path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh' },
      { path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville' },
      { path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien' }
    ]);
  });

  test('[Y] all books [author,title] via subscript expression with leading * (loose structure matching)', function() {
    var results = jp.nodes(data, '$..*[author,title]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author },
      { path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title },
      { path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author },
      { path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title },
      { path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author },
      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
      { path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author },
      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title }
    ]);
  });

  test('[Y] authors of all books in the store via branches', function() {
    var results = jp.nodes(data, '$.store.book[0.author..name,1.author..name,2.author..name,3.author..name]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'author', 0, 'profile', 'name'], value: 'Nigel Rees' },
      { path: ['$', 'store', 'book', 1, 'author', 0, 'profile', 'name'], value: 'Evelyn Waugh' },
      { path: ['$', 'store', 'book', 2, 'author', 0, 'profile', 'name'], value: 'Herman Melville' },
      { path: ['$', 'store', 'book', 3, 'author', 0, 'profile', 'name'], value: 'J. R. R. Tolkien' }
    ]);
  });

  test('[X duplicates] selective branches via nested branches', function() {
    log(jp.parse('$.store.book[0..[..name,..twitter],1..[..name,..twitter]]'));
    var results = jp.nodes(data, '$.store.book[0..[..name,..twitter],1..[..name,..twitter]]');
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



  test('[Y] all books with [isbn,title] via subscript expression with leading * strict structure matching via filter', function() {
    var results = jp.nodes(data, '$..*[?(@.isbn && @.title)][isbn,title]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 2, 'isbn'], value: data.store.book[2].isbn },
      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
      { path: ['$', 'store', 'book', 3, 'isbn'], value: data.store.book[3].isbn },
      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title }
    ]);
  });

//  test('[Y] all books with [isbn,title] via subscript expression with leading * (strict structure matching) via $has filter', function() {
//    var results = jp.nodes(data, '$..*[?($has("isbn", "title"))][isbn,title]');
//    assert.deepEqual(results, [
//      { path: ['$', 'store', 'book', 2, 'isbn'], value: data.store.book[2].isbn },
//      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
//      { path: ['$', 'store', 'book', 3, 'isbn'], value: data.store.book[3].isbn },
//      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title }
//    ]);
//  });

  test('all things in store', function() {
    var results = jp.nodes(data, '$.store.*');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book'], value: data.store.book },
      { path: ['$', 'store', 'bicycle'], value: data.store.bicycle }
    ]);
  });

  test('price of everything in the store', function() {
    var results = jp.nodes(data, '$.store..price');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'price'], value: 8.95 },
      { path: ['$', 'store', 'book', 1, 'price'], value: 12.99 },
      { path: ['$', 'store', 'book', 2, 'price'], value: 8.99 },
      { path: ['$', 'store', 'book', 3, 'price'], value: 22.99 },
      { path: ['$', 'store', 'bicycle', 'price'], value: 19.95 }
    ]);
  });

  test('last book in order via expression', function() {
    var results = jp.nodes(data, '$..book[(@.length-1)]');
    assert.deepEqual(results, [ { path: ['$', 'store', 'book', 3], value: data.store.book[3] }]);
  });

  test('first two books via union', function() {
    var results = jp.nodes(data, '$..book[0,1]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0], value: data.store.book[0] },
      { path: ['$', 'store', 'book', 1], value: data.store.book[1] }
    ]);
  });

  test('first two books via slice', function() {
    var results = jp.nodes(data, '$..book[0:2]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0], value: data.store.book[0] },
      { path: ['$', 'store', 'book', 1], value: data.store.book[1] }
    ]);
  });

  test('first two authors via nested subscripts', function() {
    var results = jp.nodes(data, '$..book[0[author[0].profile[name,twitter]],1[author[0].profile[name,twitter]]]');
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

  test('filter all books with isbn number', function() {
    var results = jp.nodes(data, '$..book[?(@.isbn)]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 2], value: data.store.book[2] },
      { path: ['$', 'store', 'book', 3], value: data.store.book[3] }
    ]);
  });

  test('filter all books with a price less than 10', function() {
    var results = jp.nodes(data, '$..book[?(@.price<10)]');
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0], value: data.store.book[0] },
      { path: ['$', 'store', 'book', 2], value: data.store.book[2] }
    ]);
  });

  test('all elements', function() {
    var results = jp.nodes(data, '$..*');

    assert.deepEqual(results, [
      { path: [ '$', 'store' ],
      value:
      { book:
        [ { category: 'reference',
          author:
            [ { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
              rating: 4 } ],
          title: 'Sayings of the Century',
          price: 8.95 },
          { category: 'fiction',
            author:
              [ { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
                rating: 4 } ],
            title: 'Sword of Honour',
            price: 12.99 },
          { category: 'fiction',
            author:
              [ { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
                rating: 4 } ],
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99 },
          { category: 'fiction',
            author:
              [ { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
                rating: 4 } ],
            title: 'The Lord of the Rings',
            isbn: '0-395-19395-8',
            price: 22.99 } ],
        bicycle: { color: 'red', price: 19.95 } } },
      { path: [ '$', 'store', 'book' ],
        value:
          [ { category: 'reference',
            author:
              [ { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
                rating: 4 } ],
            title: 'Sayings of the Century',
            price: 8.95 },
            { category: 'fiction',
              author:
                [ { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
                  rating: 4 } ],
              title: 'Sword of Honour',
              price: 12.99 },
            { category: 'fiction',
              author:
                [ { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
                  rating: 4 } ],
              title: 'Moby Dick',
              isbn: '0-553-21311-3',
              price: 8.99 },
            { category: 'fiction',
              author:
                [ { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
                  rating: 4 } ],
              title: 'The Lord of the Rings',
              isbn: '0-395-19395-8',
              price: 22.99 } ] },
      { path: [ '$', 'store', 'bicycle' ],
        value: { color: 'red', price: 19.95 } },
      { path: [ '$', 'store', 'book', 0 ],
        value:
        { category: 'reference',
          author:
            [ { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
              rating: 4 } ],
          title: 'Sayings of the Century',
          price: 8.95 } },
      { path: [ '$', 'store', 'book', 1 ],
        value:
        { category: 'fiction',
          author:
            [ { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
              rating: 4 } ],
          title: 'Sword of Honour',
          price: 12.99 } },
      { path: [ '$', 'store', 'book', 2 ],
        value:
        { category: 'fiction',
          author:
            [ { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
              rating: 4 } ],
          title: 'Moby Dick',
          isbn: '0-553-21311-3',
          price: 8.99 } },
      { path: [ '$', 'store', 'book', 3 ],
        value:
        { category: 'fiction',
          author:
            [ { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
              rating: 4 } ],
          title: 'The Lord of the Rings',
          isbn: '0-395-19395-8',
          price: 22.99 } },
      { path: [ '$', 'store', 'book', 0, 'category' ],
        value: 'reference' },
      { path: [ '$', 'store', 'book', 0, 'author' ],
        value:
          [ { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
            rating: 4 } ] },
      { path: [ '$', 'store', 'book', 0, 'title' ],
        value: 'Sayings of the Century' },
      { path: [ '$', 'store', 'book', 0, 'price' ], value: 8.95 },
      { path: [ '$', 'store', 'book', 0, 'author', 0 ],
        value:
        { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 0, 'author', 0, 'profile' ],
        value: { name: 'Nigel Rees', twitter: '@NigelRees' } },
      { path: [ '$', 'store', 'book', 0, 'author', 0, 'rating' ],
        value: 4 },
      { path: [ '$', 'store', 'book', 0, 'author', 0, 'profile', 'name' ],
        value: 'Nigel Rees' },
      { path: [ '$', 'store', 'book', 0, 'author', 0, 'profile', 'twitter' ],
        value: '@NigelRees' },
      { path: [ '$', 'store', 'book', 1, 'category' ],
        value: 'fiction' },
      { path: [ '$', 'store', 'book', 1, 'author' ],
        value:
          [ { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
            rating: 4 } ] },
      { path: [ '$', 'store', 'book', 1, 'title' ],
        value: 'Sword of Honour' },
      { path: [ '$', 'store', 'book', 1, 'price' ], value: 12.99 },
      { path: [ '$', 'store', 'book', 1, 'author', 0 ],
        value:
        { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 1, 'author', 0, 'profile' ],
        value: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' } },
      { path: [ '$', 'store', 'book', 1, 'author', 0, 'rating' ],
        value: 4 },
      { path: [ '$', 'store', 'book', 1, 'author', 0, 'profile', 'name' ],
        value: 'Evelyn Waugh' },
      { path: [ '$', 'store', 'book', 1, 'author', 0, 'profile', 'twitter' ],
        value: '@EvelynWaugh' },
      { path: [ '$', 'store', 'book', 2, 'category' ],
        value: 'fiction' },
      { path: [ '$', 'store', 'book', 2, 'author' ],
        value:
          [ { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
            rating: 4 } ] },
      { path: [ '$', 'store', 'book', 2, 'title' ],
        value: 'Moby Dick' },
      { path: [ '$', 'store', 'book', 2, 'isbn' ],
        value: '0-553-21311-3' },
      { path: [ '$', 'store', 'book', 2, 'price' ], value: 8.99 },
      { path: [ '$', 'store', 'book', 2, 'author', 0 ],
        value:
        { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 2, 'author', 0, 'profile' ],
        value: { name: 'Herman Melville', twitter: '@Herman Melville' } },
      { path: [ '$', 'store', 'book', 2, 'author', 0, 'rating' ],
        value: 4 },
      { path: [ '$', 'store', 'book', 2, 'author', 0, 'profile', 'name' ],
        value: 'Herman Melville' },
      { path: [ '$', 'store', 'book', 2, 'author', 0, 'profile', 'twitter' ],
        value: '@Herman Melville' },
      { path: [ '$', 'store', 'book', 3, 'category' ],
        value: 'fiction' },
      { path: [ '$', 'store', 'book', 3, 'author' ],
        value:
          [ { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
            rating: 4 } ] },
      { path: [ '$', 'store', 'book', 3, 'title' ],
        value: 'The Lord of the Rings' },
      { path: [ '$', 'store', 'book', 3, 'isbn' ],
        value: '0-395-19395-8' },
      { path: [ '$', 'store', 'book', 3, 'price' ], value: 22.99 },
      { path: [ '$', 'store', 'book', 3, 'author', 0 ],
        value:
        { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 3, 'author', 0, 'profile' ],
        value: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' } },
      { path: [ '$', 'store', 'book', 3, 'author', 0, 'rating' ],
        value: 4 },
      { path: [ '$', 'store', 'book', 3, 'author', 0, 'profile', 'name' ],
        value: 'J. R. R. Tolkien' },
      { path: [ '$', 'store', 'book', 3, 'author', 0, 'profile', 'twitter' ],
        value: '@J. R. R. Tolkien' },
      { path: [ '$', 'store', 'bicycle', 'color' ], value: 'red' },
      { path: [ '$', 'store', 'bicycle', 'price' ], value: 19.95 } ]);
  });

  test('all elements via subscript wildcard', function() {
    var results = jp.nodes(data, '$..*');
    assert.deepEqual(jp.nodes(data, '$..[*]'), jp.nodes(data, '$..*'));
  });

  test('object subscript wildcard', function() {
    var results = jp.query(data, '$.store[*]');
    assert.deepEqual(results, [ data.store.book, data.store.bicycle ]);
  });

  test('no match returns empty array', function() {
    var results = jp.nodes(data, '$..bookz');
    assert.deepEqual(results, []);
  });

  test('member numeric literal gets first element', function() {
    var results = jp.nodes(data, '$.store.book.0');
    assert.deepEqual(results, [ { path: [ '$', 'store', 'book', 0 ], value: data.store.book[0] } ]);
  });

  test('[Y] * Circular Reference Case descendant numeric literal gets first element', function() {
    var results = jp.nodes(data, '$.store.book..0');
    /** demonestrates a case of circular reference since book[0].athuor[0] is included twice, shoulw be extracted as $ref
     *  - traverse doesn't detect a circular reference since the reference is not a direct parent of the node but a leaf of a sibling */
    assert.deepEqual(results, [
      { path: [ '$', 'store', 'book', 0 ],
      value:
      { category: 'reference',
        author:
          [ { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
            rating: 4 } ],
        title: 'Sayings of the Century',
        price: 8.95 } },
      { path: [ '$', 'store', 'book', 0, 'author', 0 ],
        value:
        { profile: { name: 'Nigel Rees', twitter: '@NigelRees' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 1, 'author', 0 ],
        value:
        { profile: { name: 'Evelyn Waugh', twitter: '@EvelynWaugh' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 2, 'author', 0 ],
        value:
        { profile: { name: 'Herman Melville', twitter: '@Herman Melville' },
          rating: 4 } },
      { path: [ '$', 'store', 'book', 3, 'author', 0 ],
        value:
        { profile: { name: 'J. R. R. Tolkien', twitter: '@J. R. R. Tolkien' },
          rating: 4 } } ]);
  });

  test('[Y] branches via active index', function() {
    log(jp.parse('$..book[[*],[title,price],[title,price]]'));
    var results = jp.nodes(data, '$..book[[*],[title,price],[title,price]]');
    assert.deepEqual(results, [
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

  test('[Y] branches with good old script expression', function() {
    log(jp.parse('$..book.0[("title")]'));
    var results = jp.nodes(data, '$..book.0[("title")]');
    assert.deepEqual(results, [
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

  test('[Y] branches with list of script expression via leading index', function() {
    log(jp.parse('$..book[("title"),("title")]'));
    var results = jp.query(data, '$..book[0.("title"),1.("title")]');
    assert.deepEqual(results, [
      data.store.book[0].title,
      data.store.book[1].title
    ]);
  });

  test('[Y] child member script expression', function() {
    var results = jp.nodes(data, '$..book.(@.length-1).title');
    assert.deepEqual(results, [
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

  test('[Y] branch out and in via active index, single subscript and subscript list branch cases', function() {
    var results = jp.nodes(data, '$..book[.author,[author][0].profile.name,.author[0].profile.name]');
    assert.deepEqual(results, [
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

  test('root element gets us original obj', function() {
    var results = jp.nodes(data, '$');
    assert.deepEqual(results, [ { path: ['$'], value: data } ]);
  });

  test('subscript double-quoted string', function() {
    var results = jp.nodes(data, '$["store"]');
    assert.deepEqual(results, [ { path: ['$', 'store'], value: data.store} ]);
  });

  test('subscript single-quoted string', function() {
    var results = jp.nodes(data, "$['store']");
    assert.deepEqual(results, [ { path: ['$', 'store'], value: data.store} ]);
  });

  test('leading member component', function() {
    var results = jp.nodes(data, "store");
    assert.deepEqual(results, [ { path: ['$', 'store'], value: data.store} ]);
  });

  test('union of three array slices', function() {
    var results = jp.query(data, "$.store.book[0:1,1:2,2:3]");
    assert.deepEqual(results, data.store.book.slice(0,3));
  });

  test('slice with step > 1', function() {
    var results = jp.query(data, "$.store.book[0:4:2]");
    assert.deepEqual(results, [ data.store.book[0], data.store.book[2]]);
  });

  test('union of subscript string literal keys', function() {
    var results = jp.nodes(data, "$.store['book','bicycle']");
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book'], value: data.store.book },
      { path: ['$', 'store', 'bicycle'], value: data.store.bicycle },
    ]);
  });

  test('union of subscript string literal three keys', function() {
    var results = jp.nodes(data, "$.store.book[0]['title','author','price']");
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title },
      { path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author },
      { path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price }
    ]);
  });

  test('union of subscript integer three keys followed by member-child-identifier', function() {
    var results = jp.nodes(data, "$.store.book[1,2,3]['title']");
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title },
      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title }
    ]);
  });

  test('union of subscript integer three keys followed by union of subscript string literal three keys', function() {
    var results = jp.nodes(data, "$.store.book[0,1,2,3]['title','author','price']");
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title },
      { path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author },
      { path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price },
      { path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title },
      { path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author },
      { path: ['$', 'store', 'book', 1, 'price'], value: data.store.book[1].price },
      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
      { path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author },
      { path: ['$', 'store', 'book', 2, 'price'], value: data.store.book[2].price },
      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title },
      { path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author },
      { path: ['$', 'store', 'book', 3, 'price'], value: data.store.book[3].price }
    ]);
  });

  test('union of subscript 4 array slices followed by union of subscript string literal three keys', function() {
    var results = jp.nodes(data, "$.store.book[0:1,1:2,2:3,3:4]['title','author','price']");
    assert.deepEqual(results, [
      { path: ['$', 'store', 'book', 0, 'title'], value: data.store.book[0].title },
      { path: ['$', 'store', 'book', 0, 'author'], value: data.store.book[0].author },
      { path: ['$', 'store', 'book', 0, 'price'], value: data.store.book[0].price },
      { path: ['$', 'store', 'book', 1, 'title'], value: data.store.book[1].title },
      { path: ['$', 'store', 'book', 1, 'author'], value: data.store.book[1].author },
      { path: ['$', 'store', 'book', 1, 'price'], value: data.store.book[1].price },
      { path: ['$', 'store', 'book', 2, 'title'], value: data.store.book[2].title },
      { path: ['$', 'store', 'book', 2, 'author'], value: data.store.book[2].author },
      { path: ['$', 'store', 'book', 2, 'price'], value: data.store.book[2].price },
      { path: ['$', 'store', 'book', 3, 'title'], value: data.store.book[3].title },
      { path: ['$', 'store', 'book', 3, 'author'], value: data.store.book[3].author },
      { path: ['$', 'store', 'book', 3, 'price'], value: data.store.book[3].price }
    ]);
  });


  test('nested parentheses eval', function() {
    var pathExpression = '$..book[?( @.price && (@.price + 20 || false) )]'
    var results = jp.query(data, pathExpression);
    assert.deepEqual(results, data.store.book);
  });

  test('array indexes from 0 to 100', function() {
    var data = [];
    for (var i = 0; i <= 100; ++i)
      data[i] = Math.random();

    for (var i = 0; i <= 100; ++i) {
      var results = jp.query(data, '$[' + i.toString() +  ']');
      assert.deepEqual(results, [data[i]]);
    }
  });

  test('descendant subscript numeric literal', function() {
    var data = [ 0, [ 1, 2, 3 ], [ 4, 5, 6 ] ];
    var results = jp.query(data, '$..[0]');
    assert.deepEqual(results, [ 0, 1, 4 ]);
  });

  test('descendant subscript numeric literal', function() {
    var data = [ '0-0', '1-0', [ '2-0', '2-1', '2-2' ], [ '3-0', '3-1', 3-2, [ '3-3-0', '3-3-1' , '3-3-2' ] ] ];
    var results = jp.nodes(data, '$..[0,1]');
    assert.deepEqual(results, [
      {
        "path": [
          "$",
          0
        ],
        "value": "0-0"
      },
      {
        "path": [
          "$",
          2,
          0
        ],
        "value": "2-0"
      },
      {
        "path": [
          "$",
          3,
          0
        ],
        "value": "3-0"
      },
      {
        "path": [
          "$",
          3,
          3,
          0
        ],
        "value": "3-3-0"
      },
      {
        "path": [
          "$",
          1
        ],
        "value": "1-0"
      },
      {
        "path": [
          "$",
          2,
          1
        ],
        "value": "2-1"
      },
      {
        "path": [
          "$",
          3,
          1
        ],
        "value": "3-1"
      },
      {
        "path": [
          "$",
          3,
          3,
          1
        ],
        "value": "3-3-1"
      }
    ]);
  });


  test('throws for no input', function() {
    assert.throws(function() { jp.query() }, /needs to be an object/);
  });

  test('throws for bad input', function() {
    assert.throws(function() { jp.query("string", "string") }, /needs to be an object/);
  });

  test('throws for bad input', function() {
    assert.throws(function() { jp.query({}, null) }, /we need a path/);
  });

  test('[header, details, footer] all books [author,title] via list of subscript expression with first level STAR expression, header, details, footer style', function() {
    var results = jp.nodes(data, '$..book.0..author[*..name,*,*..twitter]');
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

  test('[all except] all author details via except the twitter handle using a filter-out', function() {
    var results = jp.nodes(data, '$..book.*..author[.profile..[?($key !== "twitter")]]');
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

  test('[Y] all books [author,title] via list of subscript expression with first level filter expression', function() {
    var results = jp.nodes(data, '$..book[?(@.isbn).title,?(@.isbn).price]');
    assert.deepEqual(results, [
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

  test('[Y] all books [author,title] via list of subscript expression with first level slice expression', function() {
    var results = jp.nodes(data, '$..book[0:2.title,2:4.title]');
    assert.deepEqual(results, [
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

  test('[Y] all books [author,title] via list of subscript expression with first level active slice expression', function() {
    var results = jp.nodes(data, '$..book[({@.length-3}):({@.length-1}).title,({@.length-3}):({@.length-1}).price]');
    assert.deepEqual(results, [
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

  test('[Y] all books [title] via single subscript expression with first level active slice expression', function() {
    var results = jp.nodes(data, '$..book[({@.length-4}):({@.length})[title,price]]');
    assert.deepEqual(results, [
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

  test('[Y] all books [author,title] via list of subscript expression with first level script expression', function() {
    var results = jp.nodes(data, '$..book[(@.length-2).title,(@.length-2).price]');
    assert.deepEqual(results, [
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

  test('[Y] all books [author,title] via list of subscript expression with first level active script expression', function() {
    var results = jp.query(data, '$..book[({@.length-2}).title,({@.length-2}).price]');
    assert.deepEqual(results, [
      data.store.book[2].title,
      data.store.book[2].price
    ]);
  });

  test('[?subscript-child-call_expression] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', function() {
    expect(function() {jp.query(data, '$..book[(delay: 100).title,(delay: 100 ).price]')}).to.throw("Unsupported query component: subscript-child-call_expression");
  });

  test('[?subscript-child-call_expression] all books [author,title] via list of subscript expression with first level call expression -> active position anchor', function() {
    expect(function() {jp.query(data, '$..book[(delay: 100).title,(delay: 100 ).price]')}).to.throw("Unsupported query component: subscript-child-call_expression");
  });

  test('[?] in call expression, spaces are illegal between the opening ( and the key, and between the key and the ":", parsed as void script expression ending the path retreival', function() {
    var results = jp.query(data, '$..book[( delay: 100).title,( delay: 100 ).price]');
    assert.deepEqual(results, []);
  });

  test('[?subscript-child-call_expression] subscript-style call expression with identifier style key', function() {
    expect(function() {jp.query(data, '$..book(take: 2).title')}).to.throw("Unsupported query component: subscript-child-call_expression"); //subscript style call
  });

  test('[?subscript-child-call_expression] subscript-style call expression with keyword literal style key coerces into string', function() {
    expect(function() {jp.query(data, "$..book(true: 2).title")}).to.throw("Unsupported query component: subscript-child-call_expression"); //subscript style call
  });

  test('[Y] just a member followed by a script expression, while implementation can produce the same result, the parser does not consider this a call expression, not to be confused with book(take: 2)', function() {
    var results = jp.query(data, '$..book.(2).title');
    assert.deepEqual(results, [data.store.book[2].title]);
  });

  test('[?subscript-descendant-call_expression] descendant call expression', function() {
    expect(function() {jp.query(data, '$.store.*..(take: 1).name')}).to.throw("Unsupported query component: subscript-descendant-call_expression"); //first of each category
  });

  test('[Y] active script expressions listables are still members :: SCRIPT', function() {
    var results = jp.query(data, '$..book.(@.length-1).title');
    assert.deepEqual(results, [
      "The Lord of the Rings"
    ]);
  });

  test('[Y] active script expressions listables are still members :: ACTIVE_SCRIPT', function() {
    var results = jp.query(data, '$..book.({@.length-1}).title');
    assert.deepEqual(results, [
      "The Lord of the Rings"
    ]);
  });


});

