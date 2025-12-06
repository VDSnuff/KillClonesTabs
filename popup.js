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
        const tabIds = duplicateTabs.map(tab => tab.id);
        await chrome.tabs.remove(tabIds);
        statusElement.textContent = `Killed ${tabIds.length} clone${tabIds.length === 1 ? '' : 's'}!`;
        // After closing tabs, we should update the icon state
        checkTabs();
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

// Initialize button state
updateMuteButtonState();

document.getElementById('btnSettings').onclick = () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
};