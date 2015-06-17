/**
 * Created by sdawood on 18/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
 ^                       ITGO
 *                       HOME
 10               $.R.e.a.c.[T].a.z.*
 9                      ^  ^
 8                     (@)(#)
 7
 6                       $
 5                "<=""-::+""=>"
 4
 3                      ><
 2                     DATA
 1                     TAZ
 0   1   2   3   4   5   6   7   8   9   10  $   @*/


var util = require('util');

function log($tag, $$requires) {
  console.log($tag, $$requires);
}
function inspect($tag, $$requires) {
  return util.inspect(argsToMemorySubject($tag, $$requires), false, null);
};


function argsToMemorySubject($tag, $$requires) {
  /**
   * example:
   *
   * argsToMemorySubject("name", "firstName", "lastName")
   > { name: [ 'firstName', 'lastName' ] }
   *
   */
  var sequence = [];
  sequence.push.apply(sequence, arguments);
  var subject = {};
  subject[sequence.shift()] = sequence; //{seq[0]: seq[1:]}
  return subject;
}

module.exports = {
  log: log,
  inspect: inspect,
  argsToMemorySubject: argsToMemorySubject
};