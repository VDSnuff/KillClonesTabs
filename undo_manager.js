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

        // Sort by index to restore order correctly
        this.lastState.sort((a, b) => a.index - b.index);

        // 1. Restore Order
        const tabIds = this.lastState.map(t => t.id);
        await chrome.tabs.move(tabIds, { index: 0 });

        // 2. Restore Groups
        const groups = {};
        const ungrouped = [];

        for (const t of this.lastState) {
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
