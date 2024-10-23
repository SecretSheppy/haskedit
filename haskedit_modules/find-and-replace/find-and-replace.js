'use strict';

const DEFAULT_ROW = 0;
const DEFAULT_COLUMN = 0;

/**
 * Creates a new Occurrence object.
 *
 * @param {number} index the index at which character the keyword occurs in the
 * main string.
 * @param {number} x the x coordinate of where the occurrence appears in the
 * editor.
 * @param {number} y the y coordinate of where the occurrence appears in the
 * editor.
 * @returns {Occurrence} the newly created Occurrence object.
 */
function newOccurrence(index, x, y) {
    return {
        index: index,
        coordinates: {
            x: x,
            y: y
        }
    }
}

/**
 * Finds all occurrences of a keyword within a large string. The return format
 * is used by an absolutely positioned element behind the editor to highlight
 * the text.
 *
 * Important to note that this function uses slice to compare the current
 * character and its following characters to the keyword. This may slow down
 * performance on old systems and when opening large files. However, I have
 * tested this with a range of 4000 -> 6000 word datasets and the outcome was
 * an average response time of 1.8ms, so for now I have decided this is good
 * enough.
 *
 * @param {string} text the full text to search for the keyword in.
 * @param {string} keyword the keyword to search for.
 * @returns {[Occurrence]} the coordinates of each occurrence of the keyword.
 */
function find(text, keyword) {
    let row = DEFAULT_ROW;
    let column = DEFAULT_COLUMN;
    let occurrences = [];

    for (let index = 0; index < text.length; index++) {
        if (text.slice(index, index + keyword.length) === keyword) {
            occurrences.push(newOccurrence(index, row, column));
        }

        if (text[index] === '\n') {
            row++;
            column = DEFAULT_COLUMN - 1;
        }

        column++;
    }

    return occurrences;
}

/**
 * Replaces a specified Occurrence of the keyword in a string.
 *
 * Important to note that this operation is not done in place, so double the
 * amount of memory will be required when running this method due to the
 * shallow copies of the string being produced.
 *
 * @param {Occurrence} occurrence the occurrence to replace.
 * @param {string} text the main string to replace the word in.
 * @param {string} keyword the keyword to replace.
 * @param {string} replacement the string to replace the keyword.
 * @returns {string} the new string.
 */
function replace(occurrence, text, keyword, replacement) {
    return text.slice(0, occurrence.index) + replacement
        + text.slice(occurrence.index + keyword.length, text.length);
}

/**
 * Replaces all Occurrences of the keyword in a string.
 *
 * Important to note that replaceAll uses String.prototype.replaceAll() instead
 * of repeatedly calling the replace method.
 *
 * @param {string} text the main string to replace all occurrences in.
 * @param {string} keyword the keyword to replace.
 * @param {string} replacement the string to replace the keyword.
 * @returns {string} the new string.
 */
function replaceAll(text, keyword, replacement) {
    return text.replaceAll(keyword, replacement);
}

/**
 * @typedef {Object} Coordinate stores an 2D coordinate
 * @property {number} x the x position
 * @property {number} y the y position
 */

/**
 * @typedef {Object} Occurrence stores an occurrence of a keyword
 * @property {number} index the index at which the word occurs in the string.
 * @property {Coordinate} coordinates the coordinates where the word appears.
 */

module.exports = exports = {
    find,
    replace,
    replaceAll,
}