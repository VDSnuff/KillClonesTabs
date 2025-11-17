import { findDuplicateTabs } from './utils.js';

async function highlightClones() {
    const duplicateTabs = await findDuplicateTabs();
    const statusElement = document.getElementById("status");

    if (duplicateTabs.length === 0) {
        statusElement.textContent = "All clear!";
    } else {
        // To highlight all duplicates, we also need the "original" tabs.
        // Let's find them.
        const urls = duplicateTabs.map(tab => tab.url);
        const allTabs = await chrome.tabs.query({});
        const tabsToHighlight = allTabs.filter(tab => urls.includes(tab.url));
        
        const tabIndices = tabsToHighlight.map(tab => tab.index);
        chrome.tabs.highlight({ tabs: tabIndices });
        statusElement.textContent = `Found ${duplicateTabs.length} duplicates!`;
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
        statusElement.textContent = `Killed ${tabIds.length} clones!`;
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
    }
};