var assert = require('chai').assert;
var jpql = new require('../');
var data = require('./data/deep-store-active.json');

suite('jsonpathql#active-script-operations', function() {

  test('active script expression operations ({}), default is GET', function() {
    var results = jpql.nodes(data, '$..book[({@.length-1}).title]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with splat results behavior (*{}), default is GET', function() {
    var results = jpql.nodes(data, '$..book[(*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with splat results behavior is equivalent to promoting the results into list of scripts (*{}), default is GET', function() {
    var results = jpql.nodes(data, '$..book[({@.length-1}),({@.length-2})].title');
    assert.deepEqual(results, [false]);
  });

  test('[async] active script expression operations with take(n) splat results behavior (#(n)*{}), default is GET', function() {
    var results = jpql.nodes(data, '$..book[(@(2)*{[@.length-1,@.length-2]}).title]');
    assert.deepEqual(results, [false]);
  });


  test('active script expression operations with argument ({}):({}), default "~" (POST or PUT)', function() {
    var results = jpql.nodes(data, '$..book[?(@.title===null)].({title}):({"Not Available"})');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}):({[]}) and array value, default "~" (POST or PUT), implementation should concat or push value to existing array if any', function() {
    var results = jpql.nodes(data, '$..book[?(@.title===null)].({tags}):({["Not Available"]})');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument (+{}):({}), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal', function() {
    var results = jpql.nodes(data, '$..book[?(@.title===null)].(+{tags}):({["Not Available"]})');
    assert.deepEqual(results, [false]);
  });

 test('[computed active script argument] active script expression operations with computed active script argument  (+{}):(={ @ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(+{fullName}):(={' +
      '@.firstName + " " + @.lastName' +
      '})');
    assert.deepEqual(results, [false]);
  });

  test('[merge computed active script argument] active script expression operations with computed active script argument  (&{}):(={ @ }), merge "&" (PUT), implementation should merge {key: value} into partial, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(&{fullName}):(={' +
      '@.firstName + " " + @.lastName' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[async computed nested $ path result] active script expression operations with computed nested path argument with reference to true root (+{}:@={ $ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(+{fullName}):(@={' +
      '$..book[?(@.fulleName===null)][firstName, lastName]' +
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[async subscribe to nested @$ path result] active script expression operations with computed nested path argument with reference to script context "@$" (+{}):(=@{ @$ }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(+{fullName}):(@(1)={@$[firstName, lastName]})');
    assert.deepEqual(results, [false]);
  });

 test('parse nested path with context root reference "@$" and root reference "$", used by active script handler implementation for path lazy evaluation', function() {
    var results = jpql.nodes(data, '@$.profile[$.language["default"]]');
    assert.deepEqual(results, [false]);
  });

 test('[async subscribe to nested path component == active script result] active script expression operations with computed nested active script expression with reference to parent script context value (+{}):(@={ ({@@}) }), add "+" (POST), implementation should concat or push value to existing array if any, warn or err about overwriting existing value literal, and return merged sources', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(#tag+{fullName}):(@={' +
      '@@.firstName + " " + @@.lastName' + //@@ can be $branch or $node, implementation is free to chose
      '})');
    assert.deepEqual(results, [false]);
  });

 test('[async subscribe to component via active script optation take (10) (@(n){@})', function() {
    var results = jpql.nodes(data, '$..book[?(@.discount)].(@(10){title})');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operations with argument ({}), set "=" (PUT), set overwrites existing key/value, implementation should warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?(@.title===null)].(={tags}):({"Not Available"})');
    assert.deepEqual(results, [false]);
  });

  test('active script expression operation without argument ({}), remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book.(-{fullName})');
    assert.deepEqual(results, [false]);
  });


  test('filter expression followed by delete expression operation without argument ({}), key remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)][(-{fullName})]');
    assert.deepEqual(results, [false]);
  });

  test('filter expression followed by delete expression operation without key (-{}), sink hole "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)][(-{})]');
    assert.deepEqual(results, [false]);
  });

  test('deleting filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?-{@.fulleName===null}]');
    assert.deepEqual(results, [false]);
  });

  test('[X] parse mapping script, implementation should not use script return result to access into partial and return the script result as is', function() {
//    var results = jpql.nodes(data, '$..book[?(@.fulleName===null)].(=>{"Not Available!"})');
    var results = jpql.parse('$..book[?(@.fulleName===null)].(=>{"Not Available!"})');
    assert.deepEqual(results, [false]);
  });

  test('parse mapping script, mergeAll (value or default if value is null or key does not exist) scenario, implementation chose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.nodes(data, '$..book[fullName, ?(this.fulleName===null).(=>{"Not Available"})]');
    assert.deepEqual(results, [false]);
  });

 test('parse mapping script, for this key return that value, key has to exist in the data source, Mocking and Defaults', function() {
    var results = jpql.nodes(data, '$..book.reviews.(#{details}):(#retry @(10) &=> {"Temporary Not Available"})');
    assert.deepEqual(results, [false]);
  });

 test('[Y] leaf mapping script, mergeAll value or default scenario, implementation can choose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.nodes(data, '$..book.*.author[.profile[(=>{@.fullName ? fullName : "Not Available"})]]');
    assert.deepEqual(results, [
      {
        "path": [
          "$",
          "store",
          "book",
          0,
          "author",
          0,
          "profile",
          "Not Available"
        ],
        "value": true
      },
      {
        "path": [
          "$",
          "store",
          "book",
          1,
          "author",
          0,
          "profile",
          "Not Available"
        ],
        "value": true
      },
      {
        "path": [
          "$",
          "store",
          "book",
          2,
          "author",
          0,
          "profile",
          "Not Available"
        ],
        "value": true
      },
      {
        "path": [
          "$",
          "store",
          "book",
          3,
          "author",
          0,
          "profile",
          "Not Available"
        ],
        "value": true
      }
    ]);
  });

 test('[X] key:value map/reduce provider script (Data LEGO filler), mergeAll value or default scenario, implementation can choose to bind the script this reference to the partial instead of using "@', function() {
    var results = jpql.nodes(data, '$..book.*.author[.profile[?(!@.fullName).(=>{"$fullName"}):(=>{"Not Available"})]]');
    var ast = jpql.parse('$..book.*.author[.profile[?(!@.fullName).(=>{"$fullName"}):(=>{"Not Available"})]]');
    assert.deepEqual(results, [
      {
        "path": [
          "$",
          "store",
          "book",
          0,
          "author",
          0,
          "profile",
          "name",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          0,
          "author",
          0,
          "profile",
          "twitter",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          1,
          "author",
          0,
          "profile",
          "name",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          1,
          "author",
          0,
          "profile",
          "twitter",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          2,
          "author",
          0,
          "profile",
          "name",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          2,
          "author",
          0,
          "profile",
          "twitter",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          3,
          "author",
          0,
          "profile",
          "name",
          "$fullName"
        ],
        "value": "Not Available"
      },
      {
        "path": [
          "$",
          "store",
          "book",
          3,
          "author",
          0,
          "profile",
          "twitter",
          "$fullName"
        ],
        "value": "Not Available"
      }
    ]);
  });

  test('parse active script operation call receiving literal arguments', function() {
    var results = jpql.nodes(data, '$.store.book.(=>{@.push}):({ {"4": {title: "New Book"} } })');
    assert.deepEqual(results, [false]);
  });

  test('parse active script operation call receiving computed argument', function() {
    var results = jpql.nodes(data, '$.store.(#reminder @(3) =>{"Only" + $offercount() + "left on offer!"}):(#offerCount +=>{$$..book.onOffer.(#offerCount +=>{@.length})'); // length | $offerCount via embedded path | $reminder 3 times
    assert.deepEqual(results, [false]);
  });

  test('parse active script operation call receiving computed argument via consuming a thiscribit', function() {
    var results = jpql.nodes(data, '$.store.(#reminder @(3) =>{"Only" + $offercount() + "left on offer!"}):(#offerCount ==>{})'); // length | $offerCount source piping #source ==> | $reminder 3 times
    assert.deepEqual(results, [false]);
  });

  test('tag component for later reference in the path and allowing access to individual sources before they get merged by the union expression', function() {
    var results = jpql.nodes(data, '$..category[comedy.(#comedy), (#action{action})].(@(10))'); // expressions key.(#tag) and (#tag{script returning key}) are interchangeable
    assert.deepEqual(results, [false]);
  });

  test('empty tags generate a tag that is a function of the key, path and value. details are left to the implementation.', function() {
    var results = jpql.nodes(data, '$..category[comedy.(#comedy @(10)), (#action @(10) {action})]');
    assert.deepEqual(results, [false]);
  });

  test('empty tags generate a tag that is a function of the key, path and value. details are left to the implementation.', function() {
    var results = jpql.nodes(data, '$..category[comedy.(#), (#{action})].(@(10))'); // expressions key.(#tag) and (#tag{script returning key}) are interchangeable
    assert.deepEqual(results, [false]);
  });

  test('subscribe to path component updates, take top 10 splat action titles via active script operation "@(10)"', function() {
    var results = jpql.nodes(data, '$..category.sorted.(*{action, comedy}).title.(@(10))');
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to path component updates, take top 10 from preceding partial', function() {
    var results = jpql.nodes(data, '$..category.sorted.(@(10))');
    assert.deepEqual(results, [false]);
  });



  test('subscribe to path component updates, take top 10 action titles via active script operation "@(10)"', function() {
    var results = jpql.nodes(data, '$..category.sorted.(@(10){action}).title');
    assert.deepEqual(results, [false]);
  });

  test('async: tag and asyncTake path components', function() {
    var results = jpql.nodes(data, '$..(@(10)).category.(#tagSorted).sorted');
    assert.deepEqual(results, [false]);
  });

  test('delete operation path component', function() {
    var results = jpql.nodes(data, '$..category.(-).sorted'); // equivalent to '$..category.sorted.(-)'
    assert.deepEqual(results, [false]);
  });

  test('Combo delete operation path component and add active script epxression', function() {
    var results = jpql.nodes(data, '$..category[(-).sorted,(+{reverseSorted}):(=>{@.reverse()})]'); //one off provider, equivalent to $..category[(-).sorted,(+=>{@.reverse()})]
    assert.deepEqual(results, [false]);
  });

  test('all aboard active script expression tag, take, operation, map and reduce', function() {
    var results = jpql.nodes(data, '$..category[(-).sorted,(#reverse @(10) - {reverseSorted}):(#reversed @ => {@.reverse()})]');
    assert.deepEqual(results, [false]);
  });

  test('all aboard active script expression tag, take, operation, map and reduce', function() {
    var results = jpql.nodes(data, '$..category[(-).sorted,(# @ - {reverseSorted}):(#reversed @(10) => {@.reverse()})]');
    assert.deepEqual(results, [false]);
  });


  test('pipes ending with a throttling filter', function() {
    var results = jpql.nodes(data, '$..category.sorted.(#description =>{"Movie Category: {@.name, @,rating}"}).(@(1000)).(#throttle =>{[$login($username, $password), $taz(this), $register(this, 100s)]})');
    assert.deepEqual(results, [false]);
  })
})

