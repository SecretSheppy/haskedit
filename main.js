'use strict';

const config = require('./config.json');
const pkg = require('./package.json');
const cmd = require('./haskedit_modules/cmd.js');
const file = require('./haskedit_modules/file.js');
const parser = require('./haskedit_modules/parser.js');
const path = require('node:path');
const fs = require('node:fs');
const bindings = require('./haskedit_modules/bindings.js');
const utils = require('./haskedit_modules/utils.js');
const { exec, execSync } = require('node:child_process');

/**
 * Attaching window maximized state to the window object for ease of access.
 * For reference, nw.js has no native feature for checking the state of the
 * window.
 *
 * @type {boolean} true if maximized.
 */
window.maximized = false;

/**
 * Attaching editor saved state to window object for ease of access.
 *
 * @type {boolean} true if saved
 */
window.saved = true;

/**
 * Index used to maintain how much of command history has been viewed;
 *
 * @type {number}
 */
window.historyIndex = 0;

/**
 * Overriding the cls command and replacing it with one that will clear the
 * html terminal.
 */
cmd.registerCustomCommand('cls', () => {
    document.getElementById('stdout').innerText = '';
    showCommandPrompt();
});

/**
 * Overriding the cd command and replacing it with one that will change the
 * internal cmd.cwd variable.
 */
cmd.registerCustomCommand('cd', (args) => {
    let newPath = args.join();
    if (!path.isAbsolute(newPath)) {
        newPath = path.resolve(`${cmd.getCwd()}/${newPath}`);
    }
    if (!fs.existsSync(newPath)) {
        writeStderr(`path ${newPath} does not exist`);
    } else {
        cmd.setCwd(newPath);
    }
    showCommandPrompt();
});

/**
 * Command allows user to set custom indentation level. (current version of
 * the editor uses real tabs, however ormolu should replace them with spaces.
 * May change this in the future)
 */
cmd.registerCustomCommand('set-indentation-level', (args) => {
    let newLevel = args.join();
    if (utils.isInt(newLevel)) {
        setIndentationLevel(newLevel);
    } else {
        writeStderr(`${newLevel} is not a valid indentation level`);
    }
    showCommandPrompt();
});

/**
 * Command allows users to save the current document. (works for either new or
 * previously opened files)
 */
cmd.registerCustomCommand('save', (args) => {
    let fileName = args[0];
    let editor = document.getElementById('editor');

    if (args.length === 0) {
        if (file.getFilePath() === undefined) {
            writeStderr('file has not been previously saved, must give a filename');
        } else {
            replaceTabsWithSpaces();
            file.saveFile(editor.value, 'utf-8');
            window.saved = true;
            updateSavedIndicator();
            updateFileNameDisplay();
            formatFile();
        }
        showCommandPrompt();
        return;
    }

    let filePath = path.resolve(`${cmd.getCwd()}\\${fileName}`);
    if (fs.existsSync(filePath) && !args.includes('--force')) {
        writeStderr(`path ${filePath} already exists, to overwrite it use --force`);
        showCommandPrompt();
        return;
    }

    if (!fs.existsSync(path.dirname(filePath))) {
        writeStderr(`path ${filePath} does not exist`);
        showCommandPrompt();
        return;
    }

    file.saveNewFile(editor.value, filePath, 'utf-8');
    showCommandPrompt();
    window.saved = true;
    updateSavedIndicator();
    updateFileNameDisplay();
    formatFile();
});

/**
 * Attempts to open the specified file and then puts its text into the editor.
 */
cmd.registerCustomCommand('open', (args) => {
    let filePath = args[0];

    if (!path.isAbsolute(args[0])) {
        filePath = path.join(cmd.getCwd(), args[0]);
    }

    openFileInGui(path.resolve(filePath)).then(() => {
        console.info('file loaded');
    }).catch((err) => {
        console.error(err);
    });
    showCommandPrompt();
});

/**
 * Allows the user to quit the application.
 */
cmd.registerCustomCommand('quit', (args) => {
    if (window.saved || args.includes('--force')) {
        nw.App.quit();
    }

    writeStderr('file not saved, use quit --force to quit without saving');
    showCommandPrompt();
});

/**
 * opens ghci in a new cmd.exe window (as doesn't work on inbuilt command
 * prompt)
 */
cmd.registerCustomCommand('ghci', (args) => {
    exec(`start cmd.exe /k "${parser.parseFilePath(config.scripts.interactive,
        args.join(' '))}"`);
    showCommandPrompt();
});

/**
 * Shows the help dialogue
 */
