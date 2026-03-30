var CACHE_NAME = "mlp-suite-v5";
var ASSETS = [
  "./Principal_Checkpoint_Portal/Principal_Checkpoint_Portal.html",
  "./Principal_Checkpoint_Portal/Campus_Report_Card.html",
  "./index.html",
  "./Data_Backup_Hub.html",
  "./Team_Overview.html",
  "./Onboarding.html",
  "./Coordinator_Workload.html",
  "./PD_Tracker.html",
  "./Meeting_Notes.html",
  "./Parent_Communication_Log.html",
  "./Compliance_Checklist.html",
  "./Goal_Setting.html",
  "./Student_Roster.html",
  "./TELPAS_Tracker.html",
  "./manifest.json",
  "./Academic_Monitoring_Leader_Facing/Academic_Monitoring_Planning_Template.html",
  "./Academic_Monitoring_Leader_Facing/Walkthrough_Dashboard.html",
  "./Academic_Monitoring_Leader_Facing/Coaching_Cycle_Tracker.html",
  "./ESL_Classroom_Audit/ESL_Classroom_Audit.html",
  "./ESL_Classroom_Audit/Audit_Dashboard.html",
  "./ESL_Programming_Plans/ESL_Coordinator_Scope_Sequence.html",
  "./ELPS_Agent/ELPS_Agent.html",
  "./Calibration_Tool.html",
  "./Reports_Hub.html",
  "./Teacher_360_Profile.html",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type === "basic") {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return new Response("Offline - content not cached", { status: 503 });
      });
    })
  );
});
