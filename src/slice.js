module.exports = {
    slice: slice,
    toInteger: integer
};

function integer(val) {
    return String(val).match(/^[+-]?[0-9]+$/) ? parseInt(val, 10) :
        Number.isFinite(val) ? parseInt(val, 10) : 0;
}

/**
 * Implementation of Python's `slice` function... Get a cloned subsequence
 * of an iterable (collection with length property and array like indexs).
 * Will handle both strings and array.
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
 * const list = [1, 2, 3, 4, 5]
 * slice(list) // => [1, 2, 3, 4, 5]
 * slice(list, 2) // => [3, 4, 5]
 * slice(list, 2, 4) // => [3, 4]
 * slice(list, -2) // => [4, 5]
 * slice(list, null, -1) // => [1, 2, 3, 4]
 * slice(list, null, null, 2) // => [1, 3, 5]
 * slice(list, null, null, -2) // => [5, 3]
 */

function slice(array, from, to, step) {
    if (step === 0) throw Error("Slice step cannot be zero");
    const isString = typeof array === "string"; // IE<9 have issues with accessing strings by indicies ("str"[0] === undefined)
    if (isString) {
        array = array.split("");
    }
    const len = array.length;
    let result = [];
    const empty = isString ? "" : [];
    if (from === null) from = step < 0 ? len : 0;
    if (to === null) to = step < 0 ? 0 : len;
    if (!step) {
        result = array.slice(from, to);
        return isString ? result.join("") : result;
    }
    // normalize negative values
    from = from < 0 ? len + from : from;
    to = to < 0 ? len + to : to;
    // return empty if extents are backwards
    if (step > 0 && to <= from) return empty;
    if (step < 0 && from <= to) return empty;
    if (from > to) {
        const _from = from;
        from = +to + Math.abs(step);
        to = +_from + Math.abs(step);
    }
    // since from, to are normalized, a good old efficient for loop can do the slice and the stepping in one pass with abs(step), negative step reverses the result
    for (let i = from; i < to; i += Math.abs(step)) {
        if (i >= len) break;
        if (i % step === 0) result.push(array[i]);
    }
    if (step < 0) result.reverse();
    // Return a string for input strings otherwise an array
    return isString ? result.join('') : result;
}
