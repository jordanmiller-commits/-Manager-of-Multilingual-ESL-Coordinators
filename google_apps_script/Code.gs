// ============================================================
// ESL Coordinator Data Sync — Google Apps Script Web App
// Deploy this as a web app from script.google.com
// ============================================================

var FOLDER_ID = '1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo';

// localStorage keys to sync (excludes device-specific settings)
var SYNC_KEYS = [
  'esl_audit_data',
  'esl_audit_history',
  'esl_audit_campuses',
  'walkthrough_plan_data_v2',
  'walkthrough_history',
  'esl_scope_data',
  'shared_teacher_roster',
  'coaching_cycles_data',
  'coordinator_self_assessments',
  'calibration_sessions',
  'elps_agent_docs',
  'elps_agent_history'
];

// ---- GET handler (reads) ----
function doGet(e) {
  var params = e.parameter;
  var action = params.action || 'status';

  try {
    if (action === 'status') {
      return jsonResponse({
        status: 'ok',
        folder: FOLDER_ID,
        syncKeys: SYNC_KEYS,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'read') {
      var coordId = params.coordinatorId;
      if (!coordId) return jsonResponse({ error: 'Missing coordinatorId' });
      var data = readCoordinatorData(coordId);
      if (!data) return jsonResponse({ success: true, data: null, message: 'No data found for ' + coordId });
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'readAll') {
      var allData = readAllCoordinatorData();
      return jsonResponse({ success: true, count: allData.length, data: allData });
    }

    if (action === 'list') {
      var list = listCoordinators();
      return jsonResponse({ success: true, coordinators: list });
    }

    if (action === 'readKey') {
      var coordId2 = params.coordinatorId;
      var key = params.key;
      if (!coordId2 || !key) return jsonResponse({ error: 'Missing coordinatorId or key' });
      var keyData = readCoordinatorKey(coordId2, key);
      return jsonResponse({ success: true, coordinatorId: coordId2, key: key, data: keyData });
    }

    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

// ---- POST handler (writes) ----
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'sync';

    if (action === 'sync') {
      var coordId = body.coordinatorId;
      var coordName = body.coordinatorName || coordId;
      var data = body.data;

      if (!coordId) return jsonResponse({ error: 'Missing coordinatorId' });
      if (!data) return jsonResponse({ error: 'Missing data' });

      var result = saveCoordinatorData(coordId, coordName, data);
      return jsonResponse({
        success: true,
        message: 'Data synced for ' + coordName,
        coordinatorId: coordId,
        keysWritten: Object.keys(data).length,
        fileSize: result.fileSize,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'syncKey') {
      var coordId2 = body.coordinatorId;
      var coordName2 = body.coordinatorName || coordId2;
      var key = body.key;
      var value = body.value;

      if (!coordId2 || !key) return jsonResponse({ error: 'Missing coordinatorId or key' });

      saveCoordinatorKey(coordId2, coordName2, key, value);
      return jsonResponse({
        success: true,
        message: 'Key ' + key + ' synced for ' + coordName2,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'delete') {
      var coordId3 = body.coordinatorId;
      if (!coordId3) return jsonResponse({ error: 'Missing coordinatorId' });
      var deleted = deleteCoordinatorData(coordId3);
      return jsonResponse({ success: deleted, message: deleted ? 'Deleted' : 'Not found' });
    }

    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

// ---- Drive operations ----

function saveCoordinatorData(coordId, coordName, data) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var fileName = coordId + '_data.json';
  var envelope = {
    coordinatorId: coordId,
    coordinatorName: coordName,
    lastSync: new Date().toISOString(),
    version: 1,
    data: data
  };
  var content = JSON.stringify(envelope, null, 2);

  var files = folder.getFilesByName(fileName);
  var file;
  if (files.hasNext()) {
    file = files.next();
    file.setContent(content);
  } else {
    file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  }

  return { fileSize: file.getSize() };
}

function saveCoordinatorKey(coordId, coordName, key, value) {
  var existing = readCoordinatorData(coordId);
  var envelope;
  if (existing) {
    envelope = existing;
    envelope.data[key] = value;
    envelope.lastSync = new Date().toISOString();
  } else {
    envelope = {
      coordinatorId: coordId,
      coordinatorName: coordName,
      lastSync: new Date().toISOString(),
      version: 1,
      data: {}
    };
    envelope.data[key] = value;
  }

  var folder = DriveApp.getFolderById(FOLDER_ID);
  var fileName = coordId + '_data.json';
  var content = JSON.stringify(envelope, null, 2);

  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    files.next().setContent(content);
  } else {
    folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  }
}

function readCoordinatorData(coordId) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var fileName = coordId + '_data.json';
  var files = folder.getFilesByName(fileName);

  if (!files.hasNext()) return null;

  var file = files.next();
  try {
    return JSON.parse(file.getBlob().getDataAsString());
  } catch (e) {
    return null;
  }
}

function readCoordinatorKey(coordId, key) {
  var envelope = readCoordinatorData(coordId);
  if (!envelope || !envelope.data) return null;
  return envelope.data[key] || null;
}

function readAllCoordinatorData() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var allData = [];

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    if (name.indexOf('_data.json') === name.length - 10) {
      try {
        var parsed = JSON.parse(file.getBlob().getDataAsString());
        allData.push(parsed);
      } catch (e) {
        // skip malformed files
      }
    }
  }

  return allData;
}

function listCoordinators() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var list = [];

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    if (name.indexOf('_data.json') === name.length - 10) {
      try {
        var parsed = JSON.parse(file.getBlob().getDataAsString());
        list.push({
          coordinatorId: parsed.coordinatorId,
          coordinatorName: parsed.coordinatorName,
          lastSync: parsed.lastSync,
          keysStored: Object.keys(parsed.data || {}).length,
          fileSize: file.getSize()
        });
      } catch (e) {
        list.push({
          coordinatorId: name.replace('_data.json', ''),
          coordinatorName: 'Unknown',
          lastSync: file.getLastUpdated().toISOString(),
          keysStored: 0,
          fileSize: file.getSize()
        });
      }
    }
  }

  return list;
}

function deleteCoordinatorData(coordId) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var fileName = coordId + '_data.json';
  var files = folder.getFilesByName(fileName);

  if (!files.hasNext()) return false;
  files.next().setTrashed(true);
  return true;
}

// ---- Utility ----

function jsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ---- Test function (run manually in script editor) ----
function testStatus() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  Logger.log('Folder name: ' + folder.getName());
  Logger.log('Files in folder:');
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    Logger.log('  ' + f.getName() + ' (' + f.getSize() + ' bytes)');
  }
}
