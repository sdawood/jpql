var aesprim = require('./aesprim');
var _slice = require('./slice');
var slice = _slice.slice;
var toInteger = _slice.toInteger;
var _evaluate = require('static-eval');
var _ = require('lodash');
var _uniq = _.uniq;//require('underscore').uniq;
var filters = require('./filters');
var RxArray = require('rx-array');
var traverse = require('traverse');

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

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
  if (component.expression.type === 'active_position') component.expression.value = index? index : 0;
  var util = require('util');
  console.log('resolve()', 'key::', key, 'component::', debug_inspect(component));
  if (!method) throw new Error("Unsupported query component: " + key);
  return method.bind(this);
};

Handlers.prototype.register = function(key, handler) {

  if (!handler instanceof Function) {
    throw new Error("handler must be a function");
  }

  this._fns[key] = handler;
};

Handlers.prototype._fns = {

  'member-child-identifier': function(component, partial, context) {
    var results;
    var key = component.expression.value;
    var value = partial.value;
    if (value instanceof Object && key in value) {
      results = [{ value: value[key], path: partial.path.concat(key) }];
      if (component.branch) {
        results = handleBranch(component, results, context);
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

  'subscript-child-slice': function(component, partial, context) {
    if (is_array(partial.value)) {
      var args = component.expression.value.split(':').map(toInteger);
      console.log('subscript-child-slice()', 'args::', args);
      /** here, original code is mapping all potential subjects to slice to nodes, for slice() to feed on, PERFORMANCE HIT! context should be passed down to slice */
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      console.log('slice(), args::', [values].concat(args));
      var results = [];
      var nodes = slice.apply(null, [values].concat(args));
      if (component.branch) {
        results = handleBranch(component, nodes, context);
        console.log('subscript-child-slice::branch-results', results);
        return results;
      }
      results = nodes;
      return results;
    }
  },

  'subscript-child-slice|active': function(component, partial, context) {
    if (is_array(partial.value)) {
      var args = component.expression.value;
      console.log('subscript-child-slice|active()', 'args::', args);
      args = args.map(function(arg) {
        return _.isString(arg) ? evalActiveScript(partial, arg, context) : toInteger(arg);
      });
      console.log('evaluated-args::', args);
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      var results = [];
      var nodes = slice.apply(null, [values].concat(args));
      if (component.branch) {
        results = handleBranch(component, nodes, context);
        console.log('subscript-child-slice|active::branch-results', results);
        return results;
      }
      results = nodes;
      return results;
    }
  },

  'subscript-child-union': function(component, partial, context) {
    var results = [];
    component.expression.value.forEach(function(listable, index) {
      var _component = _.merge(listable, { operation: listable.operation? listable.operation : 'subscript', scope: listable.scope? listable.scope: 'child'});
      var handler = this.resolve(_component, index);
      var _results = handler(_component, partial, context);
      results.push(_results);
    }, this);

    return results.mergeAll();
  },

  'subscript-descendant-union': function(component, partial, context) {

    var self = this;
    var results = [];
    var nodes = traverseNodes(partial, 'subscript-descendant-union', {applyToRoot: true, mark: false, leaf: false});

    nodes.forEach(function(node) {
      component.expression.value.forEach(function(listable, index) {
        var _component = _.merge(listable, { operation: listable.operation? listable.operation : 'subscript', scope: listable.scope? listable.scope: 'descendant'});
        var handler = self.resolve(_component, index);
        var _results = handler(_component, node, context);
        results.push(_results);
      });
    });

    return results.mergeAll();
  },

  'subscript-child-filter_expression': function(component, partial, context) {
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
      var _pass = evaluate(ast, { '@': value, '$key': key, '$': context.$root.value });
      console.log('subscript-child-filter::', _pass, key, "->", value, context.$root);
      return _pass;
    };

    var results = this.descend(partial, null, passable);
    if (component.branch) {
      results = handleBranch(component, results, context);
    }
    return results;
  },

  'subscript-descendant-filter_expression': function(component, partial, context) {

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;

    var passable = function(key, value) {
      var _pass = evaluate(ast, { '@': value, '$key': key, '$': context.$root.value });
      console.log('subscript-descendant-filter::', _pass, key, "->", value, context.$root);
      return _pass;
    }

    var results = this.traverse(partial, null, passable);
    if (component.branch) {
      results = handleBranch(component, results, context);
    }
    return results;
  },

  'subscript-child-script_expression': scriptComponentHandler('subscript', 'child'),

  'member-child-script_expression': scriptComponentHandler('member', 'child'),

  'member-descendant-script_expression': scriptComponentHandler('subscript', 'descendant'),

  'subscript-child-script_expression|active': scriptComponentHandler('subscript', 'child', 'active'),

  'member-child-script_expression|active': scriptComponentHandler('member', 'child', 'active'),

  'member-descendant-script_expression|active': scriptComponentHandler('subscript', 'descendant', 'active'),

  'subscript-child-root': function(component, partial, context) {
    var results = [ context.$root ];
    var util = require('util');
    console.log('subscript-child-root()', debug_inspect(component), debug_inspect(partial));
    // evaluate branch on $root
    if (component.branch) {
      results = handleBranch(component, results, context);
    }
    /** case results = [ ['$'], $root ] is meaningless with the current traversal implementation, but can navigate an edge connecting back to isolated sub-graphs in a graph implementation
     * Currently such case yields no results since unionAST.expression.value === [] after filtering
     */
    var unionAST = {
      expression:
      { type: 'union',
        value: undefined
      },
      scope: component.scope,
      operation: component.operation
    };
    var _components = results.filter(function(_component) {
      return (!_.isObject(_component.value)) && (!_.isArray(_component.value));
    }).map(function(_component) {
        var isLiteral = !_.isString(_component.value); // retain numeric, coerce (true, false, null, undefined) to string
        var type = isLiteral ? (_.isNumber(_component.value) ? 'numeric_literal' : 'keyword') : 'string_literal';
        return { expression: { type: type, value: isLiteral? _component.value : String(_component.value) }};
      }
    );
    console.log('unionAST::', debug_inspect(unionAST));
    // if we are left with any expressions that can be used
    if (_components.length === 1) {
      // A single component
      var _component = _components.pop();
      _component.scope = component.scope;
      _component.operation = component.operation;
      var handler = this.resolve(_component);
      results = handler(_component, partial, context);
      console.log('single $.branch::', debug_inspect(results));
    } else if (_components.length > 1) {
      // A union of component
      // evaluate union component on partial
      unionAST.expression.value = _components;
      var handler = this.resolve(unionAST);
      results = handler(unionAST, partial, context);
      console.log('list $.branch::', debug_inspect(results));
    }
    return results;
  }
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

Handlers.prototype._fns['subscript-descendant-identifier'] =
  Handlers.prototype._fns['subscript-descendant-numeric_literal'];

function scriptComponentHandler(operation, scope, handler) {
  console.log('scriptComponentHandler', operation, scope, handler);
  return function (component, partial, context) {
    var results = eval_recurse(partial, component.expression.value, operation, scope, handler, context);
    if (component.branch) {
      results = handleBranch(component, results, context);
    }
    return results;
  }
}

function eval_recurse(partial, src, operation, scope, handler, context) {
  var value;
  if (handler === undefined) {
    /** jspnpath script expression evaluator is the default handler */
    value = evalScript(partial, src, context);
  } else if (handler === 'active') {
    value = evalActiveScript(partial, src, context);
  } else {
    throw new Error('Unsupported script execution handler: ' + handler);
  }

  var path = fromValue(value, operation, scope);
  var jp = require('./index');

  var results = jp.nodes(partial.value, path, context);
  results.forEach(function(r) {
    r.path = partial.path.concat(r.path.slice(1));
  });

  return results;
}

function evalScript(partial, script, context) {
  var src = script.slice(1, -1);
  var ast = aesprim.parse(src).body[0].expression;
  var value = evaluate(ast, { '@': partial.value, '$': context.$root.value });
  return value;
}

function evalActiveScript(partial, script, context) {
  var src = script.slice(2, -2);
  var ast = aesprim.parse(src).body[0].expression;
  var value = evaluate(ast, { '@': partial.value, '$': context.$root.value });
  console.log('evalActiveScript', 'script::', script, 'partial.value::', partial.value, 'value::', value, '$root::', context.$root);
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
  return function(component, partial, context) {
    console.log('_descend()', component, partial);
    var results;
    var nodes;
    nodes = this.descend(partial, component.expression.value, passable);
    if (component.branch) {
      results = handleBranch(component, nodes, context);
      console.log('_descend()::branch-results', results);
      return results;
    }
    results = nodes;
    return results;
  }
}

function _traverse(passable) {
  return function(component, partial, context) {
    console.log('_traverse()', component, partial);
    var results;
    var nodes;
    nodes = this.traverse(partial, component.expression.value, passable);
    if (component.branch) {
      results = handleBranch(component, nodes, context);
      console.log('_traverse()::branch-results', results);
      return results;
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
  } else {
    _partial = partial.value;
  }
  nodes = traverse(_partial).reduce(function (acc, x) {
    if (!(options.leaf ^ this.leaf)) {
      acc.push(x);
    }
    return acc;
  }, []).slice(1);
  if (options.applyToRoot) nodes.unshift({ path: ['$'], value: rootNodeValue});
  return nodes;
}

function handleBranch(component, partials, context) {
  var jp = require('..');
  var util = require('util');
  console.log('handleBranch()', 'component', debug_inspect(component), 'partials', debug_inspect(partials));
  var options = {relative: true, branchPath: false};
  var edgeResults = jp.pathNodes(partials, component.branch.path, context, options); //relative nested path
  console.log('handleBranch()', 'edgeResults', debug_inspect(edgeResults));
  return edgeResults;
}

module.exports = Handlers;
