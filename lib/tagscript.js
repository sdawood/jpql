/*
   React@$ (Resource Active Tags) or just call me "^raz"
   *
   ^         IT GO
  10         HOME!
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

/* That's it, this is my demo */
/* this is also the shell welcome when you connect to a node's stream :) default console size is 12*12 = 144 node :), no pun intended, the demo mandated it, call it fate */
/* Path can be generated from spread sheet, no need to count spaces */

/* Presentation
* In the begining there was $.something === undefined
*
* #JavaScript and the like
* then there was $.first.second[third][0]
* then there was $.first.second[3:6][0]
*
* But there was not $.first.second[3:6].name, you will have to go in loops to get'em
*
* then there was $..second[3:6].name, and that was good, #jsonpath is brilliant
*
* And can be aggregated, within limits #jsonpath-object-transform
*
* But that is not worth much when it compares to Blueprinting uses cases or #TOSCA/CloudFormation uses cases
*
* then #Falcor presented a sexier syntax to solve a pre-determined simple data access problem, at scale, and #Facebooks #GraphQl teased everyone about Graphs
*
* So this came to be #JSONPATHQL
*
* $..second[3:6][name.(=>{@.toUpperCase()}), description]
* $..second[3:6][name.?({@.name=="Joe"}), description]
*
* But why not this also #JSONPATHQL
*
* $..second[3.name, 6.description]
* And a short hand to access elements by index, awesome with list shaped data
*
* $..list[.[name, description], .[description], 3:[shortName]
*
* to return 0.name, 0.description, and same for 1, and from 3 to the end only get shortName
*
* #DataTaz
* And this node scripts evolved into Active Scripts
* And Active Filters came to be
*
* and tagging an active node was possible
* #crossTag
* #dataregex
*
* Then everything went Async, and path parsing and operations are separate from data access and data orchestration
* and #ReactAz came to be
* and activeTaz were born
*
* and requirethis and requirethat got popular
*
* and data access applications were never written the same
*
*
* */

/*
* In general, adding a node, adds the node to the Proxy Model only, while setting a node, sets it in the data source, similartly deletes pop a key from the data souece, which require write/delete permissions respectively
* Mapper scripts do not mutate the data source, but can register an active node that produces the mapping (+=>)
*
*
*
* (    {} ) : (    {} )    GET evaluates script as key into the origin model, secondary
* (*   {} ) : (    {} )    SPLAT, similar to GET evaluates script as key into the origin model and evaluates results as a subscript union partial value, if individual result path would be masked, an evidence would be committed to the logs
* (=   {} ) : (    {} )    PUT, reduce script result is pushed to an existing array if any, assigned as a key into an object; doesn't warn about overwriting literal values, warns if key doesn't exist
* (~   {} ) : (    {} )    POST of PUT, result is pushed to an existing array if any, assigned as a key into an object; doesn't warn about overwriting literal values or if key doesn't exist
* (&   {} ) : (    {} )    POST of PUT, result is *merged* into the partial object
* (+   {} ) : (    {} )    POST, assigns the value under an existing key, overwriting any existing values, or creates the key if doesn't exist
* (-   {} ) : (    {} )    DELETE, pops and returns the key, this is the last time you see this node, better use the opportunity
* (  =>{} ) : (    {} )    Key Mapper Provide scripts performs a mapping using partial, key, value and context as input, or consuming a secondary script result as argument, e.g. active slice implementation. The script results is returned as is or passed as arguments to an existing #tazcript  and not used to access the partial.
* (    {} ) : (  =>{} )    Value Mapper Provide scripts performs a mapping using partial, key, value and context as input, the rest from the map script is passed to the reduce script context as * where it is further reduced/mapped
* (* =>{} ) : (    {} )    Mapper Splatting Provider script performs a mapping using partial key, value and context as input, or consuming a secondary script result as argument.
* (= =>{} ) : (    {} )    PUT Provider script updates the script expression, overwriting any previous aggregations
* (+ =>{} ) : (    {} )    Mapper Provider scripts do not mutate the data source, but can register an active node that produces the mapping
* (- =>{} ) : (    {} )    Deletes a mapper script
* (~ =>{} ) : (    {} )    POST or PUT a mapper script, sets a script if not existing, merges into existing ones
* (& =>{} ) : (    {} )    Merges a new source into the mapper's source, doubling the fun, secondary scripts provides the secondary source, warns if key doesn't exist
*
* excution order goes as reduce(map(args)) if neither scripts are a provider
*                    map           reduce             effective
* isProvider                                          *reduce(args, map(args))
* isProvider         =>                               [map(args), *map(args, reduce(args))]
* isProvider                        =>                [reduce(args), *reduce(args, map(args))]
* isProvider         =>             =>                [map(args), map(args, reduce(args)), reduce(args), *reduce(args, map(args))]
*
* "*" === default behaviour with initial configuration
* */


function TagScript(component, contextManager) {
  this.initialize.apply(this, component, contextManager);
};

TagScript.prototype.initialize = function(component, contextManager) {
  this.ast = component;
  this.ctx = contextManager;
};

TagScript.prototype.evaluate = function(from, args, to, ctx) {
  /* #!/TAZ */
  var evaluate = require('static-eval');


};

TagScript.prototype.block = function(from, own, args, to, ctx) {
  var result = from ? own.concat(from) : own;
  result = args ? result.concat(args) : result;
  result = to? to.concat(result) : result;
  return result;
};

TagScript.prototype.map = function(from, args, to, ctx) {
  var own = ['map-own-result'];
  return this.block(from, own, args, to, ctx)
};


TagScript.prototype.reduce = function(from, args, to, ctx) {
  var own = ['reduce-own-result'];
  return this.block(from, own, args, to, ctx)
};





module.exports = {
  TagScript: TagScript
};
