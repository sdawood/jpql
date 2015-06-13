/**
 * Created by sdawood on 12/06/2015.
 *
 /*
 ^React@$ (Resource Active Tags) or just call me "^raz"
 10         Meet
 9   $.R.e.a.c[T].a.z.*
 8        ^   ^
 7       (@) (#)
 6          $
 5      <=-...+=>
 4
 3         ><
 2        DATA
 1        TAZ
 0 1 2 3 4 5 6 7 8 9 10 $*/

/* inspiration https://allthingsarchitectural.wordpress.com/2014/09/17/using-rxjs-subjects-as-a-proxy-between-two-angular-controllers/*/


/* what if the parser generates ECMASRIPT AST, then esutil, estraverse and escodegen can be used
* the first pass on the jsonpathql AST, tranilitrate AST to javascript api DSL
* for example
* 1. AST for path $.user[123][name, pic]
* generates
* $root(data).get('user').get(123).get(name, pic)
* this declarative mapping using tagged provider scripts, e.g. (#core_access_member_child_identifier =>{MemberChildIdentifier(@@)}:={@.expression})
* We are assuming the MemberChildIdentifier factory function to do the magic, transofrming the expression into a taznode function call
* at this stage, we are only making one assumption about the data provider, it can play along this access path :)
*
* The argument-reduce script is excuted first, receives the context, and selects the $ for processing by the map script
* the reduce script is hereby performing a BNF-like reduction, recognizing a state and retuning a manipulated $$, here aliased @@ to keep the analogy clear
* the provider map script is like a macro, it can reuse other macros by embedded them (here receiving the result of reduce) and produces a literal value (dataregex)
* this simple yet powerful subsystems of active scripts is declaratively user to build the logic into the
 *
*
* 2. expansions are enumerator functions
* $..[123].*
* $root(data).traverser(passable(123), true).traverser(taz.ALL, false)
*
* use esprim to parse the JSDSL to enable other features, such as
* During interpretation, if async mode is selected, switch the pojos for subject factories with tazMixin to talk to the rest of the DSL elements
*
*
*
 */


