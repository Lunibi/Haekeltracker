// =====================================================
// APP INITIALISIERUNG UND HAUPTLOGIK
// =====================================================

/**
 * Initialisiert die App beim Laden der Seite
 */
function init() {
    // Lade Daten aus LocalStorage
    loadFromStorage();
    
    // Rendere Projekte
    renderProjects();
    
    // Icons initialisieren
    lucide.createIcons();
    
    console.log('Häkel-Tracker geladen!');
}

/**
 * Startet die App wenn die Seite fertig geladen ist
 */
window.onload = init;
