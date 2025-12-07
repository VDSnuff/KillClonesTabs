import { findDuplicateTabs, normalizeUrl } from './utils.js';

async function highlightClones() {
    const duplicateTabs = await findDuplicateTabs();
    const statusElement = document.getElementById("status");

    if (duplicateTabs.length === 0) {
        statusElement.textContent = "All clear!";
    } else {
        // To highlight all duplicates, we also need the "original" tabs.
        // Let's find them.
        const settings = await chrome.storage.sync.get({
            ignoreTrailingSlash: true,
            ignoreAnchors: false,
            ignoreWWW: false,
            ignoreQuery: false,
            ignoreProtocol: false
        });

        const urls = duplicateTabs.map(tab => normalizeUrl(tab.url, settings));
        const allTabs = await chrome.tabs.query({});
        const tabsToHighlight = allTabs.filter(tab => urls.includes(normalizeUrl(tab.url, settings)));
        
        const tabIndices = tabsToHighlight.map(tab => tab.index);
        chrome.tabs.highlight({ tabs: tabIndices });
        statusElement.textContent = `Found ${duplicateTabs.length} duplicate${duplicateTabs.length === 1 ? '' : 's'}!`;
    }
}

async function killClones() {
    const duplicateTabs = await findDuplicateTabs();
    const statusElement = document.getElementById("status");

    if (duplicateTabs.length === 0) {
        statusElement.textContent = "No targets!";
    } else {
        const btnKill = document.getElementById('btnKill');
        const svg = btnKill.querySelector('svg');
        svg.classList.add('blink-red');
        setTimeout(() => {
            svg.classList.remove('blink-red');
        }, 900); // 0.3s * 3 = 900ms

        const tabIds = duplicateTabs.map(tab => tab.id);
        await chrome.tabs.remove(tabIds);
        statusElement.textContent = `Killed ${tabIds.length} clone${tabIds.length === 1 ? '' : 's'}!`;
        // After closing tabs, we should update the icon state
        checkTabs();
        updateTargetButtonState();
    }
}

// This function is from eventPage.js, it's needed to update the icon
async function checkTabs() {
    const duplicateTabs = await findDuplicateTabs();
    const iconPath = duplicateTabs.length === 0
        ? "images/KillClonesIcon32.png"
        : "images/KillClonesRedIcon32.png";
    chrome.action.setIcon({ path: iconPath });
}

document.getElementById('btnTarget').onclick = highlightClones;
document.getElementById('btnKill').onclick = killClones;
document.getElementById('btnPin').onclick = async () => {
    const tabs = await chrome.tabs.query({});
    if (tabs.length > 0) {
        // If any tab is not pinned, pin all. Otherwise, unpin all.
        const willBePinned = tabs.some(tab => !tab.pinned);
        for (const tab of tabs) {
            await chrome.tabs.update(tab.id, { pinned: willBePinned });
        }
        document.getElementById("status").textContent = willBePinned ? "All tabs pinned!" : "All tabs unpinned!";
        updatePinButtonState();
    }
};

document.getElementById('btnMuted').onclick = async () => {
    const tabs = await chrome.tabs.query({});
    if (tabs.length > 0) {
        // If any tab is not muted, mute all. Otherwise, unmute all.
        const willBeMuted = tabs.some(tab => !tab.mutedInfo.muted);
        for (const tab of tabs) {
            await chrome.tabs.update(tab.id, { muted: willBeMuted });
        }
        document.getElementById("status").textContent = willBeMuted ? "All tabs muted!" : "All tabs unmuted!";
        updateMuteButtonState();
    }
};

async function updateMuteButtonState() {
    const tabs = await chrome.tabs.query({});
    const isAnyUnmuted = tabs.some(tab => !tab.mutedInfo.muted);
    const btnMuted = document.getElementById('btnMuted');
    const svg = btnMuted.querySelector('svg');
    
    if (isAnyUnmuted) {
        // Show Unmuted icon (Sound waves)
        svg.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
        btnMuted.title = "Mute All Tabs";
    } else {
        // Show Muted icon (Crossed out)
        svg.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
        btnMuted.title = "Unmute All Tabs";
    }
}

async function updatePinButtonState() {
    const tabs = await chrome.tabs.query({});
    const isAnyUnpinned = tabs.some(tab => !tab.pinned);
    const btnPin = document.getElementById('btnPin');
    const svg = btnPin.querySelector('svg');
    
    if (isAnyUnpinned) {
        // Show Pin icon (Action: Pin All)
        svg.innerHTML = '<line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>';
        btnPin.title = "Pin All Tabs";
    } else {
        // Show Unpin icon (Action: Unpin All)
        svg.innerHTML = '<line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path><line x1="3" y1="3" x2="21" y2="21"></line>';
        btnPin.title = "Unpin All Tabs";
    }
}

