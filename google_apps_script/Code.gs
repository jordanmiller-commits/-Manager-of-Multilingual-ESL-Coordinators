// ============================================================
// MLP Coordinator Data Sync — Google Apps Script Web App
// Deploy this as a web app from script.google.com
// ============================================================

var FOLDER_ID = '1HpYZoIgwbr0iZL6pnntBZw648--us9BG';

// Email reminder configuration — coordinator IDs must match what each person enters in Onboarding Step 3
var COORDINATOR_EMAIL_MAP = {
  'jmiller':    'jmiller@uplifteducation.org',
  'kpatterson': 'kpatterson@uplifteducation.org',
  'pokolo':     'Pokolo@uplifteducation.org',
  'vpalencia':  'vpalencia@uplifteducation.org',
};
var OVERDUE_DAYS = 7;   // coaching stage considered overdue after N days
var STALLED_DAYS = 14;  // cycle considered stalled if no update in N days
var APP_URL = "https://jordanmiller-commits.github.io/-Manager-of-Multilingual-ESL-Coordinators/";

// API secret — every request from the app must include this value.
// Update this string to any strong random value before deploying.
// Distribute to coordinators via the ?secret= URL parameter in their onboarding link.
var SHARED_SECRET = 'fe50135497f480b9dfa7e3f4cc79c6e6e5383236';

// localStorage keys to sync (excludes device-specific settings)
var SYNC_KEYS = [
  'esl_audit_data',
  'esl_audit_history',
  'esl_audit_campuses',
  'esl_streamlined_audit_data',
  'walkthrough_plan_data_v2',
  'walkthrough_history',
  'esl_scope_data',
  'shared_teacher_roster',
  'coaching_cycles_data',
  'coordinator_self_assessments',
  'calibration_sessions',
  'elps_agent_docs',
  'elps_agent_history',
  'meeting_notes_data',
  'pd_tracker_data',
  'parent_comm_log',
  'compliance_checklist_data',
  'goal_setting_data'
];

