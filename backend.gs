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
        id: r[0],
        date: r[1],
        amount: r[2],
        category: r[3],
        description: r[4],
        type: r[5]
      })).filter(t => t.id); // Filter empty rows
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
        id: r[0],
        name: r[1],
        type: r[2],
        balance: Number(r[3])
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
      rows.forEach(r => {
        if(r[0]) result.budgets[r[0]] = Number(r[1]);
      });
    } else {
      result.budgets = {};
    }

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
      if (!sheet) {
        sheet = ss.insertSheet("Transactions");
        sheet.appendRow(["ID", "Date", "Amount", "Category", "Description", "Type", "AccountID"]);
      }
      sheet.appendRow([
        payload.id,
        payload.date,
        payload.amount,
        payload.category,
        payload.description,
        payload.type,
        payload.accountId || ""
      ]);
    }
    
    else if (action === 'deleteTransaction') {
      const sheet = ss.getSheetByName("Transactions");
      const id = data.id;
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] == id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    else if (action === 'saveAccounts') {
      let sheet = ss.getSheetByName("Accounts");
      if (!sheet) {
        sheet = ss.insertSheet("Accounts");
        sheet.appendRow(["ID", "Name", "Type", "Balance"]);
      }
      // Clear old accounts and replace (simplest sync)
      // Ideally we update by ID, but for now replace is safer for sync
      if(sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      
      const rows = payload.map(a => [a.id, a.name, a.type, a.balance]);
      if(rows.length > 0) sheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }

    else if (action === 'saveBudgets') {
      let sheet = ss.getSheetByName("Budgets");
      if (!sheet) {
        sheet = ss.insertSheet("Budgets");
        sheet.appendRow(["Category", "Limit"]);
      }
      if(sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
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
