function DefaultDict(obj, factory, origin) {
  /*
  * genesis origin overrides alias overtake of key (data overtake)
  * */
  this.data = obj;
  this.factory = function() {
      return typeof factory === 'function'? factory() : factory;
    };
  this.origin = origin || {};

  return function(key, alias) {
    var access;
    access = alias ? alias[key] ? alias[key] : key : key;
    access = this.origin[access] || access;
    if (this.data.hasOwnProperty(key)) {
      console.log('this.origin[access]', this.origin[access]);
      console.log('access', access);

      return this.data[access];
    } else { //otherwise, if originped, access originped, otherwise return default factory
      console.log('this.origin[access]', this.origin[access]);
      console.log('access', access);
      access = this.origin[access] || access;
      return this.data.hasOwnProperty(access)? this.data[access] : this.factory();
    }
  }.bind(this)
}

module.exports = DefaultDict;