'use strict';

/**
 * Returns if the clicked binding was the quit binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function quit(e) {
    return e.ctrlKey && e.key === 'q';
}

/**
 * Returns if the clicked binding was the maximize binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function maximize(e) {
    return e.ctrlKey && e.key === 'ArrowUp';
}

/**
 * Returns if the clicked binding was the restore/minimize binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function restore(e) {
    return e.ctrlKey && e.key === 'ArrowDown';
}

/**
 * Returns if the clicked binding was the toggle command prompt binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function toggleCommandPrompt(e) {
    return e.ctrlKey && e.key === ' ';
}

/**
 * Returns if the clicked binding was the save binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function save(e) {
    return e.ctrlKey && e.key === 's';
}

/**
 * Returns if the clicked binding was the interactive binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function interactive(e) {
    return e.ctrlKey && e.key === 'i';
}

/**
 * Returns if the clicked binding was the ghc build binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function ghcBuild(e) {
    return e.ctrlKey && e.key === 'b';
}

/**
 * Returns if the clicked binding was the ghc run binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function ghcRun(e) {
    return e.ctrlKey && e.key === 'r';
}

/**
 * Returns if the clicked binding was the find and replace binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function find(e) {
    return e.ctrlKey && e.key === 'f';
}

/**
 * Returns if the clicked binding was the replace and find binding
 *
 * @param {KeyboardEvent} e the keyboard event to check for
 * @returns {boolean}
 */
function replace(e) {
    return e.ctrlKey && e.key === 'r';
}

module.exports = {
    quit,
    maximize,
    restore,
    toggleCommandPrompt,
    save,
    interactive,
    find,
    replace,
    ghcBuild,
    ghcRun
}