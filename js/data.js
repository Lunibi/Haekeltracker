// =====================================================
// DATENSTRUKTUREN UND GLOBALE VARIABLEN
// =====================================================

// Haupt-Datenarrays
let projects = [];   // Alle Häkelprojekte
let sessions = [];   // Alle Zeit-Sessions
let trash = { projects: [], sessions: [] }; // Der Papierkorb

// Zustandsvariablen
let focusedProjectId = null;       // ID des aktuell fokussierten Projekts
let activeTimerProjectId = null;   // ID des Projekts mit laufendem Timer
let timerStartTime = null;         // Zeitpunkt wann Timer gestartet wurde
let timerStartTimeStr = null;      // Uhrzeit-String wann Timer gestartet wurde
let timerInterval = null;          // Interval für Timer-Update
let isTimerPaused = false;         // Ist der Timer gerade pausiert?
let accumulatedTime = 0;           // Bereits verstrichene Zeit vor der aktuellen Pause

// Modal-Zustandsvariablen
let targetManualProjectId = null;  // Für manuelles Zeit-Hinzufügen
let isEditingTotal = false;        // Editieren wir die Gesamtzeit?
let editingProjectId = null;       // Welches Projekt wird gerade bearbeitet?
let editingSessionId = null;       // Welche Session wird gerade bearbeitet?
