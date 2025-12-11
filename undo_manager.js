export class UndoManager {
    constructor() {
        this.lastState = null;
    }

    async captureState() {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        // Capture tab properties: id, index, groupId, pinned
        this.lastState = tabs.map(t => ({
            id: t.id,
            index: t.index,
            groupId: t.groupId,
            pinned: t.pinned
        }));
    }

    hasState() {
        return this.lastState !== null;
    }

    async restoreState() {
        if (!this.lastState) return;

        // 1. Filter out tabs that no longer exist
        const currentTabs = await chrome.tabs.query({ currentWindow: true });
        const currentTabIds = new Set(currentTabs.map(t => t.id));
        const validState = this.lastState.filter(t => currentTabIds.has(t.id));

        if (validState.length === 0) {
            this.lastState = null;
            return;
        }

        // Sort by original index to ensure correct order
        validState.sort((a, b) => a.index - b.index);

        // 2. Restore Pinned State
        for (const t of validState) {
            const currentTab = currentTabs.find(ct => ct.id === t.id);
            if (currentTab && currentTab.pinned !== t.pinned) {
                await chrome.tabs.update(t.id, { pinned: t.pinned });
            }
        }

        // 3. Restore Order
        const tabIds = validState.map(t => t.id);
        await chrome.tabs.move(tabIds, { index: 0 });

        // 4. Restore Groups
        const groups = {};
        const ungrouped = [];

        for (const t of validState) {
            if (t.groupId === -1) {
                ungrouped.push(t.id);
            } else {
                if (!groups[t.groupId]) groups[t.groupId] = [];
                groups[t.groupId].push(t.id);
            }
        }

        // Ungroup tabs that should be ungrouped
        if (ungrouped.length > 0) {
            await chrome.tabs.ungroup(ungrouped);
        }

        // Restore tabs to their groups
        for (const [groupId, tIds] of Object.entries(groups)) {
            const gId = parseInt(groupId);
            try {
                // Try to add to existing group
                await chrome.tabs.group({ groupId: gId, tabIds: tIds });
            } catch (e) {
                // Group doesn't exist (was deleted), create a new one
                await chrome.tabs.group({ tabIds: tIds });
            }
        }

        this.lastState = null;
    }
}
