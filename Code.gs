/*
EarlScripter
Project: Itlog ni JunPaul
Description: Google Apps Script SPA for an egg selling business with dashboard, POS, inventory, reports, and role-based access.
*/

const APP_NAME = 'Itlog ni JunPaul';
const APP_CURRENCY = 'PHP';
const SESSION_KEY = 'itlog_active_user';
const SPREADSHEET_ID = '1w1b2RezsbEl2evZAiVvctkLW0fI_LZEuZmPWxY2EtQI';
const PASSWORD_HASH_PREFIX = 'sha256$';

const SHEET_CONFIG = {
  Users: ['id', 'name', 'email', 'phone', 'password', 'role', 'avatar_drive_id', 'is_active', 'created_at', 'updated_at', 'otp', 'otp_expires'],
  Categories: ['id', 'name', 'description'],
  Sub_Categories: ['id', 'category_id', 'name', 'description', 'status'],
  Suppliers: ['id', 'name', 'contact_person', 'phone', 'email', 'address'],
  Customers: ['id', 'name', 'phone', 'email', 'address', 'credit_limit', 'created_at'],
  Egg_Stocks: ['serial', 'sub_cat', 'purchase_id', 'w', 'l', 'cft', 'buy_rate', 'sell_rate', 'qty', 'status', 'image_drive_id'],
  Purchases: ['id', 'supplier_id', 'invoice_no', 'date', 'notes', 'total_amount', 'paid_amount', 'status'],
  Sales: ['id', 'customer_id', 'invoice_no', 'date', 'item_description', 'item_quantity', 'subtotal', 'discount', 'total', 'paid_amount', 'status', 'created_by'],
  Delivery_Orders: ['delivery_id', 'sale_id', 'customer_id', 'vehicle', 'distance_km', 'base_rate', 'rate_per_km', 'delivery_fee', 'status', 'created_at', 'created_by'],
  Sale_Items: ['sale_id', 'serial', 'product_name', 'qty', 'unit_price', 'subtotal'],
  Payments: ['id', 'ref_type', 'ref_id', 'party_type', 'party_id', 'amount', 'payment_method', 'date', 'note'],
  Expenses: ['id', 'category', 'amount', 'description', 'date'],
  Import_Logs: ['id', 'source', 'file_name', 'imported_at', 'records', 'success', 'notes'],
  Settings: ['key', 'value'],
  Activity_Logs: ['id', 'actor', 'action', 'details', 'created_at']
};

const DEMO_SEED_DATA = {
  Users: [
    ['U-001', 'Jun Paul', 'admin@itlognijunpaul.com', '+63 917 000 0101', 'admin123', 'admin', '', 'TRUE', '2026-04-01', '2026-04-01', '', ''],
    ['U-002', 'Iori Baral', 'manager@itlognijunpaul.com', '+63 917 000 0102', 'manager123', 'manager', '', 'TRUE', '2026-04-01', '2026-04-01', '', ''],
    ['U-003', 'Ronnie Veñarta', 'cashier@itlognijunpaul.com', '+63 917 000 0103', 'cashier123', 'cashier', '', 'TRUE', '2026-04-01', '2026-04-01', '', ''],
    ['U-004', 'Nina Reyes', 'warehouse@itlognijunpaul.com', '+63 917 000 0104', 'warehouse123', 'warehouse_staff', '', 'TRUE', '2026-04-01', '2026-04-01', '', '']
  ],
  Categories: [
    ['CAT-001', 'Eggs', 'Fresh table eggs and assorted trays'],
    ['CAT-002', 'Feeds', 'Supplement feed and industry items']
  ],
  Sub_Categories: [
    ['CAR-001', 'CAT-001', 'Car 01', 'Shipment batch for north route', 'ACTIVE'],
    ['CAR-002', 'CAT-001', 'Car 02', 'Shipment batch for central route', 'ACTIVE'],
    ['CAR-003', 'CAT-001', 'Car 03', 'Shipment batch for south route', 'ACTIVE'],
    ['CAR-004', 'CAT-001', 'Car 04', 'Shipment batch for highland route', 'ACTIVE'],
    ['CAR-005', 'CAT-001', 'Car 05', 'Special stock tray route', 'ACTIVE'],
    ['CAR-006', 'CAT-001', 'Car 06', 'Local market route', 'ACTIVE']
  ],
  Suppliers: [
    ['SUP-001', 'Pangasinan Egg Farm', 'Luis Dela Cruz', '+63 917 111 1201', 'luis@pangasinen.com', 'Dagupan City'],
    ['SUP-002', 'Cebu Layer Co.', 'Anna Lim', '+63 917 222 1302', 'anna@cebulayer.com', 'Mandaue City'],
    ['SUP-003', 'Bohol Fresh Poultry', 'Roberto Tan', '+63 917 333 1403', 'roberto@boholfresh.com', 'Tagbilaran City']
  ],
  Customers: [
    ['CUS-001', 'Market Basket', '+63 921 001 0001', 'basket@market.com', 'Cebu City', '5000', '2026-04-01'],
    ['CUS-002', 'Lutong Bahay', '+63 921 002 0002', 'lutong@bahay.com', 'Talisay City', '3000', '2026-04-02'],
    ['CUS-003', 'Sari-Sari Corner', '+63 921 003 0003', 'corner@sari.com', 'Minglanilla', '2500', '2026-04-04'],
    ['CUS-004', 'Luna Cafe', '+63 921 004 0004', 'luna@cafe.com', 'Danao City', '4200', '2026-04-08']
  ],
  Egg_Stocks: [
    ['EGG-2026-001', 'CAR-001', 'PUR-001', 12, 18, 0.6, 7.5, 9.5, 96, 'READY', ''],
    ['EGG-2026-002', 'CAR-001', 'PUR-001', 11, 18, 0.57, 7.3, 9.3, 88, 'READY', ''],
    ['EGG-2026-003', 'CAR-002', 'PUR-002', 12, 16, 0.52, 7.0, 9.1, 70, 'READY', ''],
    ['EGG-2026-004', 'CAR-002', 'PUR-002', 11, 16, 0.49, 6.8, 8.9, 62, 'LOW', ''],
    ['EGG-2026-005', 'CAR-003', 'PUR-003', 12, 15, 0.48, 6.5, 8.7, 58, 'LOW', ''],
    ['EGG-2026-006', 'CAR-003', 'PUR-003', 11, 15, 0.46, 6.3, 8.5, 40, 'LOW', ''],
    ['EGG-2026-007', 'CAR-004', 'PUR-002', 13, 19, 0.68, 8.0, 10.5, 83, 'READY', ''],
    ['EGG-2026-008', 'CAR-004', 'PUR-002', 12, 19, 0.63, 7.8, 10.2, 44, 'READY', ''],
    ['EGG-2026-009', 'CAR-005', 'PUR-003', 18, 21, 0.85, 8.7, 11.5, 72, 'READY', ''],
    ['EGG-2026-010', 'CAR-005', 'PUR-003', 17, 21, 0.82, 8.5, 11.2, 39, 'LOW', ''],
    ['EGG-2026-011', 'CAR-006', 'PUR-001', 20, 24, 0.96, 9.2, 12.2, 25, 'LOW', ''],
    ['EGG-2026-012', 'CAR-006', 'PUR-001', 19, 24, 0.9, 9.0, 12.0, 18, 'CRITICAL', '']
  ],
  Purchases: [
    ['PUR-001', 'SUP-001', 'INV-2026-001', '2026-04-03', 'Initial shipment', 7800, 7800, 'PAID'],
    ['PUR-002', 'SUP-002', 'INV-2026-002', '2026-04-12', 'Weekend batch', 7100, 7100, 'PAID'],
    ['PUR-003', 'SUP-003', 'INV-2026-003', '2026-04-21', 'Premium stock', 6300, 4300, 'PARTIAL']
  ],
  Sales: [
    ['SAL-001', 'CUS-001', 'INV-SAL-001', '2026-04-02', 'Egg Trays Mixed', 20, 1380, 0, 1380, 1380, 'PAID', 'U-003'],
    ['SAL-002', 'CUS-002', 'INV-SAL-002', '2026-04-05', 'Egg Tray 12x16', 17, 1240, 0, 1240, 1200, 'PARTIAL', 'U-003'],
    ['SAL-003', 'CUS-003', 'INV-SAL-003', '2026-04-10', 'Premium Eggs', 9, 970, 30, 940, 940, 'PAID', 'U-003'],
    ['SAL-004', 'CUS-004', 'INV-SAL-004', '2026-04-18', 'Egg Tray 13x19', 17, 1480, 50, 1430, 1430, 'PAID', 'U-003'],
    ['SAL-005', 'CUS-001', 'INV-SAL-005', '2026-04-27', 'Mixed Tray Pack', 13, 1710, 0, 1710, 1500, 'PARTIAL', 'U-003']
  ],
  Sale_Items: [
    ['SAL-001', 'EGG-2026-001', 'Egg Tray 12x18', 12, 9.5, 114],
    ['SAL-001', 'EGG-2026-002', 'Egg Tray 11x18', 8, 9.3, 74.4],
    ['SAL-002', 'EGG-2026-003', 'Egg Tray 12x16', 10, 9.1, 91],
    ['SAL-002', 'EGG-2026-008', 'Egg Tray 12x19', 7, 10.2, 71.4],
    ['SAL-003', 'EGG-2026-005', 'Egg Tray 12x15', 9, 8.7, 78.3],
    ['SAL-004', 'EGG-2026-007', 'Egg Tray 13x19', 11, 10.5, 115.5],
    ['SAL-004', 'EGG-2026-009', 'Egg Tray 18x21', 6, 11.5, 69],
    ['SAL-005', 'EGG-2026-011', 'Egg Tray 20x24', 5, 12.2, 61],
    ['SAL-005', 'EGG-2026-010', 'Egg Tray 17x21', 8, 11.2, 89.6]
  ],
  Payments: [
    ['PAY-001', 'sale', 'SAL-001', 'customer', 'CUS-001', 1380, 'cash', '2026-04-02', 'Cash payment'],
    ['PAY-002', 'supplier', 'PUR-001', 'supplier', 'SUP-001', 7800, 'bank', '2026-04-03', 'Supplier paid'],
    ['PAY-003', 'sale', 'SAL-002', 'customer', 'CUS-002', 1200, 'gcash', '2026-04-05', 'Half payment'],
    ['PAY-004', 'sale', 'SAL-004', 'customer', 'CUS-004', 1430, 'cash', '2026-04-18', 'Full payment']
  ],
  Expenses: [
    ['EXP-001', 'Feed', 3200, 'Layer feed replenishment', '2026-04-04'],
    ['EXP-002', 'Transport', 1800, 'Dispatch and hauling', '2026-04-09'],
    ['EXP-003', 'Electricity', 1200, 'Power consumption', '2026-04-14'],
    ['EXP-004', 'Labor', 4500, 'Worker wages', '2026-04-22']
  ],
  Import_Logs: [
    ['IMP-001', 'CSV', 'april_inventory.csv', '2026-04-01', 105, 'TRUE', 'Initial import'],
    ['IMP-002', 'CSV', 'reshuffle_apr_25.csv', '2026-04-25', 35, 'TRUE', 'Stock update']
  ],
  Settings: [
    ['business_name', 'Itlog ni JunPaul'],
    ['address', 'Purok 5, Tisa, Cebu City'],
    ['phone', '+63 917 123 4567'],
    ['email', 'sales@itlognijunpaul.com'],
    ['currency', 'PHP'],
    ['low_stock_threshold', '20'],
    ['default_discount', '0'],
    ['theme', 'navy_blue']
  ],
  Activity_Logs: [
    ['ACT-001', 'System', 'setup_demo_data', 'Seeded initial demo data for April 2026', '2026-04-01'],
    ['ACT-002', 'U-003', 'sale_created', 'Created sales entry for Market Basket', '2026-04-02'],
    ['ACT-003', 'U-002', 'purchase_received', 'Received new stock batch from Cebu Layer Co.', '2026-04-12'],
    ['ACT-004', 'U-004', 'inventory_import', 'Imported CSV stock batch', '2026-04-25']
  ]
};

