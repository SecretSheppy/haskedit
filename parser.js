'use strict';

const file = require('./file.js');
const cmd = require('./cmd.js');

const syntax = {
    '&path;': cmd.getCwd,
    '&fpath;': file.getAbsolutePath,
    '&fname;': file.getFileExt
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

module.exports = exports = {
    parse
}
