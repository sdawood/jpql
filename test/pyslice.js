var assert = require('assert');
var slice = require('../lib/slice').slice;
var list = [1, 2, 3, 4, 5]

//
//  * slice(list) // => [1, 2, 3, 4, 5]
//  * slice(list, 2) // => [3, 4, 5]
//  * slice(list, 2, 4) // => [3, 4]
//  * slice(list, -2) // => [4, 5]
//  * slice(list, null, -1) // => [1, 2, 3, 4]
//  * slice(list, null, null, 2) // => [1, 3, 5]
//  * slice(list, null, null, -2) // => [5, 3, 1]
//  * slice("kids a devil I tell ya", 7, -10, -1) // => "lived"
//

suite('pyslice', function() {

  test('no args yields a copy', function () {
    assert.deepEqual(slice(list), list);
  });

  test('to==null defaults to length', function () {
    assert.deepEqual(slice(list, 2), [3, 4, 5]);
  });

  test('from, to', function () {
    assert.deepEqual(slice(list, 2, 4), [3, 4]);
  });

  test('to == null default to length, -ve from', function () {
    assert.deepEqual(slice(list, -2), [4, 5]);
  });

  test('from == null defaults to 0, -ve to', function () {
    assert.deepEqual(slice(list,null, -1),  [1, 2, 3, 4]);
  });

  test('+ve step, from == null defaults to 0, to == null defaults to length ', function () {
    assert.deepEqual(slice(list, null, null, 2), [1, 3, 5]);
  });

  test('to == null defaults to length, step > 1', function () {
    assert.deepEqual(slice(list, 2), [ 3, 4, 5 ]);
  });

  test('-ve step, from > to', function () {
    assert.deepEqual(slice(list, 4, 2, -1), [5, 4]);
  });

  test('from == null defaults to length,  to == null defaults to 0, -ve step ', function () {
    /**
     * slice:: null null -2
     * slice::defaulted:: 5 0 -2
     * slice::normalized:: 5 0 -2
     * equivalent::slice:: 1:6:2.reversed()
     * */
    assert.deepEqual(slice(list, null, null, -2), [5, 3]);
  });

  test('slice with +from, -to', function () {
    assert.deepEqual(slice("kids a devil I tell ya", 7, -10, 1), "devil");
  });

  test('slice meaningless extent, normalize to 7, 12, -1', function () {
    assert.deepEqual(slice("kids a devil I tell ya", 7, -10, -1), '');
  });

  test('slice meaningless extents by -ve step', function () {
    assert.deepEqual(slice(list, -4, -2, -1), []);
  });

  test('slice -from < -to, +ve step', function () {
    assert.deepEqual(slice(list, -4, -2, 1), [2, 3]);
  });

  test('slice -from < -to by -ve step', function () {
    assert.deepEqual(slice(list, -2, -4, -1), [4, 3]);
  });

  test('-2, -4, -1 normalized to 3, 1, -1', function () {
    assert.deepEqual(slice(list, 3, 1, -1), [4, 3]);
  });

  test('slice meaningless extents by +ve step', function () {
    assert.deepEqual(slice(list, -2, -4, 1), []);
  });

})