async function updateTargetButtonState() {
    const duplicateTabs = await findDuplicateTabs();
    const btnTarget = document.getElementById('btnTarget');
    const svg = btnTarget.querySelector('svg');

    if (duplicateTabs.length > 0) {
        // Show Target icon (Magnifying glass with crosshair)
        svg.innerHTML = '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="6" x2="11" y2="16"></line><line x1="6" y1="11" x2="16" y2="11"></line>';
        btnTarget.title = "Show duplicates";
    } else {
        // Show Normal icon (Magnifying glass)
svg.innerHTML = '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>';
btnTarget.title = "No duplicates found";

document.getElementById('btnHideEvidence').onclick = async () => {
    const settings = await chrome.storage.sync.get({ hideList: '' });
    const domains = settings.hideList.split('\n').map(d => d.trim()).filter(d => d.length > 0);

    if (domains.length === 0) {
        document.getElementById("status").textContent = "List is empty!";
        return;
    }

    // 1. Close Tabs
    const allTabs = await chrome.tabs.query({});
    const tabsToRemove = allTabs.filter(tab => {
        try {
            const url = new URL(tab.url);
            return domains.some(domain => url.hostname.includes(domain));
        } catch (e) {
            return false;
        }
    });

    if (tabsToRemove.length > 0) {
        await chrome.tabs.remove(tabsToRemove.map(t => t.id));
    }

    // 2. Delete from History
    for (const domain of domains) {
        const historyItems = await chrome.history.search({ text: domain, startTime: 0, maxResults: 10000 });
        for (const item of historyItems) {
            await chrome.history.deleteUrl({ url: item.url });
        }
    }

    document.getElementById("status").textContent = "Evidence hidden!";
};

// Initialize button state
updateMuteButtonState();
    }
}

document.getElementById('btnHideEvidence').onclick = async () => {
    // Animation
    const btn = document.getElementById('btnHideEvidence');
    const svg = btn.querySelector('svg');
    svg.classList.add('blink-red');
    setTimeout(() => { svg.classList.remove('blink-red'); }, 900);

    const settings = await chrome.storage.sync.get({ hideList: '' });
    const domains = settings.hideList.split('\n').map(d => d.trim()).filter(d => d.length > 0);

    if (domains.length === 0) {
        document.getElementById("status").textContent = "List is empty!";
        return;
    }

    // 1. Close Tabs
    const allTabs = await chrome.tabs.query({});
    const tabsToRemove = allTabs.filter(tab => {
        try {
            return domains.some(domain => tab.url.includes(domain));
        } catch (e) {
            return false;
        }
    });

    if (tabsToRemove.length > 0) {
        await chrome.tabs.remove(tabsToRemove.map(t => t.id));
    }

    // 2. Delete from History
    for (const domain of domains) {
        const historyItems = await chrome.history.search({ text: domain, startTime: 0, maxResults: 10000 });
        for (const item of historyItems) {
            await chrome.history.deleteUrl({ url: item.url });
        }
    }

    document.getElementById("status").textContent = "Evidence hidden!";
};

document.getElementById('btnAddHide').onclick = async () => {
    // Animation
    const btn = document.getElementById('btnAddHide');
    const svg = btn.querySelector('svg');
    svg.classList.add('blink-red', 'scale-up');
    setTimeout(() => { svg.classList.remove('blink-red', 'scale-up'); }, 900);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    try {
        const url = new URL(tab.url);
        const domain = url.hostname;
        const variations = [
            domain,
            `https://${domain}`,
            `http://${domain}`
        ];
        
        const settings = await chrome.storage.sync.get({ hideList: '' });
        let domains = settings.hideList.split('\n').map(d => d.trim()).filter(d => d.length > 0);
        
        let added = false;
        variations.forEach(v => {
            if (!domains.includes(v)) {
                domains.push(v);
                added = true;
            }
        });

        if (added) {
            await chrome.storage.sync.set({ hideList: domains.join('\n') });
            document.getElementById("status").textContent = "Added!";
            setTimeout(() => { document.getElementById("status").textContent = "Manage your tabs"; }, 1500);
        } else {
             document.getElementById("status").textContent = "Saved!";
             setTimeout(() => { document.getElementById("status").textContent = "Manage your tabs"; }, 1500);
        }
    } catch (e) {
        document.getElementById("status").textContent = "Invalid URL";
    }
};

// Initialize button state
updateMuteButtonState();
updatePinButtonState();
updateTargetButtonState();

document.getElementById('btnSettings').onclick = () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
};