var _ = require('lodash');

var $escape = function (string) {

  return (String(string)).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\':
        return '\\' + character
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
}

var $escapeAll =  function() {
  var args = Array.prototype.slice.call(arguments);
  return args.map(function(value) {
    return $escape(value);
  }).join(",");
}

var $quoteAll = function(args) {
  var args = (args instanceof Array ? args : [args]).concat(Array.prototype.slice.call(arguments, 1));
  return args.map(function(value) {
    return '"' + value + '"';
  }).join(",");
}

var ContextManager = function() {
  console.log('NEW CONTEXT MANAGER');
  this.initialize();
}

ContextManager.prototype.initialize = function() {
  this._nodes = [
    {$version: -1, $revision: -1, $versionTags: [], $revisionTags: [], $quoteAll: $quoteAll} // every new revision or version carries all the history, consider data structure sharing
  ];
}

ContextManager.prototype.node = function (args, message) { //sugar for bulk push and head
    if (args === undefined) return this.head();

    // normalize arguments, single arg can be an array, or an object
    var nodeList = (args instanceof Array) ? args : [args];//Array.prototype.slice.call(arguments, 1);
    nodeList.forEach(function(node) {
      this.push(node, message); // [node0, node1, {node1} + {opt}, ...]
    }.bind(this));
    return this.head();
}

ContextManager.prototype.push = function(context, tag) {
    var headClone = this.head(); // get a fresh copy
    headClone.$version += 1;
    headClone.$versionTags.push(tag || '');
    this._nodes.push(_.merge(headClone, context));
    return this.head();
}

ContextManager.prototype.commit = function(delta, tag) {
    var headRef = this._nodes.slice(-1)[0]; // true reference
    headRef.$revision += 1;
    headRef.$revisionTags.push(headRef.$revision, tag || '');
    headRef = _.merge(headRef, delta);
    return this.head(); // return a clone
}

ContextManager.prototype.pop = function($revision) {
    return this._nodes.pop($revision);
}

ContextManager.prototype.head = function() {
  var head = _.merge({}, this._nodes.slice(-1)[0]); // get a fresh copy, no reference attached to user code
//  console.log('ContextManager::head()::', debug_inspect(head))
  return head;
}

var debug_inspect = function(obj) {
  var _inspect = require('util').inspect;
  return _inspect(obj, false, null);
}

module.exports = ContextManager;