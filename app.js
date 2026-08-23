const presetThemes = {
  lawn: {
    name: "🌱 Green Thumb Lawn Care",
    services: ["Standard Mowing & Edging", "Full Lawn Maintenance Package", "Spring/Fall Lawn Cleanup", "Aeration & Overseeding", "Mulch Installation & Bed Prep", "Shrub & Tree Trimming"],
    labels: { size: "Lawn Size / Acreage", code: "Gate / Access Clearance", terrain: "Turf / Grass Type" },
    headline: "Ready for a Healthier, Greener Lawn?", callout: "Contact Us for a Free Estimate Today!"
  },
  wash: {
    name: "💦 HydroClean Pressure Washing",
    services: ["House Soft Wash", "Driveway & Sidewalk Wash", "Deck & Fence Restoration", "Gutter Cleaning & Flushing", "Commercial Surface Cleaning"],
    labels: { size: "Surface Area (Sq Ft)", code: "Water Hookup Access", terrain: "Surface Material (Concrete/Vinyl/Wood)" },
    headline: "Restore Your Curb Appeal Today!", callout: "Call Today for a Fast, Free Quote!"
  },
  trade: {
    name: "🔨 Apex Contracting & Services",
    services: ["General Repair / Handyman", "Drywall & Painting", "Deck & Framing Construction", "Tile & Flooring Installation", "Rough-in Service Call"],
    labels: { size: "Project Dimensions / Sq Ft", code: "Lockbox / Gate Code", terrain: "Jobsite Environment / Specs" },
    headline: "Quality Craftsmanship Guaranteed", callout: "Schedule Your Project Consultation Today!"
  }
};

let appState = {
  presetTheme: 'lawn', theme: 'light', sidebarCollapsed: false, autoloadDefault: true,
  defaultTaxRate: 7.00, taxId: "", paymentTerms: "Payment due upon receipt.", paymentUrl: "",
  invoiceFooterNote: "Thank you for your business!",
  mailerHeadline: presetThemes.lawn.headline, mailerCallout: presetThemes.lawn.callout,
  company: { name: presetThemes.lawn.name, details: "(555) 234-5678 | info@mybusiness.com", logo: "" },
  services: [...presetThemes.lawn.services],
  customers: [], invoices: [], selectedCustomerId: null
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  attachEventListeners();
});

function initApp() {
  const stored = localStorage.getItem('multiTradeCrmData');
  if (stored) {
    try { appState = JSON.parse(stored); } catch (e) { console.error(e); }
  } else if (appState.autoloadDefault) {
    loadSampleData(); saveState();
  }

  if (window.innerWidth > 890) document.body.classList.add("full-page-mode");

  applyPresetTheme(appState.presetTheme || 'lawn');
  applyTheme(appState.theme || 'light');
  applySidebarState();
  updateBrandingUI();
  populateServicesDropdown();
  renderCustomerList();
  populateRolodexDropdown();

  if (appState.customers.length > 0) loadCustomerIntoForm(appState.customers[0].id);

  renderYouViewOverview();
  showTab('overview');
}

function loadSampleData() {
  appState.customers = [
    {
      id: 101, name: "John Doe", ownerTitle: "The Doe Family", phone: "(555) 019-2831", email: "john@example.com", address: "742 Evergreen Terrace",
      size: "5,500 sq ft", gate: "36-inch side gate", grass: "Fescue / Flat yard", equipment: "Walk Mower, Edger",
      internalCost: "22.50", reminderDate: "2026-09-06", reminderNote: "Call for Fall Aeration quote",
      service: appState.services[0] || "General Service", frequency: "Weekly", status: "Active Contract", price: "45.00", payment: "Credit Card"
    },
    {
      id: 102, name: "Mike Tyson", ownerTitle: "Tyson Residence", phone: "(314) 555-1212", email: "mike@example.com", address: "123 Heavyweight Lane",
      size: "12,000 sq ft", gate: "Double gate access", grass: "Bermuda", equipment: "Ride Mower",
      internalCost: "40.00", reminderDate: "2026-10-10", reminderNote: "Make sure they are good to go. Last month they had yard damage.",
      service: appState.services[1] || "Full Maintenance", frequency: "Bi-Weekly", status: "Active Contract", price: "85.00", payment: "Check"
    }
  ];

  appState.invoices = [{
    id: 1001, customerId: 101, number: "INV-1001", date: "2026-08-23", description: "Monthly Recurring Service Contract",
    amount: "180.00", applyTax: true, taxRate: 7.00, status: "Unpaid"
  }];
}

function saveState() { localStorage.setItem('multiTradeCrmData', JSON.stringify(appState)); }

