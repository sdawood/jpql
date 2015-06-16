/**
 * Created by sdawood on 16/06/2015.
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

var _ = require('lodash');

var unparse = function(nodes, accumulator, reducerTag) {
  reducerTag = reducerTag || '#basic'; // basic needs an upgrade
  var $reducer = $reducers[reducerTag]; //requires('./reducers', tagTokens) in hosted mode
  /* transforms flat result nodes of {path, value} into a POJO representing the original blueprint spatially*/
  console.log('unparse()::', reducerTag);
  return $reducer(nodes, accumulator);
};


var createMockLiteral = function(key, value) {
  var _mock = {};
  if (undefined !== key) {
    _mock[key] = value ? value : true;
  }
  return _mock;
};

var leafKey = function(node) {
  return node.path.slice().pop();
}


var leafKeys = function(nodes) {
  return nodes.map(function(node, index) {
    return node.path.slice().pop();
  });
}

var $paths = function(nodes, sort) {
  var paths = nodes.map(function(node, index) {
    return node.path;
  });

  if (sort) {
    paths = paths.map(function(path) { return path.join('.'); }).sort().map(function(pathstring) { return pathstring.split('.')})
  }
  return paths
}

var leftMock = function(nodes) {
  /*
   * source can come along for the ride to provide values, source can provide values for either absolute paths, or relative segments if it support scoping, e.g. local in-memory object or structured data REST API with actions and navigation links
   * */

  var segments = leafKeys(nodes),
    len = segments.length;

  var mock = createMockLiteral();
  segments.reduce(function(acc, key, index) {
    console.log(index, key);
    if ('$' === key) {
      return acc;
    }
    if (index === len - 1) {
      /* do we want to include a reference here to easy access, or not for the sake of purity? */
      console.log('leaf::acc', key, acc);
      _.merge(acc, createMockLiteral(key, true)); //overwrites target leaf if any
    } else {
      _.merge(acc, createMockLiteral(key, {})); //does not overwrite existing node reference
      console.log('key::acc::', key, acc);
    }
    acc = acc[key];
    return acc;
  }, mock);
  return mock;
}

var leftMerge = function(nodes, target, force) {
  /*
   * source can come along for the ride to provide values, source can provide values for either absolute paths, or relative segments if it support scoping, e.g. local in-memory object or structured data REST API with actions and navigation links
   * This function creates a deep structure with no support for branching, transforming [{path: x}, {path: y}, {path: z}] into {x: {y: {z: {}}}}, which is only matching the source structure in very special cases
   * */
  console.log('leftMerge', arguments);
  if (undefined === target) return {};
  force = force === undefined ? true : force; // we are a merger by default

  var segments = leafKeys(nodes),
    len = segments.length;

  segments.reduce(function(acc, key, index) {
    console.log(index, key);
    if ('$' === key) {
      return acc;
    }
    if (index === len - 1) {
      /* do we want to include a reference here to easy access, or not for the sake of purity? */
      console.log('leaf::acc', key, acc);
      var exists = key in acc;
      if (exists && !(force)) {
        console.log('skipping existing key::', key);
      } else { //all other 3 logical combinations
        _.merge(acc, createMockLiteral(key, true)); //sets if (!exists) or overwrites target leaf if exists && force
      }
    } else {
      _.merge(acc, createMockLiteral(key, {})); //does not overwrite existing node reference
      console.log('key::acc::', key, acc);
    }
    acc = acc[key];
    return acc;
  }, target);
  return target;
};

