var assert = require('chai').assert;
var jpql = require('../lib/index');
var deepStore = require('./data/deep-store.json');
var graphJSON = require('./data/graph-like.json');
var _ = require('lodash');

/**
 * Walking an edge is a genral case of moving to the path next component.
 * In otherwords, jsonpath is a special case of walking graph edges, but since the graph is limited to a tree, where every child has one and only one parent,
 * walking from parent to child is implicitely waking the edge === 'has'.
 * Within an edge expression - by convention surrounded by [ and ] - a child can walk an edge to the parent using $, or to a remote relative using $.path.to.relative.
 * navigation is exclusively within the sub-graph we accessed as $ earlier, which provides an inherent scoping security aspect.
 * within the edge expression ( member, filter, script, slice, ... ) child can access:
 * 1. @ == immediate parent
 * 2. $ == sub-graph root, require root ref to be accessible in partial handlers
 * 3. @$ == immediate parent for easy access to siblings
 * Obviously relative bacwards path from child to parent are a no brainer in case of JSON, since in a json tree there is one and only one parent
 * in "json" mode:
 * - @$$ can easily point back to the grandparent
 * - @$$$ grand grand parent, etc ...
 * - only active components are worth evaluation
 * - @.parent.grandparent[-1:]
 * - backwardd path require parent reference to walk back up the evaluated path so far
 * -
 * */


suite('jsonGpath', function() {

  test(']X] Retrieve references to nodes by ID from root $', function () {
    var results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[({String($parent.friends[0])})]]');
    assert.deepEqual(results, [false]);
  });

  test('Retrieve references to nodes with exhaustive filter', function () {
    var results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[?($parent.friends.indexOf(@.id) > -1)]]');
    assert.deepEqual(results, [false]);
  });

  test('Conditional Graph Edges with branch-root reference == $parent', function () {
    var results = jpql.nodes(graphJSON, 'nodes["123"][id,profile[name,birthdate[month]],$.nodes[({$parent.friends[0]})]]]');
    assert.deepEqual(results, [false]);
  });

  test('Single computed Graph Edges via identifier expression', function () {
    var _data = { store: { book: [{ language: 'en', author: [{ profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]}]}};
    /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
    var path = "$.store.book[0[author.0.profile[({$.store.book[0].language + '_name'})]]]";
    console.log(jpql.inspect(jpql.parse(path)));
    var results = jpql.nodes(_data, path);
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
          "en_name"
        ],
        "value": "name in english"
      }
    ]);
  });

  test('Single computed Graph Edges via string expression', function () {
    var _data = { store: { book: [{ language: 'en', author: [{ profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]}]}};
    /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
    var path = "$.store.book[0[author.0.profile[({'\"' + $.store.book[0].language + '_name'+ '\"'})]]]";
    console.log(jpql.parse(path));
    var results = jpql.nodes(_data, path);
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
          "en_name"
        ],
        "value": "name in english"
      }
    ]);
  });

  test('List of computed Graph Edges via string expressions', function () {
    var _data = {i18n: {'default': 'english', language: ['en', 'fr']}, book: [{author: [{ profile: {'fr_name': 'name in french', 'en_name': 'name in english'}}]}]};
    /** DO NOT confuse the javascript expression $.i18n.language[0] with a jsonpath, no acrobatics are allowed here, only ECMAScript Rules */
//    var path = "$.book[.author[.profile[({'\"' + $.i18n.language[0] + '_name' + '\"'}), ({'\"' + $.i18n.language[1] + '_name' + '\"'})]]]";
    var path = "$.book[.author[.profile[({'\"' + $.i18n.language[1] + '_name'+ '\"'}),({'\"' + $.i18n.language[0] + '_name'+ '\"'})]]]";
    console.log(jpql.inspect(jpql.parse(path)));
    var results = jpql.nodes(_data, path);
    assert.deepEqual(results, [
      {
        "path": [
          "$",
          "book",
          0,
          "author",
          0,
          "profile",
          "fr_name"
        ],
        "value": "name in french"
      },
      {
        "path": [
          "$",
          "book",
          0,
          "author",
          0,
          "profile",
          "en_name"
        ],
        "value": "name in english"
      }
    ]);
  });
})