suite('jsonpathql#active filter component', function() {
  test('async: subscribe to filtered path component updates', function() {
    var results = jpql.nodes(data, '$..book.?#tagPending{@.title===null}');
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to filtered path component updates, take 10', function() {
    var results = jpql.nodes(data, '$..book.? #error @(10) {@$.title===null}');
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to filtered path component updates with tagged argument passing, take 10', function() {
    var results = jpql.nodes(data, '$..book.?@(10){$title==="mybook"}:(#title @(1) {@.title.toLowerCase()})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to filtered path component updates without splatting the list of tagged arguments, implementation should call the filter for each, take 10', function() {
    var results = jpql.nodes(data, '$..book.?@(10){$lang in ["english", "french"]}:(#primarySecondaryLang @(1) {[@.language.primary.toLowerCase(), @.language.primary.toLowerCase()]})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
    assert.deepEqual(results, [false]);
  });

  test('async: subscribe to filtered path component updates with splatting list of tagged arguments, implementation should assign the arguments array to an injected variable $tag, take 10', function() {
    var results = jpql.nodes(data, '$..book.?<= #englishFromAmazon @(10) +=>{"english" in $lang}:(#primarySecondaryLang @(1) *=>{[$escapeAll(@.language.primary.toLowerCase()), $escapeAll(@.language.primary.toLowerCase())]})'); // equivalent to '$..book.?@(10)(@.title.toLowerCase()=="mybook"), often with a more beefy filter lambda
    assert.deepEqual(results, [false]);
  });

  test('[Structure Matching] positive lookahead filter expression, shorthand for filter expression with ANDed or ORed @.key expressions', function() {
    var results = jpql.nodes(data, '$..book[?={@}].discount'); //equivalent to $..book[?(@.discount)]' but effectively uses the next component as a structural template to mach the current object against
    assert.deepEqual(results, [false]);
  });

  test('[Structure Matching] negative lookahead filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?!{@}][invalid, deprecated, obsolete]'); //equivalent to $..book[?(!@.invalid && !@.deprecated && !@.onbsolete )]
    assert.deepEqual(results, [false]);
  });

  test('[Structure Matching] positive lookbehind filter expression, shorthand for filter expression with ANDed or ORed @.key expressions', function() {
    var results = jpql.nodes(data, '$..book[?<={@}].discount'); //equivalent to $..book[?(@.discount)]' but effectively uses the previous component as a structural template to mach the current object against
    assert.deepEqual(results, [false]);
  });

  test('[Structure Matching] negative lookbehind filter expression, shorthand for filter expression followed by delete expression operation without key or (-{}), partial remove "-" (DELETE), implementation is free to chose to warn or err if not found', function() {
    var results = jpql.nodes(data, '$..book[?<!{@}][invalid, deprecated, obsolete]'); //equivalent to $..book[?(!@.invalid && !@.deprecated && !@.onbsolete )]
    assert.deepEqual(results, [false]);
  });

  test('regex path component', function() {
    var results = jpql.nodes(data, '$..book.category..({/^[aA]ction/g})');
    assert.deepEqual(results, [false]);
  });
})
