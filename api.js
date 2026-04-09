/**
 * MLP Coordinator Hub — API Sync Shim
 *
 * Bridges the existing localStorage-backed HTML tools to the server-side API
 * WITHOUT requiring any changes to the individual tool files.
 *
 * How it works:
 *   1. On page load, reads a JWT from sessionStorage("mlp_jwt").
 *   2. If the token is valid, fetches all stored data from GET /data and
 *      merges it into localStorage (server wins if server timestamp is newer).
 *   3. Overrides localStorage.setItem so writes to known MLP keys are
 *      automatically synced to the server after an 800 ms debounce.
 *   4. Handles 409 Conflict responses by re-fetching the server version.
 *   5. Stores the token from ?mlp_token= URL parameter (OAuth callback).
 *
 * Compatibility:
 *   - Written in ES5 so it runs in any browser without transpilation.
 *   - Safe to include on GitHub Pages — if no token is present, the shim
 *     is entirely passive and does not interfere with localStorage.
 *
 * Usage:
 *   <script src="shared/api.js"></script>
 *   Include before any tool scripts in each HTML tool file.
 */

/* jshint esversion: 5 */
/* global XMLHttpRequest, sessionStorage, localStorage */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  var MLP_API_BASE = 'https://api.zalphateachingsolutions.org';

  // Keys that are synced to the server (generic tool-data endpoint)
  var SYNC_KEYS = [
    'esl_audit_data',
    'esl_audit_history',
    'esl_audit_campuses',
    'walkthrough_plan_data_v2',
    'walkthrough_history',
    'esl_scope_data',
    'shared_teacher_roster',
    'coaching_cycles_data',
    'elps_agent_docs',
    'elps_agent_index',
    'elps_agent_settings',
    'elps_agent_history',
    'mlp_hub_config',
    'pd_tracker_data',
    'meeting_notes_data',
    'parent_comm_log',
    'compliance_checklist_data',
    'goal_setting_data',
    'calibration_sessions',
    'notification_center_data',
    'feedback_report_data',
    'esl_workload_campuses',
    'esl_gas_sync',
    'principal_checkpoint_config'
  ];

  // FERPA keys route to their own dedicated endpoints, not /data/{key}
  var FERPA_KEYS = [
    'student_roster_data',
    'telpas_tracker_data'
  ];

  // Keys that are NEVER synced to the server
  var NEVER_SYNC_KEYS = [
    'esl_app_theme',
    'esl_gist_sync',
    'esl_home_role',
    'mlp_hub_demo_loaded',
    'notification_unread_count',
    'esl_onboarding_complete',
    'audit_nav_source'
  ];

  // -------------------------------------------------------------------------
  // Module state
  // -------------------------------------------------------------------------

  var _originalSetItem = localStorage.setItem.bind(localStorage);
  var _originalGetItem = localStorage.getItem.bind(localStorage);

  var syncTimers = {};
  var jwtToken = null;
  var currentUser = null;
  var _initialised = false;

  // -------------------------------------------------------------------------
  // Helper: should a given key be synced?
  // -------------------------------------------------------------------------

  function shouldSync(key) {
    if (!key) { return false; }

    // Never sync keys ending in _lastSaved
    if (key.indexOf('_lastSaved') !== -1) { return false; }

    // Never sync explicitly excluded keys
    var i;
    for (i = 0; i < NEVER_SYNC_KEYS.length; i++) {
      if (NEVER_SYNC_KEYS[i] === key) { return false; }
    }

    // Check explicit sync list
    for (i = 0; i < SYNC_KEYS.length; i++) {
      if (SYNC_KEYS[i] === key) { return true; }
    }

    // Check FERPA list (also synced, but to different endpoints)
    for (i = 0; i < FERPA_KEYS.length; i++) {
      if (FERPA_KEYS[i] === key) { return true; }
    }

    return false;
  }

  function isFerpaKey(key) {
    for (var i = 0; i < FERPA_KEYS.length; i++) {
      if (FERPA_KEYS[i] === key) { return true; }
    }
    return false;
  }

  // -------------------------------------------------------------------------
  // JWT helpers
  // -------------------------------------------------------------------------

  function getToken() {
    try {
      return sessionStorage.getItem('mlp_jwt');
    } catch (e) {
      return null;
    }
  }

  /**
   * Decode the base64url-encoded payload of a JWT.
   * Returns an object or null on any error.
   */
  function parseJwt(token) {
    if (!token || typeof token !== 'string') { return null; }

    var parts = token.split('.');
    if (parts.length !== 3) { return null; }

    try {
      // Base64url → base64 → decode
      var base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // Pad to a multiple of 4
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      var jsonStr = atob(base64);
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  }

  /**
   * Returns true if the token is present and not yet expired.
   * Adds a 30-second clock-skew buffer.
   */
  function isTokenValid(token) {
    if (!token) { return false; }
    var payload = parseJwt(token);
    if (!payload || typeof payload.exp !== 'number') { return false; }
    var nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds + 30;
  }

  function getAuthHeaders() {
    return {
      'Authorization': 'Bearer ' + jwtToken,
      'Content-Type': 'application/json'
    };
  }

  // -------------------------------------------------------------------------
  // Core sync: write to server
  // -------------------------------------------------------------------------

  /**
   * Debounced PUT /data/{key} for standard tool keys.
   */
  function syncToolDataToServer(key, value) {
    clearTimeout(syncTimers[key]);
    syncTimers[key] = setTimeout(function () {
      if (!jwtToken || !isTokenValid(jwtToken)) {
        return;
      }

      var data;
      try {
        data = JSON.parse(value);
      } catch (e) {
        // If the value is not JSON (unlikely for MLP tools, but safe-guard),
        // wrap it in an object so the server schema is always {data: ...}
        data = value;
      }

      var payload;
      try {
        payload = JSON.stringify({
          data: data,
          client_timestamp: Date.now(),
          version: 1
        });
      } catch (e) {
        // Serialisation failure (e.g. circular reference) — skip sync
        return;
      }

      var xhr = new XMLHttpRequest();
      xhr.open('PUT', MLP_API_BASE + '/data/' + encodeURIComponent(key), true);
      var headers = getAuthHeaders();
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          xhr.setRequestHeader(h, headers[h]);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) { return; }

        if (xhr.status === 409) {
          // Server has a newer version — pull it down
          fetchToolDataFromServer(key);
        } else if (xhr.status === 401) {
          // Token has expired mid-session — clear it
          jwtToken = null;
          try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
        }
        // 200 / 201 — success, nothing more to do
      };

      xhr.onerror = function () {
        // Network error — silently ignore; data is already in localStorage
      };

      xhr.send(payload);
    }, 800);
  }

  /**
   * Debounced sync for FERPA-sensitive keys.
   * student_roster_data → PUT /students/bulk
   * telpas_tracker_data → PUT /telpas/bulk
   *
   * These endpoints receive the raw array payload wrapped in {data: ...} for
   * consistency.  The server unpacks and re-encrypts each row.
   */
  function syncFerpaDataToServer(key, value) {
    clearTimeout(syncTimers[key]);
    syncTimers[key] = setTimeout(function () {
      if (!jwtToken || !isTokenValid(jwtToken)) {
        return;
      }

      // Only users with FERPA scope can sync FERPA data
      if (!currentUser || !currentUser.ferpa) {
        return;
      }

      var data;
      try {
        data = JSON.parse(value);
      } catch (e) {
        data = value;
      }

      var endpoint;
      if (key === 'student_roster_data') {
        endpoint = '/students/bulk';
      } else if (key === 'telpas_tracker_data') {
        endpoint = '/telpas/bulk';
      } else {
        return;
      }

      var payload;
      try {
        payload = JSON.stringify({ data: data, client_timestamp: Date.now() });
      } catch (e) {
        return;
      }

      var xhr = new XMLHttpRequest();
      xhr.open('PUT', MLP_API_BASE + endpoint, true);
      var headers = getAuthHeaders();
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          xhr.setRequestHeader(h, headers[h]);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) { return; }
        if (xhr.status === 401) {
          jwtToken = null;
          try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
        }
      };

      xhr.onerror = function () { /* silently ignore */ };

      xhr.send(payload);
    }, 800);
  }

  // -------------------------------------------------------------------------
  // Core sync: fetch from server
  // -------------------------------------------------------------------------

  /**
   * GET /data/{key} and update localStorage if the server version is newer.
   */
  function fetchToolDataFromServer(key) {
    if (!jwtToken || !isTokenValid(jwtToken)) { return; }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', MLP_API_BASE + '/data/' + encodeURIComponent(key), true);
    var headers = getAuthHeaders();
    for (var h in headers) {
      if (headers.hasOwnProperty(h)) {
        xhr.setRequestHeader(h, headers[h]);
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) { return; }
      if (xhr.status !== 200) { return; }

      var resp;
      try {
        resp = JSON.parse(xhr.responseText);
      } catch (e) {
        return;
      }

      if (!resp || !resp.storage_key) { return; }

      var serverTs = resp.client_timestamp || 0;
      var clientRaw = _originalGetItem(key);
      var clientTs = 0;

      // Try to extract the client timestamp from the raw stored value
      // Most MLP tools store plain JSON objects/arrays, not wrapped objects,
      // so we don't have a reliable client-side timestamp in the payload.
      // We compare using the server's reported client_timestamp vs. a
      // _lastSaved marker if present, otherwise we trust the server.
      var lastSavedRaw = _originalGetItem(key + '_lastSaved');
      if (lastSavedRaw) {
        clientTs = parseInt(lastSavedRaw, 10) || 0;
      }

      if (serverTs >= clientTs) {
        var newValue;
        try {
          newValue = JSON.stringify(resp.data);
        } catch (e) {
          newValue = String(resp.data);
        }
        _originalSetItem(key, newValue);
      }
    };

    xhr.onerror = function () { /* network error — ignore */ };
    xhr.send();
  }

  /**
   * GET /data — fetch all tool-data rows for the current user and merge into
   * localStorage.  Called once on page load after token validation.
   */
  function bulkFetchAll() {
    if (!jwtToken || !isTokenValid(jwtToken)) { return; }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', MLP_API_BASE + '/data', true);
    var headers = getAuthHeaders();
    for (var h in headers) {
      if (headers.hasOwnProperty(h)) {
        xhr.setRequestHeader(h, headers[h]);
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) { return; }
      if (xhr.status === 401) {
        jwtToken = null;
        try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
        return;
      }
      if (xhr.status !== 200) { return; }

      var resp;
      try {
        resp = JSON.parse(xhr.responseText);
      } catch (e) {
        return;
      }

      if (!resp || !resp.items || !resp.items.length) { return; }

      var items = resp.items;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item || !item.storage_key) { continue; }

        var key = item.storage_key;
        var serverTs = item.client_timestamp || 0;

        // Compare against _lastSaved marker if available
        var lastSavedRaw = _originalGetItem(key + '_lastSaved');
        var clientTs = lastSavedRaw ? (parseInt(lastSavedRaw, 10) || 0) : 0;

        // Server wins when server is newer or local data is absent
        var localValue = _originalGetItem(key);
        if (serverTs >= clientTs || localValue === null) {
          var newValue;
          try {
            newValue = JSON.stringify(item.data);
          } catch (e) {
            newValue = String(item.data);
          }
          _originalSetItem(key, newValue);
        }
      }
    };

    xhr.onerror = function () { /* offline — silently ignore */ };
    xhr.send();
  }

  // -------------------------------------------------------------------------
  // localStorage intercept
  // -------------------------------------------------------------------------

  localStorage.setItem = function (key, value) {
    // Always write to localStorage first — never block the tool
    _originalSetItem(key, value);

    // If authenticated and the key is a sync candidate, queue a server sync
    if (jwtToken && shouldSync(key)) {
      if (isFerpaKey(key)) {
        syncFerpaDataToServer(key, value);
      } else {
        syncToolDataToServer(key, value);
      }
    }
  };

  // getItem does NOT need to be overridden.  After bulkFetchAll() runs on init,
  // localStorage already contains the server's data and the tools read it
  // directly via their existing code.

  // -------------------------------------------------------------------------
  // URL token handler (OAuth redirect callback)
  // -------------------------------------------------------------------------

  /**
   * After the OAuth flow the API redirects to:
   *   https://app.zalphateachingsolutions.org/index.html?mlp_token=<jwt>
   *
   * The shim reads the token, saves it to sessionStorage, and strips the
   * parameter from the URL so it does not appear in history or server logs.
   */
  function checkUrlToken() {
    if (!window.location || !window.location.search) { return; }

    var match = window.location.search.match(/[?&]mlp_token=([^&]+)/);
    if (!match) { return; }

    var rawToken = match[1];
    var token;
    try {
      token = decodeURIComponent(rawToken);
    } catch (e) {
      token = rawToken;
    }

    if (!token) { return; }

    try {
      sessionStorage.setItem('mlp_jwt', token);
    } catch (e) {
      // sessionStorage write failed (private browsing quota?) — abort
      return;
    }

    // Remove the token from the URL without triggering a page reload
    try {
      var newUrl = window.location.href
        .replace(/[?&]mlp_token=[^&]+/, '')
        .replace(/[?&]$/, '')
        .replace(/\?$/, '');
      window.history.replaceState({}, document.title, newUrl || window.location.pathname);
    } catch (e) {
      // history.replaceState not available — not critical
    }
  }

  // -------------------------------------------------------------------------
  // Initialisation
  // -------------------------------------------------------------------------

  function init() {
    if (_initialised) { return; }
    _initialised = true;

    var token = getToken();
    if (!token || !isTokenValid(token)) {
      // No valid token — shim is passive.  Tools use localStorage as normal.
      return;
    }

    jwtToken = token;

    // Decode token payload for user context
    var payload = parseJwt(token);
    if (payload) {
      currentUser = {
        id: payload.sub || null,
        orgId: payload.org || null,
        role: payload.role || null,
        ferpa: !!payload.ferpa,
        email: payload.email || null
      };
    }

    // Expose current user for tools that call window._mlpCurrentUser
    window._mlpCurrentUser = currentUser;

    // Pull server data into localStorage on load
    bulkFetchAll();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Redirect to the OAuth provider's login page.
   * provider: 'google' | 'microsoft' (defaults to 'google')
   */
  window.mlpSignIn = function (provider) {
    var p = (provider === 'microsoft') ? 'microsoft' : 'google';
    window.location.href = MLP_API_BASE + '/auth/' + p;
  };

  /**
   * Log out: revoke the server session, clear the local token, reload.
   */
  window.mlpSignOut = function () {
    if (!jwtToken) {
      try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
      window.location.reload();
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', MLP_API_BASE + '/auth/logout', true);
    var headers = getAuthHeaders();
    for (var h in headers) {
      if (headers.hasOwnProperty(h)) {
        xhr.setRequestHeader(h, headers[h]);
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) { return; }
      // Whether or not the server responded, clear local state
      jwtToken = null;
      currentUser = null;
      window._mlpCurrentUser = null;
      try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
      window.location.reload();
    };

    xhr.onerror = function () {
      // Offline — clear locally anyway
      jwtToken = null;
      currentUser = null;
      window._mlpCurrentUser = null;
      try { sessionStorage.removeItem('mlp_jwt'); } catch (e) { /* ignore */ }
      window.location.reload();
    };

    xhr.send();
  };

  /**
   * Returns true if the user is currently signed in with a valid token.
   */
  window.mlpIsSignedIn = function () {
    return !!(jwtToken && isTokenValid(jwtToken));
  };

  /**
   * Returns the current user object (or null if not signed in).
   * { id, orgId, role, ferpa, email }
   */
  window.mlpCurrentUser = function () {
    return currentUser;
  };

  /**
   * Manually trigger a sync for a specific key.
   * Useful for tools that need to force an immediate sync (e.g. before tab close).
   */
  window.mlpForceSync = function (key) {
    if (!jwtToken || !isTokenValid(jwtToken) || !shouldSync(key)) { return; }
    var value = _originalGetItem(key);
    if (value === null) { return; }
    // Cancel any pending debounced write and sync immediately
    clearTimeout(syncTimers[key]);
    if (isFerpaKey(key)) {
      syncFerpaDataToServer(key, value);
    } else {
      syncToolDataToServer(key, value);
    }
    // Flush the debounce by setting timer delay to 0
    clearTimeout(syncTimers[key]);
    syncTimers[key] = setTimeout(function () {}, 0);
  };

  /**
   * Manually trigger a bulk re-fetch from the server.
   * Useful after a forced token refresh.
   */
  window.mlpRefreshFromServer = function () {
    if (!jwtToken || !isTokenValid(jwtToken)) { return; }
    bulkFetchAll();
  };

  // -------------------------------------------------------------------------
  // Boot sequence
  // -------------------------------------------------------------------------

  // 1. Capture token from OAuth redirect URL (before init reads sessionStorage)
  checkUrlToken();

  // 2. Initialise sync (reads sessionStorage for the token)
  init();

}());