function attachEventListeners() {
  document.getElementById('btnOverviewTab').addEventListener('click', () => showTab('overview'));
  document.getElementById('btnCustomerTab').addEventListener('click', () => showTab('customer'));
  document.getElementById('btnInvoicesTab').addEventListener('click', () => showTab('invoices'));
  document.getElementById('btnSettingsTab').addEventListener('click', () => showTab('settings'));

  document.getElementById('btnNewCustomerFromDashboard').addEventListener('click', () => { showTab('customer'); createNewCustomer(); });
  document.getElementById('btnNewCustomer').addEventListener('click', () => { showTab('customer'); createNewCustomer(); });
  document.getElementById('btnTabNewInvoice').addEventListener('click', () => openInvoiceCreateModal());

  const expandBtn = document.getElementById('btnExpandWindow');
  if (expandBtn) expandBtn.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") }));
  
  document.getElementById('btnToggleSidebar').addEventListener('click', toggleSidebar);
  document.getElementById('btnToggleTheme').addEventListener('click', toggleTheme);
  
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  document.getElementById('settingPresetTheme').addEventListener('change', onPresetThemeChange);
  document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);

  document.getElementById('btnSaveLibraryState').addEventListener('click', () => { saveState(); alert('Workbook library saved!'); });
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnImportJSON').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importJSON);

  document.getElementById('search').addEventListener('input', renderCustomerList);
  document.getElementById('statusFilter').addEventListener('change', renderCustomerList);

  document.getElementById('tabInvoiceSearch').addEventListener('input', renderTabInvoiceTable);
  document.getElementById('tabInvoiceStatusFilter').addEventListener('change', renderTabInvoiceTable);

  document.getElementById('rolodexSelect').addEventListener('change', (e) => {
    if (e.target.value) loadCustomerIntoForm(parseInt(e.target.value));
  });
  document.getElementById('rolodexSearch').addEventListener('input', populateRolodexDropdown);

  document.getElementById('btnSaveCustomer').addEventListener('click', saveCurrentCustomer);
  document.getElementById('btnDeleteCustomer').addEventListener('click', deleteCurrentCustomer);
  document.getElementById('btnPrintCard').addEventListener('click', () => printCustomerDocument('card'));
  document.getElementById('btnPrintMailer').addEventListener('click', () => printCustomerDocument('mailer'));

  document.getElementById('btnCreateCustomerInvoice').addEventListener('click', openInvoiceModalForCurrentCustomer);
  document.getElementById('btnCloseCreateInvoiceModal').addEventListener('click', () => closeModal('createInvoiceModal'));
  document.getElementById('btnCancelInvoiceForm').addEventListener('click', () => closeModal('createInvoiceModal'));
  
  document.getElementById('invCustomerId').addEventListener('change', autoFillInvoiceCustomerData);
  document.getElementById('invServicePreset').addEventListener('change', onInvoiceServicePresetChange);
  document.getElementById('invAmount').addEventListener('input', updateInvoiceTaxCalculations);
  document.getElementById('invApplyTax').addEventListener('change', updateInvoiceTaxCalculations);
  document.getElementById('invTaxRate').addEventListener('input', updateInvoiceTaxCalculations);

  document.getElementById('btnSubmitInvoiceForm').addEventListener('click', (e) => { e.preventDefault(); saveInvoice(); });
}

function showTab(tabName) {
  document.getElementById('customerEditorSection').style.display = tabName === 'customer' ? 'block' : 'none';
  document.getElementById('invoicesSection').style.display = tabName === 'invoices' ? 'block' : 'none';
  document.getElementById('settingsSection').style.display = tabName === 'settings' ? 'block' : 'none';

  if (tabName === 'invoices') renderTabInvoiceTable();
  if (tabName === 'settings') loadSettingsForm();

  renderYouViewOverview();
}

