var _ = require('lodash');
var aesprim = require('./aesprim');
var _evaluate = require('static-eval');

var _value = function(node) { return node.value };
var oneOrMany = function(array) { return array.length == 1 ? array.slice().pop() : array.slice() };
var values = function(partial) { return _.isArray(partial) ? oneOrMany(partial.map(_value)) : partial };

function scriptExecutionContext(node, nodeContext) {
  return {
    '@': node.value,
    $leaf: node.value,
    $parent: nodeContext.$parent ? values(nodeContext.$parent) : undefined,
    $branch: nodeContext.$branch ? values(nodeContext.$branch) : undefined,
    $node: nodeContext.$node ? values(nodeContext.$node) : undefined,
    $parent$: nodeContext.parent$ ? values(nodeContext.parent$) : undefined,
    $node$: nodeContext.node$ ? values(nodeContext.node$) : undefined,
    $: nodeContext.$root ? values(nodeContext.$root) : undefined,
    $quoteAll: nodeContext.$quoteAll
  }
}

function filterExecutionContext(key, value, nodeContext) {
  return {
    '@': value,
    $key: key,
    $leaf: value,
    $parent: nodeContext.$parent ? values(nodeContext.$parent) : undefined,
    $branch: nodeContext.$branch ? nodeContext.$branch.value : undefined, // $branch is a single partial
    $node: nodeContext.$node ? values(nodeContext.$node) : undefined,
    $parent$: nodeContext.parent$ ? values(nodeContext.parent$) : undefined,
    $node$: nodeContext.node$ ? values(nodeContext.node$) : undefined,
    $: nodeContext.$root ? values(nodeContext.$root) : undefined,
    $quoteAll: nodeContext.$quoteAll
  }
}

function evalScript(partial, component, contextManager) {
  var nodeContext = contextManager.head();
  var src = component.expression.value.slice(1, -1);
  var ast = aesprim.parse(src).body[0].expression;
  var executionContext = scriptExecutionContext(partial, nodeContext);
  var value = evaluate(ast, executionContext);
  return value;
}
function evalActiveScript(partial, component, contextManager) {
  /*Eval scripts would be executed with less constraints in the future, where function definitions and variable declarations would be allowed, or plugins would be available */
  var jp = require('../index');
  var results;
  console.log('ctx', contextManager);
  var nodeContext = contextManager.head();
  //@todo: poor-man's key provider script, use stucture matching (+ schema) future feature
  console.log('key::provider::component', jp.inspect(component));
  var executionContext = scriptExecutionContext(partial, nodeContext);
  var map = component.expression.active.map,
    reduce = component.expression.active.reduce;
  console.log(unescapeTagScript(map.script));
  var value = evaluate(unescapeTagScript(map.script), executionContext);

  if(map.provider) { // && component.expression.active.reduce == {}
    results = reduce.provider? evaluate(unescapeTagScript(reduce.script), executionContext) : value;
    console.log('key::provider::results', results);
    return results;
  }
  function unescapeTagScript(script) {
    var src = script.slice(1, -1);
    var ast = aesprim.parse(src);//.body[0].expression;
    return ast.body[0].expression;
  }
}
//function evalActiveScript(partial, component, contextManager) {
//  /*Eval scripts would be executed with less constraints in the future, where function definitions and variable declarations would be allowed, or plugins would be available */
//  var results;
//  var nodeContext = contextManager.head();
//  //@todo: poor-man's key provider script, use stucture matching (+ schema) future feature
//  var executionContext = scriptExecutionContext(partial, nodeContext);
//  var map = component.expression.active.map,
//    reduce = component.expression.active.reduce;
//  console.log(unescapeTazcript(map.script));
//  var value = evaluate(unescapeTazcript(map.script), executionContext);
//
//  if(map.provider) { // && component.expression.active.reduce == {}
//    results = reduce.provider? evaluate(unescapeTazcript(reduce.script), executionContext) : value;
//    console.log('key::provider::results', results);
//    return results;
//  }
//  function unescapeTazcript(script) {
//    var src = script.slice(1, -1);
//    var ast = aesprim.parse(src);//.body[0].expression;
//    return ast.body[0].expression;
//  }
//}

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
