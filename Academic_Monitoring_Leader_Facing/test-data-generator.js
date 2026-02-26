// ESL Manager Suite — Test Data Generator
// Paste into browser console at http://localhost or GitHub Pages origin
// Run: generateTestData()
// Clear: clearTestData()

(function (root) {

  // ----------------------------------------------------------------
  // Reference data
  // ----------------------------------------------------------------

  var TEACHERS = [
    'Ms. Garcia', 'Mr. Chen', 'Ms. Okafor', 'Ms. Rodriguez',
    'Mr. Patel', 'Ms. Kim', 'Mr. Washington', 'Ms. Torres'
  ];

  var CAMPUSES = ['North Campus', 'South Campus', 'East Campus'];

  var LEADERS = ['J. Miller', 'K. Patterson', 'P. Okolo', 'V. Palencia'];

  var CODES = ['CFU', 'Disc', 'Scaf', 'Eng', 'Rig'];

  var FOCUS_AREAS = ['ESL Strategies', 'Student Discourse', 'Formative Assessment', 'Scaffolding', 'Rigor'];

  var STAGE_LABELS = ['Observation', 'Feedback', 'Action Step', 'Follow-Up', 'Growth'];

  // School year: Aug 2025 – May 2026
  var YEAR_START_MS = new Date('2025-08-01').getTime();
  var YEAR_END_MS   = new Date('2026-05-15').getTime();

  // Keys set by this generator — used by clearTestData()
  var MANAGED_KEYS = [
    'walkthrough_history',
    'coaching_cycles_data',
    'esl_audit_history',
    'shared_teacher_roster'
  ];

  // ----------------------------------------------------------------
  // Utility helpers
  // ----------------------------------------------------------------

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randItems(arr, min, max) {
    var count = randInt(min, max);
    var shuffled = arr.slice().sort(function () { return Math.random() - 0.5; });
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /** Returns a random ISO date string within [startMs, endMs]. */
  function randDate(startMs, endMs) {
    var ms = randInt(startMs, endMs);
    return new Date(ms).toISOString().slice(0, 10);
  }

  /** Returns a date N days after the given ISO date string. */
  function addDays(isoDate, days) {
    var ms = new Date(isoDate).getTime() + days * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }

  /** Generates a simple sequential ID string. */
  var _idCounter = 1000;
  function nextId(prefix) {
    _idCounter += 1;
    return (prefix || 'id') + '_' + _idCounter;
  }

  // ----------------------------------------------------------------
  // Walkthrough history generator — 15 entries
  // ----------------------------------------------------------------

  function buildObservationLog(teachers, rounds) {
    var log = [];
    for (var i = 0; i < randInt(2, 5); i++) {
      var code = randItem(CODES);
      var teacher = randItem(teachers);
      var roundLabel = randItem(rounds);
      log.push({
        id: nextId('obs'),
        round: roundLabel,
        teacher: teacher,
        code: code,
        notes: buildObsNote(code, teacher),
        time: randInt(8, 14) + ':' + (randItem(['00', '15', '30', '45']))
      });
    }
    return log;
  }

  function buildObsNote(code, teacher) {
    var notes = {
      CFU:  [
        'Teacher used exit tickets to check for understanding.',
        'Cold-call questioning with extended wait time observed.',
        'Mini whiteboards used for whole-class response.',
        'Thumbs up / thumbs down CFU during guided practice.'
      ],
      Disc: [
        'Structured academic discourse using sentence frames.',
        'Think-pair-share with vocabulary-specific prompt.',
        'Small group discussion; teacher monitored and prompted.',
        'Students used ELPS discourse stems posted on wall.'
      ],
      Scaf: [
        'Graphic organizer provided for writing task.',
        'Bilingual glossary visible at student desks.',
        'Teacher chunked reading passage into smaller sections.',
        'Word bank displayed on projector during vocabulary work.'
      ],
      Eng:  [
        'High engagement during collaborative task — all students on-task.',
        'Turn-and-talk with accountable talk stems.',
        'Interactive notebook activity with peer sharing.',
        'Low engagement observed during independent practice — coaching opportunity noted.'
      ],
      Rig:  [
        'Higher-order questioning aligned to TEKS.',
        'Students asked to justify their answers in writing.',
        'Complex text used; teacher modeled annotation strategy.',
        'Extension task available for early finishers.'
      ]
    };
    var pool = notes[code] || ['Observation recorded.'];
    return randItem(pool);
  }

  function buildCoachingActions(teachers, date) {
    var actions = [];
    var count = randInt(1, 3);
    var actionTemplates = [
      'Co-plan next week\'s ESL scaffold with teacher.',
      'Model discourse routine in next observation.',
      'Provide feedback on sentence frame usage.',
      'Share CFU strategy resources and debrief.',
      'Observe follow-up lesson focused on engagement.',
      'Calibrate rigor expectations for upcoming unit.',
      'Review student work samples together.',
      'Debrief walk-to-intervention grouping data.'
    ];
    var statuses = ['pending', 'pending', 'complete', 'in-progress'];
    for (var i = 0; i < count; i++) {
      var daysOut = randInt(3, 21);
      actions.push({
        id: nextId('act'),
        teacher: randItem(teachers),
        observation: randItem(CODES) + ' — ' + randItem(['strong', 'developing', 'needs support']),
        feedback: randItem(actionTemplates),
        nextStep: randItem(actionTemplates),
        deadline: addDays(date, daysOut),
        status: randItem(statuses)
      });
    }
    return actions;
  }

  function buildWalkthroughHistory() {
    var history = [];
    var usedTeachers = new Set ? new Set() : { _d: {}, has: function(v) { return !!this._d[v]; }, add: function(v) { this._d[v] = true; } };

    for (var i = 0; i < 15; i++) {
      var campus   = CAMPUSES[i % CAMPUSES.length];
      var leader   = LEADERS[i % LEADERS.length];
      var date     = randDate(YEAR_START_MS, YEAR_END_MS);
      var focus    = randItem(FOCUS_AREAS);
      var numRounds = randInt(2, 4);
      var rounds   = [];
      for (var r = 0; r < numRounds; r++) {
        rounds.push('Round ' + (r + 1));
      }
      var teachers = randItems(TEACHERS, 2, 4);
      teachers.forEach(function (t) { usedTeachers.add(t); });

      var observations = buildObservationLog(teachers, rounds);

      // Compute a fidelity % from observation codes
      var codeWeights = { CFU: 1, Disc: 1, Scaf: 1, Eng: 0.8, Rig: 1 };
      var totalWeight = 0;
      var earnedWeight = 0;
      for (var o = 0; o < observations.length; o++) {
        var w = codeWeights[observations[o].code] || 1;
        totalWeight += w;
        earnedWeight += w * (Math.random() > 0.3 ? 1 : 0.5);
      }
      var fidelityPct = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

      var coachingActions = buildCoachingActions(teachers, date);

      var entry = {
        id: nextId('wt'),
        savedAt: date + 'T' + randInt(7, 16) + ':00:00.000Z',
        meta: {
          campus: campus,
          leader: leader,
          date: date,
          focusArea: focus,
          roundCount: numRounds
        },
        rounds: rounds.map(function (label, idx) {
          return {
            label: label,
            type: randItem(['Procedural', 'Conceptual', 'Engagement']),
            targetTeachers: randItems(teachers, 1, 3).join(', '),
            lookFor: randItem([
              'Students using sentence frames during discourse',
              'CFU strategies with >80% engagement',
              'Scaffolded materials at appropriate language level',
              'ELPS 2D — listening comprehension strategies visible',
              'Rigor: higher-order questioning in target language'
            ])
          };
        }),
        observations: observations,
        coachingActions: coachingActions,
        fidelityPct: fidelityPct,
        reflection: {
          patterns: randItem([
            'CFU strategies are stronger campus-wide; discourse still developing.',
            'Scaffolding is inconsistent across grade levels.',
            'Engagement high during structured tasks; drops during independent work.',
            'Rigor is a growth area — students not yet asked to justify answers.',
            'Strong discourse routines in upper grades; building in lower grades.'
          ]),
          nextSteps: randItem([
            'Plan campus-wide PD on ELPS sentence stems.',
            'Model CFU routine in two classrooms next week.',
            'Share rigor look-for resources with all teachers.',
            'Co-plan one scaffolded lesson per grade level.',
            'Calibrate observation rubric with leadership team.'
          ])
        }
      };
      history.push(entry);
    }

    // Sort chronologically
    history.sort(function (a, b) { return a.savedAt < b.savedAt ? -1 : 1; });
    return history;
  }

  // ----------------------------------------------------------------
  // Coaching cycles generator — 8 entries
  // ----------------------------------------------------------------

  function buildStage(idx, startDate, forceComplete) {
    var stageLabels = STAGE_LABELS;
    var noteTemplates = [
      [
        'Observed ' + randItem(TEACHERS) + ' during ESL pull-out. Strong scaffold use; CFU gaps noted.',
        'Walk-through observation completed. Focus on academic discourse during small group.',
        'Pre-observation conference held. Teacher shared lesson goals and anticipatory scaffold plan.'
      ],
      [
        'Debrief conversation held. Highlighted sentence frame usage; growth area: wait time after questioning.',
        'Feedback meeting: reviewed observation notes. Teacher receptive; identified one action step for next cycle.',
        'Written feedback provided via email. Teacher responded positively and requested model lesson.'
      ],
      [
        'Action step agreed: implement 3-read strategy for complex texts in next two weeks.',
        'Teacher will use structured discussion protocol (Socratic seminar lite) for upcoming unit.',
        'Co-planning session: designed scaffolded CFU exit ticket aligned to upcoming TEKS.'
      ],
      [
        'Follow-up observation scheduled. Teacher implemented action step with fidelity; noted improvement in student output.',
        'Check-in call: teacher reports students responding well to new discourse stems.',
        'Revisited data from interim assessment; coaching cycle targets confirmed relevant to student growth gaps.'
      ],
      [
        'Growth documented. Teacher now leading campus PD on ESL discourse strategies.',
        'Cycle complete — teacher demonstrates independent use of coached strategies; coaching support reduced.',
        'Final reflection: teacher articulated growth in student engagement data over cycle period.'
      ]
    ];

    var status = 'pending';
    var date = null;
    var notes = '';

    if (forceComplete || idx === 0) {
      status = 'complete';
      date = addDays(startDate, idx * randInt(5, 10));
      notes = randItem(noteTemplates[idx] || ['Stage complete.']);
    } else if (Math.random() > 0.4) {
      status = 'complete';
      date = addDays(startDate, idx * randInt(5, 10));
      notes = randItem(noteTemplates[idx] || ['Stage complete.']);
    }

    return {
      label: stageLabels[idx],
      status: status,
      date: date,
      notes: notes
    };
  }

  function buildCoachingCycles() {
    var allCycles = [];

    // Distribute cycles across leaders and campuses
    var configs = [
      { teacher: 'Ms. Garcia',     campus: 'North Campus', leader: 'J. Miller',    stagesComplete: 5 },
      { teacher: 'Mr. Chen',       campus: 'South Campus', leader: 'K. Patterson', stagesComplete: 3 },
      { teacher: 'Ms. Okafor',     campus: 'East Campus',  leader: 'P. Okolo',     stagesComplete: 2 },
      { teacher: 'Ms. Rodriguez',  campus: 'North Campus', leader: 'V. Palencia',  stagesComplete: 4 },
      { teacher: 'Mr. Patel',      campus: 'South Campus', leader: 'J. Miller',    stagesComplete: 1 },
      { teacher: 'Ms. Kim',        campus: 'East Campus',  leader: 'K. Patterson', stagesComplete: 5 },
      { teacher: 'Mr. Washington', campus: 'North Campus', leader: 'P. Okolo',     stagesComplete: 2 },
      { teacher: 'Ms. Torres',     campus: 'South Campus', leader: 'V. Palencia',  stagesComplete: 3 }
    ];

    for (var i = 0; i < configs.length; i++) {
      var cfg = configs[i];
      var startDate = randDate(YEAR_START_MS, new Date('2026-01-01').getTime());

      var stages = [];
      for (var s = 0; s < 5; s++) {
        var forceComplete = (s < cfg.stagesComplete);
        stages.push(buildStage(s, startDate, forceComplete));
      }

      allCycles.push({
        id: nextId('cyc'),
        teacher: cfg.teacher,
        campus: cfg.campus,
        leader: cfg.leader,
        createdAt: startDate,
        sourceWalkthroughId: null,
        stages: stages
      });
    }

    return {
      version: 1,
      savedAt: new Date().toISOString(),
      cycles: allCycles,
      settings: {}
    };
  }

  // ----------------------------------------------------------------
  // Audit history generator — 5 entries
  // ----------------------------------------------------------------

  var AUDIT_SECTIONS = [
    'Language Environment',
    'Word Walls & Vocabulary',
    'ELPS Standards Display',
    'Student Work Display',
    'Discourse Supports',
    'Scaffolding Materials',
    'Classroom Library',
    'Assessment Artifacts',
    'Anchor Charts',
    'Collaborative Structures',
    'Technology Integration',
    'Cultural Responsiveness',
    'Teacher Positioning'
  ];

  function buildAuditRatings(targetPct) {
    // 58 items rated 0-3, target score % approximated
    var ratings = {};
    var maxScore = 174; // 58 * 3
    var targetScore = Math.round(maxScore * (targetPct / 100));

    // Distribute points across 58 items
    var totalAssigned = 0;
    for (var i = 1; i <= 58; i++) {
      var key = 'item_' + i;
      if (totalAssigned >= targetScore) {
        ratings[key] = 0;
      } else {
        var remaining = targetScore - totalAssigned;
        var maxForItem = Math.min(3, remaining);
        ratings[key] = randInt(Math.max(0, maxForItem - 1), maxForItem);
        totalAssigned += ratings[key];
      }
    }
    return ratings;
  }

  function buildAuditHistory() {
    var history = [];
    var scoreTargets = [55, 68, 74, 82, 90];
    var teacherCampusPairs = [
      { teacher: 'Ms. Garcia',    campus: 'North Campus' },
      { teacher: 'Mr. Chen',      campus: 'South Campus' },
      { teacher: 'Ms. Okafor',    campus: 'East Campus'  },
      { teacher: 'Ms. Rodriguez', campus: 'North Campus' },
      { teacher: 'Mr. Patel',     campus: 'South Campus' }
    ];

    for (var i = 0; i < 5; i++) {
      var pct     = scoreTargets[i];
      var pair    = teacherCampusPairs[i];
      var date    = randDate(YEAR_START_MS, YEAR_END_MS);
      var ratings = buildAuditRatings(pct);
      var maxScore = 174;
      var actualScore = 0;
      for (var k in ratings) {
        if (ratings.hasOwnProperty(k)) actualScore += ratings[k];
      }
      var actualPct = Math.round((actualScore / maxScore) * 100);

      var level = actualPct >= 85 ? 'Exemplary'
                : actualPct >= 70 ? 'Proficient'
                : actualPct >= 55 ? 'Developing'
                : 'Beginning';

      history.push({
        id: nextId('aud'),
        savedAt: date + 'T10:00:00.000Z',
        scorePct: actualPct,
        level: level,
        meta: {
          teacher:  pair.teacher,
          campus:   pair.campus,
          observer: randItem(LEADERS),
          date:     date,
          school:   pair.campus
        },
        ratings: ratings,
        notes: {
          s01: randItem([
            'Word wall current and student-interactive.',
            'Language environment strong — bilingual labels throughout.',
            'Missing ELPS standard display near reading area.'
          ]),
          s02: randItem([
            'Vocabulary instruction aligned to ELPS 1E.',
            'Word wall incomplete; needs student-generated additions.',
            'Content-specific academic vocabulary prominently posted.'
          ])
        },
        prChecks: {}
      });
    }

    history.sort(function (a, b) { return a.savedAt < b.savedAt ? -1 : 1; });
    return history;
  }

  // ----------------------------------------------------------------
  // Shared teacher roster
  // ----------------------------------------------------------------

  function buildRoster() {
    return TEACHERS.slice();
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------

  function generateTestData() {
    var walkthroughHistory = buildWalkthroughHistory();
    var coachingCyclesData = buildCoachingCycles();
    var auditHistory       = buildAuditHistory();
    var roster             = buildRoster();

    try {
      localStorage.setItem('walkthrough_history',  JSON.stringify(walkthroughHistory));
      localStorage.setItem('coaching_cycles_data', JSON.stringify(coachingCyclesData));
      localStorage.setItem('esl_audit_history',    JSON.stringify(auditHistory));
      localStorage.setItem('shared_teacher_roster', JSON.stringify(roster));

      console.log('[ESL Test Data] Generated successfully.');
      console.log('  walkthrough_history:   ' + walkthroughHistory.length + ' entries');
      console.log('  coaching_cycles_data:  ' + coachingCyclesData.cycles.length + ' cycles');
      console.log('  esl_audit_history:     ' + auditHistory.length + ' entries');
      console.log('  shared_teacher_roster: ' + roster.length + ' teachers');
      console.log('Run clearTestData() to remove all generated data.');
    } catch (e) {
      console.error('[ESL Test Data] Failed to write to localStorage:', e);
    }
  }

  function clearTestData() {
    for (var i = 0; i < MANAGED_KEYS.length; i++) {
      localStorage.removeItem(MANAGED_KEYS[i]);
    }
    console.log('[ESL Test Data] Cleared keys: ' + MANAGED_KEYS.join(', '));
  }

  // Expose on window (browser) or exports (Node.js / module context)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateTestData: generateTestData, clearTestData: clearTestData };
  } else {
    root.generateTestData = generateTestData;
    root.clearTestData    = clearTestData;
  }

}(typeof window !== 'undefined' ? window : this));
