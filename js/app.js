// =====================================================
// APP INITIALISIERUNG UND HAUPTLOGIK
// =====================================================

/**
 * Initialisiert die App beim Laden der Seite
 */
function init() {
    // 1. Lokale Daten als Fallback laden
    loadFromStorage();

    // 2. Timer-Stand wiederherstellen (falls vorhanden)
    if (typeof loadTimerState === "function") {
        loadTimerState();
    }

    // 3. Firebase laden und mit Cloud synchronisieren
    if (typeof initFirebase === "function") {
        initFirebase();
    }

    // UI initialisieren
    renderProjects();

    // Icons initialisieren
    lucide.createIcons();

    console.log('Häkel-Tracker geladen!');
}

/**
 * Startet die App wenn die Seite fertig geladen ist
 */
window.onload = init;
