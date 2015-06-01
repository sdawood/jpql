var _ = require('lodash');
module.exports = {
  _options: [{}],
  _context: [{}],
  options: function (nodeOptions) {
    if (nodeOptions === undefined) return this._options.slice(-1)[0];

    if(! nodeOptions instanceof Array) // normalize arguments, first arg can be an array, or an object
    {
      nodeOptions = [ nodeOptions]
    }
    var optionsList = nodeOptions.concat(Array.prototype.slice.call(arguments, 1));
    optionsList.forEach(function(node) {
      this.pushOptions(node); // [node0, node1, {node1} + {opt}, ...]
    });
    return this._options.slice(-1)[0];
  },

  pushOptions: function(options) {
    var previousOptions = _options.slice(-1)[0]; // get a fresh copy
    this._options.push(_.merge(previousOptions, options));
    return this._options;
  },

  popOptions: function() {
    return this._options.pop();
  }
}
