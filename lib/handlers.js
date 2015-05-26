var aesprim = require('./aesprim');
var slice = require('./slice');
var _evaluate = require('static-eval');
var _ = require('lodash');
var _uniq = _.uniq;//require('underscore').uniq;
var Handlers = function() {
  return this.initialize.apply(this, arguments);
}

Handlers.prototype.initialize = function() {
  this.traverse = traverser(true);
  this.descend = traverser();
}

Handlers.prototype.keys = Object.keys;

Handlers.prototype.resolve = function(component, index) {
  var scope = component.scope.split('|')[0];
  var key = [ component.operation, scope, component.expression.type ].join('-');
  var method = this._fns[key];
  if (component.expression.type === 'active_position') component.expression.value = index;
  if (!method) throw new Error("couldn't resolve key: " + key);
  return method.bind(this);
};

Handlers.prototype.register = function(key, handler) {

  if (!handler instanceof Function) {
    throw new Error("handler must be a function");
  }

  this._fns[key] = handler;
};

Handlers.prototype._fns = {

  'member-child-identifier': function(component, partial) {
    var results;
    var key = component.expression.value;
    var value = partial.value;
    if (value instanceof Object && key in value) {
      results = [ { value: value[key], path: partial.path.concat(key) } ]
      return results;
    }
    return [];
  },

  'member-descendant-identifier':
    _traverse(function(key, value, ref) { return key == ref }),

  'subscript-child-numeric_literal':
    _descend(function(key, value, ref) { return key === ref }),

  'subscript-child-active_position':
    _descend(function(key, value, ref) { return key === ref }),

  'subscript-descendant-numeric_literal':
    _traverse(function(key, value, ref) { return key === ref }),

  'member-child-wildcard':
    _descend(function() { return true }),

  'member-descendant-wildcard':
    _traverse(function() { return true }),

  'subscript-descendant-wildcard':
    _traverse(function() { return true }),

  'subscript-child-wildcard':
    _descend(function() { return true }),

  'subscript-child-slice': function(component, partial) {
    if (is_array(partial.value)) {
      var args = component.expression.value.split(':');
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      return slice.apply(null, [values].concat(args));
    }
  },

  'subscript-child-union': function(component, partial) {
    var results = [];
    component.expression.value.forEach(function(listable, index) {
      var _component = { operation: 'subscript', scope: 'child', expression: listable.expression };
      var handler = this.resolve(_component, index);
      var _results = handler(_component, partial, index);
      if (listable.branch) {
        _results = handleBranch(listable, _results);
      }
      results = results.concat(_results);
    }, this);

    return unique(results);
  },

  'subscript-descendant-union': function(component, partial) {

    var self = this;

    var results = [];
//    var nodes = jp.nodes({ path: ['$'], value: partial }, '$..*').slice(1);
    var nodes = traverseNodes(partial, 'subscript-descendant-union', {applyToRoot: true, mark: false});

    nodes.forEach(function(node) {
      component.expression.value.forEach(function(component) {
        var _component = { operation: 'subscript', scope: 'child', expression: component.expression };
        var handler = self.resolve(_component);
        var _results = handler(_component, node);
        results = results.concat(_results);
      });
    });

    return unique(results);
  },

  'subscript-child-filter_expression': function(component, partial) {
    /**
     * Active filters would accept an array of strings and match structure against the node in descend
     * Currently this effect can be achieved by using a long condition e.g. @.isbn && @.title && @.rating
     * Scripts in general are more powerful since you can apply a filter on the value of the key, e.g. @.rating > 4
     * The field list is a special case
     * */

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;

    var passable = function(key, value) {
      return evaluate(ast, { '@': value });
    };

    return this.descend(partial, null, passable);

  },

  'subscript-descendant-filter_expression': function(component, partial) {

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;

    var passable = function(key, value) {
      return evaluate(ast, { '@': value });
    }

    return this.traverse(partial, null, passable);
  },

  'subscript-child-script_expression': function(component, partial) {
    var exp = component.expression.value.slice(1, -1);
    return eval_recurse(partial, exp, '$[{{value}}]');
  },

  'member-child-script_expression': function(component, partial) {
    var exp = component.expression.value.slice(1, -1);
    return eval_recurse(partial, exp, '$.{{value}}');
  },

  'member-descendant-script_expression': function(component, partial) {
    var exp = component.expression.value.slice(1, -1);
    return eval_recurse(partial, exp, '$..value');
  }
};