/*INDEA
  *
  * A smart start would be the best of both worlds explained below
  *
  * as a candidate for evaluation-feature, a simple dry run that generates a scafolding object to hold the data
   * 1-in sync mode a POJO is created
   * 2- in async mode, a POJO skeleton holding observable end points is created
   *
   * the dry run logic is merely guided by the path and doesn't know anything about the real data source(s) location or structure
   * the dry run, if passed a reference to the object, is capable of taking the object along for the ride, effectively visiting the shortest path tree in the graph
   * there is no risk if getting lost in the graph since you access the object at it's current node as context root, and can only get to the nodes with path mapped clearly by the path query
   * * if options.discovery = true, * and .. operations are allowed to execute, descending or traversing the graph looking for a pre-declared target
   * while enumerating the nodes, the interpreter can perform actions, using an active filter helper node
   * the active filter can verify:
   * - @.key: parent has key, child-key match, source can provide(key)
   * - @.key === expected: child-value match
   * - @ === expected: leaf-value-match, not supported by all back-ends, and only guaranteed to work with native data structure
   * the interpreter logic can either report the result at each node, pass the result down to the root node, or aggregate the result possible applying
   * a logical reduction, and push the accumulator down towards the result node
   *
   * Notice that
   * The reduction of data towards the root is not the only possible behaviour, but using an analogy to programming languages interpreter,
   * it is fit to think of each node as an expression that can be evaluated separately whether it is a void expression or evaluates to a return value
   * while expecting the data to be aggregated down to the root (current implementation does exactly that by pushing and concating into an array)
   * as a program that exists with a value, the value can be a list of sub-values
   * More accurately though the root expression result should be viewed as a block of query code, that can be nested arbitrarily within other blocks, for eample
   * when using a path that contains branches, back root reference, and expressions, which are a block of a single expression in case of script-expression and multiple
   * in case of options.angular_expressions === true.
   *
   *
   *
   *
  * format 1- Flat result option, semantically similar to the results array currently returned
  *
  * every node-key is a subject, that subscribes to all it's selected values and FlatmapAll the values
  * client and parent node's alike, are sources that subscribe to the changes in the subject, they are both subjects themselves
  * access module, an API sugar coated with a GUI or a Web UI subscribes to the parent node proxy as the channel through this the whole path would pipe data back
  *
  * the only subscription created in a typical scenario is the on created by the client to represent root node
  *
  * format 2- Proxy: if proxies are available, the user can request a proxy object that allows natural javascript navigation and gain arbitrary access to all levels of the result tree
  * otherwise
  * Note the the wiring at every leaf of the proxy is done by an injected taggig script
  * the script addes an entry #tag: $path and $path: tag in the context manager metadata
  * also the script can pipe children data through itself by creating a subject (node-subject) and registering the source with contextManager under $path: subject
  * the subject broad case the data[node-key] value or a provider value in the case of => scripts
  * example: (#fullName { $subscribe('fulleName') })
  * execution effects:
  * TAG             - #fullName: $.path.to.full.name is registerd, answering WHERE TO GET FULLNAME?
  * MAPPING         - $path.to.full.name = script-node, ansering GET NODE at PATH
  *
  * the MAPPING is what the source-nodes within a proxy use to find sources, by searching the MAPPING for their own path
  * Example state:
  *
  * ContextManager Meta:
  * TAGS: { #fullName: '$..user.profile.fullName' }
  * MAPPING { '$.user.123.user.profile.fullName': fullNameSubject }
  *
  * Proxy:
  * { user: {
  *   123: {
  *     profile: {
  *       fullName: getValue('$.user.123.user.profile.fullName') ||
  *       fullName: subject('$.user.123.user.profile.fullName')
  *
  *
  *     }
  *   }
  * }
  *
  * UI driver code:
  *
  * proxy.user.123.profile.fullName.subscribe(function(next) { // update widget #path //})
  * Or
  * flatProxy.subscribe('$..123..fullName', function(next) { // update widget #path //})
  * Or
  * proxy.tags['#fullName'].subscribe(function(next) { // update widget #path //})
  * Or use shorcut funtion
  * proxy.subscribe('#fullName', function(next) { // update widget #path //})
  *
   *
  * a simple crud api would be the programmatic fallback implementation
  * The crud api is served by nodes ofan object that has a structure rendered from the required path
  * The challenge here is that each and everynode should also allow subscriptions to themselves serving as a subject, piping data coming from the child sources through
  *
*
* */
var unparse = require('escodegen').generate;
var nodeTypes = require('./node-types');

function toTag(node) {
  var jp = require('jp');
  var key = jp.query(node, '[operation, scope, type].(#toKey =>{@.join('-')})');
  return nodeTypes(key)
}