function cloneDemoSeedData() {
  return JSON.parse(JSON.stringify(DEMO_SEED_DATA));
}

function syncScriptDataFromSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    return cloneDemoSeedData();
  }

  Object.keys(SHEET_CONFIG).forEach(function (sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      DEMO_SEED_DATA[sheetName] = [];
      return;
    }

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0] || [];
    const data = rows.slice(1).map(function (row) {
      return row.slice(0, headers.length);
    });

    DEMO_SEED_DATA[sheetName] = data;
  });

  return cloneDemoSeedData();
}

function syncSeedDataToSheets(ss, seedData, forceReset) {
  const resetSheets = !!forceReset;
  Object.keys(SHEET_CONFIG).forEach(function (sheetName) {
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    const headers = SHEET_CONFIG[sheetName];
    const rows = Array.isArray(seedData[sheetName]) ? seedData[sheetName] : [];

    if (resetSheets || sheet.getLastRow() <= 1) {
      sheet.clearContents();
      sheet.clearFormats();
      sheet.appendRow(headers);
      if (rows.length) {
        sheet.getRange(2, 1, rows.length, Math.max(headers.length, rows[0].length)).setValues(rows);
      }
      return;
    }

    const existing = sheet.getDataRange().getValues();
    const first = existing[0] || [];
    const hasHeaderMismatch = first.length !== headers.length || first.some(function (v, idx) {
      return String(v || '').trim() !== String(headers[idx] || '');
    });

    if (hasHeaderMismatch) {
      sheet.clearContents();
      sheet.clearFormats();
      sheet.appendRow(headers);
    }
    if (rows.length) {
      const currentRows = sheet.getDataRange().getValues();
      if (currentRows.length <= 1 || hasHeaderMismatch) {
        sheet.getRange(2, 1, rows.length, Math.max(headers.length, rows[0].length)).setValues(rows);
      }
    }
  });
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function runSetup() {
  return setupDemoData(true);
}

function setupDemoData(forceReset) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('No active spreadsheet found.');
    }

    const seedData = cloneDemoSeedData();
    syncSeedDataToSheets(ss, seedData, forceReset);
    ensureDashboardSheet();
    return { ok: true, message: 'Demo data initialized successfully for April 2026.' };
  } catch (error) {
    throw new Error('setupDemoData failed: ' + error.message);
  } finally {
    lock.releaseLock();
  }
}

function getAppSettings() {
  const user = requireAuth();
  const sheet = getSheetByName('Settings');
  const map = {};
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i] && rows[i][0]) {
      map[String(rows[i][0]).trim()] = rows[i][1] || '';
    }
  }
  return map;
}

function verifyPassword_(password, storedPassword) {
  const stored = String(storedPassword || '');
  const submitted = String(password || '');

  // Keep compatibility with legacy/demo accounts stored as plain text.
  if (stored.indexOf(PASSWORD_HASH_PREFIX) !== 0) {
    return stored === submitted;
  }

  // Stored format: sha256$iterations$salt$hexDigest
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'sha256') return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expectedHex = String(parts[3] || '').toLowerCase();
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000000 || !salt || !/^[0-9a-f]{64}$/.test(expectedHex)) {
    return false;
  }

  let digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + ':' + submitted,
    Utilities.Charset.UTF_8
  );
  for (let i = 1; i < iterations; i += 1) {
    digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, digest);
  }
  const actualHex = digest.map(function (byte) {
    return ('0' + (byte & 255).toString(16)).slice(-2);
  }).join('');

  // Compare the fixed-length hexadecimal digests without early exit.
  if (actualHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let j = 0; j < actualHex.length; j += 1) {
    diff |= actualHex.charCodeAt(j) ^ expectedHex.charCodeAt(j);
  }
  return diff === 0;
}

function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const seeded = ensureDemoDataReady();
  if (seeded && seeded.ok === false) {
    throw new Error(seeded.message || 'Unable to initialize demo data.');
  }

  const user = findUserByEmail(email);
  if (!user) {
    throw new Error('User not found. Please run setupDemoData() once or use the seeded admin account.');
  }
  if (!user.is_active || String(user.is_active).toUpperCase() === 'FALSE') {
    throw new Error('User account is inactive.');
  }
  if (!verifyPassword_(password, user.password)) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar_drive_id: user.avatar_drive_id || '',
    is_active: user.is_active,
    created_at: user.created_at
  };

  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty(SESSION_KEY, JSON.stringify(sessionUser));
  userProps.setProperty('itlog_active_email', String(user.email).toLowerCase());

  recordActivity(user.name, 'login', 'Logged in to the system');
  return sessionUser;
}

