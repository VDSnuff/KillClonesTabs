import { findDuplicateTabs } from './utils.js';

async function checkTabs() {
    const settings = await chrome.storage.sync.get({ autoKill: false });
    const duplicateTabs = await findDuplicateTabs();

    if (settings.autoKill && duplicateTabs.length > 0) {
        const tabIds = duplicateTabs.map(t => t.id);
        await chrome.tabs.remove(tabIds);
        // Icon stays green/normal because duplicates are gone
        chrome.action.setIcon({ path: "images/KillClonesIcon32.png" });
    } else {
        const iconPath = duplicateTabs.length === 0
            ? "images/KillClonesIcon32.png"
            : "images/KillClonesRedIcon32.png";
        chrome.action.setIcon({ path: iconPath });
    }
}

chrome.tabs.onUpdated.addListener(checkTabs);
chrome.tabs.onRemoved.addListener(checkTabs);
chrome.tabs.onCreated.addListener(checkTabs);