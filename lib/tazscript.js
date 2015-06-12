/*
  REACTAZ (Resource Active Tags) or just call me "raz"
   ^
  10   Meet Reac Taz
   9
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
* */


function TaZcript(name, scriptOrPath, include) {
  this.initialize.apply(this, arguments);
};

TagScript.prototype.initialize = function(name, scriptOrPath, include, contextManager) {
  this.name = name;
  this.script = include ? this.include(scriptOrPath) : scriptOrPath;
  this.contextManager = contextManager;
};



module.exports.TaZcript = TaZcript;
