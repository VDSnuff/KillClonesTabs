// Save options to chrome.storage
function saveOptions() {
    const ignoreTrailingSlash = document.getElementById('ignoreTrailingSlash').checked;
    const ignoreAnchors = document.getElementById('ignoreAnchors').checked;
    const ignoreWWW = document.getElementById('ignoreWWW').checked;
    const ignoreQuery = document.getElementById('ignoreQuery').checked;
    const ignoreProtocol = document.getElementById('ignoreProtocol').checked;
    const hideList = document.getElementById('hideList').value;

    chrome.storage.sync.set({
        ignoreTrailingSlash: ignoreTrailingSlash,
        ignoreAnchors: ignoreAnchors,
        ignoreWWW: ignoreWWW,
        ignoreQuery: ignoreQuery,
        ignoreProtocol: ignoreProtocol,
        hideList: hideList
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
        ignoreProtocol: false,
        hideList: '',
        protectionPin: ''
    }, (items) => {
        document.getElementById('ignoreTrailingSlash').checked = items.ignoreTrailingSlash;
        document.getElementById('ignoreAnchors').checked = items.ignoreAnchors;
        document.getElementById('ignoreWWW').checked = items.ignoreWWW;
        document.getElementById('ignoreQuery').checked = items.ignoreQuery;
        document.getElementById('ignoreProtocol').checked = items.ignoreProtocol;
        document.getElementById('hideList').value = items.hideList;

        // PIN Logic
        const authSection = document.getElementById('authSection');
        const contentSection = document.getElementById('contentSection');
        
        if (items.protectionPin) {
            // Locked
            authSection.style.display = 'block';
            contentSection.style.display = 'none';
            
            document.getElementById('btnAuth').onclick = () => {
                const input = document.getElementById('pinInput').value;
                if (input === items.protectionPin) {
                    authSection.style.display = 'none';
                    contentSection.style.display = 'block';
                    document.getElementById('newPin').value = items.protectionPin; // Pre-fill for editing
                } else {
                    const err = document.getElementById('authError');
                    err.style.display = 'block';
                    setTimeout(() => err.style.display = 'none', 2000);
                }
            };
            
            // Allow Enter key to unlock
            document.getElementById('pinInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') document.getElementById('btnAuth').click();
            });
        } else {
            // Unlocked
            authSection.style.display = 'none';
            contentSection.style.display = 'block';
        }
    });
}

function savePin() {
    const newPin = document.getElementById('newPin').value;
    chrome.storage.sync.set({ protectionPin: newPin }, () => {
        const status = document.getElementById('pinStatus');
        status.textContent = newPin ? 'PIN Set!' : 'Protection Removed!';
        status.style.display = 'block';
        setTimeout(() => status.style.display = 'none', 2000);
    });
}

function resetPin() {
    if (confirm("Forgot PIN?\n\nThis will DELETE your entire hidden list and remove the PIN protection.\n\nAre you sure?")) {
        chrome.storage.sync.set({ protectionPin: '', hideList: '' }, () => {
            location.reload();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    document.getElementById('ignoreTrailingSlash').addEventListener('change', saveOptions);
    document.getElementById('ignoreAnchors').addEventListener('change', saveOptions);
    document.getElementById('ignoreWWW').addEventListener('change', saveOptions);
    document.getElementById('ignoreQuery').addEventListener('change', saveOptions);
    document.getElementById('ignoreProtocol').addEventListener('change', saveOptions);
    document.getElementById('hideList').addEventListener('input', saveOptions);
    document.getElementById('btnSavePin').addEventListener('click', savePin);
    document.getElementById('btnForgotPin').addEventListener('click', resetPin);
});