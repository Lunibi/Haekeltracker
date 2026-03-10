// =====================================================
// DATENSTRUKTUREN UND GLOBALE VARIABLEN
// =====================================================

// Haupt-Datenarrays
let projects = [];   // Alle Häkelprojekte
let sessions = [];   // Alle Zeit-Sessions

// Zustandsvariablen
let focusedProjectId = null;       // ID des aktuell fokussierten Projekts
let activeTimerProjectId = null;   // ID des Projekts mit laufendem Timer
let timerStartTime = null;         // Zeitpunkt wann Timer gestartet wurde
let timerStartTimeStr = null;      // Uhrzeit-String wann Timer gestartet wurde
let timerInterval = null;          // Interval für Timer-Update

// Modal-Zustandsvariablen
let targetManualProjectId = null;  // Für manuelles Zeit-Hinzufügen
let isEditingTotal = false;        // Editieren wir die Gesamtzeit?
let editingProjectId = null;       // Welches Projekt wird gerade bearbeitet?
let editingSessionId = null;       // Welche Session wird gerade bearbeitet?
