# Privacy Practices & Permissions Justification

Use the following text to fill out the "Privacy practices" section in the Chrome Web Store dashboard.

## 1. History Permission (`history`)
**Justification:**
> The "history" permission is required for the "Hide Evidence" feature. This feature allows users to selectively remove specific domains (defined by the user) from their browsing history to protect their privacy. The extension does not read or collect the user's history for any other purpose.

## 2. Tab Groups Permission (`tabGroups`)
**Justification:**
> The "tabGroups" permission is necessary to enable the "Group Tabs by Domain" feature. This functionality automatically organizes the user's open tabs into native Chrome tab groups based on their website domain, helping to declutter the browser workspace.

## 3. Host Permissions (`<all_urls>`)
**Justification:**
> Host permissions for all URLs are required to inject the content script that powers the "Highlight Selected Text" feature. This allows the extension to detect text selection and apply visual highlights on any webpage the user visits. The extension only interacts with the page content when the user actively uses the highlighting feature.

---

## Financial Support Link
If the link for financial support is not working, please check the following:
1.  **Chrome Web Store Dashboard**: Go to the "Store Listing" tab and look for the "Support URL" or "Donation URL" field. Ensure the URL entered there is correct and active.
2.  **Manifest File**: This extension's `manifest.json` does not currently contain a `homepage_url` or specific donation link. If you intended to have one, you can add `"homepage_url": "https://your-donation-link.com"` to `manifest.json`.
