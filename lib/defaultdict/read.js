function DefaultDict(obj, factory, origin) {
  /*
  * genesis origin overrides alias overtake of key (data overtake)
  * */
  this.data = obj;
  this.factory = function(key) {
      return typeof factory === 'function'? factory(key) : factory;
    };
  this.origin = origin || {};

  return function(key, alias, simulate) {
    var access;
    access = alias ? alias[key] ? alias[key] : key : key;
    access = this.origin[access] || access;
    if (key in this.data) {
      console.log('this.origin[access]', this.origin[access]);
      console.log('access', access);

      return simulate? access : this.data[access];
    } else { //otherwise, if origin mapped, access origin mapped on target, otherwise return default factory
      console.log('this.origin[access]', this.origin[access]);
      console.log('access', access);
      access = this.origin[access] || access;
      return access in this.data? simulate? this.factory(access) : this.data[access] : this.factory(access);
    }
  }.bind(this)
}

module.exports = DefaultDict;