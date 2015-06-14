var _slice = require('./slice');
var slice = _slice.slice;
var toInteger = _slice.toInteger;
var _ = require('lodash');
require('rx-array');
var scripts = require('./scripts');

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
  if (component.expression.type === 'active_position') component.expression.value = index ? index : 0;
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

      if (component.branch) {

        var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
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
    if (_.isArray(partial.value)) {
      var args = component.expression.value.split(':').map(toInteger);

      /** here, original code is mapping all potential subjects to slice to nodes, for slice() to feed on, PERFORMANCE HIT! contextManager should be passed down to slice */
      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });

      var results = [];
      var nodes = slice.apply(null, [values].concat(args));

      if (component.branch) {

        var branchContext = {$branch: partial, $edge: partial, $rel: partial};
        var message = 'subscript-child-slice';
        results = handleBranchWith(component, nodes, contextManager, branchContext, message);

        return results;
      }
      results = nodes;
      return results;
    }
  },

  'subscript-child-slice|active': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    if (_.isArray(partial.value)) {
      var args = component.expression.value;

      args = args.map(function(arg) {
        return _.isString(arg) ? scripts.evalActiveScript(partial, arg, contextManager) : toInteger(arg);
      });

      var values = partial.value.map(function(v, i) { return { value: v, path: partial.path.concat(i) } });
      var results = [];
      var nodes = slice.apply(null, [values].concat(args));

      if (component.branch) {

        var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
        var message = 'subscript-child-slice|active';
        results = handleBranchWith(component, nodes, contextManager, branchContext, message);

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
      $branch: partial,
      options: {relative: true, $pathRelativeToBranch: true}
    }, 'subscript-child-union');
    component.expression.value.forEach(function(listable, index) {
      var _component = _.merge(listable, { operation: listable.operation ? listable.operation : 'subscript', scope: listable.scope ? listable.scope : 'child'});
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
    contextManager.commit({options: {relative: true, $pathRelativeToBranch: true}}, 'subscript-descendant-union', null, null, false); // merge options
//    var nodes = jp.nodes(partial.value, '..*', contextManager);
    var nodes = _.isArray(partial) ? partial : [ partial ];

    // why would descendant union do any thing exceptional to simply mergeAll descendant results ?
    nodes.forEach(function(node) {
      component.expression.value.forEach(function(listable, index) {
        var _component = _.merge(listable, { operation: listable.operation ? listable.operation : 'subscript', scope: listable.scope ? listable.scope : 'descendant'});
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
     * Active filters would accept an array of parent keys and match structure against the node in descend step
     * Currently this effect can be achieved by using a long condition e.g. @.isbn && @.title && @.rating
     * Scripts in general are more powerful since you can apply a filter on the value of the key, e.g. @.rating > 4
     * The field list is a special case
     * */

    // slice out the expression from ?(expression)

    var nodeContext = contextManager.head();
    var passable = scripts.makeFilter(component.expression.value, nodeContext);

    var results = this.descend(partial, null, passable);

    if (component.branch) {

      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
      var message = 'subscript-child-filter_expression';
      results = handleBranchWith(component, results, contextManager, branchContext, message);
    }
    return results;
  },

  'subscript-descendant-filter_expression': function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    var passable = scripts.makeFilter(component.expression.value, nodeContext);
    var results = this.traverse(partial, null, passable);

    if (component.branch) {
      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
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
    var $root = nodeContext.$root;
    var results;

    if (component.branch) {
      // evaluate branch on $root
      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
      var message = 'subscript-child-root';
      results = handleBranchWith(component, $root, contextManager, branchContext, message);

    } else {
      results = nodeContext.$root; // node{path,value}
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

  return function(component, partial, contextManager) {
    var nodeContext = contextManager.head();
    var results = eval_recurse(partial, component, operation, scope, handler, contextManager);

    if (component.branch) {

      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
      var message = 'scriptComponentHandler' + handler;
      results = handleBranchWith(component, results, contextManager, branchContext, message);
    }
    return results;
  }
}

function eval_recurse(partial, component, operation, scope, handler, contextManager) {
  var active,
    key,
    $tag,
    $$tag,
    results;
  if (handler === undefined) {
    /** jspnpath script expression evaluator is the default handler for simple secure script expressions*/
    key = scripts.evalScript(partial, component, contextManager);
  } else if (handler === 'active') {
    active = component.expression.active;
    key = scripts.evalActiveScript(partial, component, contextManager);
    console.log('key::', key);
    /* poorman's implementation of bootstrap provider scripts, badly needed to build the require provide feature */
    if(active.provider) { //event value_ready from script handler
      results = [ { path: partial.path, value: key } ];// script has already produced nodes, must have been a mapper
    } else {
      var jp = require('./index');

      var path = fromValue(key, operation, scope);
      console.log('eval_recurse::effective-path::', path);
      results = jp.nodes(partial.value, path, contextManager);
      results.forEach(function(r) {
        r.path = partial.path.concat(r.path.slice(1));
      });
    }
  } else {
    throw new Error('Unsupported script execution handler: ' + handler);
  }

  if (active.map.tag) { // too deep, but we do it so that you won't have to! we trust the AST too.
    $tag = active.map.label;
    $$tag = contextManager.tag(partial.path.join('.'), component, active.map.tag, $tag, results);
    console.log('$$tag', JSON.stringify($$tag));
  }

  return results;
}

function fromValue(value, operation, scope) {
  var _templates = {
    "subscript-child": '$[{{value}}]',
    "member-child": '$.{{value}}',
    "member-descendant": '$..value'
  };
  var path = _templates[operation + '-' + scope].replace(/\{\{\s*value\s*\}\}/g, value);
  return path;
}

function traverser(recurse) {

  return function(partial, ref, passable) {

    var value = partial.value;
    var path = partial.path;

    var results = [];

    var descend = function(value, path) {

      if (_.isArray(value)) {
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
      } else if (_.isObject(value)) {
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

    var results;
    var nodes;
    nodes = this.descend(partial, component.expression.value, passable);

    if (component.branch) {

      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
      var message = 'descend';
      results = handleBranchWith(component, nodes, contextManager, branchContext, message);

      return results;
    }
    results = nodes;
    return results;
  }
}

function _traverse(passable) {
  return function(component, partial, contextManager) {
    var nodeContext = contextManager.head();

    var results;
    var nodes;
    nodes = this.traverse(partial, component.expression.value, passable);

    if (component.branch) {

      var branchContext = {$branch: partial, $edge: partial, $rel: partial, parent$: nodeContext.$parent, node$: nodeContext.$node};
      var message = 'traverse';
      results = handleBranchWith(component, nodes, contextManager, branchContext, message);

      return results;
    }
    results = nodes;
    return results;
  }
}

function handleBranch(component, partials, contextManager) {
  var jp = require('..');

  contextManager.commit({
    options: {relative: true, $pathRelativeToBranch: true}
  }, 'handleBranch', null, null, false); // commit(..., false) merges extra options with previous version of options

  // only immediate parent == @ references moves forward along the branch traversal, $node and $branch stay untouched
  var edgeResults = jp.pathNodes(partials, component.branch.path, contextManager); //relative nested path
  return edgeResults;
}

function handleBranchWith(component, partials, contextManager, branchContext, message) {
  var branchParent = contextManager.branch(branchContext, message, contextManager.types[message]);
  var results = handleBranch(component, partials, contextManager);
  contextManager.switch(branchParent.origin);
  return results;
}
//
//function splat(component, partial, results, contextManager) {
//  /**
//   * BETA: Splat results within subscript expression ***
//   * case results = [ ['$'], $root ] is meaningless with the current traversal implementation, but can navigate an edge connecting back to isolated sub-graphs in a graph implementation
//   * Currently such case yields no results since unionAST.expression.value === [] after filtering
//   */
//  var unionAST = {
//    expression:
//    { type: 'union',
//      value: undefined
//    },
//    scope: component.scope,
//    operation: component.operation
//  };
//  var _components = results.filter(function(_component) {
//    return (!_.isObject(_component.value)) && (!_.isArray(_component.value));
//  }).map(function(_component) {
//      var isLiteral = !_.isString(_component.value); // retain numeric, coerce (true, false, null, undefined) to string
//      var type = isLiteral ? (_.isNumber(_component.value) ? 'numeric_literal' : 'keyword') : 'string_literal';
//      return { expression: { type: type, value: isLiteral ? _component.value : String(_component.value) }};
//    }
//  );
//  var handler;
//  // if we are left with any expressions that can be used
//  if (_components.length === 1) {
//    // A single component
//    var _component = _components.pop();
//    _component.scope = component.scope;
//    _component.operation = component.operation;
//    handler = this.resolve(_component);
//    results = handler(_component, partial, contextManager);
//
//  } else if (_components.length > 1) {
//    // A union of component
//    // evaluate union component on partial
//    unionAST.expression.value = _components;
//    handler = this.resolve(unionAST);
//    results = handler(unionAST, partial, contextManager);
//  }
//}

module.exports = Handlers;
