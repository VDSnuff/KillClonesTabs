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

// Default settings
let settings = {
    highlightEnabled: true,
    highlightColor: '#ffff00',
    highlightMatchCase: false,
    highlightWholeWords: false,
    highlightMinLength: 2
};

// Load settings
chrome.storage.sync.get(settings, (items) => {
    settings = items;
    updateHighlightColor();
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        if (changes.highlightEnabled) settings.highlightEnabled = changes.highlightEnabled.newValue;
        if (changes.highlightColor) {
            settings.highlightColor = changes.highlightColor.newValue;
            updateHighlightColor();
        }
        if (changes.highlightMatchCase) settings.highlightMatchCase = changes.highlightMatchCase.newValue;
        if (changes.highlightWholeWords) settings.highlightWholeWords = changes.highlightWholeWords.newValue;
        if (changes.highlightMinLength) settings.highlightMinLength = changes.highlightMinLength.newValue;
        
        // Re-run highlight logic if settings changed
        runHighlight();
    }
});

function updateHighlightColor() {
    document.documentElement.style.setProperty('--kill-clones-highlight-color', settings.highlightColor);
}

// Match Counter Element
let counterEl = null;

function updateCounter(count) {
    if (count > 0) {
        if (!counterEl) {
            counterEl = document.createElement('div');
            counterEl.id = 'kill-clones-counter';
            document.body.appendChild(counterEl);
        }
        counterEl.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
        counterEl.style.opacity = '1';
    } else {
        if (counterEl) {
            counterEl.style.opacity = '0';
        }
    }
}

function runHighlight() {
    if (!window.CSS || !CSS.highlights) return;

    if (!settings.highlightEnabled) {
        CSS.highlights.delete('kill-clones-highlight');
        updateCounter(0);
        return;
    }

    const selection = window.getSelection();
    
    // Basic validation
    if (!selection || selection.rangeCount === 0) {
        CSS.highlights.delete('kill-clones-highlight');
        updateCounter(0);
        return;
    }

    const selectedText = selection.toString().trim();
    const minLength = parseInt(settings.highlightMinLength) || 2;

    if (!selectedText || selectedText.length < minLength) {
        CSS.highlights.delete('kill-clones-highlight');
        updateCounter(0);
        return;
    }

    const ranges = [];
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let currentNode = treeWalker.nextNode();
    
    const searchStr = settings.highlightMatchCase ? selectedText : selectedText.toLowerCase();

    while (currentNode) {
        // Skip if node is empty or whitespace only
        if (!currentNode.nodeValue.trim()) {
            currentNode = treeWalker.nextNode();
            continue;
        }

        // Skip script and style tags content
        if (currentNode.parentNode && (currentNode.parentNode.tagName === 'SCRIPT' || currentNode.parentNode.tagName === 'STYLE')) {
            currentNode = treeWalker.nextNode();
            continue;
        }

        const textValue = currentNode.nodeValue;
        const compareValue = settings.highlightMatchCase ? textValue : textValue.toLowerCase();
        
        let index = compareValue.indexOf(searchStr);

        while (index !== -1) {
            // Whole Word Check
            if (settings.highlightWholeWords) {
                const charBefore = index > 0 ? textValue.charAt(index - 1) : ' ';
                const charAfter = index + searchStr.length < textValue.length ? textValue.charAt(index + searchStr.length) : ' ';
                
                // Simple regex for word boundary check (alphanumeric + underscore)
                const isWordChar = (char) => /\w/.test(char);
                
                if (isWordChar(charBefore) || isWordChar(charAfter)) {
                    index = compareValue.indexOf(searchStr, index + 1);
                    continue;
                }
            }

            // Create a range for the match
            const range = new Range();
            try {
                range.setStart(currentNode, index);
                range.setEnd(currentNode, index + selectedText.length);
                ranges.push(range);
            } catch (e) {
                // Ignore range errors
            }

            index = compareValue.indexOf(searchStr, index + 1);
        }

        currentNode = treeWalker.nextNode();
    }

    // Apply the highlight
    if (ranges.length > 0) {
        const highlight = new Highlight(...ranges);
        CSS.highlights.set('kill-clones-highlight', highlight);
        updateCounter(ranges.length);
    } else {
        CSS.highlights.delete('kill-clones-highlight');
        updateCounter(0);
    }
}

// Check if the browser supports the CSS Custom Highlight API
if (window.CSS && CSS.highlights) {
    document.addEventListener('selectionchange', debounce(runHighlight, 200));
} else {
    console.log("Kill Clone Tabs: CSS Custom Highlight API not supported.");
}