/**
 * CellarGuide_GAS
 * Main entry points and basic routing
 *
 * All program identifiers are in English.
 * 
 * nun alles sauber strukturiert und versioniert
 */

/**
 * Entry point for GET requests.
 * Usage example:
 *   /exec?token=YOUR_TOKEN              → defaults to listInventory
 *   /exec?action=ping&token=YOUR_TOKEN  → ping endpoint
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

/**
 * Entry point for POST requests.
 * Usage example:
 *   POST body: { "action": "ping", "token": "YOUR_TOKEN" }
 *   Query:     ?token=YOUR_TOKEN
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Central request handler.
 *
 * @param {Object} e - Google Apps Script event object
 * @param {String} method - "GET" or "POST"
 * @returns {ContentService.TextOutput}
 */
function handleRequest(e, method) {
  try {
    Logger.log("=== Incoming Request ===");
    Logger.log(JSON.stringify(e, null, 2));
    Logger.log("========================");

    if (!e) {
      return buildJsonResponse({
        success: false,
        error: 'Missing event object',
        code: 400
      });
    }

    // --- 0. Parse payload early (needed for POST token) --------------------
    var payload = {};

    if (method === 'POST' && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents) || {};
      } catch (err) {
        return buildJsonResponse({
          success: false,
          error: 'Invalid JSON body',
          details: String(err),
          code: 400
        });
      }
    }

    // --- 1. Auth check (query token OR JSON body token) --------------------
    var token = null;

    // 1) Token from query string: ?token=... (preferred for GET)
    if (e && e.parameter) {
      token = e.parameter.token || e.parameter.apiToken || null;
    }

    // 2) Token from JSON body: { "token": "..." } (needed for POST)
    if (!token && payload && payload.token) {
      token = payload.token;
    }
    if (!token && payload && payload.apiToken) {
      token = payload.apiToken;
    }

    // Security check against Script Properties
    var expectedToken = getSecretToken();
    if (!expectedToken || !token || token !== expectedToken) {
      return buildJsonResponse({
        success: false,
        error: 'Unauthorized',
        code: 401
      });
    }

    // --- 2. Determine action ----------------------------------------------
    var action = (e.parameter && e.parameter.action) || null;

    // Allow action in JSON body for POST
    if (!action && payload && payload.action) {
      action = payload.action;
    }

    // Default: GET /exec → listInventory
    if (!action && method === 'GET') {
      action = 'listInventory';
    }

    if (!action) {
      return buildJsonResponse({
        success: false,
        error: 'Missing action parameter',
        code: 400
      });
    }

    // --- 3. Routing --------------------------------------------------------
    switch (action) {

      case 'ping':
        return buildJsonResponse({
          success: true,
          data: {
            message: 'CellarGuide API is alive.',
            project: 'CellarGuide',
            method: method
          }
        });

      case 'listInventory':
        return listInventoryEndpoint(e, payload);

      case 'addWine':
        return addWineEndpoint(e, payload);
      case 'updateWine':
        return updateWineEndpoint(e, payload);
      case 'addTransaction':
        return addTransactionEndpoint(e, payload);
      // future actions:
      // case 'getWineHistory':
      //   return getWineHistoryEndpoint(e, payload);

      default:
        return buildJsonResponse({
          success: false,
          error: 'Unknown action',
          action: action,
          code: 404
        });
    }

  } catch (err) {
    return buildJsonResponse({
      success: false,
      error: 'Internal error',
      details: String(err),
      code: 500
    });
  }
}

/**
 * Helper to build a JSON response.
 *
 * Note: Apps Script Web Apps always respond with HTTP 200,
 * so we include a "code" field in the JSON for semantic status.
 */
function buildJsonResponse(obj) {
  Logger.log("=== Outgoing Response ===");
  Logger.log(JSON.stringify(obj, null, 2));

  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
