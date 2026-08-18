<img width="1103" height="541" alt="simplecrm" src="https://github.com/user-attachments/assets/653e4839-ec50-4492-8949-828991c7668c" />

# 🛠️ SimpleCRM - Super Super Simple CRM

> An open-source, lightweight Chrome Extension SimpleCRM & Light Billing Manager designed for lawn care professionals, pressure washing operators, contractors, and home service providers. Zero monthly subscriptions, zero server overhead, 100% privacy-focused. I like to build stuff and share  :)

![License](https://img.shields.io/github/license/ductops/simplecrm?style=flat-square)
---

## ✨ Features

- 🌿 **Multi-Trade Presets:** Adaptable UI presets for Lawn Care, Pressure Washing, and General Contracting with customizable field labels and service templates.
- 🔒 **100% Offline & Private:** Operates entirely inside browser local storage and IndexedDB. Customer records and financial data never leave the device.
- 🧾 **Invoicing & Automatic Tax Calculation:** Dynamic subtotal, configurable sales tax rates, tax exemption toggles, and payment status tracking.
- 👯 **One-Click Invoice Duplication:** Clone recurring job invoices instantly with automated incrementing numbers.
- 🖨️ **Direct PDF Printing Engine:** Generate print-ready Work Cards, Postcard Mailers, and Itemized Invoices via a background iframe printer.
- 🔔 **Follow-up Reminders & Alerts:** Set follow-up dates and notes directly on customer records with built-in alert banners.
- 🖥️ **Full-Page Window Mode:** Expand from a popup widget into a dedicated full-browser tab for heavy administration.
- 📚 **Workbook Backup Library:** Export and import JSON database snapshots or export customer contact lists to CSV spreadsheets.

---

## 🚀 Getting Started (Developer / Unpacked Installation)

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/ductops/simplecrm.git
   ```

2. **Open Chrome Extensions Manager:**
Navigate to `chrome://extensions/` in your Google Chrome browser.
3. **Enable Developer Mode:**
Toggle the **Developer mode** switch in the top right corner.
4. **Load Unpacked Extension:**
Click **Load unpacked** in the top left corner and select the folder containing `manifest.json`.

---

## 📂 Project Structure

```text
├── manifest.json   # Chrome Extension Manifest V3 configuration
├── popup.html      # Main application interface and modal views
├── app.js          # Core CRM engine, calculations, state, and DOM events
├── LICENSE         # MIT Open Source License
└── README.md       # Project documentation
```

---

## 🛠️ Built With

* **HTML5 & CSS3** (CSS Custom Properties for dynamic light/dark/preset themes)
* **Vanilla JavaScript (ES6+)** (Zero external frameworks or library dependencies)
* **Chrome Extension API (Manifest V3)**

---

## 🤝 Contributing

Contributions, feature requests, and trade preset suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewPreset`)
3. Commit your Changes (`git commit -m 'Add HVAC Trade Preset'`)
4. Push to the Branch (`git push origin feature/NewPreset`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

