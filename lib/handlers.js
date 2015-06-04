var aesprim = require('./aesprim');
var _slice = require('./slice');
var slice = _slice.slice;
var toInteger = _slice.toInteger;
var _evaluate = require('static-eval');
var _ = require('lodash');
var _uniq = _.uniq;//require('underscore').uniq;
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
//  console.log('resolve()', 'component::', debug_inspect(component));
  var scope = component.scope.split('|')[0];
  var key = [ component.operation, scope, component.expression.type ].join('-');
  var method = this._fns[key];
  if (component.expression.type === 'active_position') component.expression.value = index? index : 0;
  var util = require('util');
//  console.log('resolve()', 'key::', key, 'component::', debug_inspect(component));
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

  'member-child-identifier': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    var results;
    var key = component.expression.value;
    var value = partial.value;
    if (value instanceof Object && key in value) {
      results = [{ value: value[key], path: partial.path.concat(key) }];
//      console.log('contextManager$parent::', debug_inspect(nodeContext.$parent));
      if (component.branch) {
//        console.log('branch$parent::', debug_inspect(results));
        var branchContext = {$branch: partial, $edge: partial, $rel: partial};
        var message = 'member-child-identifier';
        results = handleBranchWith(component, results, contextManager, branchContext, message);
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

  'subscript-child-slice': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    if (is_array(partial.value)) {
      var args = component.expression.value.split(':').map(toInteger);
//      console.log('subscript-child-slice()', 'args::', args);
      /** here, original code is mapping all potential subjects to slice to nodes, for slice() to feed on, PERFORMANCE HIT! contextManager should be passed down to slice */
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
//      console.log('slice(), args::', [values].concat(args));
      var results = [];
      var nodes = slice.apply(null, [values].concat(args));
//      console.log('context$parent::', debug_inspect(nodeContext.$parent));

      if (component.branch) {
//        console.log('branch$parent::', debug_inspect(nodes));
        var branchContext = {$branch: partial, $edge: partial, $rel: partial};
        var message = 'subscript-child-slice';
        results = handleBranchWith(component, nodes, contextManager, branchContext, message);
//        console.log('subscript-child-slice::branch-results', results);
        return results;
      }
      results = nodes;
      return results;
    }
  },

  'subscript-child-slice|active': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    if (is_array(partial.value)) {
      var args = component.expression.value;
//      console.log('subscript-child-slice|active()', 'args::', args);
      args = args.map(function(arg) {
        return _.isString(arg) ? evalActiveScript(partial, arg, contextManager) : toInteger(arg);
      });
//      console.log('evaluated-args::', args);
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      var results = [];
      var nodes = slice.apply(null, [values].concat(args));
//      console.log('context$parent::', debug_inspect(nodeContext.$parent));

      if (component.branch) {
//        console.log('branch$parent::', debug_inspect(nodes));
        var branchContext = {$branch: partial, $edge: partial, $rel: partial};
        var message = 'subscript-child-slice|active';
        results = handleBranchWith(component, nodes, contextManager, branchContext, message);
//        console.log('subscript-child-slice|active::branch-results', results);
        return results;
      }
      results = nodes;
      return results;
    }
  },

  'subscript-child-union': function(component, partial, contextManager) {
    var results = [];
    /** union members starting a branch and going through pathNodes are relative, single expressions should not call pathNodes
     *  pushes a merged copy of contextManager.options with the new object to the contextManager stack, pathNodes pops the stack after finishing with the branch
     *  union handlers are not allowed to modify $parent
     */
    var branchParent = contextManager.branch({
      $branch: partial
    }, 'subscript-child-union');
    component.expression.value.forEach(function(listable, index) {
      var _component = _.merge(listable, { operation: listable.operation? listable.operation : 'subscript', scope: listable.scope? listable.scope: 'child'});
      var handler = this.resolve(_component, index);
      /**
       * Inside a first level branch, the partial retains it's original relative path, and branch can not only access the branch-parent's value through $parent but also learn the parent's path
       * */
       var _results = handler(_component, partial, contextManager);
      results.push(_results);
    }, this);
    contextManager.switch(branchParent.origin);

    return results.mergeAll();
  },

  'subscript-descendant-union': function(component, partial, contextManager) {

    var self = this;
    var results = [];
    var branchParent = contextManager.branch({
      $branch: partial
    }, 'subscript-descendant-union');
    var nodes = traverseNodes(partial, 'subscript-descendant-union', contextManager);

    nodes.forEach(function(node) {
      component.expression.value.forEach(function(listable, index) {
        var _component = _.merge(listable, { operation: listable.operation? listable.operation : 'subscript', scope: listable.scope? listable.scope: 'descendant'});
        var handler = self.resolve(_component, index);
        var _results = handler(_component, node, contextManager);
        results.push(_results);
      });
    });
    contextManager.switch(branchParent.origin);
    return results.mergeAll();
  },

  'subscript-child-filter_expression': function(component, partial, contextManager) {
    /**
     * Active filters would accept an array of strings and match structure against the node in descend
     * Currently this effect can be achieved by using a long condition e.g. @.isbn && @.title && @.rating
     * Scripts in general are more powerful since you can apply a filter on the value of the key, e.g. @.rating > 4
     * The field list is a special case
     * */

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;
    var nodeContext = contextManager.head();
//    console.log('subscript-child-filter::context::', debug_inspect(nodeContext));
    var passable = function(key, value) {
      console.log('subscript-child-filter::eval_context::', debug_inspect({
        '@': value,
        '$key': key,
        '$leaf': value,
        '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // '$edge' : nodeContext.$branch.value, '$rel' : nodeContext.$branch.value,
        '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
        '$': nodeContext.$root.value
      }));
      var _pass = evaluate(ast, {
        '@': value,
        '$key': key,
        '$leaf': value,
        '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // '$edge' : nodeContext.$branch.value, '$rel' : nodeContext.$branch.value,
        '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
        '$': nodeContext.$root.value
      });
      return _pass;
    };

    var results = this.descend(partial, null, passable);
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
//      console.log('branch$parent::', debug_inspect(results));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'subscript-child-filter_expression';
      results = handleBranchWith(component, results, contextManager, branchContext, message);
    }
    return results;
  },

  'subscript-descendant-filter_expression': function(component, partial, contextManager) {

    // slice out the expression from ?(expression)
    var src = component.expression.value.slice(2, -1);
    var ast = aesprim.parse(src).body[0].expression;
    var nodeContext = contextManager.head();
//    console.log('subscript-descendant-filter::nodeContext::', debug_inspect(nodeContext));
    var passable = function(key, value) {
      console.log('subscript-descendant-filter::eval_context::', {
        '@': value,
        '$key': key,
        '$leaf': value,
        '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // '$edge' : nodeContext.$branch.value, '$rel' : nodeContext.$branch.value,
        '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
        '$': nodeContext.$root.value
      });
      var _pass = evaluate(ast, {
        '@': value,
        '$key': key,
        '$leaf': value,
        '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // '$edge' : nodeContext.$branch.value, '$rel' : nodeContext.$branch.value,
        '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
        '$': nodeContext.$root.value
      });
      return _pass;
    }

    var results = this.traverse(partial, null, passable);
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
//      console.log('branch$parent::', debug_inspect(results));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'subscript-descendant-filter_expression';
      results = handleBranchWith(component, results, contextManager, branchContext, message);
    }
    return results;
  },

  'subscript-child-script_expression': scriptComponentHandler('subscript', 'child'),

  'member-child-script_expression': scriptComponentHandler('member', 'child'),

  'member-descendant-script_expression': scriptComponentHandler('subscript', 'descendant'),

  'subscript-child-script_expression|active': scriptComponentHandler('subscript', 'child', 'active'),

  'member-child-script_expression|active': scriptComponentHandler('member', 'child', 'active'),

  'member-descendant-script_expression|active': scriptComponentHandler('subscript', 'descendant', 'active'),

  'subscript-child-root': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    var results = nodeContext.$root;
    var util = require('util');
