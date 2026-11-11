# Privacy Policy for みぬくま (Minukuma)

Last updated: November 2026

**みぬくま (Minukuma)** is committed to protecting your privacy. This Privacy Policy explains how our browser extension handles user information.

---

### 1. Zero Data Collection & Storage
- **Minukuma does not collect, transmit, sell, or store any personal information, browsing history, or property search data on any remote servers.**
- The extension runs **100% locally** within your browser.

### 2. Local Storage Usage
The extension uses the `chrome.storage.local` API solely to store user preferences on your own device:
- Selected UI language (Japanese, Chinese, or English)
- Amortization period preference (12, 24, or 36 months)
- Whether to display risk badges on listing pages

This data never leaves your device and can be cleared at any time by uninstalling the extension or clearing extension data.

### 3. Permissions Justification
- `storage`: Required to save user preferences locally.
- `activeTab`: Used strictly when the popup is opened to detect if the current active tab is a supported rental portal (SUUMO, LIFULL HOME'S, or at home) in order to display relevant status cues.

### 4. Third-Party Websites
The extension interacts only with client-side DOM elements on explicitly supported websites (`suumo.jp`, `homes.co.jp`, `athome.co.jp`) to calculate estimated rental costs and format inquiries. It does not send any requests to external third-party tracking services or analytics providers.

### 5. Changes to This Policy
If this Privacy Policy is updated in the future, the revised policy will be posted in this repository.

### 6. Contact
If you have any questions or feedback regarding this Privacy Policy, please open an issue in the official project repository.
