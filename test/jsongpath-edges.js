var assert = require('chai').assert;
var jpql = require('../lib/index');
var data = require('./data/deep-store.json');
var _ = require('lodash');

suite('jsonGpath edges', function() {

  test('parse nested subscript expression with leading simple expression (integer)', function () {
    var results = jpql.nodes(data, "$..book[0[name,rating]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading simple expression (string-literal)', function () {
    var results = jpql.nodes(data, "$..book.0['author'[0[name,twitter]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading simple expression (identifier)', function () {
    var results = jpql.nodes(data, "$..book.0[author[0[name,twitter]]]");
    assert.deepEqual(results, [false]);
  });

//  test('parse nested subscript expression with leading simple expression (keyword)', function () {
//    var results = jpql.nodes(data, "$..book.0[true[0[name,twitter]]]");
//    assert.deepEqual(results, [false]);
//  });

  test('parse nested subscript expression with leading active expression (array-slice)', function () {
    var results = jpql.nodes(data, "$..book[1:2[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression (active-array-slice)', function () {
    var results = jpql.nodes(data, "$..book[({@.length-3}):({@.length-2})[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression (script-expression)', function () {
    var results = jpql.nodes(data, "$..book[(@.length-4)[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression (active-script-expression)', function () {
    var results = jpql.nodes(data, "$..book[({@.length-4})[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression (star)', function () {
    var results = jpql.nodes(data, "$..book[*[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression (filter-expression)', function () {
    var results = jpql.nodes(data, "$..book[?(@.isbn)[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with a list of (filter-expression)', function () {
    var results = jpql.nodes(data, "$..book[?(@.isbn)[author[0[name,twitter]]], ?(@.price<20)[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading active expression ($)', function () {
    var results = jpql.nodes(data, "$..book[*][$.i18n.descriptionTag]"); //$$ references child root node, this specific simple case is equivalent to genereLists[*][name,rating]
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading member component expression', function () {
    var results = jpql.nodes(data, "$..book[.author[0[name,twitter]]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression with leading descendant component expression', function () {
    var results = jpql.nodes(data, "$..book[0][..profile[name,twitter]]");
    assert.deepEqual(results, [false]);
  });

  test('parse nested subscript expression without leading expression (active-index)', function () {
    var results = jpql.nodes(data, "$..book[[author[0[name,twitter]]]]");
    assert.deepEqual(results, [false]);
  });
});