//    console.log('subscript-child-root()', debug_inspect(component), debug_inspect(partial));
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
      // evaluate branch on $root
//      console.log('branch$parent::', debug_inspect(results));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'subscript-child-root';
      results = handleBranchWith(component, [ results ], contextManager, branchContext, message);
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
//    console.log('unionAST::', debug_inspect(unionAST));
    // if we are left with any expressions that can be used
    if (_components.length === 1) {
      // A single component
      var _component = _components.pop();
      _component.scope = component.scope;
      _component.operation = component.operation;
      var handler = this.resolve(_component);
      results = handler(_component, partial, contextManager);
//      console.log('single $.branch::', debug_inspect(results));
    } else if (_components.length > 1) {
      // A union of component
      // evaluate union component on partial
      unionAST.expression.value = _components;
      var handler = this.resolve(unionAST);
      results = handler(unionAST, partial, contextManager);
//      console.log('list $.branch::', debug_inspect(results));
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

  return function (component, partial, contextManager) {
    var nodeContext = contextManager.head();
    var results = eval_recurse(partial, component.expression.value, operation, scope, handler, contextManager);
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
//      console.log('branch$parent::', debug_inspect(results));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'scriptComponentHandler' + handler;
      results = handleBranchWith(component, results, contextManager, branchContext, message);
    }
    return results;
  }
}

function eval_recurse(partial, src, operation, scope, handler, contextManager) {
  var value;
  if (handler === undefined) {
    /** jspnpath script expression evaluator is the default handler */
    value = evalScript(partial, src, contextManager);
  } else if (handler === 'active') {
    value = evalActiveScript(partial, src, contextManager);
  } else {
    throw new Error('Unsupported script execution handler: ' + handler);
  }

  var path = fromValue(value, operation, scope);
//  console.log('eval_recurse()::script jsonpath::', debug_inspect(path));
  var jp = require('./index');

  var results = jp.nodes(partial.value, path, contextManager);
  results.forEach(function(r) {
    r.path = partial.path.concat(r.path.slice(1));
  });
//  console.log('eval_recurse()::results::', debug_inspect(results));
  return results;
}