function getSessionUser() {
  const userProps = PropertiesService.getUserProperties();
  const raw = userProps.getProperty(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function logout() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty(SESSION_KEY);
  userProps.deleteProperty('itlog_active_email');
  return { ok: true };
}

function forgotPassword(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const user = findUserByEmail(normalizedEmail);
  if (!user) {
    throw new Error('No account was found with that email.');
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const sheet = getSheetByName('Users');
  const rows = sheet.getDataRange().getValues();
  const header = rows[0];
  const emailIndex = header.indexOf('email');
  const otpIndex = header.indexOf('otp');
  const expiryIndex = header.indexOf('otp_expires');

  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][emailIndex]).toLowerCase() === normalizedEmail) {
      const row = rows[i];
      row[otpIndex] = otp;
      row[expiryIndex] = formatDateStamp(expiresAt, true);
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      break;
    }
  }

  try {
    MailApp.sendEmail({
      to: user.email,
      subject: 'Itlog ni JunPaul Password Reset OTP',
      htmlBody: '<p>Your OTP is <strong>' + otp + '</strong>. It expires in 10 minutes.</p>'
    });
  } catch (error) {
    // still return OTP to the caller for demo/test flows if email is blocked
    return { ok: true, message: 'OTP generated but email delivery failed in this environment.', otp: otp };
  }

  return { ok: true, message: 'OTP sent to your email.' };
}

function resetPassword(email, otp, newPassword) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !otp || !newPassword) {
    throw new Error('Email, OTP, and new password are required.');
  }

  const sheet = getSheetByName('Users');
  const rows = sheet.getDataRange().getValues();
  const header = rows[0];
  const emailIndex = header.indexOf('email');
  const otpIndex = header.indexOf('otp');
  const expiryIndex = header.indexOf('otp_expires');
  const passwordIndex = header.indexOf('password');
  const updatedIndex = header.indexOf('updated_at');

  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][emailIndex]).toLowerCase() === normalizedEmail) {
      const storedOtp = String(rows[i][otpIndex] || '');
      const expiry = rows[i][expiryIndex] ? new Date(rows[i][expiryIndex]) : null;
      const now = new Date();

      if (!storedOtp || storedOtp !== String(otp)) {
        throw new Error('Invalid OTP.');
      }
      if (!expiry || expiry.getTime() < now.getTime()) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      const row = rows[i];
      row[passwordIndex] = String(newPassword);
      row[otpIndex] = '';
      row[expiryIndex] = '';
      row[updatedIndex] = formatDateStamp(new Date(), true);
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { ok: true, message: 'Password reset successfully.' };
    }
  }

  throw new Error('Account not found.');
}

function requireAuth(allowedRoles) {
  const user = getSessionUser();
  if (!user) {
    throw new Error('Authentication required. Please log in again.');
  }
  const userRow = findUserByEmail(user.email);
  if (!userRow || String(userRow.is_active).toUpperCase() === 'FALSE') {
    throw new Error('Your account is inactive.');
  }
  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
    throw new Error('You do not have permission to view this section.');
  }
  return user;
}

function getDashboardData() {
  requireAuth(['admin', 'manager', 'cashier', 'warehouse_staff']);
  const salesSheet = getSheetByName('Sales');
  const sales = salesSheet.getDataRange().getValues().slice(1);
  const stocks = getSheetByName('Egg_Stocks').getDataRange().getValues().slice(1);
  const expenses = getSheetByName('Expenses').getDataRange().getValues().slice(1);
  const activity = getSheetByName('Activity_Logs').getDataRange().getValues().slice(1);
  const customers = getSheetByName('Customers').getDataRange().getValues().slice(1);
  const imports = getSheetByName('Import_Logs').getDataRange().getValues().slice(1);

  const salesTotal = sales.reduce((sum, row) => sum + (Number(row[8]) || 0), 0);
  const benchmarkDate = resolveDashboardBenchmarkDate(sales);
  const today = benchmarkDate;
  const yesterday = new Date(benchmarkDate.getTime() - 24 * 60 * 60 * 1000);
  const todaysSales = sales.filter(function (row) {
    const d = row[3] ? new Date(row[3]) : null;
    return d && isSameDay(d, today);
  });
  const yesterdaysSales = sales.filter(function (row) {
    const d = row[3] ? new Date(row[3]) : null;
    return d && isSameDay(d, yesterday);
  });

  const energy = stocks.reduce((sum, row) => sum + (Number(row[8]) || 0), 0);
  const lowStock = stocks.filter(function (row) {
    return Number(row[8]) < Number(getSetting('low_stock_threshold', '20'));
  }).length;

  const expenseTotal = expenses.reduce((sum, row) => sum + (Number(row[2]) || 0), 0);

  const customerNames = {};
  customers.forEach(function (row) {
    customerNames[String(row[0])] = row[1] || row[0];
  });
  const customerTotals = {};
  sales.forEach(function (row) {
    const customerId = String(row[1] || 'Unknown');
    customerTotals[customerId] = (customerTotals[customerId] || 0) + (Number(row[8]) || 0);
  });
  const topCustomers = Object.keys(customerTotals).map(function (customerId) {
    return { name: customerNames[customerId] || customerId, value: customerTotals[customerId] };
  }).sort(function (a, b) {
    return b.value - a.value;
  }).slice(0, 5);

  const stockStatus = { READY: 0, LOW: 0, CRITICAL: 0 };
  stocks.forEach(function (row) {
    const status = String(row[9] || '').toUpperCase();
    if (stockStatus[status] === undefined) {
      stockStatus[status] = 0;
    }
    stockStatus[status] += 1;
  });

  const expenseTotals = {};
  expenses.forEach(function (row) {
    const category = String(row[1] || 'Uncategorized');
    expenseTotals[category] = (expenseTotals[category] || 0) + (Number(row[2]) || 0);
  });
  const expenseBreakdown = Object.keys(expenseTotals).map(function (category) {
    return { label: category, value: expenseTotals[category] };
  }).sort(function (a, b) {
    return b.value - a.value;
  });

  const salesByDate = {};
  sales.forEach(function (row) {
    const date = row[3] ? formatDateStamp(new Date(row[3]), false) : '';
    if (date) {
      salesByDate[date] = (salesByDate[date] || 0) + (Number(row[8]) || 0);
    }
  });
  const chartDates = Object.keys(salesByDate).sort().slice(-12);
  const partialSales = sales.filter(function (row) {
    return String(row[10] || '').toUpperCase() === 'PARTIAL';
  });
  const lowStockNames = stocks.filter(function (row) {
    return Number(row[8]) < Number(getSetting('low_stock_threshold', '20'));
  }).map(function (row) {
    return row[1] || row[0];
  }).slice(0, 3);
  const latestImport = imports.length ? imports[imports.length - 1] : null;

  const dashboardData = {
    stats: {
      sales_today: todaysSales.reduce((sum, row) => sum + (Number(row[8]) || 0), 0),
      sales_yesterday: yesterdaysSales.reduce((sum, row) => sum + (Number(row[8]) || 0), 0),
      stock_units: energy,
      low_stock: lowStock,
      expenses: expenseTotal,
      profit: salesTotal - expenseTotal * 0.7
    },
    alerts: [
      lowStock ? { type: 'warning', msg: 'Low stock detected in ' + (lowStockNames.length ? lowStockNames.join(', ') : 'inventory') + '.' } : { type: 'success', msg: 'All stock levels are above the low-stock threshold.' },
      partialSales.length ? { type: 'alert', msg: partialSales.length + ' sale' + (partialSales.length === 1 ? ' is' : 's are') + ' still partially paid.' } : { type: 'success', msg: 'All recorded sales are fully paid.' },
      latestImport && String(latestImport[5]).toUpperCase() === 'TRUE' ? { type: 'success', msg: 'Latest inventory import recorded successfully.' } : { type: 'warning', msg: 'No successful inventory import has been recorded yet.' }
    ],
    kpis: [
      { label: 'Gross Sales', value: formatMoney(salesTotal), trend: '+12.4%', positive: true },
      { label: 'Orders', value: String(sales.length), trend: '+8.1%', positive: true },
      { label: 'Avg Basket', value: formatMoney(salesTotal / Math.max(1, sales.length)), trend: '-2.5%', positive: false },
      { label: 'Expense', value: formatMoney(expenseTotal), trend: '+3.2%', positive: false }
    ],
    activity: activity.slice(-8).reverse().map(function (row) {
      return {
        actor: row[1],
        action: row[2],
        details: row[3],
        date: row[4]
      };
    }),
    topCustomers: topCustomers,
    stockStatus: [
      { label: 'Ready', value: stockStatus.READY || 0 },
      { label: 'Low', value: stockStatus.LOW || 0 },
      { label: 'Critical', value: stockStatus.CRITICAL || 0 }
    ],
    expenseBreakdown: expenseBreakdown,
    salesSeries: chartDates.map(function (date) { return salesByDate[date]; }),
    dateLabels: chartDates
  };

  return dashboardData;
}

function ensureDashboardSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    return null;
  }
  return ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard');
}

/**
 * Embedded fallback egg illustrations for the first inventory rows.
 * Mapping uses actual Egg_Stocks sheet row numbers (row 1 is the header).
 * Row 2-4: white eggs; row 5-6: brown eggs; row 7-8: white eggs; row 9-10: brown eggs.
 * These are data-URI SVGs built into the code, so no separate image upload is required. A saved image URL in Column L takes priority; Column K is not used as an image source.
 */
function getDefaultEggImageForSheetRow(sheetRow) {
  const brownRows = [5, 6, 9, 10];
  const whiteRows = [2, 3, 4, 7, 8];
  let fill = '';
  let stroke = '';
  let highlight = '';

  if (brownRows.indexOf(Number(sheetRow)) !== -1) {
    fill = '#9b572e';
    stroke = '#6f351b';
    highlight = '#d99a68';
  } else if (whiteRows.indexOf(Number(sheetRow)) !== -1) {
    fill = '#fffdf5';
    stroke = '#b8b3a7';
    highlight = '#ffffff';
  } else {
    return '';
  }

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">' +
    '<rect width="160" height="160" rx="18" fill="#f7f8fa"/>' +
    '<ellipse cx="80" cy="127" rx="37" ry="8" fill="#000000" opacity="0.10"/>' +
    '<path d="M80 27 C58 27 40 62 40 88 C40 113 56 125 80 125 C104 125 120 113 120 88 C120 62 102 27 80 27 Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="3"/>' +
    '<path d="M64 48 C54 62 51 77 54 88" fill="none" stroke="' + highlight + '" stroke-width="7" stroke-linecap="round" opacity="0.9"/>' +
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function getPOSData() {
  requireAuth(['admin', 'manager', 'cashier', 'warehouse_staff']);
  const stocks = getSheetByName('Egg_Stocks').getDataRange().getValues().slice(1);
  const customers = getSheetByName('Customers').getDataRange().getValues().slice(1);
  const subs = getSheetByName('Sub_Categories').getDataRange().getValues().slice(1);
  const settings = getAppSettings();

  return {
    products: stocks.map(function (row, index) {
      const subName = getSubCategoryNameById(row[1], subs);
      return {
        serial: row[0],
        name: 'Egg Tray ' + row[3] + row[4],
        sub_cat: subName,
        width: row[3],
        length: row[4],
        cft: row[5],
        qty: Number(row[8]) || 0,
        sell_rate: Number(row[7]) || 0,
        status: row[9],
        image: row[11] || getDefaultEggImageForSheetRow(index + 2)
      };
    }),
    customers: customers.map(function (row) {
      return {
        id: row[0],
        name: row[1],
        phone: row[2],
        email: row[3],
        address: row[4],
        credit_limit: row[5]
      };
    }),
    settings: settings
  };
}

function getInventoryData() {
  requireAuth(['admin', 'manager', 'warehouse_staff', 'cashier']);
  const stocks = getSheetByName('Egg_Stocks').getDataRange().getValues().slice(1);
  const subs = getSheetByName('Sub_Categories').getDataRange().getValues().slice(1);

  return stocks.map(function (row, index) {
    const subName = getSubCategoryNameById(row[1], subs);
    return {
      serial: row[0],
      sub_cat: subName,
      purchase_id: row[2],
      w: row[3],
      l: row[4],
      cft: row[5],
      buy_rate: row[6],
      sell_rate: row[7],
      qty: row[8],
      status: row[9],
      image: row[11] || getDefaultEggImageForSheetRow(index + 2)
    };
  });
}

function getReportsData() {
  requireAuth(['admin', 'manager']);
  const sales = getSheetByName('Sales').getDataRange().getValues().slice(1);
  const expenses = getSheetByName('Expenses').getDataRange().getValues().slice(1);
  const customers = getSheetByName('Customers').getDataRange().getValues().slice(1);
  const stocks = getSheetByName('Egg_Stocks').getDataRange().getValues().slice(1);

  return {
    salesSummary: sales.map(function (row) {
      return {
        id: row[0],
        customer_id: row[1],
        date: row[3],
        total: Number(row[6]) || 0,
        paid: Number(row[7]) || 0,
        status: row[8]
      };
    }),
    customerAnalysis: customers.map(function (customer) {
      const total = sales.filter(function (row) {
        return row[1] === customer[0];
      }).reduce(function (sum, row) {
        return sum + (Number(row[6]) || 0);
      }, 0);
      return { name: customer[1], total: total };
    }),
    expenseSummary: expenses.map(function (row) {
      return { category: row[1], amount: Number(row[2]) || 0 };
    }),
    stockAging: stocks.map(function (row) {
      return { serial: row[0], qty: Number(row[8]) || 0, status: row[9] };
    })
  };
}

function saveSale(data) {
  const user = requireAuth(['admin', 'manager', 'cashier']);
  const lock = LockService.getScriptLock();
  lock.waitLock(2000);

  try {
    const salesSheet = getSheetByName('Sales');
    const itemSheet = getSheetByName('Sale_Items');
    const paymentSheet = getSheetByName('Payments');
    const stockSheet = getSheetByName('Egg_Stocks');
    const stockRows = stockSheet.getDataRange().getValues();
    const cart = Array.isArray(data.cart) ? data.cart : [];

    if (!cart.length) throw new Error('Your cart is empty. Add an item before saving the sale.');

    // Validate all quantities and aggregate duplicate cart lines by serial before
    // writing ANY sale, payment, delivery, or stock records.
    const requestedBySerial = {};
    const lineBySerial = {};
    cart.forEach(function (line) {
      const serial = String(line.serial || '').trim();
      const qty = Number(line.qty);
      if (!serial) throw new Error('A cart item is missing its product serial number.');
      if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
        throw new Error('Invalid quantity for ' + (line.name || serial) + '. Quantity must be a positive whole number.');
      }
      requestedBySerial[serial] = (requestedBySerial[serial] || 0) + qty;
      lineBySerial[serial] = line;
    });

    const stockIndexBySerial = {};
    stockRows.forEach(function (row, index) {
      if (index === 0) return; // Skip header row.
      const serial = String(row[0] || '').trim();
      if (serial) stockIndexBySerial[serial] = index;
    });

    Object.keys(requestedBySerial).forEach(function (serial) {
      const found = stockIndexBySerial[serial];
      const line = lineBySerial[serial];
      if (found === undefined) {
        throw new Error('Item not found in Egg_Stocks: ' + (line.name || serial) + ' (' + serial + '). Sale was not saved.');
      }
      const currentQty = Number(stockRows[found][8]);
      const availableQty = Number.isFinite(currentQty) ? currentQty : 0;
      const requestedQty = requestedBySerial[serial];
      if (requestedQty > availableQty) {
        throw new Error('Not enough items for ' + (line.name || serial) + '. Available: ' + availableQty + ', requested: ' + requestedQty + '. Sale was not saved.');
      }
    });

    const saleId = 'SAL-' + String(Date.now()).slice(-6);
    const invoiceNumber = 'INV-SAL-' + String(Date.now()).slice(-6);
    const saleDate = formatDateStamp(new Date(), true);
    let subtotal = 0;
    let totalQty = 0;
    let itemDesc = '';
    cart.forEach(function (line, idx) {
      subtotal += Number(line.qty) * Number(line.sell_rate || 0);
      totalQty += Number(line.qty);
      itemDesc += (idx > 0 ? ', ' : '') + line.name + ' x' + Number(line.qty);
    });

    const discount = Math.max(0, Number(data.discount || 0));
    const delivery = data.delivery || {};
    const vehicle = String(delivery.vehicle || 'none').toLowerCase();
    const distanceKm = Math.max(0, Number(delivery.distance_km || 0));
    const baseRates = { motorcycle: 50, car: 90, truck: 150 };
    const baseRate = vehicle === 'none' ? 0 : (baseRates[vehicle] || 0);
    const ratePerKm = vehicle === 'none' ? 0 : 30;
    // Calculate the fee on the server; do not trust a client-submitted fee.
    const deliveryFee = vehicle === 'none' ? 0 : baseRate + distanceKm * ratePerKm;
    if (vehicle !== 'none' && !baseRates[vehicle]) throw new Error('Invalid delivery vehicle selected.');
    const total = Math.max(0, subtotal - discount) + deliveryFee;
    const paidAmount = Math.max(0, Number(data.amount_paid || 0));
    const status = paidAmount >= total ? 'PAID' : 'PARTIAL';
    if (vehicle !== 'none') itemDesc += ' [Delivery: ' + vehicle + ', ' + distanceKm + ' km, PHP ' + deliveryFee.toFixed(2) + ']';

    // All stock checks have passed; save sale and deduct the exact quantities.
    salesSheet.appendRow([saleId, data.customer_id || 'CUS-001', invoiceNumber, saleDate, itemDesc, totalQty, subtotal, discount, total, paidAmount, status, user.id]);

    if (vehicle !== 'none') {
      const deliverySheet = getSheetByName('Delivery_Orders');
      deliverySheet.appendRow([
        'DEL-' + String(Date.now()).slice(-6), saleId, data.customer_id || 'CUS-001',
        vehicle, distanceKm, baseRate, ratePerKm, deliveryFee, 'PENDING', saleDate, user.id
      ]);
    }

    Object.keys(requestedBySerial).forEach(function (serial) {
      const found = stockIndexBySerial[serial];
      const currentQty = Number(stockRows[found][8]) || 0;
      const newQty = currentQty - requestedBySerial[serial];
      stockRows[found][8] = newQty;
      stockRows[found][9] = newQty <= Number(getSetting('low_stock_threshold', '20')) ? 'LOW' : 'READY';
      // stockRows includes the header at index 0, so the sheet row is found + 1.
      stockSheet.getRange(found + 1, 1, 1, stockRows[found].length).setValues([stockRows[found]]);
    });

    cart.forEach(function (line) {
      itemSheet.appendRow([saleId, line.serial, line.name, Number(line.qty), Number(line.sell_rate || 0), Number(line.qty) * Number(line.sell_rate || 0)]);
    });

    paymentSheet.appendRow(['PAY-' + String(Date.now()).slice(-6), 'sale', saleId, 'customer', data.customer_id || 'CUS-001', paidAmount, data.payment_method || 'cash', saleDate, 'POS sale']);
    recordActivity(user.name, 'sale_created', 'Created sale ' + saleId + ' for customer ' + (data.customer_id || 'CUS-001') + (vehicle !== 'none' ? '; delivery ' + vehicle + ' (' + distanceKm + ' km), fee PHP ' + deliveryFee.toFixed(2) : '; pickup'));

    let dashboardRefreshWarning = '';
    try {
      SpreadsheetApp.flush();
      refreshDashboard();
    } catch (dashboardError) {
      dashboardRefreshWarning = dashboardError && dashboardError.message
        ? dashboardError.message
        : 'Dashboard refresh failed.';
      console.error('Sale ' + saleId + ' was saved, but Dashboard refresh failed: ' + dashboardRefreshWarning);
    }

    return {
      ok: true,
      saleId: saleId,
      invoiceNumber: invoiceNumber,
      total: total,
      status: status,
      dashboardRefreshWarning: dashboardRefreshWarning
    };
  } catch (error) {
    throw new Error(error && error.message ? error.message : String(error));
  } finally {
    lock.releaseLock();
  }
}

