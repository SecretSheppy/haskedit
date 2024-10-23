'use strict';

const fr = require('./find-and-replace');

test('finds hello at (0, 0) in "hello world"', () => {
    expect(JSON.stringify(fr.find('hello world', 'hello')))
        .toBe(JSON.stringify([{index: 0, coordinates: {x:0, y:0}}]));
});

test('finds hello at (1, 0) in "\nhello world"', () => {
    expect(JSON.stringify(fr.find('\nhello world', 'hello')))
        .toBe(JSON.stringify([{index: 1, coordinates: {x:1, y:0}}]));
});

test('finds hello at (0, 3) in "abchello world"', () => {
    expect(JSON.stringify(fr.find('abchello world', 'hello')))
        .toBe(JSON.stringify([{index: 3, coordinates: {x:0, y:3}}]));
});

test('replaces hello with goodbye in "hello world"', () => {
    let main = 'hello world';
    let keyword = 'hello';
    let replacement = 'goodbye';
    let result = 'goodbye world';
    let occurrences = fr.find(main, keyword);

    expect(occurrences.length).toBe(1);

    expect(fr.replace(occurrences[0], main, keyword, replacement)).toBe(result);
});

test('replaces hello with goodbye in "\n\n\nhello\n world"', () => {
    let main = '\n\n\nhello\n world';
    let keyword = 'hello';
    let replacement = 'goodbye';
    let result = '\n\n\ngoodbye\n world';
    let occurrences = fr.find(main, keyword);

    expect(occurrences.length).toBe(1);

    expect(fr.replace(occurrences[0], main, keyword, replacement)).toBe(result);
});

test('replaces all hello with goodbye in "hello hello world"', () => {
    let main = 'hello hello world';
    let keyword = 'hello';
    let replacement = 'goodbye';
    let result = 'goodbye goodbye world';
    let occurrences = fr.find(main, keyword);

    expect(occurrences.length).toBe(2);

    expect(fr.replaceAll(main, keyword, replacement)).toBe(result);
});