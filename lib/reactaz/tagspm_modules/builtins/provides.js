/**
 * Created by sdawood on 14/06/2015.
 *
 * React@$ (Resource Active Tags) or just call me "^raz"
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
 0 1 2 3 4 5 6 7 8 9 10 $*/

var lo = require('lodash');
var jpql = require('../../../index');

var mergeIntoBasic = function(segments, target, source) {
  /*
  * source can come along for the ride to provide values, source can provide values for either absolute paths, or relative segments if it support scoping, e.g. local in-memory object or structured data REST API with actions and navigation links
  * */
  var createMock = function(key, value) {
    var _mock = {};
    if (undefined !== key) {
      _mock[key] = value ? value : true;
    }
    return _mock;
  };
  target = target ? target : createMock();
  var len = segments.length;
  var mock = createMock();
  segments.reduce(function(acc, key, index) {
      console.log(index, key);
      if ('$' === key) {
        return acc;
      }
      if (index === len - 1) {
        /* do we want to include a reference here to easy access, or not for the sake of purity? */
        console.log('leaf::acc', key, acc);
        acc[key] = true; //overwrites target leaf if any
      } else {
        lo.merge(acc, createMock(key, {})); //does not overwrite existing node reference
        console.log('key::acc::', key, acc);
        acc = acc[key];
      }
      return acc;
    }, mock);
  return lo.merge(target, mock);
}

var rightMock = function(target, nodes) {

}

var mergeIntoNaN = function(acc, node) {
//  var leafKey = node.path.slice().pop();
//  if (isNaN(leafKey)) {
//
//    acc[leafKey] = node.value;
//
//  } else {
//
//    var numericPathSegment = lo.takeRightWhile(node.path.slice(0, -1), function (value, index, array) {
//      return !isNaN(value);
//    });
//
//    var mockNode = {}, lenNumeric = numericPathSegment.length, nodeKey;
//    if (0 === lenNumeric) {
//      acc[leafKey] = node.value; //we are a long line of numbers or the index on parent level
//    } else {
//      node.path.slice(0, - lenNumeric).reduce(mergeIntoBasic, mockNode);
//      nodeKey = node.path.slice(- lenNumeric - 1, - lenNumeric);
//      console.log('nodeKey::to be replace::', nodeKey, acc[nodeKey]);
//      delete acc[nodeKey];
//      acc[nodeKey] = mockNode;
//      console.log('best-known-node::', nodeKey, acc[nodeKey]);
//    }
//  }
//  return acc[leafKey];
};

var $reducers = {
  '#basic': mergeIntoBasic,
  '#keysNaN': mergeIntoNaN
};

var RequirementProvider = function(source, path, contextManager) {
  return this.initialize.apply(this, arguments);
}

RequirementProvider.prototype.initialize = function(source, path, contextManager) {
  /**
   * https://blog.domenic.me/the-revealing-constructor-pattern/
   *
   * source is the data source to snapshot, currently an array or a stream of flat node results, possibly after passing through merges and flatmapAll, basically an iterable that supports reduce
   * path selects a subset of the nodes
   * once instantiated, path can't be changed
   */
  this.ctx = contextManager;
  this.path = path; //path is not accessible bia memorySubject Reference, but available for template to use
  this.source = new MemorySubject(source, path, contextManager); // the revealing constructor pattern flows naturally from explicit context passing rule of thumb
  return this.source;
}


/* Now is the time to put the flat result to object transformation to work */

