var Rx = require('rx/dist/rx.all');

function arrayDiff(rxChange) {
  var values;
  removedCount = rxChange.removed.length;
  if (rxChange.addedCount) {
    values = rxChange.object.slice(rxChange.index,rxChange.index+addedCount);
  } else {
    values = rxChange.removed;
  }
  console.log(values);
  return values;
}

var of = {
//  objectChanges: Rx.Observable.ofObjectChanges,
  arrayChanges: Rx.Observable.ofArrayChanges
}

function observeChanges(obj, keys) {
  if(!obj instanceof Array) throw new TypeError('obj must be an Array'); //v1 array only
  var keys = (keys instanceof Array ? keys : [keys]).concat(Array.prototype.slice.call(arguments, 1));
  var observerOfChanges = of.arrayChanges;
  var changes = observerOfChanges(obj);
  var matches = changes.filter(function(change) {
    console.log('change', change);
    var values = arrayDiff(change).filter(function(value) {
      console.log('value', value);
      return keys.reduce(function(acc, key){
        return acc && key in value;
      }, true);
    });
    return values.length; // include the change if we are interested in any of the commits
  });
  return matches;
}

function log() {

}

module.exports = {
  observeChanges: Rx.Observable.ofArrayChanges
}