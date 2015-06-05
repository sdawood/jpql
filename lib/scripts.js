var _ = require('lodash');
var aesprim = require('./aesprim');
var _evaluate = require('static-eval');

var _value = function(node, index) { return node.value };
var oneOrMany = function(array) { return array.length == 1 ? array.slice().pop() : array.slice() };
var values = function(partial) { return _.isArray(partial) ? oneOrMany(partial.map(_value)) : partial };

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

function scriptExecutionContext(node, nodeContext, key) {
  return {
    '@': node.value,
    '$leaf': node.value,
    '$parent': nodeContext.$parent ? values(nodeContext.$parent) : undefined,
    '$branch': nodeContext.$branch ? values(nodeContext.$branch) : undefined,
    '$node': nodeContext.$node ? values(nodeContext.$node) : undefined,
    '$parent$': nodeContext.parent$ ? values(nodeContext.parent$) : undefined,
    '$node$': nodeContext.node$ ? values(nodeContext.node$) : undefined,
    '$': nodeContext.$root ? values(nodeContext.$root) : undefined,
    '$quoteAll': nodeContext.$quoteAll
  }
}

function filterExecutionContext(key, value, nodeContext) {
  return {
    '@': value,
    '$key': key,
    '$leaf': value,
    '$parent': nodeContext.$parent ? values(nodeContext.$parent) : undefined,
    '$branch' : nodeContext.$branch ? nodeContext.$branch.value : undefined, // $branch is a single partial
    '$node': nodeContext.$node ? values(nodeContext.$node) : undefined,
    '$parent$': nodeContext.parent$ ? values(nodeContext.parent$) : undefined,
    '$node$': nodeContext.node$ ? values(nodeContext.node$) : undefined,
    '$': nodeContext.$root ? values(nodeContext.$root) : undefined,
    '$quoteAll': nodeContext.$quoteAll
  }
}

function evalScript(partial, script, contextManager) {
  var nodeContext = contextManager.head();

  var src = script.slice(1, -1);
  var ast = aesprim.parse(src).body[0].expression;
  var executionContext = scriptExecutionContext(partial, nodeContext);
  var value = evaluate(ast, executionContext);
  return value;
}

function evalActiveScript(partial, script, contextManager) {
  /*Eval scripts would be executed with less constraints in the future, where function definitions and variable declarations would be allowed, or plugins would be available */
  var nodeContext = contextManager.head();
  var src = script.slice(2, -2);
  var ast = aesprim.parse(src).body[0].expression;
  var executionContext = scriptExecutionContext(partial, nodeContext);
  return evaluate(ast, executionContext);
}

function makeFilter(filter, nodeContext) {
  // slice out the expression from ?(expression)
  var src = filter.slice(2, -1);
  var ast = aesprim.parse(src).body[0].expression;
  return function(key, value) {
    var executionContext = filterExecutionContext(key, value, nodeContext);
    return evaluate(ast, executionContext);
  };
}

function evaluate() {
  try { return _evaluate.apply(this, arguments) }
  catch (e) { console.log(e);}
}

module.exports = {
  evalScript: evalScript,
  evalActiveScript: evalActiveScript,
  makeFilter: makeFilter
}