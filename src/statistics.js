/**
 * CellarGuide_GAS
 * statistics.gs
 *
 * Reads deterministic metrics from the "Statistics" sheet.
 * All program identifiers are in English.
 */

/**
 * Reads the Statistics sheet (Key/Value table) and returns an object map.
 *
 * Expected sheet structure:
 *   Col A: Key
 *   Col B: Value
 *   Col C: Comment (ignored)
 *
 * @returns {Object} stats map, e.g. { TotalBottles: 42, DrinkableCount: 10 }
 */
function readStatistics() {
  var sheet = getStatisticsSheet();
  var lastRow = sheet.getLastRow();

  // No data rows
  if (lastRow < 2) {
    return {};
  }

  // Read columns A:C from row 2 to lastRow
  var range = sheet.getRange(2, 1, lastRow - 1, 3);
  var values = range.getValues();

  var stats = {};

  for (var i = 0; i < values.length; i++) {
    var key = values[i][0];
    var value = values[i][1];

    if (!key) continue;

    // Normalize key
    key = String(key).trim();
    if (!key) continue;

    // Normalize value:
    // - numbers stay numbers
    // - booleans stay booleans
    // - empty string -> null (so API can omit or show as null)
    // - other types -> string
    if (value === '') {
      stats[key] = null;
    } else if (typeof value === 'number') {
      stats[key] = value;
    } else if (typeof value === 'boolean') {
      stats[key] = value;
    } else if (value instanceof Date) {
      // Return ISO date string (date-time) for consistent JSON
      stats[key] = value.toISOString();
    } else {
      stats[key] = String(value);
    }
  }

  return stats;
}