// Helper to normalize URLs based on settings
export function normalizeUrl(url, settings) {
    let normalized = url;

    if (settings.ignoreAnchors) {
        const anchorIndex = normalized.indexOf('#');
        if (anchorIndex !== -1) {
            normalized = normalized.substring(0, anchorIndex);
        }
    }

    if (settings.ignoreTrailingSlash) {
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
    }

    return normalized;
}

// A more efficient way to find duplicate tabs.
// Returns an array of duplicate tabs. The first tab with a given URL is not included.
export async function findDuplicateTabs() {
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    
    // Fetch settings with defaults
    const settings = await chrome.storage.sync.get({
        ignoreTrailingSlash: true,
        ignoreAnchors: false
    });

    const urlMap = new Map();
    const duplicates = [];

    for (const tab of tabs) {
        if (tab.url) {
            const normalized = normalizeUrl(tab.url, settings);
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