cmd.registerCustomCommand('help', () => {
    let bannerWrapper = document.createElement('div');
    bannerWrapper.classList.add('banner-wrapper');

    let haskeditIcon = document.createElement('img');
    haskeditIcon.classList.add('haskedit-icon');
    haskeditIcon.setAttribute('src', 'icons/haskedit.png')

    let haskeditInfo = document.createElement('div');
    haskeditInfo.classList.add('haskedit-info');

    let titleTextNode = document.createElement('p');
    titleTextNode.innerText = 'Haskedit';
    titleTextNode.classList.add('prompt-text');

    let subtitleTextNode = document.createElement('p');
    subtitleTextNode.innerText = 'The simple haskell editor built with javascript.';
    subtitleTextNode.classList.add('prompt-text');

    let versionTextNode = document.createElement('p');
    versionTextNode.innerText = `Version: ${pkg.version}`;
    versionTextNode.classList.add('prompt-text');

    haskeditInfo.appendChild(titleTextNode);
    haskeditInfo.appendChild(subtitleTextNode);
    haskeditInfo.appendChild(versionTextNode);

    bannerWrapper.appendChild(haskeditIcon);
    bannerWrapper.appendChild(haskeditInfo);

    document.getElementById('stdout').appendChild(bannerWrapper);

    writeStdout(fs.readFileSync('./help.txt', 'utf-8'));
    showCommandPrompt();
});

/**
 * Runs to set up the gui as is specified in the config.json file.
 */
function guiConfig() {
    document.getElementById('prompt').innerText =
        parser.parse(config["prompt-format"]);

    setIndentationLevel(config["indentation-level"]);

    if (config["on-start"]["show-prompt"]) {
        document.getElementById('prompt-region')
            .classList.remove('collapsed');
    }

    if (config["performance"]["disable-line-character-position"]) {
        document.getElementById('line-character-numbers')
            .classList.add('blurred');
    }

    document.getElementById('editor').focus();
}

/**
 * Opens a file in the gui.
 *
 * @param filePath
 */
async function openFileInGui(filePath) {
    showFileLoadingDisplay();

    let text = await file.openFile(filePath, 'utf-8');

    if (text == null) {
        writeStderr(`failed to open file ${filePath}`);
        showCommandPrompt();
        return;
    }

    document.getElementById('editor').value = text;
    updateSavedIndicator();
    updateFileNameDisplay();
    checkFileFormatting();
}

/**
 * Opens a file if the file name was detected in the args string.
 */
function openFileIfNwArgs() {
    if (nw.App.argv[0] !== undefined) {
        openFileInGui(path.resolve(nw.App.argv[0])).then(() => {
            console.info('file loaded');
        }).catch((err) => {
            console.error(err);
        });
    }
}

/**
 * Sets the indentation level used in the editor.
 *
 * @param {number} level
 */
function setIndentationLevel(level) {
    document.getElementById('editor')
        .setAttribute('tab-size', level.toString());

    document.getElementById('indentation-level')
        .innerText = `${level} spaces`;
}

/**
 * Scrolls to the bottom of the command prompt.
 */
function commandPromptScrollToBottom() {
    let inner = document.getElementById('prompt-inner');
    inner.scrollTop = inner.scrollHeight;
}

/**
 * Writes the stdout into the stdout wrapper element. This element prints text
 * as just white plaintext.
 *
 * @param {string} stdout
 */
function writeStdout(stdout) {
    let pre = document.createElement('pre');
    pre.appendChild(document.createTextNode(stdout));
    pre.classList.add('prompt-text');
    document.getElementById('stdout').appendChild(pre);
    commandPromptScrollToBottom();
}

/**
 * Writes the stderr into the stdout wrapper element. This element prints text
 * as red error text.
 *
 * @param {string} stderr
 */
function writeStderr(stderr) {
    let pre = document.createElement('pre');
    pre.appendChild(document.createTextNode(`Error: ${stderr}`));
    pre.classList.add('prompt-text', 'stderr');
    document.getElementById('stdout').appendChild(pre);
    commandPromptScrollToBottom();
}

/**
 * Hides the command prompt so that it is clear when commands are still
 * executing.
 */
function hideCommandPrompt() {
    document.getElementById('prompt').style.display = 'none';
}

/**
 * Returns if the command prompt is visible.
 *
 * @returns {boolean} true if visible, false if else.
 */
function isCommandPromptVisible() {
    return document.getElementById('prompt').style.display !== 'none';
}

/**
 * Shows the command prompt.
 */
