'use strict';

const fs = require('node:fs');

/**
 * The path to the currently open file
 */
let filePath;

/**
 * The name of the currently open file
 */
let fileName;

/**
 * The extension of the currently open file
 */
let fileExt;

/**
 * Returns the file path, this does not include the file name or the extension.
 * If you need the absolute path see {@link getAbsolutePath}
 *
 * @returns {string}
 */
function getFilePath() {
    return filePath;
}

/**
 * Returns the file name, this does not include the extension. If you need the
 * file name and extension see {@link getLocalName}
 *
 * @returns {string}
 */
function getFileName() {
    return fileName;
}

/**
 * Returns the file extension.
 *
 * @returns {string}
 */
function getFileExt() {
    return fileExt;
}

/**
 * Returns the file path including the file name and extension.
 * 
 * @returns {string}
 */
function getAbsolutePath() {
    return `${filePath}\\${fileName}.${fileExt}`;
}

/**
 * Returns the file name and extension.
 *
 * @returns {string}
 */
function getLocalName() {
    return `${fileName}.${fileExt}`;
}

/**
 * Sets the {@link filePath}, {@link fileName} and {@link fileExt} variables.
 *
 * @param {string} absolutePath
 */
function setOpenFile(absolutePath) {
    let pathTree = absolutePath.split('\\');
    let localName = pathTree.pop();
    let localTree = localName.split('.');

    fileExt = localTree.pop();
    fileName = localTree.join();
    filePath = pathTree.join('\\');
}

/**
 * Attempts to open the specified file.
 *
 * @param {string} absolutePath
 * @param {BufferEncoding} encoding
 * @returns {null|string} returns a string if the file was opened.
 */
function openFile(absolutePath, encoding) {
    try {
        let fileText = fs.readFileSync(absolutePath, { encoding: encoding });

        setOpenFile(absolutePath);

        return fileText.toString();
    } catch (e) {
        console.error(`failed to open file ${absolutePath}: ${e}`);
        return null;
    }
}

/**
 * Saves specified text into the open file location.
 *
 * @param {string} text
 * @param {BufferEncoding} encoding
 */
function saveFile(text, encoding) {
    try {
        fs.writeFileSync(getAbsolutePath(), text, { encoding: encoding });
    } catch (e) {
        console.error(`failed to write file ${getAbsolutePath()}: ${e}`);
    }
}

/**
 * Saves a new file.
 *
 * @param {string} text
 * @param {string} _filePath
 * @param {BufferEncoding} encoding
 */
function saveNewFile(text, _filePath, encoding) {
    setOpenFile(_filePath);
    saveFile(text, encoding);
}

module.exports = exports = {
    getFilePath,
    getFileName,
    getFileExt,
    getAbsolutePath,
    getLocalName,
    openFile,
    saveFile,
    saveNewFile
}
