var assert = require('chai').assert;
var aesprim = require('../lib/aesprim');
var evaluate = require('../lib/reactaz/example/static-eval');

var defaultdict = require('../lib/defaultdict/read');
var jpql = require('../index');

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

describe('eval-static', function() {
  /**
   *
   * The problem:
   *
   * Current implementation mixes the logic to interpret the AST (unparse) with the act of delegation to access the data,
   * manipulate a node through contextManager, or do whatever many bad things
   *
   * A new design would separate the interpretation of the nodes and branches from the logic controlling access to source and abusing the full access write
   * secretly.
   *
   * Data access would be through proxies
   *
   * Data would => provide tazpath (.nodes(data, '$..*') to explore)
   * Interpreter would require each path as it walks it
   *
   * The text below include experimental filter, active and anchor tags
   *
   * from path: 'expression.active[map[provider, script, value], reduce.?{@=={}}]'
   * to AST
   *  1 - mapper script to convert path into tagged script nodes with script===key
   *    - tags are registered with the context manager (#?async===future) #tag: path to active node
   *    - context manager sorts tags by path
   *    - and replay the tags in order to output the transformed path
   *  2 - Unparse AST and interpret the path
   *    - a delegator can play this role, and can access data through a provided tazpath (#plural) template with the granted permission in its execution context
   *    - data access is committed into a separate branch (with low priority lazy writes (#async)
   *    - the delegator will replace the clumsy index file and do one job brilliantly, with declarative governed and audited access (#async)
   *    - delegator can be used without data to dry-run a path with all provider nodes
   *    - TazPath is not just for data access capabilities and operation descriptions, it also describes an agile path through the data, being a graph query
   *      it actually defines a shortest path within the global graph, with path points that are active or async in nature
   *      This solves a few problems with (#async) data applications
   *      - Declaring intent
   *      - Granting layered access permissions
   *      - auditing (git hub style, with blame friendly messages)
   *      - undo history
   *      - generate templates of self (string templates are ideal for transforming json to yaml for example, where the template string in short sweet yaml, pulls in data from the big json)
   *      - data query, obviously
   *      - data exploration, with branching and descending
   *      - separate access declaration from data allows the delegator to forward all access to a Mock for recording
   *      - data require/provide capability declaration allows for stub generation (Tazpath with all provider nodes), which is a delegator without need for data
   *      - nodes can be piping along, concat branches or merge Observables into existing ones.
   *      - from path -> generated orderly json schema
   *      - consume json schemas with a data source to perform validation and JSON-LD actions
   *      - Use to control animation sequences using references to widgets through #tags
   *      For Example: show widgets in this sequence
   *      > [flash, welcome, login [?(@.success).home, ?(@.failed).forgotPassword ]]
   *      That's it, you have just defined a sequence for your views that you can use to guide and control the routing, animate a series of sources,
   *      for Example, to view the DataTaz logo
   *
   10   Meet data TAZ
   9
   8       ^   ^
   7      (@) (#)
   6         $
   5     <=-...+=>
   4
   3        ><
   2       DATA
   1       TAZ
   0 1 2 3 4 5 6 7 8 9 10
   *
   * Notice that this is just a 10 by 10 area of blocks, with some filled, for example ($.4.7 === '@')
   * Let's say we have enough sources to make this ascii art, we can delay or animate every bit of data from entering the screen from a port representing a source
   * To it's final destination under the node with path $.4.7 in the previous example.
   *
   *
   *      - With
   *      -
   *      -
   *      -
   *
   *
   *
   *
   *
   * */
  it('[X] warm up', function () {
    var script = 'foo(5)',
      ast = aesprim.parse(script);
    var results = evaluate(ast.body[0].expression, {foo: function (i) {
      return i * 1000
    }});
    assert.equal(results, 0);
  });

  it('[X] test if static eval can interpret assignment @["youHaveBeenAccessed"] = true;', function () {
    var ast = require('../lib/reactaz/example/ecmascript-ast');
    var evaluate = require('../lib/reactaz/example/static-eval');
    var target = {};
    var results = evaluate(ast.body.expression[0], {'@' : target});
    assert.equal(target["youHaveBeenAccessed"], true);
  });

  it('[X] full speed ahead', function () {
    var script = 'true; x["youHaveBeenAccessed"] = true; x;  list = [1, 2, 3]; list; obj = {key: true}; obj; 3 + -2; x.key = false; x.key? obj.key : "Not Available"; foo(5);',
      ast = aesprim.parse(script);
    var expressions = jpql.nodes(ast, '$..expression'); //what if nodes returns an array of node observable, or promises
    var results = expressions.map( //that can be individually mapped by interpreter
      function(expression) {
        console.log(expression);
        expression.provider = expression.value;
        expression.value = evaluate(expression.provider, {
          x: {},
          foo:  function(i) { return i*1000 }
        });
        return expression;
      });
    assert.equal(results, ast);
  });

});

describe('react-az', function() {


  it('[X] test if object satisfies structure (future, generate orderly json schema)', function () {
    var component = {
      "expression": {
        "active": {
          "map": {
            "provider": "=>",
            "script": "{\"Not Available!\"}",
            "value": "(=>{\"Not Available!\"})"
          },
          "reduce": {},
          "value": "(=>{\"Not Available!\"})"
        },
        "type": "script_expression|active",
        "value": "({\"Not Available!\"})"
      },
      "operation": "member",
      "scope": "child"
    }
    var results = jpql.paths(component, '$..*');
    var path = 'expression.active[map[provider, script, value], reduce.?{@=={}}]';
    var ast = jpql.parse(path);
    assert.equal(results, ast);
  });

  it('[X bootstrap] member expression access', function () {
    var data = {x: 'x-value'}
    var raz = require('../lib/reactaz/interpreter');
    var ast = jpql.parse('$.x')
    var results = raz(ast, subject)
    var path = 'expression.active[map[provider, script, value], reduce.?{@=={}}]';
    var ast = jpql.parse(path);
    assert.equal(results, ast);
  });


});