import { findDuplicateTabs } from './utils.js';

async function checkTabs() {
    const duplicateTabs = await findDuplicateTabs();
    const iconPath = duplicateTabs.length === 0
        ? "images/KillClonesIcon32.png"
        : "images/KillClonesRedIcon32.png";
    chrome.action.setIcon({ path: iconPath });
}

chrome.tabs.onUpdated.addListener(checkTabs);
chrome.tabs.onRemoved.addListener(checkTabs);
chrome.tabs.onCreated.addListener(checkTabs);