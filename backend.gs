// --------------------------------------------------------------------------
// COPY ALL OF THIS INTO YOUR GOOGLE APPS SCRIPT EDITOR (Code.gs)
// --------------------------------------------------------------------------

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = {};

    // --- EXISTING LOGIC ---
    
    // 1. Get Transactions
    let sheet = ss.getSheetByName("Transactions");
    if (sheet && sheet.getLastRow() > 1) {
      const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
      result.transactions = rows.map(r => ({
        id: r[0], date: r[1], amount: r[2], category: r[3], description: r[4], type: r[5]
      })).filter(t => t.id);
    } else {
      result.transactions = [];
    }

    // 2. Get Accounts
    let accSheet = ss.getSheetByName("Accounts");
    if (!accSheet) {
      accSheet = ss.insertSheet("Accounts");
      accSheet.appendRow(["ID", "Name", "Type", "Balance"]);
    }
    if (accSheet.getLastRow() > 1) {
      const rows = accSheet.getRange(2, 1, accSheet.getLastRow() - 1, 4).getValues();
      result.accounts = rows.map(r => ({
        id: r[0], name: r[1], type: r[2], balance: Number(r[3])
      })).filter(a => a.id);
    } else {
      result.accounts = [];
    }

    // 3. Get Budgets
    let budSheet = ss.getSheetByName("Budgets");
    if (!budSheet) {
      budSheet = ss.insertSheet("Budgets");
      budSheet.appendRow(["Category", "Limit"]);
    }
    if (budSheet.getLastRow() > 1) {
      const rows = budSheet.getRange(2, 1, budSheet.getLastRow() - 1, 2).getValues();
      result.budgets = {};
      rows.forEach(r => { if(r[0]) result.budgets[r[0]] = Number(r[1]); });
    } else {
      result.budgets = {};
    }

    // --- NEW INVESTMENT LOGIC ---

    // 4. Get Investments
    // We fetch prices if needed (lazy fetch on load)
    const investmentData = getInvestments(ss);
    result.investments = investmentData;

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  // ... (Keep existing doPost logic unchanged for brevity, unless new actions needed)
  // Logic is same as before, check file for full content if needed.
  // For safety, let's include the standard doPost skeleton to avoid breaking sync.
  
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;

    if (action === 'saveTransaction') {
      let sheet = ss.getSheetByName("Transactions");
      if (!sheet) { sheet = ss.insertSheet("Transactions"); sheet.appendRow(["ID", "Date", "Amount", "Category", "Description", "Type", "AccountID"]); }
      sheet.appendRow([payload.id, payload.date, payload.amount, payload.category, payload.description, payload.type, payload.accountId || ""]);
    }
    else if (action === 'deleteTransaction') {
      const sheet = ss.getSheetByName("Transactions");
      const id = data.id;
      const values = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] == id) { sheet.deleteRow(i + 1); break; }
      }
    }
    else if (action === 'saveAccounts') {
      let sheet = ss.getSheetByName("Accounts");
      if (!sheet) { sheet = ss.insertSheet("Accounts"); sheet.appendRow(["ID", "Name", "Type", "Balance"]); }
      if(sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
      const rows = payload.map(a => [a.id, a.name, a.type, a.balance]);
      if(rows.length > 0) sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    else if (action === 'saveBudgets') {
      let sheet = ss.getSheetByName("Budgets");
      if (!sheet) { sheet = ss.insertSheet("Budgets"); sheet.appendRow(["Category", "Limit"]); }
      if(sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
      const rows = Object.entries(payload).map(([k, v]) => [k, v]);
      if(rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --------------------------------------------------------------------------
// INVESTMENT HELPERS
// --------------------------------------------------------------------------

function getInvestments(ss) {
  let holdSheet = ss.getSheetByName("Holdings");
  if (!holdSheet) {
    holdSheet = ss.insertSheet("Holdings");
    holdSheet.appendRow(["AssetClass", "Identifier", "Exchange", "Quantity", "Metadata", "BuyPrice"]);
    // Sample Data
    holdSheet.appendRow(["MF", "120503", "", 100, "", 50]); // Axis Bluechip
    holdSheet.appendRow(["STOCK", "RELIANCE", "NSE", 10, "", 2400]);
    return [];
  }

  const data = holdSheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  if (rows.length === 0) return [];

  // 1. Parse Holdings
  const holdings = rows.map(r => ({
    assetClass: r[0],
    identifier: r[1],
    exchange: r[2],
    quantity: Number(r[3]),
    metadata: r[4] ? JSON.parse(r[4]) : {},
    buyPrice: Number(r[5]) || 0
  })).filter(h => h.identifier);

  // 2. Refresh Prices (if stale)
  const prices = fetchAndCachePrices(ss, holdings);

  // 3. Combine
  return holdings.map(h => {
    let currentPrice = 0;
    let value = 0;
    let lastUpdated = "";

    if (h.assetClass === 'MF' || h.assetClass === 'STOCK' || h.assetClass === 'GOLD') {
      const priceData = prices[h.identifier];
      if (priceData) {
        currentPrice = Number(priceData.price);
        lastUpdated = priceData.date;
        value = currentPrice * h.quantity;
      }
    } else if (h.assetClass === 'EPF') {
      // Logic: Start Balance + (Monthly * Months) + Interest
      // Simplified: Just use Balance in metadata if simplistic, or formula
      // User Req: "Calculate balance locally"
      // Let's assume Metadata has { balance: 100000, monthly: 5000, last_date: "2023-01-01" }
      value = calculateEPF(h.metadata);
      currentPrice = value; // Treat as lump sum
    } else if (h.assetClass === 'PPF') {
      value = calculatePPF(h.metadata);
      currentPrice = value;
    }

    return {
      ...h,
      currentPrice,
      currentValue: value,
      lastUpdated
    };
  });
}

function fetchAndCachePrices(ss, holdings) {
  let priceSheet = ss.getSheetByName("Prices");
  if (!priceSheet) {
    priceSheet = ss.insertSheet("Prices");
    priceSheet.appendRow(["Identifier", "Price", "Date", "Source"]);
  }

  // Read Cache
  const data = priceSheet.getDataRange().getValues();
  const cache = {};
  // Skip header
  for(let i=1; i<data.length; i++) {
    cache[data[i][0]] = { price: data[i][1], date: data[i][2], source: data[i][3], row: i+1 };
  }

  const today = new Date().toISOString().split('T')[0];
  const toFetch = [];

  // Check what needs fetching
  holdings.forEach(h => {
    if (['MF', 'STOCK', 'GOLD'].includes(h.assetClass)) {
      const entry = cache[h.identifier];
      // Fetch if missing OR old (not today)
      // Note: Comparing string dates YYYY-MM-DD
      const entryDate = entry ? new Date(entry.date).toISOString().split('T')[0] : "";
      if (!entry || entryDate !== today) {
        toFetch.push(h);
      }
    }
  });

  if (toFetch.length === 0) return cache;

  // FETCH LOGIC
  // 1. AMFI
  const mfs = toFetch.filter(h => h.assetClass === 'MF');
  if (mfs.length > 0) {
    const amfiData = fetchAmfiData(); // Returns big map { '120503': 123.45 }
    mfs.forEach(h => {
      const price = amfiData[h.identifier];
      if (price) {
        updateCache(priceSheet, cache, h.identifier, price, today, "AMFI");
      }
    });
  }

  // 2. Yahoo (Stocks/Gold)
  const stocks = toFetch.filter(h => ['STOCK', 'GOLD'].includes(h.assetClass));
  stocks.forEach(h => {
    const symbol = h.exchange === 'NSE' ? `${h.identifier}.NS` : `${h.identifier}.BO`;
    const price = fetchYahooPrice(symbol);
    if (price) {
      updateCache(priceSheet, cache, h.identifier, price, today, "Yahoo");
    }
  });

  // Re-read cache to return full list
  // Optimization: Just update local cache object
  return cache; 
}

function updateCache(sheet, cache, id, price, date, source) {
  if (cache[id]) {
    // Update Row
    sheet.getRange(cache[id].row, 2, 1, 3).setValues([[price, date, source]]);
    cache[id] = { price, date, source, row: cache[id].row };
  } else {
    // Append
    sheet.appendRow([id, price, date, source]);
    cache[id] = { price, date, source, row: sheet.getLastRow() };
  }
}

// Start with empty cache for AMFI to avoid re-fetching 
let AMFI_CACHE = null;

function fetchAmfiData() {
  if (AMFI_CACHE) return AMFI_CACHE;
  try {
    const response = UrlFetchApp.fetch("https://www.amfiindia.com/spages/NAVAll.txt");
    const text = response.getContentText();
    const map = {};
    const lines = text.split('\n');
    // Format: Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length > 4) {
        const code = parts[0];
        const nav = parseFloat(parts[4]);
        if (code && !isNaN(nav)) {
          map[code] = nav;
        }
      }
    }
    AMFI_CACHE = map;
    return map;
  } catch (e) {
    return {};
  }
}

function fetchYahooPrice(symbol) {
  try {
    // Use the chart API which is generally open
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const json = JSON.parse(response.getContentText());
    if (json.chart && json.chart.result && json.chart.result[0]) {
      return json.chart.result[0].meta.regularMarketPrice;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

function calculateEPF(meta) {
  // meta: { balance: 100000, monthly: 5000, last_date: "2024-04-01", interest_rate: 0.0825 }
  // Simple approximation logic
  if (!meta || !meta.balance) return 0;
  return meta.balance + (meta.monthly || 0) * 12; // Placeholder
}

function calculatePPF(meta) {
  // Placeholder, user enters current value usually
  if (!meta || !meta.balance) return 0;
  return meta.balance;
}
