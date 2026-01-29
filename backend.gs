// --------------------------------------------------------------------------
// COPY ALL OF THIS INTO YOUR GOOGLE APPS SCRIPT EDITOR (Code.gs)
// --------------------------------------------------------------------------

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = {};

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

    // 4. Get Investments
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
    // [NEW] Save Holding
    else if (action === 'saveHolding') {
      let sheet = ss.getSheetByName("Holdings");
      if (!sheet) {
        sheet = ss.insertSheet("Holdings");
        sheet.appendRow(["AssetClass", "Identifier", "Exchange", "Quantity", "Metadata", "BuyPrice"]);
      }
      sheet.appendRow([
        payload.assetClass, 
        payload.identifier, 
        payload.exchange || "", 
        payload.quantity, 
        JSON.stringify(payload.metadata || {}),
        payload.buyPrice
      ]);
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
    return [];
  }

  const data = holdSheet.getDataRange().getValues();
  const rows = data.slice(1);
  if (rows.length === 0) return [];

  const holdings = rows.map(r => {
    let meta = {};
    try { meta = r[4] ? JSON.parse(r[4]) : {}; } catch(e) {}
    return {
      assetClass: r[0],
      identifier: r[1],
      exchange: r[2],
      quantity: Number(r[3]),
      metadata: meta,
      buyPrice: Number(r[5]) || 0
    };
  }).filter(h => h.identifier);

  const prices = fetchAndCachePrices(ss, holdings);

  return holdings.map(h => {
    let currentPrice = 0;
    let investedValue = 0;
    let value = 0;
    let lastUpdated = "";

    // 1. Calculate Invested Value
    if (h.assetClass === 'MF') {
      if (h.metadata.type === 'SIP') {
        // Calculate months since start
        investedValue = calculateSipInvested(h.metadata.sipAmount, h.metadata.startDate);
      } else if (h.metadata.type === 'LUMPSUM') {
        investedValue = Number(h.metadata.amount) || 0;
      } else {
        investedValue = h.quantity * h.buyPrice;
      }
    } else {
      investedValue = h.quantity * h.buyPrice;
    }

    // 2. Calculate Current Value
    if (['MF', 'STOCK', 'GOLD'].includes(h.assetClass)) {
      const priceData = prices[h.identifier];
      if (priceData) {
        currentPrice = Number(priceData.price);
        lastUpdated = priceData.date;
        
        if (h.quantity > 0) {
           value = currentPrice * h.quantity;
        } else {
           // Fallback: Use Invested Value (assume no gain/loss if we don't know units)
           // ideally we fetch NAV and calculate units from invested amount/NAV at start date, but that's complex
           // for now, just show invested value so it's not 0
           value = investedValue; 
           // If we have current NAV, we *could* estimate
        }
      }
      
      // If we failed to get price but have invested value, preserve it
      if (value === 0 && investedValue > 0) value = investedValue;
      
    } else if (h.assetClass === 'EPF') {
      value = calculateEPF(h.metadata);
      currentPrice = value;
      investedValue = value; // Approx
    } else if (h.assetClass === 'PPF') {
      value = calculatePPF(h.metadata);
      currentPrice = value;
      investedValue = value;
    }

    return { 
      ...h, 
      currentPrice, 
      currentValue: value, 
      investedValue: investedValue, // Pass back to UI
      lastUpdated 
    };
  });
}

function calculateSipInvested(amount, startDateStr) {
  if (!amount || !startDateStr) return 0;
  const start = new Date(startDateStr);
  const now = new Date();
  
  // Calculate months difference
  let months = (now.getFullYear() - start.getFullYear()) * 12;
  months -= start.getMonth();
  months += now.getMonth();
  
  if (months < 0) months = 0;
  return amount * (months + 1); // +1 because start month counts? or maybe just elapsed. Let's say +1 (current month paid)
}

function fetchAndCachePrices(ss, holdings) {
  let priceSheet = ss.getSheetByName("Prices");
  if (!priceSheet) {
    priceSheet = ss.insertSheet("Prices");
    priceSheet.appendRow(["Identifier", "Price", "Date", "Source"]);
  }

  const data = priceSheet.getDataRange().getValues();
  const cache = {};
  for(let i=1; i<data.length; i++) {
    cache[data[i][0]] = { price: data[i][1], date: data[i][2], source: data[i][3], row: i+1 };
  }

  const today = new Date().toISOString().split('T')[0];
  const toFetch = [];

  holdings.forEach(h => {
    if (['MF', 'STOCK', 'GOLD'].includes(h.assetClass)) {
      const entry = cache[h.identifier];
      const entryDate = entry ? new Date(entry.date).toISOString().split('T')[0] : "";
      if (!entry || entryDate !== today) {
        toFetch.push(h);
      }
    }
  });

  if (toFetch.length === 0) return cache;

  // 1. AMFI
  const mfs = toFetch.filter(h => h.assetClass === 'MF');
  if (mfs.length > 0) {
    const amfiData = fetchAmfiData(); 
    mfs.forEach(h => {
      const price = amfiData[h.identifier];
      if (price) {
        updateCache(priceSheet, cache, h.identifier, price, today, "AMFI");
      }
    });
  }

  // 2. Yahoo
  const stocks = toFetch.filter(h => ['STOCK', 'GOLD'].includes(h.assetClass));
  stocks.forEach(h => {
    const symbol = h.exchange === 'NSE' ? `${h.identifier}.NS` : `${h.identifier}.BO`;
    const price = fetchYahooPrice(symbol);
    if (price) {
      updateCache(priceSheet, cache, h.identifier, price, today, "Yahoo");
    }
  });

  return cache; 
}

function updateCache(sheet, cache, id, price, date, source) {
  if (cache[id]) {
    sheet.getRange(cache[id].row, 2, 1, 3).setValues([[price, date, source]]);
    cache[id] = { price, date, source, row: cache[id].row };
  } else {
    sheet.appendRow([id, price, date, source]);
    cache[id] = { price, date, source, row: sheet.getLastRow() };
  }
}

let AMFI_CACHE = null;

function fetchAmfiData() {
  if (AMFI_CACHE) return AMFI_CACHE;
  try {
    const response = UrlFetchApp.fetch("https://www.amfiindia.com/spages/NAVAll.txt");
    const text = response.getContentText();
    const map = {};
    const lines = text.split('\n');
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
  if (!meta || !meta.balance) return 0;
  return meta.balance + (meta.monthly || 0) * 12; 
}

function calculatePPF(meta) {
  if (!meta || !meta.balance) return 0;
  return meta.balance;
}
