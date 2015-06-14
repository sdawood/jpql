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
var RequirementProvider = require('./provides').RequirementProvider;
var jpql = require('../../../index')

/* let's spare a cycle on this level, RequirmentProviderwould evaluate the path, if the value is a single string, it is considered a path and is then used to query the tagscripts*/
// and not use provides: new RequirementProvider(require('./builtins'), '$.provides'), and grab all tagscripts

var path = '$.tagscripts';

module.exports = {
  $path: path,
  $provider: function(ctx){
    return new RequirementProvider(
      jpql.nodes(require('./builtins'), path),
      path,
      ctx);
  }, //perform operation only when a ctx is available
  $recipe: require('./package.json') //don't reinvent the wheel, RecipeProvider queries package.json for info
}