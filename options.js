// Save options to chrome.storage
function saveOptions() {
    const ignoreTrailingSlash = document.getElementById('ignoreTrailingSlash').checked;
    const ignoreAnchors = document.getElementById('ignoreAnchors').checked;

    chrome.storage.sync.set({
        ignoreTrailingSlash: ignoreTrailingSlash,
        ignoreAnchors: ignoreAnchors
    }, () => {
        // Update status to let user know options were saved.
        // (Optional visual feedback could go here)
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({
        ignoreTrailingSlash: true, // Default value
        ignoreAnchors: false       // Default value
    }, (items) => {
        document.getElementById('ignoreTrailingSlash').checked = items.ignoreTrailingSlash;
        document.getElementById('ignoreAnchors').checked = items.ignoreAnchors;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('ignoreTrailingSlash').addEventListener('change', saveOptions);
document.getElementById('ignoreAnchors').addEventListener('change', saveOptions);