function evalScript(partial, script, contextManager) {
  var nodeContext = contextManager.head();
//  console.log('evalScript::nodeContext::', debug_inspect(nodeContext));
  var src = script.slice(1, -1);
  var ast = aesprim.parse(src).body[0].expression;
  console.log('evalScript::context::', {
    '@': partial.value,
    '$leaf': partial.value,
    '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined,
    '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
    '$': nodeContext.$root.value
  });
  var value = evaluate(ast, {
    '@': partial.value,
    '$leaf': partial.value,
    '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined,
    '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
    '$': nodeContext.$root.value
  });
  return value;
}

function evalActiveScript(partial, script, contextManager) {
  var nodeContext = contextManager.head();
//  console.log('evalActiveScript::nodeContext::', debug_inspect(nodeContext));
  var src = script.slice(2, -2);
  var ast = aesprim.parse(src).body[0].expression;
  console.log('evalActiveScript::nodeContext::', debug_inspect(nodeContext));
  console.log('evalActiveScript::ctx::', {
    '@': partial.value,
    '$leaf': partial.value,
    '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // branch is always a single partial
    '$parent': nodeContext.$parent.value, '$node': nodeContext.$node.value,
    '$': nodeContext.$root.value,
    '$quoteAll': nodeContext.$quoteAll
  });
  var value = evaluate(ast, {
    '@': partial.value,
    '$leaf': partial.value,
    '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // branch is always a single partial
    '$parent': nodeContext.$parent ? nodeContext.$parent.value : undefined,
    '$node': nodeContext.$node ? nodeContext.$parent.value : undefined,
    '$': nodeContext.$root.value,
    '$quoteAll': nodeContext.$quoteAll
  });
  return value;
}

function fromValue(value, operation, scope) {
  var _templates = {
    "subscript-child": '$[{{value}}]',
    "member-child": '$.{{value}}',
    "member-descendant": '$..value'
  };
//  if (operation === 'subscript') {
//    // options.escape_script_results
//    value = _.isArray(value) ? value : [value];
//    value = value.map(function(value, index) {
//      return _.isString(value) ? (value[0] === '\\' ? '\\"' + value + '\\"': value) : value;
//    }).join(",");
//  }
  var path = _templates[operation + '-' + scope].replace(/\{\{\s*value\s*\}\}/g, value);
//  console.log('[ Excusting script ] as::', operation, scope, value, ' -> ', path);
  return path;
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
  return function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
//    console.log('_descend()', component, partial);
    var results;
    var nodes;
    nodes = this.descend(partial, component.expression.value, passable);
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
//      console.log('branch$parent::', debug_inspect(nodes));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'descend';
      results = handleBranchWith(component, nodes, contextManager, branchContext, message);
//      console.log('_descend()::branch-results', results);
      return results;
    }
    results = nodes;
    return results;
  }
}

function _traverse(passable) {
  return function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
//    console.log('_traverse()', component, partial);
    var results;
    var nodes;
    nodes = this.traverse(partial, component.expression.value, passable);
//    console.log('nodeContext$parent::', debug_inspect(nodeContext.$parent));
    if (component.branch) {
//      console.log('branch$parent::', debug_inspect(nodes));
      var branchContext = {$branch: partial, $edge: partial, $rel: partial};
      var message = 'traverse';
      results = handleBranchWith(component, nodes, contextManager, branchContext, message);
//      console.log('_traverse()::branch-results', results);
      return results;
    }
    results = nodes;
    return results;
  }
}

function evaluate() {
  try { return _evaluate.apply(this, arguments) }
  catch (e) { console.log(e); throw e; }
}

//function unique(results) {
//  return _uniq(
//    results,
//    function(r) { return r.path.map(function(c) { return String(c).replace('-', '--') }).join('-') }
//  );
//}

function traverseNodes(partial, operation, contextManager) {
  var options = contextManager.head().options;
  /** descendant operation marking experiment **/
  var jp = require('..');
  var _partial;
  var nodes;
  var rootNodeValue = partial.value;
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

function handleBranch(component, partials, contextManager) {
  var nodeContext = contextManager.head();
  var jp = require('..');
//  console.log('handleBranch()', 'component', debug_inspect(component), 'partials', debug_inspect(partials));

//  contextManager.$branch = contextManager.$branch ? contextManager.$branch : undefined; // undefined means trouble
  contextManager.commit({
    options: {relative: true, $pathRelativeToBranch: true}
  }, 'handleBranch', null, false); // commit(..., false) merges extra options with previous version of options


  // only immediate parent == @ references moves forward along the branch traversal, $node and $branch stay untouched
  var edgeResults = jp.pathNodes(partials, component.branch.path, contextManager); //relative nested path
//  console.log('handleBranch()', 'edgeResults', debug_inspect(edgeResults));
//  contextManager.pop();
  return edgeResults;
}

function handleBranchWith(component, partials, contextManager, branchContext, message) {
  var branchParent = contextManager.branch(branchContext, message, contextManager.tags[message]);
  var results = handleBranch(component, partials, contextManager);
  contextManager.switch(branchParent.origin);
  return results;
}

module.exports = Handlers;
