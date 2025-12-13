// Debounce function to improve performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if the browser supports the CSS Custom Highlight API
if (window.CSS && CSS.highlights) {
    document.addEventListener('selectionchange', debounce(() => {
        const selection = window.getSelection();
        
        // Basic validation
        if (!selection || selection.rangeCount === 0) {
            CSS.highlights.delete('kill-clones-highlight');
            return;
        }

        const selectedText = selection.toString().trim();

        // Only highlight if text is selected and it's not too short (e.g., at least 2 chars)
        if (!selectedText || selectedText.length < 2) {
            CSS.highlights.delete('kill-clones-highlight');
            return;
        }

        const ranges = [];
        const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let currentNode = treeWalker.nextNode();
        const lowerSelectedText = selectedText.toLowerCase();

        while (currentNode) {
            // Skip if node is empty or whitespace only (optimization)
            if (!currentNode.nodeValue.trim()) {
                currentNode = treeWalker.nextNode();
                continue;
            }

            const textValue = currentNode.nodeValue;
            const lowerTextValue = textValue.toLowerCase();
            let index = lowerTextValue.indexOf(lowerSelectedText);

            while (index !== -1) {
                // Create a range for the match
                const range = new Range();
                try {
                    range.setStart(currentNode, index);
                    range.setEnd(currentNode, index + selectedText.length);
                    ranges.push(range);
                } catch (e) {
                    // Ignore range errors (e.g. if DOM changed)
                }

                index = lowerTextValue.indexOf(lowerSelectedText, index + 1);
            }

            currentNode = treeWalker.nextNode();
        }

        // Apply the highlight
        if (ranges.length > 0) {
            const highlight = new Highlight(...ranges);
            CSS.highlights.set('kill-clones-highlight', highlight);
        } else {
            CSS.highlights.delete('kill-clones-highlight');
        }
    }, 200));
} else {
    console.log("Kill The Clones: CSS Custom Highlight API not supported.");
}