function showCommandPrompt() {
    let prompt = document.getElementById('prompt');
    prompt.innerText = parser.parse(config["prompt-format"]);
    prompt.style.display = 'block';
}

/**
 * clears the command prompt.
 */
function clearCommandPrompt() {
    document.getElementById('prompt-input').value = '';
}

/**
 * Returns if the command prompt is empty or populated with at least one
 * character.
 *
 * @returns {boolean} true if more than 0 characters.
 */
function isCommandPromptEmpty() {
    return !(document.getElementById('prompt-input').value !== '');
}

/**
 * Shows the command prompt region.
 */
function showCommandPromptRegion() {
    let promptRegion = document.getElementById('prompt-region');
    promptRegion.classList.remove('collapsed');
    document.getElementById('prompt-input').focus();
}

/**
 * Toggles the visibility of the command prompt interface.
 */
function toggleCommandPromptRegionVisibility() {
    let promptRegion = document.getElementById('prompt-region');
    if (promptRegion.classList.contains('collapsed')) {
        promptRegion.classList.remove('collapsed');
        document.getElementById('prompt-input').focus();
        return;
    }
    promptRegion.classList.add('collapsed');
    document.getElementById('editor').focus();
}

/**
 * Updates the line-character-numbers element to be correct in relation to the
 * current cursor position.
 */
function updateCursorPosition() {
    let textarea = document.getElementById('editor');
    let cursorPosition = textarea.selectionStart;
    let textBeforeCursor = textarea.value.substring(0, cursorPosition);
    let lineNumber = (textBeforeCursor.match(/\n/g) || []).length + 1;
    let lastLineStart = textBeforeCursor.lastIndexOf('\n') + 1;
    let characterPosition = (cursorPosition - lastLineStart) + 1;
    document.getElementById('line-character-numbers')
        .innerText = `${lineNumber}:${characterPosition}`;
}

/**
 * Shows if the file is saved.
 */
function updateSavedIndicator() {
    let indicator = document.getElementById('saved-indicator');
    if (window.saved) {
        indicator.innerText = 'Saved';
        indicator.classList.remove('false');
        indicator.classList.add('true');
        document.title = `Haskedit - ${file.getLocalName()}`;
        return;
    }
    indicator.innerText = 'Not Saved';
    indicator.classList.remove('true');
    indicator.classList.add('false');
    document.title = `Haskedit - ${file.getLocalName()}*`;
}

/**
 * Puts the filename/path into the status bar in the format specified by the
 * user in the config.json file.
 */
function updateFileNameDisplay() {
    let nameDisplay = document.getElementById('file-name-display');
    nameDisplay.classList.remove('loading');
    if (window.saved) {
        nameDisplay.innerText = parser.parse(config["file-name-display-format"]);
    }
}

/**
 * Shows the file loading display.
 */
function showFileLoadingDisplay() {
    let nameDisplay = document.getElementById('file-name-display');
    nameDisplay.innerText = 'Loading';
    nameDisplay.classList.remove('loading');
}

/**
 * Updates the formatted indicator in the status bar.
 *
 * @param {string} stage either: NOT_FORMATTED, FORMATTING, FORMATTED.
 */
function updateFormattingIndicator(stage) {
    let formattedIndicator = document.getElementById('formatted-indicator');

    switch (stage) {
        case 'NOT_FORMATTED':
            formattedIndicator.innerText = 'Not Formatted';
            formattedIndicator.classList.remove('true', 'formatting');
            formattedIndicator.classList.add('false');
            break;
        case 'FORMATTING':
            formattedIndicator.innerText = 'Formatting';
            formattedIndicator.classList.remove('true', 'false');
            formattedIndicator.classList.add('formatting');
            break;
        case 'FORMATTED':
            formattedIndicator.innerText = 'Formatted';
            formattedIndicator.classList.remove('false', 'formatting');
            formattedIndicator.classList.add('true');
            break;
    }
}

/**
 * formats the code and replaces it in the file and the editor.
 */
function formatFile() {
    if (!config["on-save"]["formatter"]["run"]) {
        return;
    }

    updateFormattingIndicator('FORMATTING');

    console.info('starting automatic formatting process');
    let command = parser.parse(config["on-save"]["formatter"]["script"]);

    try {
        let formattedText = execSync(command);

        document.getElementById('editor').value
            = formattedText.toString();

        replaceTabsWithSpaces();
        file.saveFile(formattedText.toString(), 'utf-8');
        console.log('formatted file successfully');

        updateFormattingIndicator('FORMATTED');
    } catch (e) {
        writeStderr(`failed to format ${file.getLocalName()} with command "${command}"`);
        showCommandPromptRegion();
    }
}

