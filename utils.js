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
export async function findDuplicateTabs() {
    const tabs = await chrome.tabs.query({ windowType: 'normal' });
    
    // Fetch settings with defaults
    const settings = await chrome.storage.sync.get({
        ignoreTrailingSlash: true,
        ignoreAnchors: false,
        ignoreWWW: false,
        ignoreQuery: false,
        ignoreProtocol: false,
        keepCurrentTab: false, // Legacy
        keepStrategy: 'oldest'
    });

    // Migration logic for legacy setting
    let strategy = settings.keepStrategy;
    if (settings.keepCurrentTab && strategy === 'oldest') {
        strategy = 'active';
    }

    // Get current active tab if strategy is 'active'
    let activeTab = null;
    if (strategy === 'active') {
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
                
                if (strategy === 'active' && activeTab) {
                    if (tab.id === activeTab.id) {
                        // Current tab is a duplicate - keep it, mark existing as duplicate
                        duplicates.push(existing);
                        urlMap.set(normalized, tab);
                    } else if (existing.id === activeTab.id) {
                        // Existing is active - keep it, mark current as duplicate
                        duplicates.push(tab);
                    } else {
                        // Neither is active - fallback to oldest (keep existing)
                        duplicates.push(tab);
                    }
                } else if (strategy === 'newest') {
                    // Keep newest (current 'tab' is newer than 'existing' because tabs are iterated in order)
                    // So we keep 'tab' and mark 'existing' as duplicate
                    duplicates.push(existing);
                    urlMap.set(normalized, tab);
                } else {
                    // Default 'oldest': keep first (existing), mark current as duplicate
                    duplicates.push(tab);
                }
            } else {
                urlMap.set(normalized, tab);
            }
        }
    }
    return duplicates;
}

export async function toggleTabGroups(windowId) {
    // If windowId is not provided, get the current window
    if (!windowId) {
        const window = await chrome.windows.getCurrent();
        windowId = window.id;
    }

    const tabs = await chrome.tabs.query({ windowId });
    
    // Check if any tab is in a group
    // chrome.tabGroups.TAB_GROUP_ID_NONE is -1
    const groupedTabs = tabs.filter(t => t.groupId !== -1);
    
    if (groupedTabs.length > 0) {
        // Ungroup all tabs
        const tabIds = groupedTabs.map(t => t.id);
        await chrome.tabs.ungroup(tabIds);
        return "Tabs ungrouped!";
    } else {
        // Group tabs by domain
        const groups = {};
        tabs.forEach(tab => {
            let domain = '';
            try { 
                const hostname = new URL(tab.url).hostname; 
                // Remove www.
                let shortName = hostname.replace(/^www\./, '');
                
                // Remove TLD (last segment) to shorten the name
                const parts = shortName.split('.');
                if (parts.length > 1) {
                    parts.pop();
                    shortName = parts.join('.');
                }
                
                // Capitalize first letter
                domain = shortName.charAt(0).toUpperCase() + shortName.slice(1);
            } catch (e) { 
                domain = 'Other'; 
            }
            if (!groups[domain]) groups[domain] = [];
            groups[domain].push(tab.id);
        });

        // Create native groups
        for (const [domain, tabIds] of Object.entries(groups)) {
            if (tabIds.length > 1) {
                const groupId = await chrome.tabs.group({ tabIds });
                await chrome.tabGroups.update(groupId, { title: domain });
            }
        }
        return "Tabs grouped natively!";
    }
}
