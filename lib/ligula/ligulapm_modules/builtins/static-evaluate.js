/**
 * Created by sdawood on 16/06/2015.
 *
 * L.I.G.U.L.A
 ^
 *
 10
 9                     "##$$"
 8                     "$$@@"
 7                  $@   |-+|  $@
 6                    <=#/></*=>
 5                       || |
 4                       #==$
 3                       || |
 2                 ACTIVE$|#LIGULA
 1
 0   1   2   3   4   5   6   7   8   9   10  $   @*/

var aesprim = require('./aesprim');
var _evaluate = require('static-eval');

module.exports = function(script, context) {
  var ast = aesprim.parse(script).body[0].expression;
  return _evaluate(ast, context);
}