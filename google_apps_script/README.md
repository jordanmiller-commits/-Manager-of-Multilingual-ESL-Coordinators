# Google Apps Script — Drive Sync & Email Reminders

## Overview

`Code.gs` is a Google Apps Script web app that serves as the backend for the ESL Coordinator Management Suite. It does two things:

1. **Drive Sync** — Stores each coordinator's full localStorage data state as a JSON file in a shared Google Drive folder. Each coordinator's data is saved as `{coordinatorId}_data.json`. This lets coordinators sync their tool data across devices and lets the manager's Team Overview dashboard aggregate data from all coordinators.

2. **Email Reminders** — Reads each coordinator's coaching cycle data from Drive and sends weekly plain-text email reminders listing overdue and stalled cycles. Reminders include direct deep-links to the Coaching Cycle Tracker.

---

## Configuration Constants

These are defined at the top of `Code.gs` and must be updated before deployment.

**`FOLDER_ID`**
The Google Drive folder ID where all coordinator data files are stored. The folder must be owned by the Google account running the script. Current value: `1FvxiBn6-SmLa2RKXWXdE7DMufwm0tOVo`. To find a folder ID, open the folder in Google Drive and copy the string after `/folders/` in the URL.

**`COORDINATOR_EMAIL_MAP`**
An object mapping coordinatorId keys to email address strings. Each key must exactly match the Coordinator ID the coordinator entered during onboarding (Step 3 of `Onboarding.html`). Add or remove entries to control who receives weekly reminder emails. Example:

```javascript
var COORDINATOR_EMAIL_MAP = {
  'jmiller':    'jmiller@school.org',
  'kpatterson': 'kpatterson@school.org',
  'pokolo':     'pokolo@school.org',
  'vpalencia':  'vpalencia@school.org',
};
```

**`OVERDUE_DAYS`** (default: `7`)
Number of days after the most recent stage update before a coaching cycle is flagged as overdue in reminder emails. A cycle whose last-touched stage was 7 or more days ago will appear in the "OVERDUE" section of the reminder.

**`STALLED_DAYS`** (default: `14`)
Number of days with no stage update at all before a cycle is flagged as stalled. Cycles with no dates recorded on any stage, or with all dates older than this threshold, appear in the "STALLED" section of the reminder.

**`APP_URL`**
Base URL of the deployed GitHub Pages app. Used to construct direct links in reminder emails. Update this if the GitHub Pages URL changes. Example: `"https://your-org.github.io/repo-name/"`. The trailing slash is required.

---

## Initial Deployment Steps

1. Go to [script.google.com](https://script.google.com) and create a new project. Name it something like "ESL Coordinator Sync".

2. Delete the default `myFunction` code. Paste the entire contents of `Code.gs` into the editor.

3. Update `FOLDER_ID` at the top of the file to match your Google Drive folder's ID. The folder should be shared with any accounts that need to read coordinator data (e.g. the manager's account if it differs from the script account).

4. Add coordinator email addresses to `COORDINATOR_EMAIL_MAP`. Each key must match the Coordinator ID coordinators will use in the Onboarding wizard.

5. Update `APP_URL` to your GitHub Pages base URL.

6. Click **Deploy** → **New Deployment** → select type **Web App**.

7. Set **Execute as**: "Me" (the account that owns the Drive folder). Set **Who has access**: "Anyone". This is required so that coordinators' browsers can call the script without OAuth — the script URL itself acts as the access credential, so keep it out of source control.

8. Click **Deploy** and copy the generated **Web App URL** (format: `https://script.google.com/macros/s/.../exec`).

9. Paste that URL into the Data Backup Hub → Drive Sync Settings → Script URL field on each coordinator's device. Or distribute the `Onboarding.html?gasUrl=YOUR_URL` link to pre-fill it for them.

10. In the Apps Script editor, run `testStatus()` manually (select it from the function dropdown and click Run). Check the Logs tab to confirm the script can access the Drive folder and list its files.

11. Run `createWeeklyTrigger()` once manually. This installs a time-based trigger that calls `weeklyReminderJob()` every Monday at 7AM. Verify the trigger appears under **Triggers** (clock icon in the left sidebar).

---

## Redeployment (when Code.gs changes)

Each time you edit `Code.gs` you must create a new version to apply the changes to the live endpoint:

1. **Deploy** → **Manage Deployments**
2. Click the pencil (Edit) icon on the existing deployment
3. Set **Version** to "New version"
4. Click **Deploy**

The Web App URL does not change between versions. Coordinators do not need to update their settings after a redeployment.

---

## API Endpoints

### GET Endpoints

| Action | URL Parameters | Returns |
|---|---|---|
| `status` | `action=status` | Folder ID, list of sync keys, server timestamp |
| `read` | `action=read&coordinatorId=X` | Full data envelope for coordinator X |
| `readAll` | `action=readAll` | Array of all coordinator data envelopes in the folder |
| `list` | `action=list` | Summary list: coordinatorId, coordinatorName, lastSync, keysStored, fileSize |
| `readKey` | `action=readKey&coordinatorId=X&key=K` | Value of a single localStorage key K for coordinator X |

### POST Endpoints (JSON body)

| Action | Body Fields | Effect |
|---|---|---|
| `sync` | `{action, coordinatorId, coordinatorName, data}` | Full push — writes all keys in `data` to the coordinator's Drive file |
| `syncKey` | `{action, coordinatorId, coordinatorName, key, value}` | Single-key push — merges one key into the coordinator's existing Drive file |
| `delete` | `{action, coordinatorId}` | Moves the coordinator's Drive file to trash |
| `sendReminders` | `{action, coordinators: [{coordinatorId, email}]}` | Reads coaching data for each coordinator from Drive and emails overdue/stalled cycle alerts |

All responses are JSON. Errors are returned as `{"error": "message"}`.

---

## Troubleshooting

**"Script URL returns 404"**
The deployment is pointing to an old version or was not published as a Web App. Go to Deploy → Manage Deployments, edit the deployment, select "New version", and redeploy.

**"Permission denied to Drive folder"**
The script is running as a Google account that does not own or have edit access to the folder specified by `FOLDER_ID`. Open the Drive folder, click Share, and add the script's owner email with Editor access. You can find the script's owner email in the Apps Script editor under Project Settings.

**"Email not received"**
First confirm that `COORDINATOR_EMAIL_MAP` contains the correct `coordinatorId` keys — they must exactly match what each coordinator entered in Onboarding Step 3 (case-sensitive). Second, check the MailApp quota: personal Google accounts are limited to 100 emails per day. If the quota is exceeded, no email is sent and no error is raised. Check Apps Script execution logs under **Executions** for any quota warnings.

**"Trigger not firing"**
Open the Apps Script editor and click the clock icon (Triggers) in the left sidebar. If `weeklyReminderJob` is not listed, run `createWeeklyTrigger()` manually once from the editor to reinstall it. Also verify that the script account has not been signed out or had its permissions revoked — if the OAuth session has expired, time-based triggers will fail silently.
