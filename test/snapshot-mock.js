/**
 * Created by sdawood on 15/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 *
 ^         IT GO
 10        HOME!
 9   $.R.e.a.c[T].a.z.*
 8        ^   ^
 7       (@) (#)
 6          $
 5      <=-...+=>
 4
 3         ><
 2        DATA
 1        TAZ
 0 1 2 3 4 5 6 7 8 9 10 $*/

var assert = require('chai').assert;
var data = require('./data/deep-store.json');
var _ = require('lodash');
var ContextManager = require('../lib/context').ContextManager;
var _provides = require('../lib/reactaz/tagspm_modules/builtins/provides');
var MemorySubject = _provides.MemorySubject,
  RequirementProvider = _provides.RequirementProvider;
var unparse = require('../lib/reactaz/tagspm_modules/builtins/datacodegen').unparse;


suite('builtins#snapshot#mocking - not reconstructing branches', function() {

  test('#basic has no resemblance to the original, builtins#unparse: tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var jpql = require('../lib/index');
    var source = { x: 'X', y: {yy: "YY",  junk: '$#%^&#!@#$'},
      z: "Z", w: [
        { w: { w: {name: "ReacTaz"}}},
        "w1"
      ], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[x, y.yy, z, w[.w.w.name]]'; //@todo #takeAll activeScript Tag to get leaf or node.*, in this example we had to know that x, y are keys with simple values
    var flatResult = jpql.nodes(source, snapshotpath);
    assert.deepEqual(flatResult, [
      {
        "path": [
          "$",
          "x"
        ],
        "value": "X"
      },
      {
        "path": [
          "$",
          "y",
          "yy"
        ],
        "value": "YY"
      },
      {
        "path": [
          "$",
          "z"
        ],
        "value": "Z"
      },
      {
        "path": [
          "$",
          "w",
          0,
          "w",
          "w",
          "name"
        ],
        "value": "ReacTaz"
      }
    ]);
    var pocMock = {};
    assert.deepEqual(unparse(flatResult, pocMock, '#basic'), {
      "x": {
        "yy": {
          "z": {
            "name": true
          }
        }
      }
    });
    pocMock = unparse(flatResult, null, '#mock');
    assert.deepEqual(pocMock, {
      "x": {
        "yy": {
          "z": {
            "name": true
          }
        }
      }
    });
    var mockClone = _.merge({}, pocMock);
    var foreignNodes = [{path: ['unknown', 'com'], value: 'untrusted $#%^&#!@#$ junk'}];
    var through = unparse(foreignNodes, mockClone);
    // did we let alien nodes into the mock?
    assert.deepEqual(mockClone, pocMock);
  });

  test('#levels is as good as it gets, used by builtins#unparse: tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var jpql = require('../lib/index');
    var source = { R: ['R'], e: {a: ['a'], '[T]': ['[T]'],  junk: ['$#%^&#!@#$']},
      ".": {a: {z: ['Data Tags']}},
      w: [
        { w: { w: {name: "ReacTaz"}}},
        "w1"
      ], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[R, e, e[a, "[T]"], ["."].a.z, w[.w.w.name], w]'; //@todo #takeAll activeScript Tag to get leaf or node.*, in this example we had to know that x, y are keys with simple values
    var flatResult = jpql.nodes(source, snapshotpath);
    assert.deepEqual(flatResult, [{"value":["R"],"path":["$","R"]},{"value":{"a":["a"],"[T]":["[T]"],"junk":["$#%^&#!@#$"]},"path":["$","e"]},{"value":["a"],"path":["$","e","a"]},{"value":["[T]"],"path":["$","e","[T]"]},{"value":"ReacTaz","path":["$","w",0,"w","w","name"]},{"value":[{"w":{"w":{"name":"ReacTaz"}}},"w1"],"path":["$","w"]}]);
    var pocMock = {};
    assert.deepEqual(unparse(flatResult, pocMock, '#level'), {
      "x": {
        "yy": {
          "z": {
            "name": true
          }
        }
      }
    });
    pocMock = unparse(flatResult, null, '#level');
    assert.deepEqual(pocMock, {
      "x": {
        "yy": {
          "z": {
            "name": true
          }
        }
      }
    });
    var mockClone = _.merge({}, pocMock);
    var foreignNodes = [{path: ['unknown', 'com'], value: 'untrusted $#%^&#!@#$ junk'}];
    var through = unparse(foreignNodes, mockClone, '#level');
    // did we let alien nodes into the mock?
    assert.deepEqual(mockClone, pocMock);
  });

  test('builtins#unparse: tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var jpql = require('../lib/index');
    var source = { x: 'X', y: {yy: "YY",  junk: '$#%^&#!@#$'},
      z: "Z", w: [
        { w: { w: {name: "ReacTaz"}}},
        "w1"
      ], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[x, y.yy, z, w[.w.w.name]]'; //@todo #takeAll activeScript Tag to get leaf or node.*, in this example we had to know that x, y are keys with simple values
    var flatResult = jpql.nodes(source, snapshotpath);
    assert.deepEqual(flatResult, [
      {
        "path": [
          "$",
          "x"
        ],
        "value": "X"
      },
      {
        "path": [
          "$",
          "y",
          "yy"
        ],
        "value": "YY"
      },
      {
        "path": [
          "$",
          "z"
        ],
        "value": "Z"
      },
      {
        "path": [
          "$",
          "w",
          0,
          "w",
          "w",
          "name"
        ],
        "value": "ReacTaz"
      }
    ]);
    var pocMock = {};
    assert.deepEqual(unparse(flatResult, pocMock, '#basic'), {not: 'equal'});
    pocMock = unparse(flatResult, null, '#mock');
    assert.deepEqual(pocMock, {
      "x": {
        "yy": {
          "z": {
            "name": true
          }
        }
      }
    });
    var mockClone = _.merge({}, pocMock);
    var foreignNodes = [{path: ['unknown', 'com'], value: 'untrusted $#%^&#!@#$ junk'}];
    var through = unparse(foreignNodes, mockClone);
    // we even let alien nodes into the mock
    assert.notDeepEqual(mockClone, pocMock);
  });


  test('builtins#RequirementProvider: tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var ctx = new ContextManager();
    var jpql = require('../lib/index');
    var source = {x: 'X', y: {yy: "YY",  junk: '$#%^&#!@#$'}, z: "Z", w: ["W0", "w1"], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[x.*, y.yy, z.*, w.*]';
    var provider = new RequirementProvider(jpql.nodes(source, snapshotpath), snapshotpath, ctx);
    assert.deepEqual(provider.nodes, [false]);
    var pocMock = {};
    assert.deepEqual(provider.provideAs(pocMock), {not: 'equal'});
    var mockClone = _.merge({}, pockMock);
    var foreignNodes = [{path: 'unknown.com', value: 'untrusted $#%^&#!@#$ junk'}];
    var through = provider.provideAs(mockClone, foreignNodes);
    // did we let alien nodes into the mock?
    assert.deepEqual(mockClone, pockMock);
  });
});