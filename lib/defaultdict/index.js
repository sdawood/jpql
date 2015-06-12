var readonly = require('./read');
//var writeable = {};

var defaultdict = function(target, factory, origin) {
 return new readonly(target, factory, origin).bind(this);
}
module.exports = defaultdict;