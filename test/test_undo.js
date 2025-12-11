import { UndoManager } from '../undo_manager.js';

// Mock Chrome API
global.chrome = {
    tabs: {
        query: async () => [],
        move: async () => {},
        ungroup: async () => {},
        group: async () => {}
    }
};

// Test Data
const mockTabs = [
    { id: 1, index: 0, groupId: -1, pinned: false },
    { id: 2, index: 1, groupId: 100, pinned: false },
    { id: 3, index: 2, groupId: 100, pinned: false }
];

// Test Suite
async function runTests() {
    console.log("Running UndoManager Tests...");
    const manager = new UndoManager();
    let passed = 0;
    let failed = 0;

    // Test 1: Capture State
    try {
        // Mock query to return tabs
        chrome.tabs.query = async () => [...mockTabs];
        
        await manager.captureState();
        
        if (manager.hasState() && manager.lastState.length === 3) {
            console.log("✅ Test 1 Passed: State captured correctly");
            passed++;
        } else {
            throw new Error("State not captured correctly");
        }
    } catch (e) {
        console.error("❌ Test 1 Failed:", e.message);
        failed++;
    }

    // Test 2: Restore State (Order)
    try {
        let movedIds = [];
        let moveIndex = -1;
        
        // Mock move
        chrome.tabs.move = async (ids, props) => {
            movedIds = ids;
            moveIndex = props.index;
        };

        await manager.restoreState();

        // Check if all IDs were moved to index 0
        const expectedIds = [1, 2, 3];
        const idsMatch = JSON.stringify(movedIds) === JSON.stringify(expectedIds);
        
        if (idsMatch && moveIndex === 0) {
            console.log("✅ Test 2 Passed: Order restoration called correctly");
            passed++;
        } else {
            throw new Error(`Move called with wrong args. IDs: ${movedIds}, Index: ${moveIndex}`);
        }
    } catch (e) {
        console.error("❌ Test 2 Failed:", e.message);
        failed++;
    }

    // Test 3: Restore Groups
    try {
        // Reset manager state for clean test
        chrome.tabs.query = async () => [...mockTabs];
        await manager.captureState();

        let ungroupedIds = [];
        let groupedCalls = [];

        chrome.tabs.ungroup = async (ids) => { ungroupedIds = ids; };
        chrome.tabs.group = async (props) => { groupedCalls.push(props); };

        await manager.restoreState();

        // Check ungroup
        const ungroupCorrect = ungroupedIds.length === 1 && ungroupedIds[0] === 1;
        
        // Check group
        // Should have one call for group 100 with tabs [2, 3]
        const groupCorrect = groupedCalls.length === 1 && 
                             groupedCalls[0].groupId === 100 && 
                             JSON.stringify(groupedCalls[0].tabIds) === JSON.stringify([2, 3]);

        if (ungroupCorrect && groupCorrect) {
            console.log("✅ Test 3 Passed: Group restoration called correctly");
            passed++;
        } else {
            throw new Error(`Group logic failed. Ungrouped: ${ungroupedIds}, Grouped: ${JSON.stringify(groupedCalls)}`);
        }

    } catch (e) {
        console.error("❌ Test 3 Failed:", e.message);
        failed++;
    }

    console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);
}

runTests();
