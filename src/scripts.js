const _ = require('lodash');
const aesprim = require('./aesprim');
const _evaluate = require('static-eval');

const _value = node => node.value;

const oneOrMany = array => array.length === 1 ? array.slice().pop() : array.slice();

const values = partial =>_.isArray(partial) ? oneOrMany(partial.map(_value)) : partial;

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
    };
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
    };
}

function evalScript(partial, script, contextManager) {
    const nodeContext = contextManager.head();

    const src = script.slice(1, -1);
    const ast = aesprim.parse(src).body[0].expression;
    const executionContext = scriptExecutionContext(partial, nodeContext);
    const value = evaluate(ast, executionContext);
    return value;
}

function evalActiveScript(partial, script, contextManager) {
    
    /*Eval scripts would be executed with less constraints in the future, where function definitions and variable declarations would be allowed, or plugins would be available */
    const nodeContext = contextManager.head();
    const src = script.slice(2, -2);
    const ast = aesprim.parse(src).body[0].expression;
    const executionContext = scriptExecutionContext(partial, nodeContext);
    return evaluate(ast, executionContext);
}

function makeFilter(filter, nodeContext) {
    // slice out the expression from ?(expression)
    const src = filter.slice(2, -1);
    const ast = aesprim.parse(src).body[0].expression;
    return function (key, value) {
        const executionContext = filterExecutionContext(key, value, nodeContext);
        return evaluate(ast, executionContext);
    };
}

function evaluate() {
    try {
        return _evaluate.apply(this, arguments);
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = {
    evalScript: evalScript,
    evalActiveScript: evalActiveScript,
    makeFilter: makeFilter
}
