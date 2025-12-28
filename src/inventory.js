/**
 * CellarGuide_GAS
 * Inventory-related API endpoints
 *
 * All program identifiers are in English.
 */

/**
 * List inventory items and enrich them with full wine metadata from Wines sheet.
 * Returns merged objects:
 * - all fields from Wines
 * - plus Inventory fields (override if same key exists)
 */
function listInventoryEndpoint(e, payload) {
  try {
    var invSheet = getInventorySheet();
    var winesSheet = getWinesSheet();

    var invValues = invSheet.getDataRange().getValues();     // header + rows
    var wineValues = winesSheet.getDataRange().getValues();  // header + rows

    if (!invValues || invValues.length < 2) {
      return buildJsonResponse({
        success: true,
        data: { total: 0, items: [] }
      });
    }

    if (!wineValues || wineValues.length < 2) {
      return buildJsonResponse({
        success: false,
        error: 'Wines sheet is empty or missing',
        code: 500
      });
    }

    var invHeader = invValues[0].map(function (h) { return String(h || '').trim(); });
    var invRows = invValues.slice(1);

    var wineHeader = wineValues[0].map(function (h) { return String(h || '').trim(); });
    var wineRows = wineValues.slice(1);

    // --- Build WineID -> wineObject map -----------------------------------
    var wineIdCol = wineHeader.indexOf('WineID');
    if (wineIdCol === -1) {
      return buildJsonResponse({
        success: false,
        error: 'Wines header missing "WineID"',
        code: 500
      });
    }

    var winesById = {};
    for (var i = 0; i < wineRows.length; i++) {
      var r = wineRows[i];
      var id = String(r[wineIdCol] || '').trim();
      if (!id) continue;
      winesById[id] = rowToObject_(wineHeader, r);
    }

    // --- Determine Inventory WineID column --------------------------------
    var invWineIdCol = invHeader.indexOf('WineID');
    if (invWineIdCol === -1) {
      return buildJsonResponse({
        success: false,
        error: 'Inventory header missing "WineID"',
        code: 500
      });
    }

    // --- Build merged items ------------------------------------------------
    var items = [];
    for (var j = 0; j < invRows.length; j++) {
      var row = invRows[j];
      var invWineId = String(row[invWineIdCol] || '').trim();
      if (!invWineId) continue;

      var invObj = rowToObject_(invHeader, row);
      var wineObj = winesById[invWineId] || {};

      // Merge: Wines first (meta), Inventory second (state overrides)
      var merged = Object.assign({}, wineObj, invObj);

      // Ensure consistent key
      merged.WineID = invWineId;

      items.push(merged);
    }

    return buildJsonResponse({
      success: true,
      data: {
        total: items.length,
        items: items
      }
    });

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: 'Failed to list inventory',
      details: String(err),
      code: 500
    });
  }
}

/**
 * Convert a sheet row to an object using the provided header row.
 */
function rowToObject_(header, row) {
  var o = {};
  for (var i = 0; i < header.length; i++) {
    var key = String(header[i] || '').trim();
    if (!key) continue;
    o[key] = row[i];
  }
  return o;
}