module.exports = function (ast, vars, contextManager) {
  if (!vars) vars = {};
  var FAIL = {};
  var tag = toTag(node);
  var result = (function walk (node) {
    switch (tag) {
      case 'member-child-identifier':
      case 'member-child-numeric_literal':
      case 'member-child-keyword':
      case 'member-child-script_expression':
      case 'member-child-script_expression|active':
      case 'member-child-wildcard':
      case 'member-descendant-identifier':
      case 'member-descendant-numeric_literal':
      case 'member-descendant-keyword':
      case 'member-descendant-script_expression':
      case 'member-descendant-script_expression|active':
      case 'member-descendant-wildcard':
      case 'subscript-child-root':
      case 'subscript-child-identifier':
      case 'subscript-child-numeric_literal':
      case 'subscript-child-string_literal':
      case 'subscript-child-keyword':
      case 'subscript-child-active_position':
      case 'subscript-child-script_expression':
      case 'subscript-child-script_expression|active':
      case 'subscript-child-slice':
      case 'subscript-child-slice|active':
      case 'subscript-child-filter_expression':
      case 'subscript-child-wildcard':
      case 'subscript-child-union':
      case 'subscript-descendant-identifier':
      case 'subscript-descendant-numeric_literal':
      case 'subscript-descendant-filter_expression':
      case 'subscript-descendant-wildcard':
      case 'subscript-descendant-union':
      case descend:
      case traverse:
      default: throw new Error('Unsupported nodeType: ' + tag);
    }
    if (node.type === 'Literal') {
      return node.value;
    }
    else if (node.type === 'UnaryExpression'){
      var val = walk(node.argument)
      if (node.operator === '+') return +val
      if (node.operator === '-') return -val
      if (node.operator === '~') return ~val
      if (node.operator === '!') return !val
      return FAIL
    }
    else if (node.type === 'ArrayExpression') {
      var xs = [];
      for (var i = 0, l = node.elements.length; i < l; i++) {
        var x = walk(node.elements[i]);
        if (x === FAIL) return FAIL;
        xs.push(x);
      }
      return xs;
    }
    else if (node.type === 'ObjectExpression') {
      var obj = {};
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i];
        var value = prop.value === null
            ? prop.value
            : walk(prop.value)
          ;
        if (value === FAIL) return FAIL;
        obj[prop.key.value || prop.key.name] = value;
      }
      return obj;
    }
    else if (node.type === 'BinaryExpression' ||
      node.type === 'LogicalExpression') {
      var l = walk(node.left);
      if (l === FAIL) return FAIL;
      var r = walk(node.right);
      if (r === FAIL) return FAIL;

      var op = node.operator;
      if (op === '==') return l == r;
      if (op === '===') return l === r;
      if (op === '!=') return l != r;
      if (op === '!==') return l !== r;
      if (op === '+') return l + r;
      if (op === '-') return l - r;
      if (op === '*') return l * r;
      if (op === '/') return l / r;
      if (op === '%') return l % r;
      if (op === '<') return l < r;
      if (op === '<=') return l <= r;
      if (op === '>') return l > r;
      if (op === '>=') return l >= r;
      if (op === '|') return l | r;
      if (op === '&') return l & r;
      if (op === '^') return l ^ r;
      if (op === '&&') return l && r;
      if (op === '||') return l || r;

      return FAIL;
    }
    else if (node.type === 'Identifier') {
      if ({}.hasOwnProperty.call(vars, node.name)) {
        return vars[node.name];
      }
      else return FAIL;
    }
    else if (node.type === 'CallExpression') {
      var callee = walk(node.callee);
      if (callee === FAIL) return FAIL;

      var ctx = node.callee.object ? walk(node.callee.object) : FAIL;
      if (ctx === FAIL) ctx = null;

      var args = [];
      for (var i = 0, l = node.arguments.length; i < l; i++) {
        var x = walk(node.arguments[i]);
        if (x === FAIL) return FAIL;
        args.push(x);
      }
      return callee.apply(ctx, args);
    }
    else if (node.type === 'MemberExpression') {
      var obj = walk(node.object);
      if (obj === FAIL) return FAIL;
      if (node.property.type === 'Identifier') {
        return obj[node.property.name];
      }
      var prop = walk(node.property);
      if (prop === FAIL) return FAIL;
      return obj[prop];
    }
    else if (node.type === 'ConditionalExpression') {
      var val = walk(node.test)
      if (val === FAIL) return FAIL;
      return val ? walk(node.consequent) : walk(node.alternate)
    }
    else if (node.type === 'FunctionExpression') {
      var keys = Object.keys(vars);
      var vals = keys.map(function(key) {
        return vars[key];
      });
      contextManager.log('@()', unparse(node), '[,]', vals);
      return Function(keys.join(', '), 'return ' + unparse(node)).apply(null, vals);
    }
    else return FAIL;
  })(ast);

  return result === FAIL ? undefined : result;
};