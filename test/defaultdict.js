var assert = require('chai').assert;
var defaultdict = require('../lib/defaultdict/read');

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

describe('defaultdict#DefaultDict', function() {

  it('should be transparent for existing keys', function () {
    var source = new defaultdict({x: 1, y: 2}, function(){ return 'Not Available'}, {z: 'Temporary Not Available', 'XXX': '#ACCESS_DENIED'});
    assert.equal(source('x'), 1);
  });

  it('should default() for missing keys, if no map or alias are provided', function () {
    var source = new defaultdict({x: 1, y: 2}, function(){ return 'Not Available'});
    assert.equal(source('xx'), 'Not Available');
  });

  it('should return default value for missing keys, if no map or alias are provided', function () {
    var source = new defaultdict({x: 1, y: 2}, 'Not Available');
    assert.equal(source('xx'), 'Not Available');
  });

  it('should give alias priority over the key, if no map is provided', function () {
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available'}, function(){ return 'Not Available'});
    assert.equal(source('x', {x: 'notAvailable'}), "Custom Not Available");
  });

  it('should give alias priority over an existing key, if no map is provided', function () {
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available'}, function(){ return 'Not Available'});
    assert.equal(source('x', {x: 'notAvailable'}), "Custom Not Available");
  });

  it('should give alias priority over missing key, if no map is provided', function () {
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available'}, function(){ return 'Not Available'});
    assert.equal(source('optional', {optional: 'notAvailable'}), "Custom Not Available");
  });

  it('map masks filtered existing key', function () {
    var source = new defaultdict({x: 1, y: 2, forbidden: '$$ confidential $$ information $$', notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('forbidden', {forbidden: 'forbidden'}), '403 Forbidden');
  });

  it('map masks existing key', function () {
    var source = new defaultdict({x: 1, y: 2, forbidden: '$$ confidential $$ information $$', notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('forbidden'), '403 Forbidden');
  });

  it('map masks filtered missing key', function () {
    var source = new defaultdict({x: 1, y: 2, forbidden: '$$ confidential $$ information $$', notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('missing', {missing: 'forbidden'}), '403 Forbidden');
  });

  it('map masks missing key', function () {
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('forbidden'), '403 Forbidden');
  });

  it('return effective access keys in simulation mode', function () {
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('forbidden', null, true), "Not Available"); //default factory result not masked by alias or map
  });

  it('return effective access keys in simulation mode, with nodeContext target', function () {
    var jp = require('../index');
    var ResourceNode = require('../lib/context').ResourceNode;
    var node = new ResourceNode();
    console.log(node.$quoteAll([1, 2, 3, 4]))
    var forwarding = new defaultdict(node, "401 Not Available", {
      $parent$: 'parent$', $node$: 'node$', $: '$root'
    }); //target, defaultFactory, originMapping

    var required = ['$parent', '$branch', '$node', 'node$', '$', '$quoteAll']; //need iterators over parsed path components to enumerate all required sub-path and apply mappings, bootstrapped jpql operating on AST?
    required = required.map(function(key){ return forwarding(key, null, true); });
    var path = JSON.stringify(required); // line of shame, @todo remove after bootstrapped jpql is up for the task
    console.log('path::', path);
    var results = jp.nodes(node, path); //works only for first level path components, needs bootstrap capability (key-map script to describe the mapping in a deeper node
    console.log('require()::', results);
    results = results.map(function(node){ var key = node.path.pop(); node.path.push(forwarding(key, null, true)); console.log('FORWARD::',key, node.path.slice(-1)); return node; });
    console.log('require()::map::', results);
    return results;
    var source = new defaultdict({x: 1, y: 2, notAvailable: 'Custom Not Available', '#403': '403 Forbidden'}, function(){ return 'Not Available'}, {
      forbidden: '#403'
    });
    assert.equal(source('forbidden', null, true), "Not Available"); //default factory result not masked by alias or map
  });

});

describe('defaultdict#negativeArray', function() {
  var createArray = require('../dist/lib/defaultdict/proxy').createArray;
  it('should access array using negative indexes', function () {
    var source = createArray(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    assert.equal(source(-1), 9);
    assert.equal(source(-2), 8);
  });
});