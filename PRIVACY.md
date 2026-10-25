# Privacy Policy for SimpleCRM & Billing Pro

**Last Updated:** October 2026

SimpleCRM & Billing Pro ("the Extension") is committed to delivering a privacy-first, local-first utility for field service professionals and trade businesses. This Privacy Policy outlines our strict policy regarding user data collection, storage, and processing.

---

### 1. Core Principle: Zero Remote Data Collection
SimpleCRM & Billing Pro does **not** collect, track, transmit, monetize, or sell personal information, business data, customer records, or browsing activity. 

There are no remote analytical trackers, external database telemetry, user fingerprinting services, or third-party tracking cookies embedded within the Extension.

---

### 2. Permissions Declared & Usage

The Extension requests only the minimum permissions necessary to function:

* **`storage`**: Used exclusively to save and retrieve your database records (customer contact info, invoices, crew rosters, taxonomies, and layout settings) inside your browser's private local sandboxed environment via `chrome.storage.local` / `localStorage`. This data never leaves your device unless you initiate a local file export.
* **`sidePanel`**: Used solely to open and operate the Extension's interface directly alongside your active browser tabs. The Extension cannot read, alter, or access the contents or URLs of the websites you navigate to.

---

### 3. Local Encryption & Data Security
* **Client-Side Processing:** All cryptographic operations (AES-256-GCM authenticated encryption and PBKDF2 key derivation) run directly within your browser session utilizing the standard, native Web Crypto API (`window.crypto.subtle`).
* **Passphrases:** Master passphrases used to encrypt your database backups are processed entirely in local memory and are never stored, logged, or transmitted anywhere. If a passphrase is lost, it cannot be recovered by the developers.

---

### 4. External Links & Services
* **Mapping Providers:** Opening a direction route or map view executes a standard navigation event in a new browser tab using standard public URL formats (Google Maps, Apple Maps, or Bing Maps). The Extension does not send background tracking calls to these providers.
* **Payment Gateways:** Invoices utilize user-specified payment links (e.g., Stripe, PayPal, Venmo). Payment transactions take place entirely on those third-party platforms under their respective privacy policies.

---

### 5. Third-Party Disclosures
Because the Extension does not collect any user data, no information is ever sold, leased, or disclosed to third parties, advertisers, or data brokers.

---

### 6. Updates & Inquiries
If our privacy practices change, this policy will be revised accordingly. For any inquiries regarding this policy or the Extension's security architecture, please contact us via the Chrome Web Store support portal or our official repository.
