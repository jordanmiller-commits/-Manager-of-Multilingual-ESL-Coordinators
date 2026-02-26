// Paste this entire script into your browser console while on ESL_Classroom_Audit.html
// It generates 10 rich walkthrough audits AND loads the latest one as the active session
// so ALL chart types work: Radar, Mastery, Section Bars, Growth, Perm vs Rot, Tag Usage, Heatmap

(function() {
  var STORAGE_KEY = "esl_audit_data";
  var HISTORY_KEY = "esl_audit_history";
  var CAMPUS_KEY = "esl_audit_campuses";

  // Clear previous test data to avoid duplicates
  localStorage.removeItem(HISTORY_KEY);

  var sectionItems = {
    s01:5, s02:5, s03:5, s04:3, s05:4, s06:5, s07:3,
    s08:5, s09:6, s10:6, s11:4, s12:4, s13:3
  };
  var sectionIds = ["s01","s02","s03","s04","s05","s06","s07","s08","s09","s10","s11","s12","s13"];

  var teachers = [
    "Maria Gonzalez",
    "David Chen",
    "Fatima Al-Rashid",
    "James Washington",
    "Linh Nguyen"
  ];

  var observers = ["Jordan Miller", "Ana Reyes"];

  var allTags = ["Photo Taken","Scholar-Generated","Needs Replacement","Bilingual","Recently Updated","Teacher-Created"];

  // Tag assignment patterns per rating level (higher ratings get positive tags, lower get negative)
  var tagsByRating = {
    0: [["Needs Replacement"], ["Needs Replacement","Photo Taken"]],
    1: [["Needs Replacement"], ["Photo Taken"], ["Teacher-Created"], ["Needs Replacement","Photo Taken"]],
    2: [["Scholar-Generated"], ["Bilingual"], ["Recently Updated"], ["Photo Taken","Bilingual"], ["Scholar-Generated","Recently Updated"], ["Teacher-Created"]],
    3: [["Scholar-Generated","Recently Updated"], ["Bilingual","Scholar-Generated"], ["Photo Taken","Bilingual","Recently Updated"], ["Scholar-Generated","Teacher-Created"], ["Bilingual","Photo Taken"]]
  };

  // Comment templates per rating level
  var commentsByRating = {
    0: [
      "Not observed during walkthrough. Needs immediate attention.",
      "Absent from classroom. Follow up with teacher on implementation timeline.",
      "No evidence of this element. Add to coaching action plan.",
      "Not present. Teacher may need modeling or resources to implement.",
      "Missing entirely. Schedule support session this week."
    ],
    1: [
      "Partially present but not actively used by scholars.",
      "Materials exist but are outdated or inaccessible to students.",
      "Minimal evidence — posted but not at scholar eye level.",
      "Present but lacks organization. Scholars did not reference during observation.",
      "Began implementation but inconsistent. Needs follow-up coaching cycle."
    ],
    2: [
      "Solid implementation. Scholars reference materials during tasks.",
      "Good foundation — would benefit from bilingual additions.",
      "Consistent display. Next step: increase scholar-generated content.",
      "Well-organized and current. Scholars used during independent work.",
      "Present and functional. Could be enhanced with visual supports."
    ],
    3: [
      "Exemplary. Scholar-generated, bilingual, and actively referenced throughout lesson.",
      "Model classroom element. Scholars independently access and use materials.",
      "Outstanding implementation. Routinely used across all observed activities.",
      "Best practice example. Consider using this classroom for peer observations.",
      "Fully integrated into daily instruction. Scholars take ownership of materials."
    ]
  };

  // Section-level notes templates
  var sectionNotesByStrength = {
    weak: [
      "This section needs significant support. Schedule coaching follow-up within 2 weeks.",
      "Major gaps identified. Prioritize in next coaching cycle with model classroom visit.",
      "Below expectations. Provide teacher with resource kit and implementation timeline.",
      "Critical area for growth. Consider co-teaching session to model expectations."
    ],
    developing: [
      "Some elements present but inconsistent implementation observed.",
      "Foundation is building. Continue monitoring with bi-weekly check-ins.",
      "Progress noted since last visit. Maintain coaching momentum on this section.",
      "Developing well. Focus next steps on scholar interaction with these materials."
    ],
    strong: [
      "Strong implementation across this section. Acknowledge teacher effort.",
      "Consistent and scholar-centered. Share strategies with grade-level team.",
      "Exemplary section. Consider for peer observation or video model."
    ]
  };

  var teacherProfiles = {
    "Maria Gonzalez":     [2,3,2,2,3,2,1, 2,2,1,2,1,2],
    "David Chen":         [1,2,2,1,1,2,2, 1,2,2,1,2,1],
    "Fatima Al-Rashid":   [3,2,3,2,2,2,2, 2,1,2,3,2,2],
    "James Washington":   [1,1,1,2,2,1,1, 2,2,2,2,1,1],
    "Linh Nguyen":        [2,2,2,3,3,2,2, 2,2,2,2,2,3]
  };

  var auditDates = [
    "2025-09-15", "2025-09-22",
    "2025-10-10", "2025-10-18",
    "2025-11-05", "2025-11-19",
    "2025-12-08", "2025-12-15",
    "2026-01-12", "2026-01-28"
  ];

  var auditTeachers = [
    "James Washington",
    "David Chen",
    "Maria Gonzalez",
    "Linh Nguyen",
    "Fatima Al-Rashid",
    "James Washington",
    "David Chen",
    "Maria Gonzalez",
    "Linh Nguyen",
    "Fatima Al-Rashid"
  ];

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function genRating(base, growthBonus) {
    var noise = Math.floor(Math.random() * 3) - 1;
    return clamp(Math.round(base + growthBonus + noise), 0, 3);
  }

  function genAudit(auditIndex) {
    var teacher = auditTeachers[auditIndex];
    var date = auditDates[auditIndex];
    var observer = observers[auditIndex % 2];
    var profile = teacherProfiles[teacher];

    var isRevisit = false;
    for (var prev = 0; prev < auditIndex; prev++) {
      if (auditTeachers[prev] === teacher) { isRevisit = true; break; }
    }
    var growthBonus = isRevisit ? 0.7 : 0;

    var ratings = {};
    var notes = {};
    var prChecks = {};
    var itemComments = {};
    var itemTags = {};
    var totalScore = 0;
    var totalMax = 0;

    for (var si = 0; si < sectionIds.length; si++) {
      var sid = sectionIds[si];
      var count = sectionItems[sid];
      var baseLevel = profile[si];
      var sectionScore = 0;

      for (var ii = 0; ii < count; ii++) {
        var key = sid + "-" + ii;
        var rating = genRating(baseLevel, growthBonus);
        ratings[key] = rating;
        sectionScore += rating;
        totalScore += rating;
        totalMax += 3;

        // Tags on 70% of items — use rating-appropriate tag combos
        if (Math.random() < 0.7) {
          itemTags[key] = pick(tagsByRating[rating]).slice();
        }

        // Comments on 60% of items — use rating-appropriate language
        if (Math.random() < 0.6) {
          itemComments[key] = pick(commentsByRating[rating]);
        }
      }

      // Section notes based on section performance
      var sectionPct = Math.round((sectionScore / (count * 3)) * 100);
      if (sectionPct < 45) {
        notes[sid] = pick(sectionNotesByStrength.weak);
      } else if (sectionPct < 70) {
        notes[sid] = pick(sectionNotesByStrength.developing);
      } else if (Math.random() < 0.5) {
        notes[sid] = pick(sectionNotesByStrength.strong);
      }
    }

    // Principles: correlate with overall strength, ensure variety
    var avgPct = totalMax > 0 ? totalScore / totalMax : 0;
    for (var pi = 0; pi < 6; pi++) {
      var threshold = 0.2 + (avgPct * 0.6);
      // Principles 0,1,4 are harder to meet
      if (pi === 0 || pi === 1 || pi === 4) threshold -= 0.15;
      prChecks[pi] = Math.random() < threshold;
    }

    var scorePct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    var hour = 8 + Math.floor(Math.random() * 4);
    var min = Math.floor(Math.random() * 60);
    var ts = new Date(date + "T" + (hour < 10 ? "0" : "") + hour + ":" + (min < 10 ? "0" : "") + min + ":00");

    var sectionTimers = {
      permanent: 180 + Math.floor(Math.random() * 300),
      rotating: 150 + Math.floor(Math.random() * 300),
      principles: 45 + Math.floor(Math.random() * 120)
    };
    var timerElapsed = sectionTimers.permanent + sectionTimers.rotating + sectionTimers.principles + Math.floor(Math.random() * 60);

    return {
      version: 3,
      id: ts.getTime().toString(),
      timestamp: ts.toISOString(),
      meta: {
        teacher: teacher,
        campus: "Uplift Testing Prep",
        observer: observer,
        date: date
      },
      ratings: ratings,
      notes: notes,
      prChecks: prChecks,
      itemComments: itemComments,
      itemTags: itemTags,
      itemPhotos: {},
      timerElapsed: timerElapsed,
      sectionTimers: sectionTimers,
      scorePct: scorePct
    };
  }

  // Generate all 10 audits into history
  var history = [];
  for (var a = 0; a < 10; a++) {
    history.push(genAudit(a));
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  // Load the LAST audit (Fatima Al-Rashid revisit, Jan 28) as the active session
  // This populates the live state so Radar, Mastery, Section Bars, Perm vs Rot,
  // Tag Usage, and Heatmap all have data
  var latest = history[history.length - 1];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));

  // Add campus
  var campuses = [];
  try {
    var raw = localStorage.getItem(CAMPUS_KEY);
    if (raw) campuses = JSON.parse(raw);
  } catch(e) {}
  if (campuses.indexOf("Uplift Testing Prep") === -1) {
    campuses.push("Uplift Testing Prep");
    localStorage.setItem(CAMPUS_KEY, JSON.stringify(campuses));
  }

  // Summary stats
  var tagTotals = {};
  for (var t = 0; t < allTags.length; t++) tagTotals[allTags[t]] = 0;
  for (var key in latest.itemTags) {
    for (var i = 0; i < latest.itemTags[key].length; i++) {
      tagTotals[latest.itemTags[key][i]]++;
    }
  }
  var commentCount = Object.keys(latest.itemComments).length;
  var taggedCount = Object.keys(latest.itemTags).length;

  console.log("=== TEST DATA GENERATED ===");
  console.log("10 audits saved to history for Uplift Testing Prep");
  console.log("Latest audit loaded as active session: " + latest.meta.teacher + " (" + latest.meta.date + ")");
  console.log("Active audit score: " + latest.scorePct + "%");
  console.log("Items with comments: " + commentCount + "/58");
  console.log("Items with tags: " + taggedCount + "/58");
  console.log("Tag breakdown:", tagTotals);
  console.log("");
  console.log("RELOAD the page, then test each Visualize chart type.");
  alert("Done! 10 audits generated + latest loaded as active session.\n\nScore: " + latest.scorePct + "%\nComments: " + commentCount + "/58 items\nTags: " + taggedCount + "/58 items\n\nRELOAD the page to see all data.");
})();
