// ============================================================
// MLP Auto-Sync Engine v2 — Zero-Config Cross-Device Persistence
// Hardcoded GAS endpoint — no coordinator setup required.
// Identity resolved from mlp_hub_config or one-time prompt.
// Include via <script src="./sync-engine.js"></script> before tool script
// ============================================================
(function(){
  "use strict";

  // ---- HARDCODED BACKEND CONFIG ----
  var GAS_URL = "https://script.google.com/macros/s/AKfycbz2gob9qMfrPTb_zgMy-LAt1HoZQfO_jzNSvLqqVok3DzWnPESD4VhQ5PN0uDL0NgHJxA/exec";
  var GAS_SECRET = "fe50135497f480b9dfa7e3f4cc79c6e6e5383236";

  // ---- TIMING ----
  var DEBOUNCE_MS = 3000;
  var POLL_MS = 120000; // 2 minutes

  // ---- STATE ----
  var pushTimers = {};
  var pollInterval = null;
  var syncIndicator = null;
  var identityPromptShown = false;
  var lastPollTs = 0;

  // ---- IDENTITY RESOLUTION ----
  // Priority: 1) mlp_hub_config userId  2) esl_gas_sync coordinatorId  3) one-time prompt

  function getIdentity(){
    var id = "", name = "";

    // Try mlp_hub_config first
    try{
      var cfg = JSON.parse(localStorage.getItem("mlp_hub_config") || "{}");
      if(cfg.userId && cfg.userId !== "default") id = cfg.userId;
      if(cfg.userName && cfg.userName !== "Administrator") name = cfg.userName;
    }catch(e){}

    // Fallback to esl_gas_sync (legacy manual config)
    if(!id){
      try{
        var gas = JSON.parse(localStorage.getItem("esl_gas_sync") || "{}");
        if(gas.coordinatorId) id = gas.coordinatorId;
        if(gas.coordinatorName) name = name || gas.coordinatorName;
      }catch(e2){}
    }

    if(id) return {id: id, name: name || id};
    return null;
  }

  function saveIdentity(id, name){
    // Save to mlp_hub_config
    try{
      var cfg = JSON.parse(localStorage.getItem("mlp_hub_config") || "{}");
      cfg.userId = id;
      cfg.userName = name;
      localStorage.setItem("mlp_hub_config", JSON.stringify(cfg));
    }catch(e){}

    // Also save to esl_gas_sync for backward compat
    try{
      var gas = JSON.parse(localStorage.getItem("esl_gas_sync") || "{}");
      gas.gasUrl = GAS_URL;
      gas.coordinatorId = id;
      gas.coordinatorName = name;
      gas.secret = GAS_SECRET;
      localStorage.setItem("esl_gas_sync", JSON.stringify(gas));
    }catch(e2){}
  }

  function promptForIdentity(){
    if(identityPromptShown) return null;
    identityPromptShown = true;

    // Create a simple overlay prompt
    var overlay = document.createElement("div");
    overlay.id = "mlpSyncIdentityOverlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',Arial,sans-serif";

    var modal = document.createElement("div");
    modal.style.cssText = "background:#fff;border-radius:12px;padding:28px 32px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2)";
    modal.innerHTML =
      "<div style='font-size:18px;font-weight:800;color:#2c3e6e;margin-bottom:4px'>Welcome to Coordinator Hub</div>" +
      "<p style='font-size:13px;color:#666;margin-bottom:18px;line-height:1.5'>Enter your name to enable cloud sync. Your data will automatically stay in sync across all your devices. This only needs to be done once per device.</p>" +
      "<label style='font-size:11px;font-weight:700;color:#888;text-transform:uppercase;display:block;margin-bottom:4px'>Your Full Name</label>" +
      "<input type='text' id='mlpSyncNameInput' placeholder='e.g., J. Miller' style='width:100%;padding:10px 12px;border-radius:6px;border:1px solid #ddd;font-size:14px;font-family:inherit;margin-bottom:14px;box-sizing:border-box'/>" +
      "<div style='display:flex;gap:8px;justify-content:flex-end'>" +
      "<button id='mlpSyncSkipBtn' style='padding:8px 18px;border-radius:6px;border:1px solid #ddd;background:#fff;color:#888;font-size:13px;cursor:pointer;font-family:inherit'>Skip</button>" +
      "<button id='mlpSyncSaveBtn' style='padding:8px 18px;border-radius:6px;border:none;background:#2c3e6e;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit'>Enable Sync</button>" +
      "</div>";

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("mlpSyncSaveBtn").onclick = function(){
      var nameVal = document.getElementById("mlpSyncNameInput").value.trim();
      if(!nameVal){
        document.getElementById("mlpSyncNameInput").style.borderColor = "#e74c3c";
        return;
      }
      // Generate ID from name: lowercase, dots to empty, spaces to empty
      var idVal = nameVal.toLowerCase().replace(/[^a-z0-9]/g, "");
      if(!idVal) idVal = "user" + Date.now();
      saveIdentity(idVal, nameVal);
      document.body.removeChild(overlay);
      showStatus("\u2713 Sync enabled for " + nameVal, "ok");
      // Start syncing now that we have identity
      if(window.mlpSync && window.mlpSync._pendingPoll){
        window.mlpSync.startPolling(window.mlpSync._pendingPoll.keys, window.mlpSync._pendingPoll.callback);
      }
    };

    document.getElementById("mlpSyncSkipBtn").onclick = function(){
      document.body.removeChild(overlay);
    };

    // Focus the input
    setTimeout(function(){ document.getElementById("mlpSyncNameInput").focus(); }, 100);

    return null; // identity not yet available
  }

  // ---- SYNC INDICATOR ----

  function createIndicator(){
    if(syncIndicator) return syncIndicator;
    syncIndicator = document.createElement("div");
    syncIndicator.id = "mlpSyncIndicator";
    syncIndicator.style.cssText = "position:fixed;bottom:8px;right:8px;font-size:10px;padding:4px 10px;border-radius:12px;background:var(--card-bg,#fff);border:1px solid var(--border,#eee);color:var(--text-muted,#888);box-shadow:0 1px 4px rgba(0,0,0,.1);z-index:9999;transition:opacity .3s;opacity:0;pointer-events:none;font-family:'Segoe UI',Arial,sans-serif";
    document.body.appendChild(syncIndicator);
    return syncIndicator;
  }

  function showStatus(msg, type){
    var ind = createIndicator();
    ind.textContent = msg;
    ind.style.opacity = "1";
    ind.style.pointerEvents = "auto";
    if(type === "ok"){ ind.style.borderColor = "#27ae60"; ind.style.color = "#27ae60"; }
    else if(type === "err"){ ind.style.borderColor = "#e74c3c"; ind.style.color = "#e74c3c"; }
    else{ ind.style.borderColor = "var(--primary,#4a90d9)"; ind.style.color = "var(--text-muted,#888)"; }
    setTimeout(function(){ ind.style.opacity = "0"; ind.style.pointerEvents = "none"; }, 4000);
  }

  // ---- PUSH (to Google Drive via GAS) ----

  function pushKey(key){
    var identity = getIdentity();
    if(!identity) return;

    var value = localStorage.getItem(key);
    if(!value) return;

    showStatus("\u27F3 Syncing\u2026", "info");

    var payload = JSON.stringify({
      action: "syncKey",
      coordinatorId: identity.id,
      coordinatorName: identity.name,
      secret: GAS_SECRET,
      key: key,
      value: value
    });

    fetch(GAS_URL, {
      method: "POST",
      body: payload,
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      redirect: "follow"
    }).then(function(resp){ return resp.text(); })
    .then(function(text){
      try{
        var resp = JSON.parse(text);
        if(resp.success){
          showStatus("\u2713 Synced", "ok");
          localStorage.setItem("mlp_last_push_" + key, Date.now().toString());
        } else {
          showStatus("\u26A0 " + (resp.error || "Sync error"), "err");
        }
      }catch(e){ showStatus("\u26A0 Sync error", "err"); }
    })["catch"](function(e){ showStatus("\u26A0 Offline", "err"); });
  }

  // ---- PULL (from Google Drive via GAS) ----

  function pullKeys(keys, callback){
    var identity = getIdentity();
    if(!identity) return;

    var url = GAS_URL
      + "?action=read&coordinatorId=" + encodeURIComponent(identity.id)
      + "&secret=" + encodeURIComponent(GAS_SECRET);

    fetch(url, {redirect: "follow"})
    .then(function(resp){ return resp.text(); })
    .then(function(text){
      try{
        var resp = JSON.parse(text);
        if(!resp.success || !resp.data || !resp.data.data) return;
        var remote = resp.data.data;
        var updated = [];
        for(var i = 0; i < keys.length; i++){
          var k = keys[i];
          if(remote[k] === undefined || remote[k] === null) continue;
          var remoteVal = typeof remote[k] === "string" ? remote[k] : JSON.stringify(remote[k]);
          var localVal = localStorage.getItem(k);

          if(remoteVal === localVal) continue;

          var remoteTs = 0;
          try{
            var rParsed = typeof remote[k] === "string" ? JSON.parse(remote[k]) : remote[k];
            if(rParsed && rParsed.timestamp) remoteTs = new Date(rParsed.timestamp).getTime();
          }catch(e2){}
          if(!remoteTs && resp.data.lastSync){
            remoteTs = new Date(resp.data.lastSync).getTime();
          }

          var localTs = parseInt(localStorage.getItem(k + "_lastSaved") || "0", 10);
          var lastPush = parseInt(localStorage.getItem("mlp_last_push_" + k) || "0", 10);
          if(lastPush > localTs) localTs = lastPush;

          if(remoteTs > localTs || !localVal){
            localStorage.setItem(k, remoteVal);
            updated.push(k);
          }
        }
        lastPollTs = Date.now();
        if(updated.length > 0){
          showStatus("\u2193 Updated " + updated.length + " key(s) from cloud", "ok");
          if(callback) callback(updated);
          try{
            var bc = new BroadcastChannel("mlp_hub_sync");
            for(var j = 0; j < updated.length; j++){
              bc.postMessage({type:"data_update", key:updated[j], timestamp:Date.now(), source:"sync-engine"});
            }
            bc.close();
          }catch(e3){}
        }
      }catch(e){}
    })["catch"](function(){});
  }

  // ---- SHEETS LOGGING (Option B) ----
  // Appends a row to a Google Sheet for every save — for manager tracking/visualization
  // Uses the same GAS endpoint with action "logToSheet"

  function logToSheet(key, toolName){
    var identity = getIdentity();
    if(!identity) return;

    var value = localStorage.getItem(key);
    if(!value) return;

    // Extract summary metadata from the value
    var meta = {};
    try{
      var parsed = JSON.parse(value);
      if(parsed.timestamp) meta.timestamp = parsed.timestamp;
      if(parsed.meta){
        if(parsed.meta.teacher) meta.teacher = parsed.meta.teacher;
        if(parsed.meta.campus) meta.campus = parsed.meta.campus;
        if(parsed.meta.date) meta.date = parsed.meta.date;
      }
      // Count items for array-based data
      if(parsed.meetings) meta.itemCount = parsed.meetings.length;
      else if(parsed.sessions) meta.itemCount = parsed.sessions.length;
      else if(parsed.entries) meta.itemCount = parsed.entries.length;
      else if(parsed.items) meta.itemCount = parsed.items.length;
      else if(parsed.goals) meta.itemCount = parsed.goals.length;
      if(parsed.scorePct !== undefined) meta.scorePct = parsed.scorePct;
    }catch(e){}

    var body = JSON.stringify({
      action: "logToSheet",
      coordinatorId: identity.id,
      coordinatorName: identity.name,
      secret: GAS_SECRET,
      key: key,
      toolName: toolName || key,
      meta: meta,
      dataSize: value.length
    });

    // Fire and forget — don't show indicator for sheet logging
    fetch(GAS_URL, {
      method: "POST",
      body: body,
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      redirect: "follow"
    })["catch"](function(){});
  }

  // ---- PUBLIC API ----

  window.mlpSync = {
    _pendingPoll: null,

    push: function(key, toolName){
      if(pushTimers[key]) clearTimeout(pushTimers[key]);
      pushTimers[key] = setTimeout(function(){
        pushKey(key);
        logToSheet(key, toolName);
      }, DEBOUNCE_MS);
    },

    pushNow: function(key, toolName){
      if(pushTimers[key]) clearTimeout(pushTimers[key]);
      pushKey(key);
      logToSheet(key, toolName);
    },

    pull: function(keys, callback){
      var identity = getIdentity();
      if(!identity){
        // Prompt for identity, then pull after setup
        window.mlpSync._pendingPoll = {keys: keys, callback: callback};
        promptForIdentity();
        return;
      }
      pullKeys(keys, callback);
    },

    startPolling: function(keys, callback){
      var identity = getIdentity();
      if(!identity){
        // Store pending poll config and prompt
        window.mlpSync._pendingPoll = {keys: keys, callback: callback};
        promptForIdentity();
        return;
      }
      if(pollInterval) clearInterval(pollInterval);
      setTimeout(function(){ pullKeys(keys, callback); }, 2000);
      pollInterval = setInterval(function(){ pullKeys(keys, callback); }, POLL_MS);
    },

    stopPolling: function(){
      if(pollInterval){ clearInterval(pollInterval); pollInterval = null; }
    },

    isConfigured: function(){
      return !!getIdentity();
    },

    getIdentity: function(){
      return getIdentity();
    },

    lastPoll: function(){ return lastPollTs; }
  };
})();
