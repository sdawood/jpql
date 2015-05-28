module.exports = {
  slice: slice,
  toInteger: integer
};

var oldSlice = function(arr, start, end, step) {

  var len = arr.length;

  if (step === 0) throw new Error("step cannot be zero");
  step = step ? integer(step) : 1;

  // normalize negative values
  start = start < 0 ? len + start : start;
  end = end < 0 ? len + end : end;

  // default extents to extents
  start = integer(start === 0 ? 0 : !start ? (step > 0 ? 0 : len - 1) : start);
  end = integer(end === 0 ? 0 : !end ? (step > 0 ? len : -1) : end);

  // clamp extents
  start = step > 0 ? Math.max(0, start) : Math.min(len, start);
  end = step > 0 ? Math.min(end, len) : Math.max(-1, end);

  // return empty if extents are backwards
  if (step > 0 && end <= start) return [];
  if (step < 0 && start <= end) return [];

  var result = [];

  for (var i = start; i != end; i += step) {
    console.log('slicing()::', start, end, step, i);
    if ((step < 0 && i <= end) || (step > 0 && i >= end)) break;
    result.push(arr[i]);
  }

  return result;
}

function integer(val) {
  return String(val).match(/^[+-]?[0-9]+$/) ? parseInt(val) :
    Number.isFinite(val) ? parseInt(val, 10) : 0;
}

/**
 * Implementation of Python's `slice` function... Get a cloned subsequence
 * of an iterable (collection with length property and array like indexs).
 * Will handle both strings and array(likes).
 *
 * @param {Array|String} collection
 * @param {None|Integer} start First index to include. If negative it will be indicies from end
 (i.e. -1 is last item). Omit or pass 0/null/undefined for 0.
 * @param {None|Integer} end Last index to include. If negative it will be indicies from end
 (i.e. -1 is last item). Omit or pass null/undefined for end.
 * @param {None|Intger} step Increments to increase by (non-1 will skip indicies). Negative values
 will reverse the output.
 * @returns {Array|String} sliced array
 *
 * @example
 * var list = [1, 2, 3, 4, 5]
 * slice(list) // => [1, 2, 3, 4, 5]
 * slice(list, 2) // => [3, 4, 5]
 * slice(list, 2, 4) // => [3, 4]
 * slice(list, -2) // => [4, 5]
 * slice(list, null, -1) // => [1, 2, 3, 4]
 * slice(list, null, null, 2) // => [1, 3, 5]
 * slice(list, null, null, -2) // => [5, 3, 1]
 * slice("kids a devil I tell ya", 7, -10, -1) // => "lived"
 */
function badSlice(collection, start, end, step) {
  var length = collection.length,
    isString = typeof collection == "string", // IE<9 have issues with accessing strings by indicies ("str"[0] === undefined)
    result = [];
  if (isString) {
    collection = collection.split("");
  }
  if (start === null) {
    start = 0;
  } else if (start < 0) {
    start = length + start;
  }
  if (end === null || end > length) {
    end = length;
  } else if (end < 0) {
    end = length + end;
  }
  if (step === null) {
    step = 1;
  } else if (step === 0) {
    throw Error("Slice step cannot be zero");
  }
  if (step > 0) {
    for (; start < end; start += step) {
      result.push(collection[start]);
    }
  } else {
    for (end -= 1; start <= end; end += step) {
      result.push(collection[end]);
    }
  }
  // Return a string for input strings otherwise an array
  return isString ? result.join("") : result;
}

function slice(array, from, to, step) {
  if (step === 0) throw Error("Slice step cannot be zero");
  console.log('slice::', from, to, step);
  var isString = typeof array === "string"; // IE<9 have issues with accessing strings by indicies ("str"[0] === undefined)
  if (isString) {
    array = array.split("");
  }
  var len = array.length;
  var result = isString ? "" : [];
  if (from === null) from = step < 0 ? len : 0;
  if (to === null) to = step < 0 ? 0 : len;
  console.log('slice::defaulted::', from, to, step);
  if (!step) {
    result = array.slice(from, to);
    return isString ? result.join("") : result
  }
  // normalize negative values
  from = from < 0 ? len + from : from;
  to = to < 0 ? len + to : to;
  console.log('slice::normalized::', from, to, step);
  // return empty if extents are backwards
  if (step > 0 && to <= from) return result;
  if (step < 0 && from <= to) return result;
  if (from < to) {
    console.log('equivalent::slice::', from, to);
    result = Array.prototype.slice.call(array, from, to);
  } else {
    // step must be -ve here
    /**
     * >>> l[-2:-4:-1]
     * [4, 3]
     * is now normalized to:
     * >>> l[3:1:-1]
     * [4, 3]
     * is not equivalent to the reverse of:
     * >>> l[1:3:1]
     * [2, 3]
     * but is equivalent to the reverse of:
     * >>> l[2:4:1]
     * [3, 4]
     * if from < to and step < 0
     * from = to + 1
     * to = from + 1
     * result = Array.prototype.slice(from, to)
     * result = result.reverse()
     * */
    var _from = from;
    from = +to + 1;
    to = +_from + 1;
    console.log('equivalent::slice::', from, to);
    result = Array.prototype.slice.call(array, from, to);
  }
  if (step < 0) result.reverse();
  step = Math.abs(step);
  if (step > 1) {
    var final = [];
    for (var i = result.length - 1; i >= 0; i--) {
      (i % step === 0) && final.push(result[i]);
    };
    final.reverse();
    result = final;
  }
  // Return a string for input strings otherwise an array
  return isString ? result.join("") : result;
}