/**
 * Add a new wine to the Wines sheet
 *
 * @param {Object} e - event object
 * @param {Object} payload - parsed JSON body
 * @returns {ContentService.TextOutput}
 */
function addWineEndpoint(e, payload) {
  try {
    if (!payload) {
      return buildJsonResponse({
        success: false,
        error: 'Missing request body',
        code: 400
      });
    }

    var name = (payload.name || '').trim();
    var winery = (payload.winery || '').trim();

    if (!name || !winery) {
      return buildJsonResponse({
        success: false,
        error: 'Missing required fields: name, winery',
        code: 400
      });
    }

    var sheet = getWinesSheet();
    var data = sheet.getDataRange().getValues();

    // --- Duplicate check (same name + winery) ----------------------------
    for (var i = 1; i < data.length; i++) {
      if (
        String(data[i][COL_WINES_NAME - 1]).toLowerCase() === name.toLowerCase() &&
        String(data[i][COL_WINES_WINERY - 1]).toLowerCase() === winery.toLowerCase()
      ) {
        return buildJsonResponse({
          success: false,
          error: 'Wine already exists',
          existingWineId: data[i][COL_WINES_WINE_ID - 1],
          code: 409
        });
      }
    }

    // --- Generate WineID --------------------------------------------------
    var wineId = generateWineId();

    // --- Build row in correct column order -------------------------------
    var row = [];
    row[COL_WINES_WINE_ID - 1]          = wineId;
    row[COL_WINES_NAME - 1]             = name;
    row[COL_WINES_WINERY - 1]           = winery;
    row[COL_WINES_REGION - 1]           = payload.region || '';
    row[COL_WINES_COUNTRY - 1]          = payload.country || '';
    row[COL_WINES_VINTAGE - 1]          = payload.vintage || '';
    row[COL_WINES_COLOR - 1]            = payload.color || '';
    row[COL_WINES_GRAPES - 1]           = payload.grapes || '';
    row[COL_WINES_STYLE - 1]            = payload.style || '';
    row[COL_WINES_SWEETNESS - 1]        = payload.sweetness || '';
    row[COL_WINES_ALCOHOL - 1]          = payload.alcohol || '';
    row[COL_WINES_DRINK_FROM - 1]       = payload.drinkFrom || '';
    row[COL_WINES_DRINK_UNTIL - 1]      = payload.drinkUntil || '';
    row[COL_WINES_FOOD_PAIRING - 1]     = payload.foodPairing || '';
    row[COL_WINES_OCCASION - 1]         = payload.occasion || '';
    row[COL_WINES_PRICE - 1]            = payload.price || '';
    row[COL_WINES_BOTTLE_SIZE - 1]      = payload.bottleSize || '';
    row[COL_WINES_STORAGE_LOCATION - 1] = payload.storageLocation || '';
    row[COL_WINES_NOTES - 1]            = payload.notes || '';

    sheet.appendRow(row);


    // --- Optional: create initial IN transaction ------------------------------
    var initialQuantity = payload.initialQuantity;

    var createdTransactionId = null;
    if (initialQuantity !== null && initialQuantity !== undefined && initialQuantity !== '') {
      var qty = Number(initialQuantity);

      if (!isFinite(qty) || qty <= 0) {
        return buildJsonResponse({
          success: false,
          error: 'initialQuantity must be a positive number',
          code: 400
        });
      }

      // lock to avoid rare race conditions (insert + tx)
      var lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        createdTransactionId = appendInTransaction_(
          wineId,
          qty,
          payload.initialTransactionDate || '',
          payload.initialReason || 'Initial Stock',
          payload.initialPerson || '',
          payload.initialComment || ''
        );
      } finally {
        lock.releaseLock();
      }
    }

    return buildJsonResponse({
      success: true,
      data: {
        wineId: wineId,
        name: name,
        winery: winery,
        initialTransactionId: createdTransactionId
      }
    });

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: 'Failed to add wine',
      details: String(err),
      code: 500
    });
  }
}




/**
 * Update properties of an existing wine
 *
 * @param {Object} e - event object
 * @param {Object} payload - parsed JSON body
 * @returns {ContentService.TextOutput}
 */
function updateWineEndpoint(e, payload) {
  try {
    if (!payload || !payload.wineId) {
      return buildJsonResponse({
        success: false,
        error: 'Missing required field: wineId',
        code: 400
      });
    }

    var wineId = String(payload.wineId).trim();
    var sheet = getWinesSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return buildJsonResponse({
        success: false,
        error: 'Wines sheet is empty',
        code: 404
      });
    }

    // --- Find wine row by WineID ------------------------------------------
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_WINES_WINE_ID - 1]) === wineId) {
        rowIndex = i + 1; // sheet rows are 1-based
        break;
      }
    }

    if (rowIndex === -1) {
      return buildJsonResponse({
        success: false,
        error: 'Wine not found',
        wineId: wineId,
        code: 404
      });
    }

    // --- Map payload fields to columns ------------------------------------
    var updates = {};

    if ('name' in payload)             updates[COL_WINES_NAME]             = payload.name;
    if ('winery' in payload)           updates[COL_WINES_WINERY]           = payload.winery;
    if ('region' in payload)           updates[COL_WINES_REGION]           = payload.region;
    if ('country' in payload)          updates[COL_WINES_COUNTRY]          = payload.country;
    if ('vintage' in payload)          updates[COL_WINES_VINTAGE]          = payload.vintage;
    if ('color' in payload)            updates[COL_WINES_COLOR]            = payload.color;
    if ('grapes' in payload)           updates[COL_WINES_GRAPES]           = payload.grapes;
    if ('style' in payload)            updates[COL_WINES_STYLE]            = payload.style;
    if ('sweetness' in payload)        updates[COL_WINES_SWEETNESS]        = payload.sweetness;
    if ('alcohol' in payload)          updates[COL_WINES_ALCOHOL]          = payload.alcohol;
    if ('drinkFrom' in payload)        updates[COL_WINES_DRINK_FROM]       = payload.drinkFrom;
    if ('drinkUntil' in payload)       updates[COL_WINES_DRINK_UNTIL]      = payload.drinkUntil;
    if ('foodPairing' in payload)      updates[COL_WINES_FOOD_PAIRING]     = payload.foodPairing;
    if ('occasion' in payload)         updates[COL_WINES_OCCASION]         = payload.occasion;
    if ('price' in payload)            updates[COL_WINES_PRICE]            = payload.price;
    if ('bottleSize' in payload)       updates[COL_WINES_BOTTLE_SIZE]      = payload.bottleSize;
    if ('storageLocation' in payload)  updates[COL_WINES_STORAGE_LOCATION] = payload.storageLocation;
    if ('notes' in payload)            updates[COL_WINES_NOTES]            = payload.notes;

    if (Object.keys(updates).length === 0) {
      return buildJsonResponse({
        success: false,
        error: 'No updatable fields provided',
        code: 400
      });
    }

    // --- Apply updates ----------------------------------------------------
    for (var col in updates) {
      sheet.getRange(rowIndex, Number(col)).setValue(updates[col]);
    }

    return buildJsonResponse({
      success: true,
      data: {
        wineId: wineId,
        updatedFields: Object.keys(updates).length
      }
    });

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: 'Failed to update wine',
      details: String(err),
      code: 500
    });
  }
}