var levelsReducer = function(nodes, target, source) {
  /* SLIDING SUBJECTS DATA PLAYBACK */
  var createSubject = function () { var sequence = []; sequence.push.apply(sequence, arguments); return sequence; };//Rx.Subject;
  var levels = _.zip.apply(null, $paths(nodes)); //transpose array of paths into levels
  console.log(levels);
  var maxdepth = levels.length - 1;
  var slidingSubjects;
  /* sliding subject build aggregated Observable.Subject for each path.to.result,
   * maintaing result relationship with it's origin, regardless of the structure of it's rendering active-template
   * while the target manipulations are mashing things together with no sense of origin, but it's okay only in this level because we are creating the inMemorySubject for the reactaz liberary
  */
  levels.forEach(function(level, depth) {
    console.log('recude::level::', level);
    if (depth == 0) {
      // $root source, can optionally aggregate a merged stream of notifications from all leaves
      var $subjects =
      slidingSubjects = level.map(function(){ return target; });
      return;
    }
    level.forEach(function(key, index) {
      console.log('forEach::', key, index);
      if (key === undefined) return; //that path is done, but leaf would be set to leafSubject type currently #true
      var parent = slidingSubjects[index];
      console.log('slidingSubjects::', slidingSubjects, index, parent);

      var exists = key in parent;

      var isLeaf = depth == maxdepth || levels[depth + 1][index] === undefined; // is node leaf :)

      console.log('parent::', parent, 'key::', key, 'index::', index, 'exists::', exists, 'isLeaf::', isLeaf);
      var newnode;
      if (exists) {
        if (isLeaf ^ (true != parent[key])) { //leaf trying to overwrite an object, or object trying to overwrite a leaf at "key", in both cases we need a POJO
          console.log('CIRCULAR REFERENCE: upgrade data structure from leaf subject to merged subject');
          // isLeaf === false and parent[key] is true found a branch! we only convert literals left by a previous occurrence of "key" as a leaf, set by the previous pass
          newnode = {};
          newnode = createSubject(newnode); // new structure for an existing node (literalConstructor)
          parent[key].push(newnode);//reference stored in slidingSubjects
        } else if (isLeaf) {
          console.log('CIRCULAR REFERENCE::STRUCTURE SHARING::Observable Merging:: existing and structurally similar!', key, parent[key]);
          newnode = true;
          // we want to leave the terminated leaf source in place, and merge into it whatever comes on the branch subject
          // the local sync equivalent is appending to an array of values, otherwise we lose not only the structure within the target, but also the number of expected values === number of terminal leaf nodes (Subjects)
          parent[key].push(createSubject(newnode)); //
          // we still have reference to our own subject (newnode), but where to store it? slidingSubjects aggregates it into the parent subject.
        }
      } else {
        newnode = isLeaf ? true : {};
        //terminal data port, or an intermediate node
        // the new node is gonna end up a leaf or a branch, we don't know yet!
        console.log('NEW NODE:', depth, index, parent, key, newnode);
        parent[key] = createSubject(newnode);
      }

//      if (!isLeaf) { // this branch is gonna have undefined keys from here on, store the reference to the newnode Subject in slidingSubjects for future reference
        slidingSubjects[index] = newnode; // advance level
//      }

    });
  });
  return target;
};

/* ^^^ PLAYBACK READER or is it a breadth first traversal, left to right, with existing nodes connected to parents and undefined disappears */

var rightMock = function(nodes, target) {

}

var mergeIntoNaN = function(acc, node) {
//  var leafKey = node.path.slice().pop();
//  if (isNaN(leafKey)) {
//
//    acc[leafKey] = node.value;
//
//  } else {
//
//    var numericPathSegment = _.takeRightWhile(node.path.slice(0, -1), function (value, index, array) {
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
}





/**
 * List of capabilities and current state of implementation
 *
 *        mock       merge      walk-source
 * left   #          #          x
 * right  x          x          x
 *
 */

var $reducers = {
  '#level': levelsReducer,
  '#left': leftMock,
  '#mock': leftMock,
  '#basic': leftMerge,
  '#right': rightMock,
  '#rightMock': undefined,
  '#rightMerge': undefined
};

/* CONVENTION: reference declaration is done via '#requirement', think #include
 * The realized object is always named $requirement, you have just realized/monitized your # => $, getting one step closer to $@
 * When an active context is nested within another, it is fully qualified path is $root::node1::branch1::leaf
 * scope inheritance is applied from $root down to leaf, unless filtered by a "pause-context" plug (#pauseContext => or not {some script})
 * context data updates (context carries the payload) would not go past that point, this node is effectively a sink-hole for context provider stream
 *
 * #  declare it
 * $  realize it
 * :: access it
 *
 * */
var $filters = {
  '#keysNaN': function(key) { return isNaN(key); }
}



module.exports = {
  unparse: unparse,
  $reducers: $reducers
};