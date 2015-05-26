var _ = require('lodash');

module.exports = {
  has: function(object) {
    return function() {
      var args = Array.prototype.slice.apply(arguments);
      var results = [];
      args.forEach(function(arg) {
        results.push(_.has(object, path));
      })
      return _.all(results);
    }
  },

  _has: function(object) {
    return function() {
      var args = Array.prototype.slice.apply(arguments);
      var results = [];
      args.forEach(function(arg) {
        results.push(object.hasOwnProperty(arg));
      })
      return results.reduce(function(acc, bool) { return bool && acc;}, true);
    }
  }
};