// ---- GET handler (reads) ----
function doGet(e) {
  var params = e.parameter;
  if (SHARED_SECRET && params.secret !== SHARED_SECRET) {
    return jsonResponse({ error: 'Unauthorized' });
  }
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
      var coordId = sanitizeCoordId(params.coordinatorId);
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
      var coordId2 = sanitizeCoordId(params.coordinatorId);
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
    if (SHARED_SECRET && body.secret !== SHARED_SECRET) {
      return jsonResponse({ error: 'Unauthorized' });
    }
    var action = body.action || 'sync';

    if (action === 'sync') {
      var coordId = sanitizeCoordId(body.coordinatorId);
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
      var coordId2 = sanitizeCoordId(body.coordinatorId);
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
      var coordId3 = sanitizeCoordId(body.coordinatorId);
      if (!coordId3) return jsonResponse({ error: 'Missing coordinatorId' });
      var deleted = deleteCoordinatorData(coordId3);
      return jsonResponse({ success: deleted, message: deleted ? 'Deleted' : 'Not found' });
    }

    if (action === 'logToSheet') {
      var coordId4 = sanitizeCoordId(body.coordinatorId);
      var coordName4 = body.coordinatorName || coordId4;
      var logKey = body.key || '';
      var toolName = body.toolName || logKey;
      var meta = body.meta || {};
      var dataSize = body.dataSize || 0;

      if (!coordId4 || !logKey) return jsonResponse({ error: 'Missing coordinatorId or key' });

      var logResult = appendToActivityLog(coordId4, coordName4, logKey, toolName, meta, dataSize);
      return jsonResponse({ success: true, message: 'Logged to sheet', row: logResult.row });
    }

    if (action === 'sendReminders') {
      var coordsParam = body.coordinators || [];
      var reminderResult = sendReminderEmails(coordsParam);
      return jsonResponse({ success: true, result: reminderResult });
    }

    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

// ---- Input validation ----

function sanitizeCoordId(id) {
  if (!id) return '';
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50);
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

// ---- Email Reminder Functions ----

/**
 * Main dispatcher — sends overdue/stalled coaching reminders to coordinators.
 * @param {Array} coordsOverride - optional array of {coordinatorId, email} objects from frontend
 */
function sendReminderEmails(coordsOverride) {
  var coords = (coordsOverride && coordsOverride.length > 0)
    ? coordsOverride
    : buildCoordsFromMap();

  var sent = [];
  var skipped = [];

  for (var i = 0; i < coords.length; i++) {
    var coord = coords[i];
    if (!coord.email) { skipped.push(coord.coordinatorId || coord.id); continue; }

    var envelope = readCoordinatorData(coord.coordinatorId || coord.id);
    if (!envelope || !envelope.data) { skipped.push(coord.coordinatorId || coord.id); continue; }

    var cyclesRaw = envelope.data['coaching_cycles_data'];
    var cycles = [];
    try {
      var cd = typeof cyclesRaw === 'string' ? JSON.parse(cyclesRaw) : cyclesRaw;
      cycles = (cd && cd.cycles) ? cd.cycles : [];
    } catch (e) { cycles = []; }

    var overdue = findOverdueCycles(cycles);
    var stalled = findStalledCycles(cycles);

    if (overdue.length === 0 && stalled.length === 0) {
      skipped.push(coord.coordinatorId || coord.id);
      continue;
    }

    var body = buildReminderEmail(coord, overdue, stalled);
    MailApp.sendEmail({
      to: coord.email,
      subject: '[MLP Coordinator Hub] Coaching Cycle Reminder — ' + new Date().toLocaleDateString(),
      body: body
    });
    sent.push(coord.email);
  }

  return { sent: sent, skipped: skipped };
}

/** Converts COORDINATOR_EMAIL_MAP to array of {coordinatorId, email} */
function buildCoordsFromMap() {
  var result = [];
  for (var id in COORDINATOR_EMAIL_MAP) {
    if (COORDINATOR_EMAIL_MAP.hasOwnProperty(id)) {
      result.push({ coordinatorId: id, email: COORDINATOR_EMAIL_MAP[id] });
    }
  }
  return result;
}

/** Returns cycles where the latest-dated stage is more than OVERDUE_DAYS old and cycle is not complete. */
function findOverdueCycles(cycles) {
  var cutoff = new Date(Date.now() - OVERDUE_DAYS * 86400000).toISOString().slice(0, 10);
  var result = [];
  for (var i = 0; i < cycles.length; i++) {
    if (isCycleCompleteGAS(cycles[i])) continue;
    var latest = latestStageDate(cycles[i]);
    if (latest && latest < cutoff) result.push(cycles[i]);
  }
  return result;
}

/** Returns cycles where no stage has been updated in more than STALLED_DAYS and cycle is not complete. */
function findStalledCycles(cycles) {
  var cutoff = new Date(Date.now() - STALLED_DAYS * 86400000).toISOString().slice(0, 10);
  var result = [];
  for (var i = 0; i < cycles.length; i++) {
    if (isCycleCompleteGAS(cycles[i])) continue;
    var latest = latestStageDate(cycles[i]);
    if (!latest || latest < cutoff) result.push(cycles[i]);
  }
  return result;
}

/** Returns true if all 5 stages are status === 'complete'. */
function isCycleCompleteGAS(cycle) {
  var stages = cycle.stages || [];
  for (var i = 0; i < stages.length; i++) {
    if (stages[i].status !== 'complete') return false;
  }
  return stages.length > 0;
}

/** Returns the most recent date string across all stages, or null. */
function latestStageDate(cycle) {
  var stages = cycle.stages || [];
  var latest = null;
  for (var i = 0; i < stages.length; i++) {
    if (stages[i].date && (!latest || stages[i].date > latest)) {
      latest = stages[i].date;
    }
  }
  return latest;
}

/** Returns label of the first non-complete stage. */
function currentStageLabel(cycle) {
  var stageLabels = ['Observation', 'Feedback', 'Action Step', 'Follow-Up', 'Growth'];
  var stages = cycle.stages || [];
  for (var i = 0; i < stages.length; i++) {
    if (stages[i].status !== 'complete') {
      return stageLabels[i] || ('Stage ' + (i + 1));
    }
  }
  return 'Complete';
}

/** Builds plain-text email body for a coordinator's overdue/stalled cycles. */
function buildReminderEmail(coord, overdue, stalled) {
  var name = coord.coordinatorName || coord.name || (coord.coordinatorId || coord.id);
  var lines = [];
  lines.push('Hi ' + name + ',');
  lines.push('');
  lines.push('This is your weekly MLP Coordinator Hub coaching cycle reminder.');
  lines.push('');

  if (overdue.length > 0) {
    lines.push('--- OVERDUE CYCLES (last update > ' + OVERDUE_DAYS + ' days ago) ---');
    for (var i = 0; i < overdue.length; i++) {
      var c = overdue[i];
      lines.push('  • ' + (c.teacher || 'Unknown teacher') +
        ' (' + (c.campus || 'N/A') + ') — current stage: ' + currentStageLabel(c) +
        ', last update: ' + (latestStageDate(c) || 'none'));
    }
    lines.push('');
  }

  if (stalled.length > 0) {
    lines.push('--- STALLED CYCLES (no update in ' + STALLED_DAYS + '+ days) ---');
    for (var j = 0; j < stalled.length; j++) {
      var s = stalled[j];
      lines.push('  • ' + (s.teacher || 'Unknown teacher') +
        ' (' + (s.campus || 'N/A') + ') — current stage: ' + currentStageLabel(s));
    }
    lines.push('');
  }

  lines.push('Open your Coaching Cycle Tracker to update these cycles:');
  lines.push(APP_URL + 'Academic_Monitoring_Leader_Facing/Coaching_Cycle_Tracker.html');
  lines.push('');
  lines.push('— MLP Coordinator Hub (automated reminder)');
  return lines.join('\n');
}

/**
 * Installs a weekly Monday 7AM time-based trigger.
 * Run this once manually from the Apps Script editor.
 */
function createWeeklyTrigger() {
  // Remove any existing weeklyReminderJob triggers first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'weeklyReminderJob') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('weeklyReminderJob')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();
  Logger.log('Weekly reminder trigger created (Monday 7AM).');
}

/** Handler called by the weekly trigger. */
function weeklyReminderJob() {
  var result = sendReminderEmails([]);
  Logger.log('Weekly reminder job complete. Sent: ' + result.sent.join(', ') + ' | Skipped: ' + result.skipped.join(', '));
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

// ============================================================
// GOOGLE SHEETS ACTIVITY LOG (Option B)
// Logs every save to a spreadsheet for manager tracking
// ============================================================

var SHEET_NAME = 'MLP Activity Log';

/**
 * Gets or creates the activity log spreadsheet in the sync folder.
 * Returns the Sheet object.
 */
function getOrCreateActivitySheet() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var fileName = SHEET_NAME + '.gsheet';

  // Look for existing spreadsheet in folder
  var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName() === SHEET_NAME) {
      return SpreadsheetApp.openById(file.getId()).getSheetByName('Activity Log')
        || SpreadsheetApp.openById(file.getId()).getSheets()[0];
    }
  }

  // Create new spreadsheet
  var ss = SpreadsheetApp.create(SHEET_NAME);
  var sheet = ss.getSheets()[0];
  sheet.setName('Activity Log');

  // Set up headers
  var headers = [
    'Timestamp',
    'Coordinator ID',
    'Coordinator Name',
    'Tool',
    'Storage Key',
    'Teacher',
    'Campus',
    'Date',
    'Score %',
    'Item Count',
    'Data Size (bytes)',
    'Sync Type'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#2c3e6e')
    .setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  // Set column widths for readability
  sheet.setColumnWidth(1, 170); // Timestamp
  sheet.setColumnWidth(4, 200); // Tool
  sheet.setColumnWidth(5, 200); // Storage Key

  // Move the spreadsheet to the sync folder
  var ssFile = DriveApp.getFileById(ss.getId());
  folder.addFile(ssFile);
  DriveApp.getRootFolder().removeFile(ssFile);

  // Create Summary sheet
  var summarySheet = ss.insertSheet('Summary');
  var summaryHeaders = ['Coordinator', 'Total Syncs', 'Last Active', 'Tools Used', 'Most Recent Tool'];
  summarySheet.getRange(1, 1, 1, summaryHeaders.length).setValues([summaryHeaders]);
  summarySheet.getRange(1, 1, 1, summaryHeaders.length)
    .setFontWeight('bold')
    .setBackground('#2c3e6e')
    .setFontColor('#ffffff');
  summarySheet.setFrozenRows(1);

  return sheet;
}

