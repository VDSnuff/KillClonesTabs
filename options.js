// Save options to chrome.storage
function saveOptions() {
    const ignoreTrailingSlash = document.getElementById('ignoreTrailingSlash').checked;
    const ignoreAnchors = document.getElementById('ignoreAnchors').checked;
    const ignoreWWW = document.getElementById('ignoreWWW').checked;
    const ignoreQuery = document.getElementById('ignoreQuery').checked;
    const ignoreProtocol = document.getElementById('ignoreProtocol').checked;

    chrome.storage.sync.set({
        ignoreTrailingSlash: ignoreTrailingSlash,
        ignoreAnchors: ignoreAnchors,
        ignoreWWW: ignoreWWW,
        ignoreQuery: ignoreQuery,
        ignoreProtocol: ignoreProtocol
    }, () => {
        // Update status to let user know options were saved.
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({
        ignoreTrailingSlash: true,
        ignoreAnchors: false,
        ignoreWWW: false,
        ignoreQuery: false,
        ignoreProtocol: false
    }, (items) => {
        document.getElementById('ignoreTrailingSlash').checked = items.ignoreTrailingSlash;
        document.getElementById('ignoreAnchors').checked = items.ignoreAnchors;
        document.getElementById('ignoreWWW').checked = items.ignoreWWW;
        document.getElementById('ignoreQuery').checked = items.ignoreQuery;
        document.getElementById('ignoreProtocol').checked = items.ignoreProtocol;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('ignoreTrailingSlash').addEventListener('change', saveOptions);
document.getElementById('ignoreAnchors').addEventListener('change', saveOptions);
document.getElementById('ignoreWWW').addEventListener('change', saveOptions);
document.getElementById('ignoreQuery').addEventListener('change', saveOptions);
document.getElementById('ignoreProtocol').addEventListener('change', saveOptions);