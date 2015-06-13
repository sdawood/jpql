/**
 * Created by sdawood on 14/06/2015.
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
var Rx = require('rx/dist/rx.all');
var context = require('../lib/context');
var ContextManager = context.ContextManager,
  ResourceNode = context.ResourceNode;

var TagScript = require('../lib/tagscript').TagScript;

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

describe('TagScript (TAZ)', function() {

  it('map script result with from, args, to', function () {
    var ctx = new ContextManager();
    var taz = new TagScript(null, ctx);
    assert.deepEqual(taz.map(['from'], ['args'], ['to'], ctx), [
      "to",
      "map-own-result",
      "from",
      "args"
    ]);

  });

  it('map script result with args', function () {
    var ctx = new ContextManager();
    var taz = new TagScript(null, ctx);
    assert.deepEqual(taz.map([], ['args'], [], ctx), [
      "map-own-result",
      "args"
    ]);

  });

  it('reduce script result with from, args, to', function () {
    var ctx = new ContextManager();
    var taz = new TagScript(null, ctx);
    assert.deepEqual(taz.reduce(['from'], ['args'], ['to'], ctx), [
      "to",
      "reduce-own-result",
      "from",
      "args"
    ]);

  });

  it('reduce script result with args', function () {
    var ctx = new ContextManager();
    var taz = new TagScript(null, ctx);
    assert.deepEqual(taz.reduce([], ['args'], [], ctx), [
      "reduce-own-result",
      "args"
    ]);

  });
});