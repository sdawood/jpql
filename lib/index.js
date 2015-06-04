var assert = require('assert');
var dict = require('./dict');
var Parser = require('jsonpathql-parser');
var Handlers = require('./handlers');
var _ = require('lodash');
var ContextManager = require('./context').ContextManager;

var JSONPath = function() {
  this.initialize.apply(this, arguments);
};

JSONPath.prototype.initialize = function() {
  this.parser = new Parser();
  this.handlers = new Handlers();
  this.ContextManager = ContextManager; // new instance of ContextManager is created with every call to nodes(). Reference is passed around and never stored for optimum memory usage
};

JSONPath.prototype.parse = function(string) {
  assert.ok(string, "we need a path");
  return this.parser.parse(string);
};

JSONPath.prototype._getNode = function(obj, path) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(Array.isArray(path), "we need a path array");

  return this.query(obj, this.stringify(path)).shift();
}

JSONPath.prototype.parent = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var node = this.nodes(obj, string)[0];
  var key = node.path.pop(); /* jshint unused:false */
  return this._getNode(obj, node.path);
}

JSONPath.prototype.apply = function(obj, string, fn) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");
  assert.equal(typeof fn, "function", "fn needs to be function")

  var nodes = this.nodes(obj, string);

  nodes.forEach(function(node) {
    var key = node.path.pop();
    var parent = this.value(obj, this.stringify(node.path));
    var val = node.value = fn.call(obj, parent[key]);
    parent[key] = val;
  }, this);

  return nodes;
}

JSONPath.prototype.value = function(obj, string, value) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  if (arguments.length >= 3) {
    var path = this.parser.parse(string);
    path = path.map(function(component) { return component.expression.value; });
    var self = this;
    var setValue = function(path, value) {
      var key = path.pop();
      var node = self._getNode(obj, path);
      if (!node) {
        setValue(path.concat(), typeof key === 'string' ? {} : []);
        node = self._getNode(obj, path);
      }
      node[key] = value;
    }
    setValue(path, value);
  }

  return this.query(obj, string)[0];
}

JSONPath.prototype.query = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var results = this.nodes(obj, string)
    .map(function(r) { return r.value });

  return results;
};

JSONPath.prototype.paths = function(obj, string) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");

  var results = this.nodes(obj, string)
    .map(function(r) { return r.path });

  return results;
};

JSONPath.prototype.nodes = function(obj, string, contextManager) {

  assert.ok(obj instanceof Object, "obj needs to be an object");
  assert.ok(string, "we need a path");
  var path = this.parser.parse(string);
  var partials = [ { path: ['$'], value: obj } ];
  var $root;
  if (path.length && path[0].expression.type == 'root') path.shift();
  if (!path.length) return partials;
  if(contextManager === undefined ) {
    $root = { path: ['$'], value: obj };
    contextManager = new this.ContextManager();
    var rootNode = contextManager.node({$root: $root, $stem: $root, $parent: $root, $node: $root, $path: $root.path}, 'root');
  }
  var results = this.pathNodes(partials, path, contextManager);
  return results;
};

JSONPath.prototype.pathNodes = function(partials, path, contextManager) {
  var nodeContext = contextManager.head();
  nodeContext = contextManager.commit({options: {applyToRoot: true, mark: false, leaf: false}}, 'pathNodes');
  var options = nodeContext.options;
  var handlers = this.handlers;
  var partialMatches = partials; //.slice() to get a fresh copy?
  var matches = [];

  if (!path.length) return partials;

  path.forEach(function(component, index) {

    var handler = handlers.resolve(component);
    var _partials = [];

    partialMatches.forEach(function(p, partialsIndex) {
      var results = [];
//      console.log('pathNodes()', 'index', index, 'of', path.length);
      if (options.relative) {
        // caller code has already captured context.$branch before calling handleBranch

        results = handler(component, { path: ['$'], value: p.value }, contextManager);
        if(! results) throw Error('null results');
        results = results.map(function(result) {
          if (options.$pathRelativeToBranch) {
            contextManager.commit({$pathRelativeToBranch: result.path}, '$pathRelativeToBranch['+partialsIndex+']');
          }

          var $path = p.path.concat(result.path.slice(1));
          if (options.$path) {
            contextManager.commit({$path: $path}, '$path['+index+']');
          }
          result.path = $path;
          return result;
        });
      } else {
        // conditionally slide context.$node, move for steps, and anchor before traversing or descending
//        contextManager.node({$node: p}, '$node++['+partialsIndex+']' + p.path);
        contextManager.transition(component, p, '['+partialsIndex+']');
        results = handler(component, p, contextManager);
      }
      if (index == path.length - 1) {
        // if we're through the components we're done
        matches = matches.concat(results || []);
      } else {
        // otherwise accumulate and carry on through
        _partials = _partials.concat(results || []);
      }
      // always move the context.$parent, after an expansion, parent can be an array of nodes > 1
      contextManager.commit({$parent: results}, '$parent++['+partialsIndex+']' + results.map(function(result){return result.path}).join(' | '));
    });

    partialMatches = _partials;

  });

  return matches;
};

JSONPath.prototype.stringify = function(path) {

  assert.ok(path, "we need a path");

  var string = '$';

  var templates = {
    'descendant-member': '..{{value}}',
    'child-member': '.{{value}}',
    'descendant-subscript': '..[{{value}}]',
    'child-subscript': '[{{value}}]'
  };

  path = this._normalize(path);

  path.forEach(function(component) {

    if (component.expression.type == 'root') return;

    var key = [component.scope, component.operation].join('-');
    var template = templates[key];
    var value;

    if (component.expression.type == 'string_literal') {
      value = JSON.stringify(component.expression.value)
    } else {
      value = component.expression.value;
    }

    if (!template) throw new Error("couldn't find template " + key);

    string += template.replace(/{{value}}/, value);
  });

  return string;
}

JSONPath.prototype.inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

JSONPath.prototype._normalize = function(path) {

  assert.ok(path, "we need a path");

  if (typeof path == "string") {

    return this.parser.parse(path);

  } else if (Array.isArray(path) && typeof path[0] == "string") {

    var _path = [ { expression: { type: "root", value: "$" } } ];

    path.forEach(function(component, index) {

      if (component == '$' && index === 0) return;

      if (typeof component == "string" && component.match("^" + dict.identifier + "$")) {

        _path.push({
          operation: 'member',
          scope: 'child',
          expression: { value: component, type: 'identifier' }
        });

      } else {

        var type = typeof component == "number" ?
          'numeric_literal' : 'string_literal';

        _path.push({
          operation: 'subscript',
          scope: 'child',
          expression: { value: component, type: type }
        });
      }
    });

    return _path;

  } else if (Array.isArray(path) && typeof path[0] == "object") {

    return path
  }

  throw new Error("couldn't understand path " + path);
}

JSONPath.Handlers = Handlers;
JSONPath.Parser = Parser;

var instance = new JSONPath;
instance.JSONPath = JSONPath;

module.exports = instance;
