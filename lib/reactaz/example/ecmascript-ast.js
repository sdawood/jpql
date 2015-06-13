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


module.exports = { type: 'Program',
  body:
  [ { type: 'ExpressionStatement',
    expression:
    { type: 'AssignmentExpression',
      operator: '=',
      left:
      { type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: '@' },
        property:
        { type: 'Literal',
          value: 'youHaveBeenAccessed',
          raw: '"youHaveBeenAccessed"' } },
      right: { type: 'Literal', value: true, raw: 'true' } } } ] }