function populateRolodexDropdown() {
  const sel = document.getElementById('rolodexSelect');
  const search = document.getElementById('rolodexSearch').value.toLowerCase();
  sel.innerHTML = '';

  const filtered = appState.customers.filter(c => c.name.toLowerCase().includes(search) || c.address.toLowerCase().includes(search));

  if (filtered.length === 0) {
    sel.innerHTML = `<option value="">No matching customers</option>`;
    return;
  }

  filtered.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `📇 ${c.name} — ${c.address} (${c.service})`;
    if (c.id === appState.selectedCustomerId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderYouViewOverview() {
  let totalUnpaid = 0;
  let overdueCount = 0;
  
  appState.invoices.forEach(inv => {
    if (inv.status === 'Unpaid' || inv.status === 'Overdue') {
      const { grandTotal } = calculateInvoiceTotals(inv);
      totalUnpaid += grandTotal;
      if (inv.status === 'Overdue') overdueCount++;
    }
  });

  const activeContractsCount = appState.customers.filter(c => c.status === 'Active Contract').length;
  const pendingRemindersCount = appState.customers.filter(c => c.reminderDate && c.reminderNote).length;

  document.getElementById('statUnpaidTotal').textContent = `$${totalUnpaid.toFixed(2)}`;
  document.getElementById('statOverdueCount').textContent = overdueCount;
  document.getElementById('statActiveContracts').textContent = activeContractsCount;
  document.getElementById('statPendingReminders').textContent = pendingRemindersCount;

  // Reminders Widget
  const remTbody = document.getElementById('youViewRemindersTableBody');
  const reminderCusts = appState.customers.filter(c => c.reminderDate && c.reminderNote);

  if (reminderCusts.length === 0) {
    remTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No pending customer follow-up reminders.</td></tr>`;
  } else {
    remTbody.innerHTML = '';
    reminderCusts.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.name}</strong> (${c.phone || 'No phone'})</td>
        <td><span class="badge badge-overdue">${c.reminderDate}</span></td>
        <td>${c.reminderNote}</td>
        <td>
          <div style="display:flex; gap:4px; align-items:center;">
            <select class="form-control snooze-select btn-sm" style="width:110px; margin:0;" data-id="${c.id}">
              <option value="">-- Snooze --</option>
              <option value="7">Snooze +1 Wk</option>
              <option value="14">Snooze +2 Wks</option>
              <option value="clear">Mark Complete</option>
            </select>
            <button type="button" class="btn btn-sm btn-secondary btn-edit-cust-rem">✏️ Edit</button>
          </div>
        </td>
      `;

      tr.querySelector('.snooze-select').addEventListener('change', (e) => handleSnoozeReminder(c.id, e.target.value));
      tr.querySelector('.btn-edit-cust-rem').addEventListener('click', () => {
        showTab('customer');
        loadCustomerIntoForm(c.id);
      });

      remTbody.appendChild(tr);
    });
  }

  // Unpaid Invoices Widget
  const invTbody = document.getElementById('youViewUnpaidInvoicesTableBody');
  const unpaidInvs = appState.invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue');

  if (unpaidInvs.length === 0) {
    invTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No unpaid invoices! All clear! 🎉</td></tr>`;
  } else {
    invTbody.innerHTML = '';
    unpaidInvs.forEach(inv => {
      const cust = appState.customers.find(c => c.id === inv.customerId);
      const { grandTotal } = calculateInvoiceTotals(inv);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${inv.number}</strong></td>
        <td>${cust ? cust.name : 'Unknown Customer'}</td>
        <td>${inv.date}</td>
        <td>$${grandTotal.toFixed(2)}</td>
        <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
        <td>
          <button type="button" class="btn btn-sm btn-secondary btn-copy-pay">🔗 Pay Link</button>
          <button type="button" class="btn btn-sm btn-secondary btn-edit-overview-inv">✏️ Edit</button>
        </td>
      `;
      tr.querySelector('.btn-copy-pay').addEventListener('click', () => copyPaymentLink(inv.id));
      tr.querySelector('.btn-edit-overview-inv').addEventListener('click', () => openInvoiceCreateModal(inv.id));
      invTbody.appendChild(tr);
    });
  }
}

function handleSnoozeReminder(custIdx, val) {
  const c = appState.customers.find(cust => cust.id === custIdx);
  if (!c) return;

  if (val === 'clear') {
    c.reminderDate = '';
    c.reminderNote = '';
  } else if (val) {
    const days = parseInt(val);
    const currDate = new Date(c.reminderDate || Date.now());
    currDate.setDate(currDate.getDate() + days);
    c.reminderDate = currDate.toISOString().slice(0,10);
  }

  saveState();
  renderYouViewOverview();
  if (appState.selectedCustomerId === custIdx) loadCustomerIntoForm(custIdx);
}

