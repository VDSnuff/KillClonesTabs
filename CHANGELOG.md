# Changelog

### Version 1.11
*   **UI:** Added a separator line before the Settings button for better visual distinction.
*   **UI:** Increased popup height to accommodate the separator.

### Version 1.10
*   **New:** Added a "Settings" button to the popup for quick access to options.
*   **UI:** Slightly increased popup size to accommodate the new button.

### Version 1.9
*   **New:** Added setting to ignore "www" subdomain (e.g., treat `http://example.com` and `http://www.example.com` as duplicates).
*   **New:** Added setting to ignore URL parameters (e.g., treat `example.com` and `example.com?source=email` as duplicates).
*   **New:** Added setting to ignore protocol (e.g., treat `http://example.com` and `https://example.com` as duplicates).

### Version 1.8
*   **New:** Added an Options page for customizing duplicate detection settings.
*   **New:** Added setting to ignore anchors/hashes (e.g., treat `example.com` and `example.com#section` as duplicates).
*   **Improved:** "Ignore trailing slashes" is now a configurable setting (enabled by default).

### Version 1.7
*   **Improved:** URLs with and without a trailing slash (e.g., `example.com` and `example.com/`) are now treated as duplicates.

### Version 1.6
*   **Improved:** Mute/Unmute logic is now consistent with Pin/Unpin.
*   **Improved:** Status messages now correctly handle singular/plural forms.

### Version 1.5
*   **New:**
    *   Performance Boost: Replaced the slow, looping method of finding duplicate tabs with a much faster one.
    *   Pin/Unpin Toggle: The "Pin" button now also unpins tabs if they are already pinned.
    *   Status Messages: Added text feedback for pinning, unpinning, and muting tabs.
    *   UI Refresh: Moved the status text to the top of the popup and added a dividing line for a cleaner look.
*   **Technical:**
    *   Modern Code: Updated all JavaScript files to use modern syntax (`const`, `let`, arrow functions).
    *   Manifest V3: Updated the extension to the latest Chrome manifest version for better security and performance.
    *   Git Ignore: Added a `.gitignore` file to keep the repository clean.
    *   Code Refactor: Re-wrote the project to use modern ES Modules for better performance and easier updates.
    *   No More Duplicates: Created a shared `utils.js` file to hold the tab-finding logic, so it's only in one place.

### Version 1.4
*   **Manifest Update:** Upgraded to `manifest_version: 3` for compatibility with modern Chrome extension standards.

### Version 1.3
*   **New:** Added duplicate tabs tracking functionality (change color of extension icon).

### Version 1.2
*   **New:** Added tooltips.
*   **Fix:** Solved problem with pinned tabs.

### Version 1.1
*   **New:** Pin / Unpin All Tabs.
*   **New:** Mute / Unmute All Tabs.
