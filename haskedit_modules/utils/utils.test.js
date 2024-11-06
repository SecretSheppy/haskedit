'use strict';

const utils = require('./utils');

test('prepends a to array [\'b\', \'c\']', () => {
    expect(utils.prepend('a', ['b', 'c'])).toEqual(['a', 'b', 'c']);
});

test('prepends [1, 2, 3] to [4, 5, 6]', () => {
    expect(utils.prepend([1, 2, 3], [4, 5, 6]))
        .toEqual([[1, 2, 3], 4, 5, 6]);
});

test('determines that "1" is a string which is an integer', () => {
    expect(utils.stringIsInt("1")).toBe(true);
});

test('determines that "abc" is a string which is not an integer', () => {
    expect(utils.stringIsInt("abc")).toBe(false);
});
