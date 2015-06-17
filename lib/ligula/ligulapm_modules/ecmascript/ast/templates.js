/**
 * Created by sdawood on 15/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 *
 ^         IT GO
 10        HOME!
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

/*Found this jewel, an idea implemented and tested in an early atttempt at jsonpath + falcor with peg.js
* should come in very handy to generate ast for javascript expression 'redcume(args, map(args))'
* Where the templates are FunctionCall AST nodes, with args overwritten, unparse by escodegen and evaluate securely with static-eval
* No chance for unsafe code with #tagScriptMarshall lambdas looking into the ast, applying permissions and inject metric stamps
* Performance monitoring is not done by the endpoints mesauring delays in request/response, stamps in the data carry actual visits log
* and is piped downstream towards a sink that is possible a tazhub live git repo in clustered memory
* */

function partial(template) {
  return function(partial) {
    var templateClone = merge({}, template); // Clousre::template shouldn't be returned to caller code for keeping. Would create circular references in ASTY Tree
    if (partial) {
      return merge(templateClone, partial); // merge code above shouldn't modify Closure::template, since that reference is reused
    }
    return templateClone;
  }
}

var jp = {
  'member-child-identifier' : partial(
    {
      expression: { type: 'identifier', value: undefined },
      scope: 'child',
      operation: 'member'
    }
  ),
  'subscript-child-numeric_literal': partial(
    {
      expression: { type: 'numeric_literal', value: undefined },
      scope: 'child',
      operation: 'subscript'
    }
  ),
  'member-child-numeric_literal': partial(
    {
      expression: { type: 'numeric_literal', value: undefined },
      scope: 'child',
      operation: 'member'
    }
  ),
  'subscript-child-string_literal': partial(
    {
      expression: { type: 'string_literal', value: undefined },
      scope: 'child',
      operation: 'subscript'
    }
  ),
  'subscript-child-keyword_literal': partial(
    {
      expression: { type: 'keyword_literal', value: undefined },
      scope: 'child',
      operation: 'subscript'
    }
  ),
  'subscript-child-slice': partial(
    {
      expression: { type: 'slice', value: undefined },
      scope: 'child',
      operation: 'subscript'
    }
  ),
  'subscript-child-union': partial(
    {
      expression: { type: 'union', value: undefined },
      scope: 'child',
      operation: 'subscript'
    }
  )
}