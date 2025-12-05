// Helper to normalize URLs based on settings
export function normalizeUrl(url, settings) {
    let normalized = url;

    if (settings.ignoreProtocol) {
        normalized = normalized.replace(/^https?:\/\//, 'http://');
    }

    if (settings.ignoreWWW) {
        normalized = normalized.replace(/:\/\/(www\.)/, '://');
    }

    if (settings.ignoreAnchors) {
        const anchorIndex = normalized.indexOf('#');
        if (anchorIndex !== -1) {
            normalized = normalized.substring(0, anchorIndex);
        }
    }

    if (settings.ignoreQuery) {
        const queryIndex = normalized.indexOf('?');
        if (queryIndex !== -1) {
            normalized = normalized.substring(0, queryIndex);
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
        ignoreAnchors: false,
        ignoreWWW: false,
        ignoreQuery: false,
        ignoreProtocol: false
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
