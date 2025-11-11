// A more efficient way to find duplicate tabs.
// Returns an array of duplicate tabs. The first tab with a given URL is not included.
async function findDuplicateTabs() {
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    const urlMap = new Map();
    const duplicates = [];

    for (const tab of tabs) {
        if (tab.url) {
            if (urlMap.has(tab.url)) {
                // The tab in the map is the "original", this one is a duplicate
                duplicates.push(tab);
            } else {
                urlMap.set(tab.url, tab);
            }
        }
    }
    return duplicates;
}

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