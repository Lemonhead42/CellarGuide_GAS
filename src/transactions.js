/**
 * Add a new transaction (IN / OUT) to the Transactions sheet
 *
 * Required payload fields:
 * - action: "addTransaction"
 * - wineId
 * - type: "IN" or "OUT"
 * - quantity (positive number)
 *
 * Optional fields:
 * - transactionDate (YYYY-MM-DD, defaults to today)
 * - reason
 * - person
 * - comment
 */
function addTransactionEndpoint(e, payload) {
  try {
    if (!payload) {
      return buildJsonResponse({
        success: false,
        error: 'Missing request body',
        code: 400
      });
    }

    // --- Required fields --------------------------------------------------
    var wineId = String(payload.wineId || '').trim();
    var type = String(payload.type || '').trim().toUpperCase();
    var quantity = payload.quantity;

    if (!wineId) {
      return buildJsonResponse({
        success: false,
        error: 'Missing required field: wineId',
        code: 400
      });
    }

    if (type !== 'IN' && type !== 'OUT') {
      return buildJsonResponse({
        success: false,
        error: 'Invalid type. Use "IN" or "OUT".',
        code: 400
      });
    }

    if (quantity === null || quantity === undefined || quantity === '') {
      return buildJsonResponse({
        success: false,
        error: 'Missing required field: quantity',
        code: 400
      });
    }

    quantity = Number(quantity);
    if (!isFinite(quantity) || quantity <= 0) {
      return buildJsonResponse({
        success: false,
        error: 'Quantity must be a positive number',
        code: 400
      });
    }

    // --- Optional fields --------------------------------------------------
    var transactionDate = String(payload.transactionDate || '').trim();
    if (!transactionDate) {
      transactionDate = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      return buildJsonResponse({
        success: false,
        error: 'transactionDate must be in format YYYY-MM-DD',
        code: 400
      });
    }

    var reason  = payload.reason  ? String(payload.reason).trim()  : '';
    var person  = payload.person  ? String(payload.person).trim()  : '';
    var comment = payload.comment ? String(payload.comment).trim() : '';

    // --- Validate wine existence -----------------------------------------
    if (!wineExistsById_(wineId)) {
      return buildJsonResponse({
        success: false,
        error: 'Wine not found',
        wineId: wineId,
        code: 404
      });
    }

    // --- Prevent overselling: block OUT if stock is insufficient ---------------
    var lock = LockService.getScriptLock();
    lock.waitLock(10000); // wait up to 10s

    try {
      if (type === 'OUT') {
        var currentStock = getCurrentStockByWineId_(wineId);

        if (quantity > currentStock) {
          return buildJsonResponse({
            success: false,
            error: 'Insufficient stock',
            code: 409,
            data: {
              wineId: wineId,
              requestedOut: quantity,
              currentStock: currentStock
            }
          });
        }
      }

      // --- Build & append transaction row --------------------------------------
      var sheet = getTransactionsSheet();
      var transactionId = generateTransactionId_();

      var row = [];
      row[COL_TRANS_ID       - 1] = transactionId;
      row[COL_TRANS_DATE     - 1] = transactionDate;
      row[COL_TRANS_WINE_ID  - 1] = wineId;
      row[COL_TRANS_QUANTITY - 1] = quantity;
      row[COL_TRANS_TYPE     - 1] = type;
      row[COL_TRANS_REASON   - 1] = reason;
      row[COL_TRANS_PERSON   - 1] = person;
      row[COL_TRANS_COMMENT  - 1] = comment;

    sheet.appendRow(row);

    return buildJsonResponse({
      success: true,
      data: {
        transactionId: transactionId,
        wineId: wineId,
        type: type,
        quantity: quantity,
        transactionDate: transactionDate
      }
    });
  
  } finally {
  lock.releaseLock();
  }

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: 'Failed to add transaction',
      details: String(err),
      code: 500
    });
  }
}



/**
 * Append an IN transaction for a given wineId.
 * Assumes wineId exists.
 *
 * @param {string} wineId
 * @param {number} quantity
 * @param {string} transactionDate - "YYYY-MM-DD" or empty for today
 * @param {string} reason
 * @param {string} person
 * @param {string} comment
 * @returns {string} transactionId
 */
function appendInTransaction_(wineId, quantity, transactionDate, reason, person, comment) {
  var sheet = getTransactionsSheet();

  // default date
  var dateStr = String(transactionDate || '').trim();
  if (!dateStr) {
    dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('initialTransactionDate must be in format YYYY-MM-DD');
  }

  var qty = Number(quantity);
  if (!isFinite(qty) || qty <= 0) {
    throw new Error('initialQuantity must be a positive number');
  }

  var txId = generateTransactionId_();

  var row = [];
  row[COL_TRANS_ID       - 1] = txId;
  // Empfehlung: echtes Datum schreiben (stabil für MAX/QUERY)
  row[COL_TRANS_DATE     - 1] = new Date(dateStr);
  row[COL_TRANS_WINE_ID  - 1] = wineId;
  row[COL_TRANS_QUANTITY - 1] = qty;
  row[COL_TRANS_TYPE     - 1] = 'IN';
  row[COL_TRANS_REASON   - 1] = reason ? String(reason).trim() : 'Initial Stock';
  row[COL_TRANS_PERSON   - 1] = person ? String(person).trim() : '';
  row[COL_TRANS_COMMENT  - 1] = comment ? String(comment).trim() : '';

  sheet.appendRow(row);
  return txId;
}




/**
 * Calculate current stock for a wineId from Transactions sheet.
 * IN adds, OUT subtracts.
 *
 * @param {string} wineId
 * @returns {number}
 */
function getCurrentStockByWineId_(wineId) {
  var sheet = getTransactionsSheet();
  var values = sheet.getDataRange().getValues(); // header + rows

  var stock = 0;
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var id = String(row[COL_TRANS_WINE_ID - 1] || '').trim();
    if (id !== wineId) continue;

    var qty = Number(row[COL_TRANS_QUANTITY - 1] || 0);
    var type = String(row[COL_TRANS_TYPE - 1] || '').trim().toUpperCase();

    if (!isFinite(qty)) qty = 0;

    if (type === 'IN') stock += qty;
    else if (type === 'OUT') stock -= qty;
  }
  return stock;
}