/**
 * Upload an inventory image and save its display URL in column L of Egg_Stocks.
 * Client sends a data URL because google.script.run cannot pass a File/Blob object.
 */
function uploadInventoryImage(serial, dataUrl, fileName) {
  requireAuth(['admin', 'manager', 'warehouse_staff']);
  if (!serial || !dataUrl) throw new Error('Choose a stock serial and an image first.');

  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data. Please select a JPG, PNG, GIF, or WebP image.');

  const mimeType = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, fileName || 'egg_image');
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const imageUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();

  const sheet = getSheetByName('Egg_Stocks');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Egg_Stocks has no stock records.');
  const serials = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  let targetRow = -1;
  for (let i = 0; i < serials.length; i++) {
    if (String(serials[i][0]).trim() === String(serial).trim()) {
      targetRow = i + 2;
      break;
    }
  }
  if (targetRow === -1) throw new Error('Stock serial not found: ' + serial);

  // Column L (12) is the image URL column requested for Egg_Stocks.
  if (!sheet.getRange(1, 12).getValue()) sheet.getRange(1, 12).setValue('image_url');
  sheet.getRange(targetRow, 12).setValue(imageUrl);
  recordActivity(getSessionUser().name, 'inventory_image_uploaded', 'Uploaded image for ' + serial);
  return { ok: true, serial: serial, fileId: file.getId(), imageUrl: imageUrl };
}

function bulkImportEggs(rows) {
  const user = requireAuth(['admin', 'manager', 'warehouse_staff']);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getSheetByName('Egg_Stocks');
    const importSheet = getSheetByName('Import_Logs');
    const values = Array.isArray(rows) ? rows : [];
    const inserted = [];

    values.forEach(function (row) {
      if (!row || !row.serial) {
        return;
      }
      inserted.push([
        row.serial,
        row.sub_cat,
        row.purchase_id || 'MANUAL',
        Number(row.w || 0),
        Number(row.l || 0),
        Number(row.cft || 0),
        Number(row.buy_rate || 0),
        Number(row.sell_rate || 0),
        Number(row.qty || 0),
        row.status || 'READY',
        row.image_drive_id || ''
      ]);
    });

    if (inserted.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, inserted.length, 11).setValues(inserted);
    }

    importSheet.appendRow(['IMP-' + String(Date.now()).slice(-6), 'CSV', 'bulk_import', formatDateStamp(new Date(), true), inserted.length, 'TRUE', 'Imported by ' + user.name]);
    recordActivity(user.name, 'inventory_import', 'Bulk imported ' + inserted.length + ' egg stock rows');
    return { ok: true, inserted: inserted.length };
  } catch (error) {
    throw new Error('bulkImportEggs failed: ' + error.message);
  } finally {
    lock.releaseLock();
  }
}

function getAllTables() {
  requireAuth(['admin', 'manager', 'cashier', 'warehouse_staff']);
  return {
    users: getRecords('Users'),
    categories: getRecords('Categories'),
    sub_categories: getRecords('Sub_Categories'),
    suppliers: getRecords('Suppliers'),
    customers: getRecords('Customers'),
    stock: getRecords('Egg_Stocks'),
    purchases: getRecords('Purchases'),
    sales: getRecords('Sales'),
    sale_items: getRecords('Sale_Items'),
    payments: getRecords('Payments'),
    expenses: getRecords('Expenses'),
    settings: getRecords('Settings'),
    activity: getRecords('Activity_Logs')
  };
}

function getRecords(sheetName) {
  const rows = getSheetByName(sheetName).getDataRange().getValues();
  const headers = rows[0] || [];
  return rows.slice(1).map(function (row) {
    const out = {};
    headers.forEach(function (header, idx) {
      out[header] = row[idx] || '';
    });
    return out;
  });
}

function getSheetByName(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet not found: ' + name);
  }
  return sheet;
}

function findUserByEmail(email) {
  try {
    const sheet = getSheetByName('Users');
    const rows = sheet.getDataRange().getValues();
    if (!rows || !rows.length) {
      return null;
    }
    const header = rows[0];
    const emailIndex = header.indexOf('email');
    if (emailIndex === -1) {
      return null;
    }
    for (let i = 1; i < rows.length; i += 1) {
      if (String(rows[i][emailIndex] || '').toLowerCase() === String(email || '').toLowerCase()) {
        const row = rows[i];
        const entry = {};
        header.forEach(function (key, idx) {
          entry[key] = row[idx];
        });
        return entry;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

function getSubCategoryNameById(subId, list) {
  const found = (list || []).find(function (row) {
    return String(row[0]) === String(subId);
  });
  return found ? found[2] : subId;
}

function recordActivity(actor, action, details) {
  const sheet = getSheetByName('Activity_Logs');
  sheet.appendRow(['ACT-' + String(Date.now()).slice(-6), actor, action, details, formatDateStamp(new Date(), true)]);
}

function saveSettings(settingsObj) {
  const user = requireAuth(['admin', 'manager']);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getSheetByName('Settings');
    const rows = sheet.getDataRange().getValues();
    const values = settingsObj || {};
    const keys = Object.keys(values);
    keys.forEach(function (key) {
      let found = false;
      for (let i = 1; i < rows.length; i += 1) {
        if (String(rows[i][0]).trim() === String(key)) {
          sheet.getRange(i + 1, 2).setValue(values[key]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, values[key]]);
      }
    });
    recordActivity(user.name, 'settings_updated', 'Updated system settings');
    return { ok: true, updated: keys.length };
  } catch (error) {
    throw new Error('saveSettings failed: ' + error.message);
  } finally {
    lock.releaseLock();
  }
}

function resolveDashboardBenchmarkDate(sales) {
  const dates = (sales || [])
    .map(function (row) {
      return row && row[3] ? new Date(row[3]) : null;
    })
    .filter(function (dateValue) {
      return dateValue && !isNaN(dateValue.getTime());
    });

  if (!dates.length) {
    return new Date();
  }

  return new Date(Math.max.apply(null, dates.map(function (dateValue) {
    return dateValue.getTime();
  })));
}

function getSetting(key, fallback) {
  const rows = getSheetByName('Settings').getDataRange().getValues();
  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][0]).trim() === String(key)) {
      return rows[i][1] || fallback;
    }
  }
  return fallback;
}

