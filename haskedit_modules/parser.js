'use strict';

const file = require('./file.js');
const cmd = require('./cmd.js');

const syntax = {
    '&path;': cmd.getCwd,
    '&fpath;': file.getAbsolutePath,
    '&fname;': file.getFileExt,
    '&fpathexe;': file.getAbsoluteExecutablePath
}

/**
 * parses a script from the config.json file
 *
 * @param {string} script
 * @returns {string}
 */
function parse(script) {
    for (let key in syntax) {
        script = script.replaceAll(key, syntax[key]());
    }

    return script;
}

/**
 * parses a file path into a script
 *
 * @param {string} script
 * @param {string} filePath
 * @returns {string}
 */
function parseFilePath(script, filePath) {
    return script.replaceAll('&fpath;', filePath);
}

module.exports = exports = {
    parse,
    parseFilePath
}