/**
 * Appends a row to the activity log spreadsheet.
 */
function appendToActivityLog(coordId, coordName, key, toolName, meta, dataSize) {
  var sheet = getOrCreateActivitySheet();
  var now = new Date();

  // Friendly tool name mapping
  var TOOL_NAMES = {
    'esl_audit_data': 'Full Observation (working)',
    'esl_audit_history': 'Full Observation (history)',
    'esl_streamlined_audit_data': 'Targeted Walkthrough (working)',
    'walkthrough_plan_data_v2': 'Walkthrough Planner (working)',
    'walkthrough_history': 'Walkthrough Planner (history)',
    'coaching_cycles_data': 'Coaching Cycle Tracker',
    'meeting_notes_data': 'Meeting Notes',
    'pd_tracker_data': 'PD Tracker',
    'parent_comm_log': 'Parent Communication Log',
    'compliance_checklist_data': 'Compliance Checklist',
    'goal_setting_data': 'Goal Setting',
    'esl_scope_data': 'Scope & Sequence',
    'calibration_sessions': 'Calibration Tool',
    'shared_teacher_roster': 'Teacher Roster (shared)',
    'esl_audit_campuses': 'Campus List'
  };

  var friendlyTool = TOOL_NAMES[key] || toolName || key;

  var row = [
    now,                              // Timestamp
    coordId,                          // Coordinator ID
    coordName,                        // Coordinator Name
    friendlyTool,                     // Tool (friendly name)
    key,                              // Storage Key (raw)
    (meta && meta.teacher) || '',     // Teacher
    (meta && meta.campus) || '',      // Campus
    (meta && meta.date) || '',        // Date
    (meta && meta.scorePct !== undefined) ? meta.scorePct : '',  // Score %
    (meta && meta.itemCount) || '',   // Item Count
    dataSize || '',                   // Data Size
    'auto-sync'                       // Sync Type
  ];

  sheet.appendRow(row);

  // Update summary sheet
  updateSummarySheet(sheet.getParent(), coordId, coordName, friendlyTool);

  return { row: sheet.getLastRow() };
}

