var aesprim = require('./aesprim');
var _slice = require('./slice');
var slice = _slice.slice;
var toInteger = _slice.toInteger;
var _evaluate = require('static-eval');
var _ = require('lodash');
var _uniq = _.uniq;//require('underscore').uniq;
var filters = require('./filters');
var RxArray = require('rx-array')
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
  var util = require('util');
  console.log('resolve()', 'key', key, 'component', util.inspect(component, false, null));
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
      results = [{ value: value[key], path: partial.path.concat(key) }];
      if (component.branch) {
        results = handleBranch(component, results);
      }
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
      var args = component.expression.value.split(':').map(toInteger);
      console.log('subscript-child-slice()', 'args::', args);
      /** here, original code is mapping all potential subjects to slice to nodes, for slice() to feed on, PERFORMANCE HIT! context should be passed down to slice */
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      console.log('slice(), args::', [values].concat(args));
      var results = slice.apply(null, [values].concat(args));
      return results;
    }
  },

  'subscript-child-slice|active': function(component, partial) {
    if (is_array(partial.value)) {
      var args = component.expression.value;
      console.log('subscript-child-slice|active()', 'args::', args);
      args = args.map(function(arg) {
        return _.isString(arg) ? evalActiveScript(partial, arg) : toInteger(arg);
      });
      console.log('evaluated-args::', args);
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      var results = slice.apply(null, [values].concat(args));
      return results;
    }
  },

  'subscript-child-union': function(component, partial, parent) {
    var results = [];
    component.expression.value.forEach(function(listable, index) {
      var _component = { operation: 'subscript', scope: 'child', expression: listable.expression };
      var handler = this.resolve(_component, index);
      var _results = handler(_component, partial, index);
      if (listable.branch) {
        _results = handleBranch(listable, _results);
      }
      results.push(_results);
    }, this);

//    return unique(results);
    return results.mergeAll();
  },

  'subscript-descendant-union': function(component, partial) {

    var self = this;

    var results = [];
//    var nodes = jp.nodes({ path: ['$'], value: partial }, '$..*').slice(1);
    var nodes = traverseNodes(partial, 'subscript-descendant-union', {applyToRoot: true, mark: false});

    nodes.forEach(function(node) {
      component.expression.value.forEach(function(listable, index) {
        var _component = { operation: 'subscript', scope: 'child', expression: listable.expression };
        var handler = self.resolve(_component);
        var _results = handler(_component, node, index);
        if (listable.branch) {
          _results = handleBranch(listable, _results);
        }
        results.push(_results);
      });
    });

//    return unique(results);
    return results.mergeAll();
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

    var results = this.descend(partial, null, passable);
    if (component.branch) {
      results = handleBranch(component, results);
    }
    return results;
  },

  'subscript-descendant-filter_expression': function(component, partial) {

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;

    var passable = function(key, value) {
      return evaluate(ast, { '@': value });
    }

    var results = this.traverse(partial, null, passable);
    if (component.branch) {
      results = handleBranch(component, results);
    }
    return results;
  },

  'subscript-child-script_expression': scriptComponentHandler('subscript', 'child'),

  'member-child-script_expression': scriptComponentHandler('member', 'child'),

  'member-descendant-script_expression': scriptComponentHandler('subscript', 'descendant'),

  'subscript-child-script_expression|active': scriptComponentHandler('subscript', 'child', 'active'),

  'member-child-script_expression|active': scriptComponentHandler('member', 'child', 'active'),

  'member-descendant-script_expression|active': scriptComponentHandler('subscript', 'descendant', 'active')
};

Handlers.prototype._fns['subscript-child-string_literal'] =
Handlers.prototype._fns['subscript-child-keyword'] =
Handlers.prototype._fns['subscript-child-identifier'] =
	Handlers.prototype._fns['member-child-identifier'];

Handlers.prototype._fns['member-child-numeric_literal'] =
Handlers.prototype._fns['member-child-keyword'] =
	Handlers.prototype._fns['subscript-child-numeric_literal'];

Handlers.prototype._fns['member-descendant-numeric_literal'] =
Handlers.prototype._fns['member-descendant-keyword'] =
	Handlers.prototype._fns['member-descendant-identifier'];

function scriptComponentHandler(operation, scope, handler) {
  console.log('scriptComponentHandler', operation, scope, handler);
  return function (component, partial) {
    var results = eval_recurse(partial, component.expression.value, operation, scope, handler);
    if (component.branch) {
      results = handleBranch(component, results);
    }
    return results;
  }
}

function eval_recurse(partial, src, operation, scope, handler) {
  var value;
  if (handler === undefined) {
    /** jspnpath script expression evaluator is the default handler */
    value = evalScript(partial, src);
  } else if (handler === 'active') {
    value = evalActiveScript(partial, src);
  } else {
    throw new Error('Unsupported script execution handler: ' + handler);
  }

  var path = fromValue(value, operation, scope);
  var jp = require('./index');

  var results = jp.nodes(partial.value, path);
  results.forEach(function(r) {
    r.path = partial.path.concat(r.path.slice(1));
  });

  return results;
}

function evalScript(partial, script) {
  var src = script.slice(1, -1);
  var ast = aesprim.parse(src).body[0].expression;
  var value = evaluate(ast, { '@': partial.value });
  return value;
}

function evalActiveScript(partial, script) {
  var src = script.slice(2, -2);
  var ast = aesprim.parse(src).body[0].expression;
  var value = evaluate(ast, { '@': partial.value });
  return value;
}

function fromValue(value, operation, scope) {
  var _templates = {
    "subscript-child": '$[{{value}}]',
    "member-child": '$.{{value}}',
    "member-descendant": '$..value'
  };
  console.log('[ Excusting script ] as::', operation, scope);
  return _templates[operation + '-' + scope].replace(/\{\{\s*value\s*\}\}/g, value);
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
    console.log('_descend()', component, partial);
    var results;
    var nodes;
    nodes = this.descend(partial, component.expression.value, passable);
    if (component.branch) {
      results = nodes.map(function (node) {
        var edgeResults = [];
        edgeResults = handleBranch(component, node);
        return edgeResults;
      });
      console.log('_descend()::branch-results', results);
      return results.mergeAll();
    }
    results = nodes;
    return results;
  }
}

function _traverse(passable) {
  return function(component, partial) {
    console.log('_traverse()', component, partial);
    var results;
    var nodes;
    nodes = this.traverse(partial, component.expression.value, passable);
    if (component.branch) {
      results = nodes.map(function (node) {
        var edgeResults = [];
        edgeResults = handleBranch(component, node);
        return edgeResults;
      });
      console.log('_traverse()::branch-results', results);
      return results.mergeAll();
    }
    results = nodes;
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
  var util = require('util');
  console.log('handleBranch()', 'component', util.inspect(component, false, null), 'partial', util.inspect(partial, false, null));
  return jp.pathNodes(partial, component.branch.path, {relative: true, branchPath: false}); //relative nested path
}

module.exports = Handlers;