var MemorySubject = function(nodes, path, contextManager) {
  this.ctx = contextManager;
  var thisPath = path;
  this.nodes = nodes;

  var passportControl = function(nodes, path) {
    /** @todo: Tag Passport Control:
      * take inspiration from https://lodash.com/docs#takeWhile
      * take nodes only included in the template-proxy
      * template should have a way to handle working with all
      *  literals, arrays and objects, and provide best guess,
      *  no guessing is used for * and ..* and a take(n) can be configured as default behavior
      *
      *
      * foreign nodes can optionally be filtered through routes
      * Routes are generated from the path nodes to open allowed set of path gates declaratively,
      * allowing through matching paths one at a time without comparing against all path at once to validate
      *
      * HINT: Passing in nodes, allows for update events to be communicated, where new nodes are a diff between the real data and the virtual data-ast*/

    /* It's your lucky day data minions, we will have to photocopy some ids though, may be some shape information, literal, array or object for proper future validation*/
    this.ctx.commit({ allowed: nodes.map(function(node) {return node.path; })}, '#passportControl()', thisPath); //new branch for the path
    console.log(this.ctx.head());
    /* @todo matching, identification, authentication, delay, buffering, debouncing, and all observable goodness is available here too in async mode*/
    return nodes;
  }

  this.provideAs = function(target, nodes, options) {
    console.log('provideAs', arguments);
    /**
     *
     * HotSwapping of active script code
     * re-constructs an object from the flat result nodes, possibly arriving over a stream or a subscription to an Observable into
     * a sub graph locally with a chance for templating and node transoformations, think rolling out a new version of an active tag script
     * We simply rebuild the whole sub graph from the path and the new nodes
     *
     * target is the sink where data is gonna be aggregated, hierarchical assignment in JSON words
     * nodes argument is optional, if not available, provider cached sources are used
     *
     * Foreign nodes can be passed through as well, being an updated version of the current nodes or a completely different piece of data from a foreign source
     * whatever the origin of this data is, we just reconstruct what we need, and provide a proxy
     *
     */
    var nodes = nodes ? passportControl(nodes) : this.nodes;
    /**
     *
     * Bad
     {
      "path": "$[x, y.yy, z, w.*]",
        "value": {
           "0": "W0", //.*.0
           "1": "w1", //.*.1
           "x": "X",
           "yy": "YY",
           "z": "Z"
        }
     }
    *
    * Better
    *
     {
      "path": "$[x, y.yy, z, w.*]",
        "value": {
           "w": { "0": "W0",
                  "1": "w1" },
           "x": "X",
           "yy": "YY",
           "z": "Z"
        }
     }
    *
    * We need to reduce path right till we find a non integer (a non index regex #future) and
    * reconstruct the branch of the union node
    * a recursive call will be used in beta
    * */
    console.log('nodes::', nodes);
    return {path: thisPath, value: unparse(target, nodes, options.keysNaN)};
  };


  this.commit = function(target, source) {
    /*
     * commit is for commitment, the memory subject is asked to commit itself to a new source, and feed into a new target
     * the self.nodes reference is overwritten, and only the path remains untouched, a subject is not reusable for different paths
     *
     * the subject should commit changes to a contextManager, in git speak
     * */
    this.nodes = passportControl(source);
    this.ctx.commit({self: { commit: true } }, '#commit'); // to same branch created by passport control
    return this.provideAs(target); //use the fresh this.nodes
  };

  this.template = function(alias, options) {
    /*@todo: support pluggable templating options
    *
    * builtin uses interpreter to walk the path AST and reconstruct active script placeholders with keys from the original path
    * unless alias map is provided, possibly for localizing the templates
    *
    * */
    return ["({", thisPath,"})"].join(); // a taste of tomorrow's lazy binding templates with path or tags
  };

  return this;
};

var unparse = function(acc, nodes, reducerTag) {
  var reducers = $reducers; //requires('./reducers', tagTokens) in hosted mode
  var $reducer = reducers[reducerTag];
  /* transforms flat result nodes of {path, value} into a POJO representing the original blueprint spatially*/
  console.log('unparse()::', nodes, $reducers)
  return nodes.reduce($reducer, acc);
};


module.exports = {
  RequirementProvider: RequirementProvider,
  MemorySubject: MemorySubject,
  unparse: unparse,
  $reducers: $reducers
};
