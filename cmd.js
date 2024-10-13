'use strict';

const { spawn } = require('node:child_process');
const kill = require('tree-kill');
const utils = require('./utils.js');

/**
 * The current working directory of the terminal. default location is the
 * haskedit install directory.
 */
let cwd = process.cwd();

/**
 * The current running cmd process.
 */
let cmdProcess;

/**
 * The history of cmd commands used in the current session. The first is the
 * most recently used command.
 *
 * @type {[Command]}
 */
let cmdHistory = [];

/**
 * Stores all the custom commands registered in the system
 *
 * @type {[CustomCommand]}
 */
const customCommandsRegister = [];

/**
 * get the current working directory
 *
 * @returns {string}
 */
function getCwd() {
    return cwd;
}

/**
 * set the current working directory
 *
 * @param {string} _cwd
 */
function setCwd(_cwd) {
    cwd = _cwd;
}

/**
 * Parses the string of arguments into an array format which can
 * be passed into the {@link spawnCommand}.
 *
 * @param {string} args the arguments string
 * @returns {Command}
 */
function parseArgs(args) {
    let split = args.split(' ');
    return {
        command: split.shift(),
        args: split
    }
}

/**
 * Spawns a child process to echo the command until it has finished.
 *
 * @param {Command} command the formatted command object. Can parse a command
 * string into a {@link Command} object by using {@link parseArgs}
 * @param {Function} stdoutTarget the method used to print stdout wherever it
 * needs to be.
 * @param {Function} stderrTarget the method used to print stderr wherever it
 * needs to be. This should preferably be obviously different to the stdout.
 * @param {Function} onClose handler for on close event
 * @returns {ChildProcessWithoutNullStreams | null} the process instance. should
 * only be used if early termination is desired.
 */
function spawnCommand(command, stdoutTarget, stderrTarget, onClose) {
    addCommandToSessionHistory(command);

    if (isCustomCommand(command.command)) {
        runCustomCommand(command);
        return null;
    }

    cmdProcess = spawn(command.command, command.args, { cwd: cwd, shell: true });

    cmdProcess.stdout.on('data', data => stdoutTarget(data));
    cmdProcess.stderr.on('data', data => stderrTarget(data));
    cmdProcess.on('close', (code) => {
        stdoutTarget(`Process exited with code ${code}`);
        onClose();
    });
}

/**
 * Kills the current command. The module tree-kill is used to force cmd.exe to
 * stop running the command.
 */
function killCommand() {
    kill(cmdProcess.pid);
}

/**
 * Register a custom command into the system. Commands registered will
 * be intercepted during the {@link spawnCommand} and then their callback
 * function will be called.
 *
 * @param {string} command
 * @param {Function} callback
 */
function registerCustomCommand(command, callback) {
    customCommandsRegister.push({
        command: command,
        callback: callback
    });
}

/**
 * Detects if the command is in the customCommandsRegister.
 *
 * @param {string} command
 * @returns {boolean}
 */
function isCustomCommand(command) {
    for (let custom of customCommandsRegister) {
        if (custom.command === command) {
            return true;
        }
    }

    return false;
}

/**
 * Runs the callback function of a custom command.
 *
 * @param {Command} command
 */
function runCustomCommand(command) {
    for (let custom of customCommandsRegister) {
        if (custom.command === command.command) {
            custom.callback(command.args);
        }
    }
}

/**
 * Adds a command object to the cmd history array.
 *
 * @param {Command} command
 */
function addCommandToSessionHistory(command) {
    cmdHistory = utils.prepend(command, cmdHistory);
}

/**
 * Gets the specified command from the command history.
 *
 * @param {number} index
 * @returns {string} returns and empty string if there is no session history
 */
function getCommandStringFromHistoryAt(index) {
    if (cmdHistory.length === 0) {
        return '';
    }

    index = index % cmdHistory.length;
    return `${cmdHistory[index].command} ${cmdHistory[index].args.join(' ')}`;
}

module.exports = exports = {
    getCwd,
    setCwd,
    parseArgs,
    spawnCommand,
    killCommand,
    registerCustomCommand,
    getCommandStringFromHistoryAt
}

/**
 * @typedef {Object} Command stores a command and its arguments
 * @property {string} command the command
 * @property {[string]} args the command arguments
 */

/**
 * @typedef {Object} CustomCommand stores a command keyword and its callback
 * @property {string} command the command
 * @property {Function} callback execute the command
 */