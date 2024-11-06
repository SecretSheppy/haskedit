'use strict';

/**
 * A collection of functions that are used within the main file, but are not
 * relevant enough to be defined in the main file.
 */
let docutils = {};

/**
 * Waits for an element to exist within the DOM and then runs the callback
 * function.
 *
 * @param {string} selector the selector to identify the element
 * @param {Function} callback the function to run after the element has been
 * added to the DOM.
 */
docutils.waitForElement = (selector, callback) => {
    let element = document.querySelector(selector);
    if (element) {
        callback(element);
        return;
    }

    let observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            let element = document.querySelector(selector);
            if (element) {
                callback(element);
                observer.disconnect();
                return;
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

window.docutils = docutils;