function renderTabInvoiceTable() {
  const tbody = document.getElementById('tabInvoiceTableBody');
  const search = document.getElementById('tabInvoiceSearch').value.toLowerCase();
  const statusFilter = document.getElementById('tabInvoiceStatusFilter').value;

  const filtered = appState.invoices.filter(inv => {
    const cust = appState.customers.find(c => c.id === inv.customerId);
    const custName = cust ? cust.name.toLowerCase() : '';
    const matchesSearch = inv.number.toLowerCase().includes(search) || custName.includes(search) || inv.description.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No invoices found.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  filtered.forEach(inv => {
    const cust = appState.customers.find(c => c.id === inv.customerId);
    const { grandTotal } = calculateInvoiceTotals(inv);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.number}</strong></td>
      <td>${cust ? cust.name : 'Unknown Customer'}</td>
      <td>${inv.date}</td>
      <td>${inv.description}</td>
      <td>$${grandTotal.toFixed(2)}</td>
      <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-secondary btn-print-inv">🖨️ Print</button>
        <button type="button" class="btn btn-sm btn-secondary btn-dup-inv">👯 Duplicate</button>
        <button type="button" class="btn btn-sm btn-edit-inv">✏️ Edit</button>
        <button type="button" class="btn btn-sm btn-secondary btn-copy-pay">🔗 Pay Link</button>
        <button type="button" class="btn btn-sm btn-danger btn-del-inv">🗑️ Delete</button>
      </td>
    `;
    tr.querySelector('.btn-print-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); printSingleInvoice(inv.id); });
    tr.querySelector('.btn-dup-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); duplicateInvoice(inv.id); });
    tr.querySelector('.btn-edit-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openInvoiceCreateModal(inv.id); });
    tr.querySelector('.btn-copy-pay').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); copyPaymentLink(inv.id); });
    tr.querySelector('.btn-del-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); deleteInvoice(inv.id); });
    tbody.appendChild(tr);
  });
}

function toggleSidebar() {
  appState.sidebarCollapsed = !appState.sidebarCollapsed;
  applySidebarState(); saveState();
}

function applySidebarState() {
  const container = document.getElementById('mainContainer');
  const btn = document.getElementById('btnToggleSidebar');
  if (appState.sidebarCollapsed) { container.classList.add('sidebar-collapsed'); btn.textContent = '▶'; }
  else { container.classList.remove('sidebar-collapsed'); btn.textContent = '◀'; }
}

function applyPresetTheme(presetKey) {
  appState.presetTheme = presetKey;
  document.documentElement.setAttribute('data-preset', presetKey);
  const p = presetThemes[presetKey] || presetThemes.lawn;
  document.getElementById('labelScopeSize').textContent = p.labels.size;
  document.getElementById('labelAccessCode').textContent = p.labels.code;
  document.getElementById('labelSiteTerrain').textContent = p.labels.terrain;
}

function onPresetThemeChange(e) {
  const presetKey = e.target.value;
  applyPresetTheme(presetKey);
  const p = presetThemes[presetKey];
  document.getElementById('settingCompName').value = p.name;
  document.getElementById('settingMailerHeadline').value = p.headline;
  document.getElementById('settingMailerCallout').value = p.callout;
  document.getElementById('settingServices').value = p.services.join(', ');
}

function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(appState.theme); saveState();
}

function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); }

function loadSettingsForm() {
  document.getElementById('settingPresetTheme').value = appState.presetTheme || 'lawn';
  document.getElementById('settingCompName').value = appState.company.name || '';
  document.getElementById('settingCompDetails').value = appState.company.details || '';
  document.getElementById('settingDefaultTaxRate').value = appState.defaultTaxRate || 0;
  document.getElementById('settingTaxId').value = appState.taxId || '';
  document.getElementById('settingPaymentUrl').value = appState.paymentUrl || '';
  document.getElementById('settingPaymentTerms').value = appState.paymentTerms || '';
  document.getElementById('settingInvoiceFooterNote').value = appState.invoiceFooterNote || 'Thank you for your business!';
  document.getElementById('settingMailerHeadline').value = appState.mailerHeadline || presetThemes.lawn.headline;
  document.getElementById('settingMailerCallout').value = appState.mailerCallout || presetThemes.lawn.callout;
  document.getElementById('settingServices').value = (appState.services || []).join(', ');
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) { appState.company.logo = evt.target.result; updateBrandingUI(); saveState(); };
    reader.readAsDataURL(file);
  }
}

function saveSettings() {
  applyPresetTheme(document.getElementById('settingPresetTheme').value);
  appState.company.name = document.getElementById('settingCompName').value;
  appState.company.details = document.getElementById('settingCompDetails').value;
  appState.defaultTaxRate = parseFloat(document.getElementById('settingDefaultTaxRate').value) || 0;
  appState.taxId = document.getElementById('settingTaxId').value;
  appState.paymentUrl = document.getElementById('settingPaymentUrl').value;
  appState.paymentTerms = document.getElementById('settingPaymentTerms').value;
  appState.invoiceFooterNote = document.getElementById('settingInvoiceFooterNote').value;
  appState.mailerHeadline = document.getElementById('settingMailerHeadline').value;
  appState.mailerCallout = document.getElementById('settingMailerCallout').value;
  appState.services = document.getElementById('settingServices').value.split(',').map(s => s.trim()).filter(s => s.length > 0);

  saveState(); updateBrandingUI(); populateServicesDropdown();
  alert('All Settings Preferences Saved Successfully!');
}

function updateBrandingUI() {
  document.getElementById('displayCompanyName').textContent = appState.company.name || 'Business Manager';
  document.getElementById('displayCompanyDetails').textContent = appState.company.details || '';
  const logoImg = document.getElementById('displayCompanyLogo');
  if (appState.company.logo) { logoImg.src = appState.company.logo; logoImg.style.display = 'block'; }
  else { logoImg.style.display = 'none'; }
}

function populateServicesDropdown() {
  const sel = document.getElementById('primaryService');
  const invSel = document.getElementById('invServicePreset');
  const val = sel.value;
  
  sel.innerHTML = '';
  invSel.innerHTML = '<option value="">-- Custom Line Item --</option>';

  (appState.services || []).forEach(s => {
    const opt = document.createElement('option'); opt.value = s; opt.textContent = s; sel.appendChild(opt);
    const invOpt = document.createElement('option'); invOpt.value = s; invOpt.textContent = s; invSel.appendChild(invOpt);
  });
  
  if (val) sel.value = val;
}

function onInvoiceServicePresetChange(e) {
  const selectedService = e.target.value;
  if (!selectedService) return;
  document.getElementById('invDescription').value = `${selectedService}`;
  
  const custId = parseInt(document.getElementById('invCustomerId').value);
  const cust = appState.customers.find(c => c.id === custId);
  if (cust && cust.price && parseFloat(cust.price) > 0) {
    document.getElementById('invAmount').value = cust.price;
  }
  updateInvoiceTaxCalculations();
}

function renderCustomerList() {
  const list = document.getElementById('customerList');
  const search = document.getElementById('search').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  list.innerHTML = '';

  const filtered = appState.customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search) || c.address.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filtered.forEach(c => {
    const li = document.createElement('li');
    li.className = `customer-item ${c.id === appState.selectedCustomerId ? 'active' : ''}`;
    li.onclick = () => { showTab('customer'); loadCustomerIntoForm(c.id); };
    li.innerHTML = `<h4>${c.name || 'Unnamed Record'}</h4><p>${c.address || 'No Address'}</p><p><strong>${c.service}</strong> - $${c.price || '0.00'}</p>`;
    list.appendChild(li);
  });
}

function loadCustomerIntoForm(id) {
  const c = appState.customers.find(item => item.id === id);
  if (!c) return;
  appState.selectedCustomerId = id;

  document.getElementById('custName').value = c.name || '';
  document.getElementById('custOwnerTitle').value = c.ownerTitle || '';
  document.getElementById('custPhone').value = c.phone || '';
  document.getElementById('custEmail').value = c.email || '';
  document.getElementById('custAddress').value = c.address || '';
  document.getElementById('propertySize').value = c.size || '';
  document.getElementById('gateCode').value = c.gate || '';
  document.getElementById('grassType').value = c.grass || '';
  document.getElementById('equipmentNeeds').value = c.equipment || '';
  
  const costEl = document.getElementById('internalCost');
  if (costEl) costEl.value = c.internalCost || '';

  const rDateEl = document.getElementById('custReminderDate');
  if (rDateEl) rDateEl.value = c.reminderDate || '';

  const rNoteEl = document.getElementById('custReminderNote');
  if (rNoteEl) rNoteEl.value = c.reminderNote || '';

  document.getElementById('primaryService').value = c.service || (appState.services[0] || '');
  document.getElementById('serviceFrequency').value = c.frequency || 'Weekly';
  document.getElementById('customerStatus').value = c.status || 'Active Contract';
  document.getElementById('servicePrice').value = c.price || '';
  document.getElementById('paymentMethod').value = c.payment || 'Credit Card';

  renderCustomerInvoiceTable(c.id);
  renderCustomerList();
  populateRolodexDropdown();
}

function createNewCustomer() {
  const newCust = {
    id: Date.now(), name: "New Customer", ownerTitle: "", phone: "", email: "", address: "", size: "", gate: "", grass: "",
    equipment: "", internalCost: "", reminderDate: "", reminderNote: "",
    service: appState.services[0] || "Service Call", frequency: "Weekly", status: "Lead/Quote", price: "0.00", payment: "Credit Card"
  };
  appState.customers.push(newCust); saveState(); loadCustomerIntoForm(newCust.id);
}

function saveCurrentCustomer() {
  if (!appState.selectedCustomerId) return;
  const c = appState.customers.find(item => item.id === appState.selectedCustomerId);
  if (!c) return;

  c.name = document.getElementById('custName').value;
  c.ownerTitle = document.getElementById('custOwnerTitle').value;
  c.phone = document.getElementById('custPhone').value;
  c.email = document.getElementById('custEmail').value;
  c.address = document.getElementById('custAddress').value;
  c.size = document.getElementById('propertySize').value;
  c.gate = document.getElementById('gateCode').value;
  c.grass = document.getElementById('grassType').value;
  c.equipment = document.getElementById('equipmentNeeds').value;
  
  const costEl = document.getElementById('internalCost');
  if (costEl) c.internalCost = costEl.value;

  const rDateEl = document.getElementById('custReminderDate');
  if (rDateEl) c.reminderDate = rDateEl.value;

  const rNoteEl = document.getElementById('custReminderNote');
  if (rNoteEl) c.reminderNote = rNoteEl.value;

  c.service = document.getElementById('primaryService').value;
  c.frequency = document.getElementById('serviceFrequency').value;
  c.status = document.getElementById('customerStatus').value;
  c.price = document.getElementById('servicePrice').value;
  c.payment = document.getElementById('paymentMethod').value;

  saveState(); renderCustomerList(); populateRolodexDropdown(); renderYouViewOverview(); alert('Customer record saved!');
}

function deleteCurrentCustomer() {
  if (!appState.selectedCustomerId) return;
  if (confirm("Delete customer record and all associated invoices?")) {
    appState.customers = appState.customers.filter(c => c.id !== appState.selectedCustomerId);
    appState.invoices = appState.invoices.filter(i => i.customerId !== appState.selectedCustomerId);
    appState.selectedCustomerId = appState.customers.length > 0 ? appState.customers[0].id : null;
    saveState(); renderCustomerList(); populateRolodexDropdown(); renderYouViewOverview();
    if (appState.selectedCustomerId) loadCustomerIntoForm(appState.selectedCustomerId);
  }
}

function calculateInvoiceTotals(inv) {
  const subtotal = parseFloat(inv.amount) || 0;
  const applyTax = inv.applyTax !== false;
  const rate = applyTax ? (parseFloat(inv.taxRate) || 0) : 0;
  const taxAmount = subtotal * (rate / 100);
  const grandTotal = subtotal + taxAmount;
  return { subtotal, rate, taxAmount, grandTotal };
}

function renderCustomerInvoiceTable(customerId) {
  const tbody = document.getElementById('customerInvoiceTableBody');
  const custInvoices = appState.invoices.filter(i => i.customerId === customerId);

  if (custInvoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No invoices for this customer yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  custInvoices.forEach(inv => {
    const { grandTotal } = calculateInvoiceTotals(inv);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.number}</strong></td>
      <td>${inv.date}</td>
      <td>${inv.description}</td>
      <td>$${grandTotal.toFixed(2)}</td>
      <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-secondary btn-print-inv">🖨️ Print</button>
        <button type="button" class="btn btn-sm btn-secondary btn-dup-inv">👯 Duplicate</button>
        <button type="button" class="btn btn-sm btn-edit-inv">✏️ Edit</button>
        <button type="button" class="btn btn-sm btn-danger btn-del-inv">🗑️ Delete</button>
      </td>
    `;
    tr.querySelector('.btn-print-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); printSingleInvoice(inv.id); });
    tr.querySelector('.btn-dup-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); duplicateInvoice(inv.id); });
    tr.querySelector('.btn-edit-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openInvoiceCreateModal(inv.id); });
    tr.querySelector('.btn-del-inv').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); deleteInvoice(inv.id); });
    tbody.appendChild(tr);
  });
}

function copyPaymentLink(invId) {
  if (!appState.paymentUrl) {
    alert("Set up your 3rd-party Payment URL in settings first!");
    return;
  }
  const inv = appState.invoices.find(i => i.id === invId);
  const { grandTotal } = calculateInvoiceTotals(inv);
  const payMsg = `Payment for ${inv.number} ($${grandTotal.toFixed(2)}): ${appState.paymentUrl}`;
  navigator.clipboard.writeText(payMsg);
  alert(`Payment details copied to clipboard:\n${payMsg}`);
}

function duplicateInvoice(invId) {
  const original = appState.invoices.find(i => i.id === invId);
  if (!original) return;

  const duplicated = {
    ...original,
    id: Date.now(),
    number: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().slice(0,10),
    status: "Unpaid"
  };

  appState.invoices.push(duplicated);
  saveState();
  renderTabInvoiceTable();
  renderYouViewOverview();
  if (appState.selectedCustomerId) renderCustomerInvoiceTable(appState.selectedCustomerId);
  alert(`Invoice duplicated as ${duplicated.number}!`);
}

function deleteInvoice(invId) {
  const inv = appState.invoices.find(i => i.id === invId);
  if (!inv) return;
  if (confirm(`Are you sure you want to delete invoice ${inv.number}?`)) {
    appState.invoices = appState.invoices.filter(i => i.id !== invId);
    saveState();
    renderTabInvoiceTable();
    renderYouViewOverview();
    if (appState.selectedCustomerId) renderCustomerInvoiceTable(appState.selectedCustomerId);
  }
}

function populateInvoiceCustomerDropdown() {
  const sel = document.getElementById('invCustomerId');
  sel.innerHTML = appState.customers.map(c => `<option value="${c.id}">${c.name} (${c.address})</option>`).join('');
}

function openInvoiceModalForCurrentCustomer() {
  if (!appState.selectedCustomerId) return alert("Select or create a customer record first.");
  openInvoiceCreateModal(null, appState.selectedCustomerId);
}

function openInvoiceCreateModal(invId = null, defaultCustId = null) {
  populateInvoiceCustomerDropdown();
  populateServicesDropdown();
  const form = document.getElementById('invoiceForm');
  form.reset();

  if (invId) {
    const inv = appState.invoices.find(i => i.id === invId);
    if (inv) {
      document.getElementById('invoiceFormTitle').textContent = "Edit Invoice";
      document.getElementById('invId').value = inv.id;
      document.getElementById('invCustomerId').value = inv.customerId;
      document.getElementById('invNum').value = inv.number;
      document.getElementById('invDate').value = inv.date;
      document.getElementById('invDescription').value = inv.description;
      document.getElementById('invAmount').value = inv.amount;
      document.getElementById('invApplyTax').checked = inv.applyTax !== false;
      document.getElementById('invTaxRate').value = inv.taxRate !== undefined ? inv.taxRate : (appState.defaultTaxRate || 0);
      document.getElementById('invStatus').value = inv.status;
    }
  } else {
    document.getElementById('invoiceFormTitle').textContent = "Create New Invoice";
    document.getElementById('invId').value = "";
    if (defaultCustId) document.getElementById('invCustomerId').value = defaultCustId;
    document.getElementById('invNum').value = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('invDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('invApplyTax').checked = true;
    document.getElementById('invTaxRate').value = appState.defaultTaxRate || 0;
    autoFillInvoiceCustomerData();
  }

  updateInvoiceTaxCalculations();
  document.getElementById('createInvoiceModal').style.display = 'flex';
}

function updateInvoiceTaxCalculations() {
  const subtotal = parseFloat(document.getElementById('invAmount').value) || 0;
  const applyTax = document.getElementById('invApplyTax').checked;
  const rate = applyTax ? (parseFloat(document.getElementById('invTaxRate').value) || 0) : 0;
  const taxAmount = subtotal * (rate / 100);
  const grandTotal = subtotal + taxAmount;

  document.getElementById('calcSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('calcTaxRateLabel').textContent = rate.toFixed(2);
  document.getElementById('calcTaxAmount').textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById('calcGrandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

function autoFillInvoiceCustomerData() {
  const invId = document.getElementById('invId').value;
  if (invId) return;

  const custId = parseInt(document.getElementById('invCustomerId').value);
  const cust = appState.customers.find(c => c.id === custId);
  if (cust) {
    document.getElementById('invDescription').value = `${cust.service} (${cust.frequency})`;
    document.getElementById('invAmount').value = cust.price || "0.00";
    updateInvoiceTaxCalculations();
  }
}

function saveInvoice() {
  const idVal = document.getElementById('invId').value;
  const custId = parseInt(document.getElementById('invCustomerId').value);
  const num = document.getElementById('invNum').value;
  const date = document.getElementById('invDate').value;
  const desc = document.getElementById('invDescription').value;
  const amount = document.getElementById('invAmount').value;
  const applyTax = document.getElementById('invApplyTax').checked;
  const taxRate = parseFloat(document.getElementById('invTaxRate').value) || 0;
  const status = document.getElementById('invStatus').value;

  if (idVal) {
    const inv = appState.invoices.find(i => i.id === parseInt(idVal));
    if (inv) {
      inv.customerId = custId; inv.number = num; inv.date = date; inv.description = desc;
      inv.amount = amount; inv.applyTax = applyTax; inv.taxRate = taxRate; inv.status = status;
    }
  } else {
    appState.invoices.push({
      id: Date.now(), customerId: custId, number: num, date: date, description: desc,
      amount: amount, applyTax: applyTax, taxRate: taxRate, status: status
    });
  }

  saveState(); closeModal('createInvoiceModal'); renderTabInvoiceTable(); renderYouViewOverview();
  if (appState.selectedCustomerId) renderCustomerInvoiceTable(appState.selectedCustomerId);
}

function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function printCustomerDocument(type) {
  const cust = appState.customers.find(c => c.id === appState.selectedCustomerId);
  if (!cust) return alert("Select a customer record first.");

  const p = presetThemes[appState.presetTheme] || presetThemes.lawn;
  const logoHtml = appState.company.logo ? `<img src="${appState.company.logo}" style="max-height:60px; margin-bottom:10px;">` : '';
  let content = '';

  if (type === 'card') {
    content = `
      <div style="border:2px solid #333; padding:20px; max-width:500px; font-family:sans-serif; margin: 0 auto;">
        ${logoHtml}
        <h2 style="margin-top:0;">${appState.company.name || 'Service Provider'}</h2>
        <p style="font-size:0.85rem; color:#555;">${appState.company.details}</p>
        <hr>
        <h3>Customer Service Card</h3>
        <p><strong>Name / Title:</strong> ${cust.name} ${cust.ownerTitle ? `(${cust.ownerTitle})` : ''}</p>
        <p><strong>Address:</strong> ${cust.address}</p>
        <p><strong>Phone:</strong> ${cust.phone} | <strong>Email:</strong> ${cust.email}</p>
        <hr>
        <p><strong>Service:</strong> ${cust.service} (${cust.frequency})</p>
        <p><strong>${p.labels.code}:</strong> ${cust.gate || 'N/A'}</p>
        <p><strong>${p.labels.terrain}:</strong> ${cust.grass || 'N/A'}</p>
        <p><strong>Equipment Required:</strong> ${cust.equipment || 'Standard'}</p>
      </div>
    `;
  } else if (type === 'mailer') {
    const greetingName = cust.ownerTitle || cust.name || 'Neighbor';
    const headline = appState.mailerHeadline || p.headline;
    const callout = appState.mailerCallout || p.callout;

    content = `
      <div style="border:2px dashed #333; padding:25px; max-width:550px; font-family:sans-serif; text-align:center; margin: 0 auto;">
        ${logoHtml}
        <h2 style="margin-top:0; color:#333;">${appState.company.name}</h2>
        <h3 style="color:#555; margin-bottom:15px;">${headline}</h3>
        <p>Greetings <strong>${greetingName}</strong> at <strong>${cust.address}</strong>!</p>
        <p>We provide professional ${appState.services.slice(0, 3).join(', ')} services right here in your area.</p>
        <div style="background:#f4f6f8; border:1px solid #333; padding:12px; margin:15px 0; border-radius:6px;">
          <h3 style="margin:0; font-size:1.1rem;">${callout}</h3>
        </div>
        <p><strong>Contact Info:</strong> ${appState.company.details}</p>
      </div>
    `;
  }

  executeIframePrint(content);
}

function printSingleInvoice(invoiceId) {
  const inv = appState.invoices.find(i => i.id === invoiceId);
  if (!inv) return;
  const cust = appState.customers.find(c => c.id === inv.customerId) || {};
  const { subtotal, rate, taxAmount, grandTotal } = calculateInvoiceTotals(inv);

  const logoHtml = appState.company.logo ? `<img src="${appState.company.logo}" style="max-height:70px;">` : '';
  const taxIdHtml = appState.taxId ? `<br><small style="color:#555;">Tax ID: ${appState.taxId}</small>` : '';
  const footerNote = appState.invoiceFooterNote || 'Thank you for your business!';

  let payQrHtml = '';
  if (appState.paymentUrl) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(appState.paymentUrl)}`;
    payQrHtml = `
      <div style="margin-top:15px; text-align:right;">
        <p style="margin:0 0 5px 0; font-size:0.8rem; font-weight:bold;">Scan to Pay Online:</p>
        <img src="${qrUrl}" style="width:90px; height:90px; border:1px solid #ccc; padding:3px;">
      </div>
    `;
  }

  const content = `
    <div style="max-width:700px; font-family:sans-serif; padding:20px; border:1px solid #ccc; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          ${logoHtml}
          <h2 style="margin:5px 0 0 0;">${appState.company.name}</h2>
          <p style="font-size:0.85rem; color:#555; margin:0;">${appState.company.details}${taxIdHtml}</p>
        </div>
        <div style="text-align:right;">
          <h1 style="margin:0; color:#333;">INVOICE</h1>
          <p style="margin:5px 0;"><strong>${inv.number}</strong></p>
          <p style="margin:0; font-size:0.9rem;">Date: ${inv.date}</p>
          <p style="margin:5px 0 0 0;"><span style="padding:4px 8px; border:1px solid #333; font-weight:bold;">${inv.status.toUpperCase()}</span></p>
        </div>
      </div>
      <hr style="margin:20px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
        <div>
          <strong>Billed To:</strong><br>
          ${cust.name || 'Valued Customer'} ${cust.ownerTitle ? `(${cust.ownerTitle})` : ''}<br>
          ${cust.address || ''}<br>
          ${cust.phone || ''}<br>
          ${cust.email || ''}
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="background:#f4f6f8; border-bottom:2px solid #333;">
            <th style="padding:10px; text-align:left;">Service Description</th>
            <th style="padding:10px; text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px; border-bottom:1px solid #ddd;">${inv.description}</td>
            <td style="padding:12px; text-align:right; border-bottom:1px solid #ddd;">$${subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="font-size:0.8rem; color:#555; max-width:320px;">
          <p style="margin:0;"><strong>Payment Terms:</strong> ${appState.paymentTerms || 'Payment due upon receipt.'}</p>
          ${appState.paymentUrl ? `<p style="margin:5px 0 0 0;"><strong>Pay Online:</strong> ${appState.paymentUrl}</p>` : ''}
        </div>
        <div style="width:240px; text-align:right; font-size:0.9rem;">
          <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:3px 0;">
            <span>Sales Tax (${rate.toFixed(2)}%):</span>
            <span>$${taxAmount.toFixed(2)}</span>
          </div>
          <hr style="margin:6px 0; border:none; border-top:2px solid #333;">
          <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:bold;">
            <span>Total Due:</span>
            <span>$${grandTotal.toFixed(2)}</span>
          </div>
          ${payQrHtml}
        </div>
      </div>

      <p style="text-align:center; margin-top:30px; font-size:0.85rem; color:#777;">${footerNote}</p>
    </div>
  `;

  executeIframePrint(content);
}

function executeIframePrint(htmlContent) {
  const frame = document.getElementById('printFrame');
  const frameDoc = frame.contentWindow || frame.contentDocument.document || frame.contentDocument;
  frameDoc.document.open();
  frameDoc.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Print Document</title><style>@page { margin: 10mm; } body { margin: 0; padding: 10px; background: #ffffff; color: #000000; }</style></head>
    <body>${htmlContent}</body>
    </html>
  `);
  frameDoc.document.close();
  setTimeout(() => { frame.contentWindow.focus(); frame.contentWindow.print(); }, 300);
}

function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", `crm_database_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
}

function importJSON(e) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported.customers) {
        appState = imported; saveState(); initApp();
        alert('Database successfully imported!');
      }
    } catch (err) { alert('Invalid JSON file format.'); }
  };
  reader.readAsText(e.target.files[0]);
}

function exportCSV() {
  if (appState.customers.length === 0) return alert("No customer records to export.");
  const headers = ["Name", "Owner Title", "Phone", "Email", "Address", "Property Size", "Service", "Price", "Status"];
  const rows = appState.customers.map(c => [
    `"${c.name}"`, `"${c.ownerTitle || ''}"`, `"${c.phone}"`, `"${c.email}"`, `"${c.address}"`, `"${c.size}"`, `"${c.service}"`, `"${c.price}"`, `"${c.status}"`
  ]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const anchor = document.createElement("a");
  anchor.setAttribute("href", encodeURI(csvContent));
  anchor.setAttribute("download", `customer_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
}