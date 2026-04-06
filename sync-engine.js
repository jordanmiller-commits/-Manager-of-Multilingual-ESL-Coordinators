// ============================================================
// MLP Auto-Sync Engine — Cross-Device Data Persistence
// Reads credentials from esl_gas_sync localStorage key
// Include via <script src="./sync-engine.js"></script> before tool script
// ============================================================
(function(){
  "use strict";
  var SETTINGS_KEY = "esl_gas_sync";
  var DEBOUNCE_MS = 3000;
  var POLL_MS = 120000; // 2 minutes
  var pushTimers = {};
  var pollInterval = null;
  var syncIndicator = null;
  var lastPollTs = 0;

  function getSettings(){
    try{
      var raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }

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

  function pushKey(key){
    var settings = getSettings();
    if(!settings || !settings.gasUrl || !settings.coordinatorId) return;

    var value = localStorage.getItem(key);
    if(!value) return;

    showStatus("\u27F3 Syncing\u2026", "info");

    var body = JSON.stringify({
      action: "syncKey",
      coordinatorId: settings.coordinatorId,
      coordinatorName: settings.coordinatorName || settings.coordinatorId,
      secret: settings.secret || "",
      key: key,
      value: value
    });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", settings.gasUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function(){
      if(xhr.status === 200){
        try{
          var resp = JSON.parse(xhr.responseText);
          if(resp.success){
            showStatus("\u2713 Synced", "ok");
            localStorage.setItem("mlp_last_push_" + key, Date.now().toString());
          } else {
            showStatus("\u26A0 Sync error", "err");
          }
        }catch(e){ showStatus("\u26A0 Sync error", "err"); }
      } else { showStatus("\u26A0 Sync failed (HTTP " + xhr.status + ")", "err"); }
    };
    xhr.onerror = function(){ showStatus("\u26A0 Offline", "err"); };
    xhr.send(body);
  }

  function pullKeys(keys, callback){
    var settings = getSettings();
    if(!settings || !settings.gasUrl || !settings.coordinatorId) return;

    var url = settings.gasUrl
      + "?action=read&coordinatorId=" + encodeURIComponent(settings.coordinatorId)
      + "&secret=" + encodeURIComponent(settings.secret || "");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(){
      if(xhr.status !== 200) return;
      try{
        var resp = JSON.parse(xhr.responseText);
        if(!resp.success || !resp.data || !resp.data.data) return;
        var remote = resp.data.data;
        var updated = [];
        for(var i = 0; i < keys.length; i++){
          var k = keys[i];
          if(remote[k] === undefined || remote[k] === null) continue;
          var remoteVal = typeof remote[k] === "string" ? remote[k] : JSON.stringify(remote[k]);
          var localVal = localStorage.getItem(k);

          if(remoteVal === localVal) continue;

          // Merge strategy: compare timestamps, newer wins
          var remoteTs = 0;
          try{
            var rParsed = typeof remote[k] === "string" ? JSON.parse(remote[k]) : remote[k];
            if(rParsed && rParsed.timestamp) remoteTs = new Date(rParsed.timestamp).getTime();
          }catch(e2){}
          // Also check envelope lastSync
          if(!remoteTs && resp.data.lastSync){
            remoteTs = new Date(resp.data.lastSync).getTime();
          }

          var localTs = parseInt(localStorage.getItem(k + "_lastSaved") || "0", 10);
          var lastPush = parseInt(localStorage.getItem("mlp_last_push_" + k) || "0", 10);
          if(lastPush > localTs) localTs = lastPush;

          // Accept remote if newer or if no local data
          if(remoteTs > localTs || !localVal){
            localStorage.setItem(k, remoteVal);
            updated.push(k);
          }
        }
        lastPollTs = Date.now();
        if(updated.length > 0){
          showStatus("\u2193 Updated " + updated.length + " key(s) from cloud", "ok");
          if(callback) callback(updated);
          // Broadcast to other tabs
          try{
            var bc = new BroadcastChannel("mlp_hub_sync");
            for(var j = 0; j < updated.length; j++){
              bc.postMessage({type:"data_update", key:updated[j], timestamp:Date.now(), source:"sync-engine"});
            }
            bc.close();
          }catch(e3){}
        }
      }catch(e){}
    };
    xhr.onerror = function(){};
    xhr.send();
  }

  // Expose global API
  window.mlpSync = {
    // Push a localStorage key to GAS (debounced)
    push: function(key){
      if(pushTimers[key]) clearTimeout(pushTimers[key]);
      pushTimers[key] = setTimeout(function(){ pushKey(key); }, DEBOUNCE_MS);
    },

    // Push immediately (no debounce) — use for explicit saves like saveToHistory
    pushNow: function(key){
      if(pushTimers[key]) clearTimeout(pushTimers[key]);
      pushKey(key);
    },

    // Pull specific keys and call back with list of updated keys
    pull: function(keys, callback){
      pullKeys(keys, callback);
    },

    // Start periodic polling
    startPolling: function(keys, callback){
      if(pollInterval) clearInterval(pollInterval);
      // Initial pull after short delay (let page load first)
      setTimeout(function(){ pullKeys(keys, callback); }, 2000);
      pollInterval = setInterval(function(){ pullKeys(keys, callback); }, POLL_MS);
    },

    // Stop polling
    stopPolling: function(){
      if(pollInterval){ clearInterval(pollInterval); pollInterval = null; }
    },

    // Check if GAS sync is configured
    isConfigured: function(){
      var s = getSettings();
      return !!(s && s.gasUrl && s.coordinatorId);
    },

    // Get last poll timestamp
    lastPoll: function(){ return lastPollTs; }
  };
})();