function formatMoney(value) {
  const val = Number(value) || 0;
  return APP_CURRENCY + ' ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateStamp(dateValue, includeTime) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const formatter = includeTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'GMT+8', formatter);
}

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Demo data can be reinitialized with setupDemoData().', APP_NAME, 5);
}

function ensureDemoData() {
  return setupDemoData();
}

function ensureDemoDataReady() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    return setupDemoData();
  }

  const usersSheet = ss.getSheetByName('Users');
  if (!usersSheet || usersSheet.getLastRow() <= 1) {
    return setupDemoData();
  }

  const hasAdmin = !!findUserByEmail('admin@itlognijunpaul.com');
  if (!hasAdmin) {
    return setupDemoData();
  }

  return { ok: true, message: 'Demo data already available.' };
}

function getBusinessDashboardSpreadsheet() {
  try {
    return SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();
  } catch (error) {
    throw new Error('Unable to access the Google Spreadsheet: ' + error.message);
  }
}

function normalizeDashboardLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDashboardHeaderIndex(headers, aliases) {
  const normalizedHeaders = (headers || []).map(normalizeDashboardLabel);
  for (let i = 0; i < aliases.length; i += 1) {
    const index = normalizedHeaders.indexOf(normalizeDashboardLabel(aliases[i]));
    if (index !== -1) {
      return index;
    }
  }
  return -1;
}

function parseDashboardNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const accountingNegative = /^\s*\(.*\)\s*$/.test(text);
  const sanitized = text.replace(/[^0-9.\-]/g, '');
  if (!sanitized || sanitized === '-' || sanitized === '.') {
    return null;
  }

  const asNumber = Number(sanitized);
  return isNaN(asNumber) ? null : accountingNegative ? -Math.abs(asNumber) : asNumber;
}

function parseDashboardDate(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function dashboardDateKey(value, timeZone) {
  const date = parseDashboardDate(value);
  return date ? Utilities.formatDate(date, timeZone, 'yyyy-MM-dd') : '';
}

function shiftDashboardDateKey(dateKey, dayOffset) {
  const parts = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + dayOffset));
  return shifted.toISOString().slice(0, 10);
}

function getDashboardRows(sheetName) {
  const sheet = getBusinessDashboardSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Required sheet was not found: ' + sheetName);
  }
  const values = sheet.getDataRange().getValues();
  return {
    sheet: sheet,
    headers: values.length ? values[0] : [],
    rows: values.length > 1 ? values.slice(1) : []
  };
}

function getDashboardSetting(key, fallback) {
  const settings = getDashboardRows('Settings');
  const keyIndex = getDashboardHeaderIndex(settings.headers, ['key', 'setting']);
  const valueIndex = getDashboardHeaderIndex(settings.headers, ['value', 'setting value']);
  if (keyIndex === -1 || valueIndex === -1) {
    return fallback;
  }

  for (let i = 0; i < settings.rows.length; i += 1) {
    if (String(settings.rows[i][keyIndex] || '').trim() === key) {
      const value = parseDashboardNumber(settings.rows[i][valueIndex]);
      return value === null ? fallback : value;
    }
  }
  return fallback;
}

function calculateDashboardData() {
  const ss = getBusinessDashboardSpreadsheet();
  const timeZone = ss.getSpreadsheetTimeZone() || Session.getScriptTimeZone() || 'GMT';
  const salesData = getDashboardRows('Sales');
  const salesDateIndex = getDashboardHeaderIndex(salesData.headers, ['date', 'sale date', 'transaction date', 'datetime', 'date time']);
  const salesAmountIndex = getDashboardHeaderIndex(salesData.headers, ['total', 'sale amount', 'total amount', 'amount', 'grand total']);
  const salesIdIndex = getDashboardHeaderIndex(salesData.headers, ['id', 'sale id', 'transaction id', 'invoice no', 'invoice number']);
  const salesCustomerIndex = getDashboardHeaderIndex(salesData.headers, ['customer id', 'customer', 'customer name']);
  const salesQuantityIndex = getDashboardHeaderIndex(salesData.headers, ['item quantity', 'quantity', 'qty', 'egg units', 'units sold']);

  if (salesDateIndex === -1) {
    throw new Error('The Sales sheet needs a date or transaction date header.');
  }
  if (salesAmountIndex === -1) {
    throw new Error('The Sales sheet needs a total or amount header.');
  }

  const saleItems = getDashboardRows('Sale_Items');
  const itemSaleIdIndex = getDashboardHeaderIndex(saleItems.headers, ['sale id', 'transaction id', 'invoice no', 'sale']);
  const itemQuantityIndex = getDashboardHeaderIndex(saleItems.headers, ['qty', 'quantity', 'item quantity', 'egg units']);
  const itemQuantitiesBySale = {};
  if (salesQuantityIndex === -1 && itemSaleIdIndex !== -1 && itemQuantityIndex !== -1) {
    saleItems.rows.forEach(function (row) {
      const saleId = String(row[itemSaleIdIndex] || '').trim();
      const quantity = parseDashboardNumber(row[itemQuantityIndex]);
      if (saleId && quantity !== null) {
        itemQuantitiesBySale[saleId] = (itemQuantitiesBySale[saleId] || 0) + quantity;
      }
    });
  }

  const customerData = getDashboardRows('Customers');
  const customerIdIndex = getDashboardHeaderIndex(customerData.headers, ['id', 'customer id']);
  const customerNameIndex = getDashboardHeaderIndex(customerData.headers, ['name', 'customer name']);
  const customerNames = {};
  if (customerIdIndex !== -1 && customerNameIndex !== -1) {
    customerData.rows.forEach(function (row) {
      const customerId = String(row[customerIdIndex] || '').trim();
      if (customerId) customerNames[customerId] = String(row[customerNameIndex] || customerId);
    });
  }

  const today = dashboardDateKey(new Date(), timeZone);
  const yesterday = shiftDashboardDateKey(today, -1);
  const salesByDate = {};
  const customerTotals = {};
  let totalSales = 0;
  let salesToday = 0;
  let salesYesterday = 0;
  let eggUnits = 0;
  let salesRowCount = 0;
  let latestSale = null;

  salesData.rows.forEach(function (row) {
    const saleId = salesIdIndex === -1 ? '' : String(row[salesIdIndex] || '').trim();
    const saleDate = parseDashboardDate(row[salesDateIndex]);
    const amount = parseDashboardNumber(row[salesAmountIndex]);
    if (!saleDate || amount === null) return;

    salesRowCount += 1;
    totalSales += amount;
    const dateKey = dashboardDateKey(saleDate, timeZone);
    if (dateKey === today) salesToday += amount;
    if (dateKey === yesterday) salesYesterday += amount;
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + amount;

    const quantity = salesQuantityIndex !== -1
      ? parseDashboardNumber(row[salesQuantityIndex])
      : (saleId ? itemQuantitiesBySale[saleId] : null);
    if (quantity !== null && quantity !== undefined) eggUnits += quantity;

    if (salesCustomerIndex !== -1) {
      const customerValue = String(row[salesCustomerIndex] || '').trim();
      if (customerValue) {
        const customerName = customerNames[customerValue] || customerValue;
        customerTotals[customerName] = (customerTotals[customerName] || 0) + amount;
      }
    }

    if (!latestSale || saleDate.getTime() > latestSale.date.getTime()) {
      latestSale = { date: saleDate, amount: amount, id: saleId };
    }
  });

  const stocks = getDashboardRows('Egg_Stocks');
  const detectedStockQuantityIndex = getDashboardHeaderIndex(stocks.headers, [
    'qty', 'quantity', 'stock units', 'units', 'stock quantity',
    'available quantity', 'available qty', 'remaining quantity', 'remaining qty',
    'current stock', 'stock on hand', 'egg quantity', 'egg units'
  ]);
  // Existing POS reads Egg_Stocks quantity from column I (zero-based index 8).
  const stockQuantityIndex = detectedStockQuantityIndex === -1
    ? SHEET_CONFIG.Egg_Stocks.indexOf('qty')
    : detectedStockQuantityIndex;
  const stockStatusIndex = getDashboardHeaderIndex(stocks.headers, ['status', 'stock status']);
  const stockIdIndex = getDashboardHeaderIndex(stocks.headers, ['serial', 'id', 'product id', 'sku']);
  const effectiveStockStatusIndex = stockStatusIndex === -1 ? 9 : stockStatusIndex;
  const effectiveStockIdIndex = stockIdIndex === -1 ? 0 : stockIdIndex;
  if (detectedStockQuantityIndex === -1) {
    console.warn(
      'Egg_Stocks quantity header not recognized; using the established POS quantity column at index ' +
      stockQuantityIndex + '. Headers found: ' + JSON.stringify(stocks.headers)
    );
  }
  const lowStockThreshold = getDashboardSetting('low_stock_threshold', 20);
  let stockUnits = 0;
  let lowStockItems = 0;
  const stockStatuses = {};
  stocks.rows.forEach(function (row) {
    const quantity = parseDashboardNumber(row[stockQuantityIndex]);
    const status = String(row[effectiveStockStatusIndex] || '').trim();
    const hasRecord = String(row[effectiveStockIdIndex] || '').trim() ||
      quantity !== null || status;
    if (!hasRecord) return;

    const units = quantity === null ? 0 : quantity;
    stockUnits += units;
    if (status) {
      const normalizedStatus = status.toUpperCase();
      stockStatuses[normalizedStatus] = (stockStatuses[normalizedStatus] || 0) + 1;
    }
    if (quantity !== null && quantity < lowStockThreshold) lowStockItems += 1;
  });

  const expenses = getDashboardRows('Expenses');
  const expenseAmountIndex = getDashboardHeaderIndex(expenses.headers, ['amount', 'expense amount', 'total', 'total amount']);
  const expenseCategoryIndex = getDashboardHeaderIndex(expenses.headers, ['category', 'expense category', 'type']);
  if (expenseAmountIndex === -1) {
    throw new Error('The Expenses sheet needs an amount header.');
  }
  let totalExpenses = 0;
  const expenseTotals = {};
  expenses.rows.forEach(function (row) {
    const amount = parseDashboardNumber(row[expenseAmountIndex]);
    if (amount === null) return;
    totalExpenses += amount;
    const category = expenseCategoryIndex === -1
      ? 'Uncategorized'
      : String(row[expenseCategoryIndex] || 'Uncategorized').trim() || 'Uncategorized';
    expenseTotals[category] = (expenseTotals[category] || 0) + amount;
  });

  return {
    success: true,
    spreadsheetName: ss.getName(),
    today: today,
    salesRows: salesRowCount,
    latestSale: latestSale,
    stats: {
      sales_today: salesToday,
      sales_yesterday: salesYesterday,
      stock_units: stockUnits,
      egg_units: eggUnits,
      low_stock: lowStockItems,
      expenses: totalExpenses,
      profit: totalSales - totalExpenses,
      total_sales: totalSales
    },
    salesByDate: Object.keys(salesByDate).sort().slice(-12).map(function (date) {
      return { label: date, value: salesByDate[date] };
    }),
    topCustomers: Object.keys(customerTotals).map(function (name) {
      return { label: name, value: customerTotals[name] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 5),
    stockStatus: Object.keys(stockStatuses).map(function (status) {
      return { label: status, value: stockStatuses[status] };
    }).sort(function (a, b) { return a.label.localeCompare(b.label); }),
    expenseBreakdown: Object.keys(expenseTotals).map(function (category) {
      return { label: category, value: expenseTotals[category] };
    }).sort(function (a, b) { return b.value - a.value; })
  };
}

function findDashboardCell(rows, label) {
  const target = normalizeDashboardLabel(label);
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (normalizeDashboardLabel(row[columnIndex]) === target) {
        return { row: rowIndex + 1, column: columnIndex + 1 };
      }
    }
  }
  return null;
}

