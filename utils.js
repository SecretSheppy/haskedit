'use strict';

/**
 * Prepend to array (same way as done in golang).
 *
 * @param {any} value the value to prepend to the array
 * @param {[any]} array the array to prepend to
 * @returns {[any]} the new array
 */
function prepend(value, array) {
    let newArray = array.slice();
    newArray.unshift(value);
    return newArray;
}

/**
 * Checks if a string is a valid integer.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isInt(value) {
    let num = parseInt(value, 10)
    return !isNaN(num) && num.toString() === value;
}

module.exports = exports = {
    prepend,
    isInt
}