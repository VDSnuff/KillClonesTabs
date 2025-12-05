// Helper to normalize URLs (ignore trailing slash)
export function normalizeUrl(url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

// A more efficient way to find duplicate tabs.
// Returns an array of duplicate tabs. The first tab with a given URL is not included.
export async function findDuplicateTabs() {
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    const urlMap = new Map();
    const duplicates = [];

    for (const tab of tabs) {
        if (tab.url) {
            const normalized = normalizeUrl(tab.url);
            if (urlMap.has(normalized)) {
                // The tab in the map is the "original", this one is a duplicate
                duplicates.push(tab);
            } else {
                urlMap.set(normalized, tab);
            }
        }
    }
    return duplicates;
}