/**
 * Updates the Summary sheet with aggregated coordinator stats.
 */
function updateSummarySheet(spreadsheet, coordId, coordName, toolName) {
  var summary = spreadsheet.getSheetByName('Summary');
  if (!summary) return;

  var data = summary.getDataRange().getValues();
  var rowIdx = -1;

  // Find existing row for this coordinator
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === coordId) {
      rowIdx = i + 1; // 1-based row number
      break;
    }
  }

  var now = new Date();

  if (rowIdx > 0) {
    // Update existing row
    var currentCount = summary.getRange(rowIdx, 2).getValue() || 0;
    var currentTools = String(summary.getRange(rowIdx, 4).getValue() || '');
    var toolSet = currentTools ? currentTools.split(', ') : [];
    if (toolSet.indexOf(toolName) === -1) toolSet.push(toolName);

    summary.getRange(rowIdx, 2).setValue(currentCount + 1);         // Total Syncs
    summary.getRange(rowIdx, 3).setValue(now);                       // Last Active
    summary.getRange(rowIdx, 4).setValue(toolSet.join(', '));        // Tools Used
    summary.getRange(rowIdx, 5).setValue(toolName);                  // Most Recent Tool
  } else {
    // Add new row
    summary.appendRow([coordId, 1, now, toolName, toolName]);
  }
}