function writeDashboardMetric(sheet, rows, labels, value) {
  let found = null;
  for (let i = 0; i < labels.length && !found; i += 1) {
    found = findDashboardCell(rows, labels[i]);
  }
  if (!found) {
    console.warn('Dashboard metric label not found: ' + labels[0]);
    return null;
  }
  sheet.getRange(found.row, found.column + 1).setValue(value);
  return sheet.getRange(found.row, found.column + 1).getA1Notation();
}

function writeDashboardSection(sheet, rows, title, entries, sectionTitles) {
  const section = findDashboardCell(rows, title);
  if (!section) {
    console.warn('Dashboard section not found: ' + title);
    return;
  }

  const startRow = section.row + 1;
  const labelColumn = section.column;
  const nextSectionRow = sectionTitles.reduce(function (nextRow, sectionTitle) {
    const candidate = findDashboardCell(rows, sectionTitle);
    return candidate && candidate.column === labelColumn && candidate.row > section.row
      ? Math.min(nextRow, candidate.row)
      : nextRow;
  }, sheet.getLastRow() + 1);
  let availableRows = Math.max(0, nextSectionRow - startRow);
  const requiredRows = entries.length + 1;
  if (requiredRows > availableRows && nextSectionRow <= sheet.getLastRow()) {
    const rowsToInsert = requiredRows - availableRows;
    sheet.insertRowsBefore(nextSectionRow, rowsToInsert);
    const formatSourceRow = Math.max(1, startRow);
    sheet.getRange(formatSourceRow, labelColumn, 1, 2)
      .copyTo(sheet.getRange(nextSectionRow, labelColumn, rowsToInsert, 2), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    availableRows += rowsToInsert;
  } else if (requiredRows > availableRows) {
    const rowsToAdd = requiredRows - availableRows;
    const currentMaxRows = sheet.getMaxRows();
    if (startRow + requiredRows - 1 > currentMaxRows) {
      sheet.insertRowsAfter(currentMaxRows, startRow + requiredRows - 1 - currentMaxRows);
    }
    availableRows = requiredRows;
  }

  if (availableRows > 0) {
    sheet.getRange(startRow, labelColumn, availableRows, 2).clearContent();
  }
  if (entries.length) {
    const values = entries.map(function (entry) {
      return [entry.label, entry.value];
    });
    sheet.getRange(startRow, labelColumn, values.length, 2).setValues(values);
  }
}

function refreshDashboard() {
  const calculation = calculateDashboardData();
  const ss = getBusinessDashboardSpreadsheet();
  const dashboardSheet = ss.getSheetByName('Dashboard');
  if (!dashboardSheet) {
    throw new Error('The Dashboard sheet was not found.');
  }

  const dashboardRows = dashboardSheet.getDataRange().getValues();
  const metricWrites = [
    { labels: ['Sales Today'], value: calculation.stats.sales_today },
    { labels: ['Sales Yesterday'], value: calculation.stats.sales_yesterday },
    { labels: ['Low Stock Items', 'Low Stock'], value: calculation.stats.low_stock },
    { labels: ['Total Expenses'], value: calculation.stats.expenses },
    { labels: ['Estimated Profit'], value: calculation.stats.profit }
  ];
  const updatedCells = [];
  const missingMetrics = [];
  metricWrites.forEach(function (metric) {
    const cell = writeDashboardMetric(dashboardSheet, dashboardRows, metric.labels, metric.value);
    if (cell) {
      updatedCells.push(cell);
    } else {
      missingMetrics.push(metric.labels[0]);
    }
  });
  const stockUnitsCell = writeDashboardMetric(
    dashboardSheet,
    dashboardRows,
    ['Stock Units'],
    calculation.stats.stock_units
  );
  if (stockUnitsCell) updatedCells.push(stockUnitsCell);
  const eggUnitsCell = writeDashboardMetric(dashboardSheet, dashboardRows, ['Egg Units'], calculation.stats.egg_units);
  if (eggUnitsCell) updatedCells.push(eggUnitsCell);
  if (!stockUnitsCell && !eggUnitsCell) {
    missingMetrics.push('Stock Units or Egg Units');
  }

  const tableTitles = ['Sales by Date', 'Top Customers', 'Stock Status', 'Expense Breakdown'];
  writeDashboardSection(dashboardSheet, dashboardRows, 'Sales by Date', calculation.salesByDate, tableTitles);
  writeDashboardSection(dashboardSheet, dashboardSheet.getDataRange().getValues(), 'Top Customers', calculation.topCustomers, tableTitles);
  writeDashboardSection(dashboardSheet, dashboardSheet.getDataRange().getValues(), 'Stock Status', calculation.stockStatus, tableTitles);
  writeDashboardSection(dashboardSheet, dashboardSheet.getDataRange().getValues(), 'Expense Breakdown', calculation.expenseBreakdown, tableTitles);

  const refreshedCell = findDashboardCell(dashboardSheet.getDataRange().getValues(), 'Last refreshed');
  if (refreshedCell) {
    dashboardSheet.getRange(refreshedCell.row, refreshedCell.column + 1).setValue(new Date());
  }
  SpreadsheetApp.flush();

  if (missingMetrics.length) {
    throw new Error('Dashboard metric labels are missing: ' + missingMetrics.join(', '));
  }

  return {
    success: true,
    spreadsheetName: calculation.spreadsheetName,
    salesRows: calculation.salesRows,
    today: calculation.today,
    latestSale: calculation.latestSale,
    stats: calculation.stats,
    updatedCells: updatedCells
  };
}

function testDashboardCalculations() {
  const result = refreshDashboard();
  const latestSaleText = result.latestSale
    ? formatMoney(result.latestSale.amount) + (result.latestSale.id ? ' (' + result.latestSale.id + ')' : '')
    : 'None';
  const message = [
    '===== DASHBOARD CALCULATION TEST =====',
    'Sales sheet: Sales',
    'Sales rows: ' + result.salesRows,
    'Latest transaction: ' + latestSaleText,
    'Today: ' + result.today,
    'Sales Today: ' + formatMoney(result.stats.sales_today),
    'Sales Yesterday: ' + formatMoney(result.stats.sales_yesterday),
    'Egg Units: ' + result.stats.egg_units,
    'Low-stock count: ' + result.stats.low_stock,
    'Total Expenses: ' + formatMoney(result.stats.expenses),
    'Estimated Profit: ' + formatMoney(result.stats.profit),
    'Dashboard cells updated: ' + result.updatedCells.join(', '),
    '======================================'
  ].join('\n');
  Logger.log(message);
  return { success: true, message: message, result: result };
}

function findDashboardMetric(rows, label) {
  const target = normalizeDashboardLabel(label);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    for (let j = 0; j < row.length; j += 1) {
      if (normalizeDashboardLabel(row[j]) === target && j + 1 < row.length) {
        return row[j + 1];
      }
    }
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    for (let j = 0; j < row.length; j += 1) {
      if (normalizeDashboardLabel(row[j]) === target) {
        return row[j + 1] !== undefined ? row[j + 1] : null;
      }
    }
  }

  console.warn('Missing dashboard metric: ' + label);
  return null;
}

