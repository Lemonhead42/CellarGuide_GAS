/**
 * CellarGuide_GAS
 * Sheet access helpers
 *
 * All program identifiers are in English.
 */

/**
 * Returns the active spreadsheet.
 * Since this is a bound script, this is the CellarGuide sheet.
 *
 * @returns {SpreadsheetApp.Spreadsheet}
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Returns the Wines sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getWinesSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_WINES);
  if (!sheet) {
    throw new Error('Wines sheet not found: ' + SHEET_NAME_WINES);
  }
  return sheet;
}

/**
 * Returns the Transactions sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getTransactionsSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_TRANSACTIONS);
  if (!sheet) {
    throw new Error('Transactions sheet not found: ' + SHEET_NAME_TRANSACTIONS);
  }
  return sheet;
}

/**
 * Returns the Inventory sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getInventorySheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_INVENTORY);
  if (!sheet) {
    throw new Error('Inventory sheet not found: ' + SHEET_NAME_INVENTORY);
  }
  return sheet;
}

/**
 * Reads all meaningful rows from the Inventory sheet and
 * returns them as an array of plain objects.
 *
 * This does NOT do any calculations – it just reads what is
 * already calculated in the sheet (via your formulas).
 *
 * @returns {Object[]} inventoryRows
 */
function getInventoryRows() {
  var sheet = getInventorySheet();
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return [];
  }

  var rows = [];
  // Start at row index 1 to skip header row (index 0)
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var wineId = row[COL_INV_WINE_ID - 1];

    // Skip completely empty rows
    if (!wineId) {
      continue;
    }

    rows.push({
      wineId: String(row[COL_INV_WINE_ID - 1]),
      name: row[COL_INV_NAME - 1],
      winery: row[COL_INV_WINERY - 1],
      vintage: row[COL_INV_VINTAGE - 1],
      color: row[COL_INV_COLOR - 1],
      storageLocation: row[COL_INV_STORAGE_LOCATION - 1],
      currentStock: row[COL_INV_CURRENT_STOCK - 1],
      lastTransactionDate: row[COL_INV_LAST_TRANSACTION - 1],
      isDrinkableNow: row[COL_INV_IS_DRINKABLE_NOW - 1],
      drinkSoon: row[COL_INV_DRINK_SOON - 1]
    });
  }

  return rows;
}


function getTransactionsSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
}

function wineExistsById_(wineId) {
  var sheet = getWinesSheet();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][COL_WINES_WINE_ID - 1]) === wineId) {
      return true;
    }
  }
  return false;
}


function getStatisticsSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_STATISTICS);
  if (!sheet) {
    throw new Error('Statistics sheet not found: ' + SHEET_NAME_STATISTICS);
  }
  return sheet;
}