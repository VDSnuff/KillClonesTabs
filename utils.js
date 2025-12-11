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
// Returns an array of duplicate tabs to be closed.
// If keepCurrentTab is true, keep the active tab instead of the first occurrence.
export async function findDuplicateTabs() {
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    
    // Fetch settings with defaults
    const settings = await chrome.storage.sync.get({
        ignoreTrailingSlash: true,
        ignoreAnchors: false,
        ignoreWWW: false,
        ignoreQuery: false,
        ignoreProtocol: false,
        keepCurrentTab: false
    });

    // Get current active tab if keepCurrentTab is enabled
    let activeTab = null;
    if (settings.keepCurrentTab) {
        const [current] = await chrome.tabs.query({ active: true, currentWindow: true });
        activeTab = current;
    }

    const urlMap = new Map();
    const duplicates = [];

    for (const tab of tabs) {
        if (tab.url) {
            const normalized = normalizeUrl(tab.url, settings);
            if (urlMap.has(normalized)) {
                const existing = urlMap.get(normalized);
                
                // If keepCurrentTab is enabled and one of the tabs is active
                if (settings.keepCurrentTab && activeTab) {
                    if (tab.id === activeTab.id) {
                        // Current tab is a duplicate - keep it, mark existing as duplicate
                        duplicates.push(existing);
                        urlMap.set(normalized, tab);
                    } else if (existing.id === activeTab.id) {
                        // Existing is active - keep it, mark current as duplicate
                        duplicates.push(tab);
                    } else {
                        // Neither is active - keep first (existing), mark current as duplicate
                        duplicates.push(tab);
                    }
                } else {
                    // Default behavior: keep first, mark current as duplicate
                    duplicates.push(tab);
                }
            } else {
                urlMap.set(normalized, tab);
            }
        }
    }
    return duplicates;
}
