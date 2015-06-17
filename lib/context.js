/* React@$ (Resource Active Tags) or just call me "^raz"
*
^         IT GO
10        HOME!
  9   $.R.e.a.c[T].a.z.*
8        ^   ^
7       (@) (#)
6          $
5      <=-...+=>
4
3         ><
2        DATA
1        TAZ
0 1 2 3 4 5 6 7 8 9 10 $

I contrast with the rest of the legacy interpreter, the contextManager is a fresh addition and is neary ready to pop up and join reactaz

Context manager is a microGit in memory, with structured data/context

an activetag service running standalone can chose to pipe commits/branches and pushes to a local git repo

The local git repo is a branch, identified by the node at hand own path

Aggregation keeps moving one step higher, into a master Repo with branches, holding the context for the data storm
with marshalling and stamping at each node

The in-memory Git functionality is a micro-service that can be deployed standalone and communicate through HTTP
This particular micro-service can be written in a programming language that has native support for data versioning
marries up nicely with ideas in Clojure(js) and Om, which should be at least considered if they
can conduct themselves in a node.js micro-service environment.

*/

var assert = require('assert'); //should load dynamic assertion policies
var _ = require('lodash');
var transition = require('./transition');
var builtins = require('./ligula/ligulapm_modules/builtins');

var ResourceNode = function() {
  this.initialize();
}

ResourceNode.prototype.initialize = function(branch) {
  this.meta = { location: undefined };
  this.origin = branch || 'master';
  this.version = -1;
  this.revision = -1; // alias for branch
  this.commit = 0;
  this.versionTags = [];
  this.revisionTags = [];
  this.commitMessages = []; // every new revision or version carries all the history, consider data structure sharing
  this.options = {};
}


var ContextManager = function() {
  this.initialize.apply(this, arguments);
}

ContextManager.prototype.initialize = function(rootOptions, meta, reader) {
  console.log('initalize(argument)', arguments);

  this.$root = new ResourceNode();
  this.reader = reader; // @todo: CAN NOT EVEN require the legacy jpql reader for now till interpreter is ready, context will be instantiated from jpql
  this._branches = { master: [this.$root] }; //packed $root node
  this._currentBranch = 'master';
  this._tags = {};
  this.configure(rootOptions ? rootOptions : {applyToRoot: true, mark: false, leaf: false}, meta); // @todo: read defaults from config;
}

ContextManager.prototype.configure = function(options, meta) {
  var hunk = {};
  options ? hunk.options = options : null;
  meta ? hunk.meta = meta : null;
  this.commit(hunk, 'configure(' + JSON.stringify(arguments) + ')');
  return this;
}

ContextManager.prototype.requires = function() {
  builtins.$provider(this).provideAs(this.$root); // pipe builtins to this.$root node according to the declared capability in builtins.provides, not equivalent to '$.*', which will violate builtins declared public capability and would only work in local MemorySubject anyhow
}

ContextManager.prototype.transition = transition.transition;
ContextManager.prototype.types = require('./ligula/node-types');

ContextManager.prototype.node = function(hunks, message, branch, meta) { //sugar for bulk push and head
  if (hunks === undefined) return this.head();

  // normalize arguments, single arg can be an array, or an object
  var nodeList = (hunks instanceof Array) ? hunks : [hunks];
  nodeList.forEach(function(hunk) {
    var head = this.head(branch); // get a fresh copy
    head.version += 1;
    head.versionTags.push(message || '');
    if (meta) { _.merge(hunk, { meta: meta })};
    this.commit(hunk, message, branch, head);
  }.bind(this));
  return this.head(branch);
}

ContextManager.prototype.branch = function(hunks, message, name, meta) { //sugar for bulk branch push and head (head alias is by convention used by branching code only)
  if (hunks === undefined) return this.head();

  // normalize arguments, hunks argument can be an array or an object
  var nodeList = (hunks instanceof Array) ? hunks : [hunks];
  nodeList.forEach(function(hunk) {
    var head = this.head(); // get a fresh copy of current branch head
    head.revision += 1;
    head.revisionTags.push(message || '');
    if (meta) { _.merge(hunk, { meta: meta })};
    this.commit(hunk, message, name, head);
  }.bind(this));
  return this.head(name);
}

ContextManager.prototype._push = function(node, branch) {
  branch = branch ? branch : this._currentBranch;
  node.origin = this._currentBranch;
  this._currentBranch = branch;
  if (this._branches[branch]) {
    this._branches[branch].push(node);
  } else {
    this._branches[branch] = [node];
  }
  return this.head(branch);
}

ContextManager.prototype.commit = function(hunk, message, branch, headRef, force) {
  assert.ok(message, 'Commit message can not be empty');
  force = force || true;
  var head = headRef || this.head(branch);
  head.commit += 1;
  head.commitMessages.push(message || '');
  hunk.timestamp = Date.now();
  var merged = hunk ? this.merge(head, hunk, force) : head;
  return this._push(merged, branch);
}

ContextManager.prototype.merge = function(target, sources, force) {
  function latest(before, after) {
    return after; // overwrite {x: {value0: 0}} by {x: {value1: 1}}, destructive for existing keys (~lines)
  }
  return _.merge(target, sources, force ? latest : null);
}

ContextManager.prototype.head = function(branch) {
  var head = this.merge(new ResourceNode(), this._branches[branch || this._currentBranch].slice(-1)[0]); // get a fresh copy, no reference attached to user code
  return head;
}

ContextManager.prototype.switch = function(branch) {
  this._currentBranch = branch || 'master';
  return this.head(this._currentBranch);
}

ContextManager.prototype.tag = function(path, provider, family, label, cacheable) {
  var tag = {
    path: path,
    provider: provider,
    family: family,
    label: '$' + label,
    value: cacheable
  }; //essentials
  tag[tag.label] = tag.value; tag[tag.path] = label; //lookup/reverse
  tag['=>'] = tag.provider; //alias
  tag.since = new Date(); //timestamp
  var nodeContext = this.head();
  nodeContext.tags = nodeContext.tags ? nodeContext.tags.concat([tag]) : [];
  this.commit(nodeContext, JSON.stringify(tag));
  this._tags[tag.label] = tag.value; //the caller code is not to attached to the internals of the tag, it lives inside the node context, and evidence is logged Context+Action+Result+Evidence
  return tag;
};

ContextManager.prototype.tags = function() {
  return this._tags;
}


//function $escape(string) {
//
//  return (String(string)).replace(/["'\\\n\r\u2028\u2029]/g, function(character) {
//    // Escape all characters not included in SingleStringCharacters and
//    // DoubleStringCharacters on
//    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
//    switch (character) {
//      case '"':
//      case "'":
//      case '\\':
//        return '\\' + character
//      // Four possible LineTerminator characters need to be escaped:
//      case '\n':
//        return '\\n'
//      case '\r':
//        return '\\r'
//      case '\u2028':
//        return '\\u2028'
//      case '\u2029':
//        return '\\u2029'
//    }
//  })
//}
//
//function $escapeAll() {
//  var hunks = Array.prototype.slice.call(arguments);
//  return hunks.map(function(value) {
//    return $escape(value);
//  }).join(",");
//}
//
//function $quoteAll(hunks) {
//  hunks = (hunks instanceof Array ? hunks : [hunks]).concat(Array.prototype.slice.call(arguments, 1));
//  return hunks.map(function(value) {
//    return '"' + value + '"';
//  }).join(",");
//}

module.exports = {
  ContextManager: ContextManager,
  ResourceNode: ResourceNode
};
