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
var jpql = require('../../../index');
var log = require('./utils').log;
var evaluate = require('./static-evaluate');
var requirex = /\$\$(.*)/;
var providex =  /^\$(?![\$])(.*)/;

function ligufunc($tag, func) {
  var script = 'var ' + $tag + ' = ' + func.toString();

  log('$script', script);
  var ast = aesprim.parse(script);
  var $params = jpql.nodes(ast, '$.body..declarations..params..name');
  log($params);
  var requires = $params.reduce(function(acc, $node){
    if(requirex.test($node.value)) {
//      var $$tag = requirex.exec($node.value)[1];
      var $$tag = $node.value.replace(requirex, '#$1');
      acc[$$tag] = true;
    }
    return acc;
  }, {});
  var provides = $params.reduce(function(acc, $node){
    if(providex.test($node.value)) {
      var $tag = $node.value;
      acc[$tag] = true;
    }
    return acc;
  }, {});
  return {
    $tag: $tag,
    script: script,
    ast: ast,
    requires: requires, //required execution context
    provides: provides
  };
}

function liguex($tag, expression) {
  var script = 'var ' + $tag + ' = ' + expression;

  log('$script', script);
  var ast = aesprim.parse(script);
  var $params = jpql.nodes(ast, '$.body..declarations..params..name');
  log($params);
  var requires = $params.reduce(function(acc, $node){
    if(requirex.test($node.value)) {
//      var $$tag = requirex.exec($node.value)[1];
      var $$tag = $node.value.replace(requirex, '#$1');
      acc[$$tag] = true;
    }
    return acc;
  }, {});
  var provides = $params.reduce(function(acc, $node){
    if(providex.test($node.value)) {
      var $tag = $node.value;
      acc[$tag] = true;
    }
    return acc;
  }, {});
  return {
    $tag: $tag,
    script: script,
    ast: ast,
    requires: requires, //required execution context
    provides: provides
  };
}

module.exports = {
  liqufy: ligufy
}