Handlers.prototype._fns['subscript-child-string_literal'] =
Handlers.prototype._fns['subscript-child-identifier'] =
	Handlers.prototype._fns['member-child-identifier'];

Handlers.prototype._fns['member-child-numeric_literal'] =
	Handlers.prototype._fns['subscript-child-numeric_literal'];

Handlers.prototype._fns['member-descendant-numeric_literal'] =
	Handlers.prototype._fns['member-descendant-identifier'];

function eval_recurse(partial, src, template) {

  var jp = require('./index');
  var ast = aesprim.parse(src).body[0].expression;
  var value = evaluate(ast, { '@': partial.value });
  var path = template.replace(/\{\{\s*value\s*\}\}/g, value);

  var results = jp.nodes(partial.value, path);
  results.forEach(function(r) {
    r.path = partial.path.concat(r.path.slice(1));
  });

  return results;
}

function is_array(val) {
  return Array.isArray(val);
}

function is_object(val) {
  // is this a non-array, non-null object?
  return val && !(val instanceof Array) && val instanceof Object;
}

function traverser(recurse) {

  return function(partial, ref, passable) {

    var value = partial.value;
    var path = partial.path;

    var results = [];

    var descend = function(value, path) {

      if (is_array(value)) {
        value.forEach(function(element, index) {
          if (passable(index, element, ref)) {
            results.push({ path: path.concat(index), value: element });
          }
        });
        value.forEach(function(element, index) {
          if (recurse) {
            descend(element, path.concat(index));
          }
        });
      } else if (is_object(value)) {
        this.keys(value).forEach(function(k) {
          if (passable(k, value[k], ref)) {
            results.push({ path: path.concat(k), value: value[k] });
          }
        })
        this.keys(value).forEach(function(k) {
          if (recurse) {
            descend(value[k], path.concat(k));
          }
        });
      }
    }.bind(this);
    descend(value, path);
    return results;
  }
}

function _descend(passable) {
  return function(component, partial) {
    return this.descend(partial, component.expression.value, passable);
  }
}

function _traverse(passable) {
  return function(component, partial) {
    var results = this.traverse(partial, component.expression.value, passable);
    if (component.branch) {
      results = handleBranch(component, results);
    }
    return results;
  }
}

function evaluate() {
  try { return _evaluate.apply(this, arguments) }
  catch (e) { }
}

function unique(results) {
  return _uniq(
    results,
    function(r) { return r.path.map(function(c) { return String(c).replace('-', '--') }).join('-') }
  );
}

function traverseNodes(partial, operation, options) {
  /** descendant operation marking experiment **/
  var jp = require('..');
  var _partial;
  var nodes;
  var rootNodeValue = partial.value;
  options.relative = true; //patNodes(options)
  if (options.mark) {
    partial['__' + operation.replace(/-/g, '_') + '__'] = partial.value;
    delete partial.value;
    delete partial.path;
    _partial = partial;
    nodes = jp.nodes(_partial, '..*', options).slice(1);
    if (options.applyToRoot) nodes.unshift({ path: ['$'], value: rootNodeValue});
  } else {
    _partial = partial.value;
    nodes = jp.nodes(_partial, '..*', options).slice(1);
    if (options.applyToRoot) nodes.unshift({ path: ['$'], value: rootNodeValue});
  }
  return nodes;
}

function handleBranch(component, partial) {
  var jp = require('..');
  return jp.pathNodes(partial, component.branch.path, {relative: true, branchPath: false}); //relative nested path
}

module.exports = Handlers;