function findDashboardMetricAny(rows, labels) {
  for (let i = 0; i < labels.length; i += 1) {
    const location = findDashboardCell(rows, labels[i]);
    if (location && location.column < (rows[location.row - 1] || []).length) {
      return rows[location.row - 1][location.column];
    }
  }
  console.warn('Missing dashboard metric: ' + labels.join(' / '));
  return null;
}

function readDashboardTable(rows, label) {
  const section = findDashboardCell(rows, label);
  if (!section) {
    return [];
  }

  const results = [];
  const labelIndex = section.column - 1;
  const valueIndex = labelIndex + 1;
  for (let i = section.row; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const name = row[labelIndex];
    const valueText = row[valueIndex];
    if (String(name || '').trim() === '' && String(valueText || '').trim() === '') {
      break;
    }

    const labelText = String(name || '').trim();
    const numericValue = parseDashboardNumber(valueText);
    if (!labelText || valueText === undefined || valueText === null || valueText === '') {
      continue;
    }

    results.push({
      label: labelText,
      value: numericValue !== null ? numericValue : Number(String(valueText).trim()) || 0
    });
  }

  return results;
}

function getBusinessDashboard() {
  try {
    requireAuth(['admin', 'manager', 'cashier', 'warehouse_staff']);
    refreshDashboard();
    const ss = getBusinessDashboardSpreadsheet();
    if (!ss) {
      throw new Error('Unable to access the Google Spreadsheet.');
    }

    const dashboardSheet = ss.getSheetByName('Dashboard');
    if (!dashboardSheet) {
      throw new Error('The Dashboard sheet was not found.');
    }

    const rows = dashboardSheet.getDataRange().getValues();
    const data = {
      success: true,
      salesToday: null,
      salesYesterday: null,
      stockUnits: null,
      lowStockItems: null,
      totalExpenses: null,
      estimatedProfit: null,
      salesByDate: [],
      topCustomers: [],
      stockStatus: [],
      expenseBreakdown: [],
      lastUpdated: new Date().toISOString()
    };

    const metrics = [
      ['Sales Today', 'salesToday'],
      ['Sales Yesterday', 'salesYesterday'],
      ['Stock Units / Egg Units', 'stockUnits'],
      ['Low Stock Items / Low Stock', 'lowStockItems'],
      ['Total Expenses', 'totalExpenses'],
      ['Estimated Profit', 'estimatedProfit']
    ];

    metrics.forEach(function (metric) {
      const labels = metric[0].split(' / ');
      const rawValue = findDashboardMetricAny(rows, labels);
      const parsedValue = parseDashboardNumber(rawValue);
      data[metric[1]] = parsedValue;
      if (parsedValue === null) {
        console.warn('Dashboard metric missing or unreadable: ' + metric[0]);
      }
    });

    data.salesByDate = readDashboardTable(rows, 'Sales by Date');
    data.topCustomers = readDashboardTable(rows, 'Top Customers');
    data.stockStatus = readDashboardTable(rows, 'Stock Status');
    data.expenseBreakdown = readDashboardTable(rows, 'Expense Breakdown');

    return data;
  } catch (error) {
    const message = error && error.message ? error.message : 'Unable to load dashboard data.';
    console.error('getBusinessDashboard failed:', message);
    return {
      success: false,
      error: message,
      salesToday: null,
      salesYesterday: null,
      stockUnits: null,
      lowStockItems: null,
      totalExpenses: null,
      estimatedProfit: null,
      salesByDate: [],
      topCustomers: [],
      stockStatus: [],
      expenseBreakdown: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

function testBusinessDashboardConnection() {
  try {
    const ss = getBusinessDashboardSpreadsheet();
    if (!ss) {
      throw new Error('Unable to access the Google Spreadsheet.');
    }

    const dashboardSheet = ss.getSheetByName('Dashboard');
    if (!dashboardSheet) {
      throw new Error('The Dashboard sheet was not found.');
    }

    const rows = dashboardSheet.getDataRange().getValues();
    const hasData = rows.some(function (row) {
      return (row || []).some(function (cell) {
        return String(cell || '').trim() !== '';
      });
    });

    if (!hasData) {
      return {
        connected: false,
        spreadsheetName: ss.getName(),
        sheetName: 'Dashboard',
        message: 'The Dashboard sheet was found but contains no data.'
      };
    }

    const metrics = {
      salesToday: parseDashboardNumber(findDashboardMetricAny(rows, ['Sales Today'])),
      stockUnits: parseDashboardNumber(findDashboardMetricAny(rows, ['Stock Units', 'Egg Units'])),
      lowStockItems: parseDashboardNumber(findDashboardMetricAny(rows, ['Low Stock Items', 'Low Stock'])),
      totalExpenses: parseDashboardNumber(findDashboardMetric(rows, 'Total Expenses')),
      estimatedProfit: parseDashboardNumber(findDashboardMetric(rows, 'Estimated Profit'))
    };
    const missingMetrics = Object.keys(metrics).filter(function (key) {
      return metrics[key] === null;
    });

    return {
      connected: missingMetrics.length === 0,
      spreadsheetName: ss.getName(),
      sheetName: 'Dashboard',
      salesToday: metrics.salesToday,
      stockUnits: metrics.stockUnits,
      lowStockItems: metrics.lowStockItems,
      totalExpenses: metrics.totalExpenses,
      estimatedProfit: metrics.estimatedProfit,
      message: missingMetrics.length
        ? 'Dashboard is connected, but these metrics could not be found: ' + missingMetrics.join(', ') + '.'
        : 'Dashboard connection and required metrics verified.'
    };
  } catch (error) {
    return {
      connected: false,
      spreadsheetName: '',
      sheetName: 'Dashboard',
      message: error && error.message ? error.message : 'Unable to test the business dashboard connection.'
    };
  }
}