/**
 * Checks if a file is formatted correctly or not.
 */
function checkFileFormatting() {
    if (!config["on-save"]["formatter"]["run"]) {
        return;
    }

    updateFormattingIndicator('FORMATTING');

    console.info('starting automatic formatting process');
    let command = parser.parse(config["on-save"]["formatter"]["script"]);

    try {
        let formattedText = execSync(command);

        if (document.getElementById('editor').value === formattedText.toString()) {
            updateFormattingIndicator('FORMATTED');
            return;
        }

        updateFormattingIndicator('NOT_FORMATTED');
    } catch (e) {
        writeStderr(`format checker failed to format ${file.getLocalName()} with command "${command}"`);
        showCommandPromptRegion();
    }
}

/**
 * Replaces all tabs in the editor with the current tab-size worth of spaces.
 */
function replaceTabsWithSpaces() {
    let editor = document.getElementById('editor');
    let tabSize = parseInt(editor.getAttribute('tab-size'));
    editor.value = editor.value.replace(/\t/g, ' '.repeat(tabSize));
}

/**
 * Binding event listeners after the DOM has loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    guiConfig();
    openFileIfNwArgs();

    /**
     * Runs the command prompt
     */
    document.getElementById('prompt-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && isCommandPromptVisible()) {
            writeStdout(`${parser.parse(config["prompt-format"])} ${e.target.value}`);

            if (!isCommandPromptEmpty()) {
                hideCommandPrompt();

                cmd.spawnCommand(cmd.parseArgs(e.target.value),
                    (stdout) => {
                        writeStdout(stdout);
                    },
                    (stderr) => {
                        writeStderr(stderr);
                    },
                    () => {
                        showCommandPrompt();
                    });
            }

            clearCommandPrompt();
            window.historyIndex = 0;
        }

        if (e.key === 'c' && e.ctrlKey) {
            cmd.killCommand();
        }

        if (e.key === 'ArrowUp') {
            e.target.value = cmd.getCommandStringFromHistoryAt(window.historyIndex);
            window.historyIndex++;
        }

        if (e.key === 'ArrowDown') {
            e.target.value = cmd.getCommandStringFromHistoryAt(window.historyIndex);
            if (window.historyIndex > 0) {
                window.historyIndex--;
            }
        }
    });

    /**
     * Focuses the command prompt when the user clicks anywhere within the
     * command prompt region.
     */
    document.getElementById('prompt-region').addEventListener('click', () => {
        document.getElementById('prompt-input').focus();
    });

    /**
     * Editor character and line count event listeners
     */
    if (!config["performance"]["disable-line-character-position"]) {
        document.getElementById('editor')
            .addEventListener('input', updateCursorPosition);
        document.getElementById('editor')
            .addEventListener('click', updateCursorPosition);
        document.getElementById('editor')
            .addEventListener('keyup', updateCursorPosition);
    }

    document.getElementById('editor')
        .addEventListener('input', () => {
            window.saved = false;
            updateSavedIndicator();
            updateFormattingIndicator('NOT_FORMATTED');
        });
});

/**
 * Event listener for key bindings regarding the nw.js window and the main
 * application frame.
 */
document.addEventListener('keydown', (e) => {
    if (bindings.quit(e)) {
        if (window.saved) {
            nw.App.quit();
        } else {
            showCommandPromptRegion();
            writeStderr('file not saved, use quit --force to quit without saving');
        }
    }

    if (bindings.maximize(e)) {
        window.maximized = true;
        nw.Window.get().maximize();
    }

    if (bindings.restore(e)) {
        if (window.maximized) {
            nw.Window.get().restore();
            window.maximized = false;
        } else {
            nw.Window.get().minimize();
        }
    }

    if (bindings.toggleCommandPrompt(e)) {
        toggleCommandPromptRegionVisibility();
    }

    if (bindings.save(e)) {
        let editor = document.getElementById('editor');
        if (file.getFilePath() === undefined) {
            writeStderr('file has not been previously saved, must give a filename');
            showCommandPromptRegion();
        } else {
            replaceTabsWithSpaces();
            file.saveFile(editor.value, 'utf-8');
            window.saved = true;
            updateSavedIndicator();
            updateFileNameDisplay();
            formatFile();
        }
    }

    if (bindings.interactive(e)) {
        exec(`start cmd.exe /k "${parser.parse(config.scripts.interactive)}"`);
    }
});
