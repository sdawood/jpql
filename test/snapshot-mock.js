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


suite('snapshot-mocking', function() {
  test('MemorySubject: tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var ctx = new ContextManager();
    var jpql = require('../lib/index');
    var source = {x: 'X', y: {yy: "YY",  junk: '$#%^&#!@#$'}, z: "Z", w: ["W0", "w1"], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[x.*, y.yy, z.*, w.*]';
    var provider = new MemorySubject(jpql.nodes(source, snapshotpath), snapshotpath, ctx);
    assert.deepEqual(provider.nodes, [false]);
    var pocMock = {};
    assert.deepEqual(provider.provideAs(pocMock), {not: 'equal'});
    var mockClone = _.merge({}, pocMock);
    var foreignNodes = [{path: 'unknown.com', value: 'untrusted $#%^&#!@#$ junk'}];
    var through = provider.provideAs(mockClone, foreignNodes);
    // did we let alien nodes into the mock?
    assert.deepEqual(mockClone, pocMock);
  });

  test('tag a selective snapshot of an available source of data, and reconstruct it in your own scope', function () {
    var ctx = new ContextManager();
    var jpql = require('../lib/index');
    var source = {x: 'X', y: {yy: "YY",  junk: '$#%^&#!@#$'}, z: "Z", w: ["W0", "w1"], junk: '$#%^&#!@#$'};
    var snapshotpath = '$[x.*, y.yy, z.*, w.*]';
    var provider = new ReqProvider(jpql.nodes(source, snapshotpath), snapshotpath, ctx);
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