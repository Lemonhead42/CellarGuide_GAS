/**
 * CellarGuide_GAS
 * Global configuration and constants
 *
 * All program identifiers are in English.
 */

/**
 * IMPORTANT:
 * Replace this with a long, random secret token.
 * This token must be sent as `token` (or `apiToken`)
 * in every request from your CustomGPT.
 *
 * Example: "g8F3kL9pQ1zX7..." (20–40 chars, mixed)
 */
//const SECRET_TOKEN = 'rinsiz-ninqyq-9dYdve';
function getSecretToken() {
  return PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN');
}

/**
 * Spreadsheet configuration
 *
 * If this script is bound to the CellarGuide sheet
 * (which it is in your case), we can use:
 *   SpreadsheetApp.getActiveSpreadsheet()
 *
 * But we still define sheet names here for clarity.
 */

const SHEET_NAME_WINES       = 'Wines';
const SHEET_NAME_TRANSACTIONS = 'Transactions';
const SHEET_NAME_INVENTORY   = 'Inventory';

/**
 * Column indices for the Wines sheet
 * (1-based indices, as used by Apps Script)
 *
 * Header row (for reference):
 * WineID,Name,Winery,Region,Country,Vintage,Color,Grapes,Style,Sweetness,Alcohol,DrinkFrom,DrinkUntil,FoodPairing,Occasion,Price,BottleSize,StorageLocation,Notes
 */

const COL_WINES_WINE_ID          = 1;
const COL_WINES_NAME             = 2;
const COL_WINES_WINERY           = 3;
const COL_WINES_REGION           = 4;
const COL_WINES_COUNTRY          = 5;
const COL_WINES_VINTAGE          = 6;
const COL_WINES_COLOR            = 7;
const COL_WINES_GRAPES           = 8;
const COL_WINES_STYLE            = 9;
const COL_WINES_SWEETNESS        = 10;
const COL_WINES_ALCOHOL          = 11;
const COL_WINES_DRINK_FROM       = 12;
const COL_WINES_DRINK_UNTIL      = 13;
const COL_WINES_FOOD_PAIRING     = 14;
const COL_WINES_OCCASION         = 15;
const COL_WINES_PRICE            = 16;
const COL_WINES_BOTTLE_SIZE      = 17;
const COL_WINES_STORAGE_LOCATION = 18;
const COL_WINES_NOTES            = 19;

/**
 * Column indices for the Transactions sheet
 *
 * Header row:
 * TransactionID,Date,WineID,Quantity,Type,Reason,Person,Comment
 */

const COL_TRANS_ID       = 1;
const COL_TRANS_DATE     = 2;
const COL_TRANS_WINE_ID  = 3;
const COL_TRANS_QUANTITY = 4;
const COL_TRANS_TYPE     = 5;
const COL_TRANS_REASON   = 6;
const COL_TRANS_PERSON   = 7;
const COL_TRANS_COMMENT  = 8;

/**
 * Column indices for the Inventory sheet
 *
 * Header row:
 * WineID,Name,Winery,Vintage,Color,StorageLocation,CurrentStock,LastTransactionDate,IsDrinkableNow,DrinkSoon
 */

const COL_INV_WINE_ID             = 1;
const COL_INV_NAME                = 2;
const COL_INV_WINERY              = 3;
const COL_INV_VINTAGE             = 4;
const COL_INV_COLOR               = 5;
const COL_INV_STORAGE_LOCATION    = 6;
const COL_INV_CURRENT_STOCK       = 7;
const COL_INV_LAST_TRANSACTION    = 8;
const COL_INV_IS_DRINKABLE_NOW    = 9;
const COL_INV_DRINK_SOON          = 10;

/**
 * Business constants
 */

const TRANSACTION_TYPE_IN  = 'IN';
const TRANSACTION_TYPE_OUT = 'OUT';
