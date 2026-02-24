// =====================================================
// LOCALSTORAGE VERWALTUNG
// =====================================================

/**
 * Lädt alle Daten aus dem LocalStorage
 * Migriert automatisch alte Daten falls vorhanden
 */
function loadFromStorage() {
    // Prüfe erst ob neue Datenstruktur vorhanden ist
    const stored = localStorage.getItem('haekelTrackerData');
    
    if (stored) {
        // Neue Datenstruktur vorhanden - normal laden
        const data = JSON.parse(stored);
        projects = data.projects || [];
        sessions = data.sessions || [];
        focusedProjectId = data.focusedProjectId || null;
        
        // Fallback: Wenn kein fokussiertes Projekt gesetzt ist, nimm das erste aktive
        if (!focusedProjectId && projects.length > 0) {
            focusedProjectId = projects[0].id;
        }
    } else {
        // Keine neuen Daten - prüfe ob alte Daten vorhanden sind (Migration)
        const oldProjects = localStorage.getItem('crochet_projects');
        const oldSessions = localStorage.getItem('crochet_sessions');
        const oldFocusedId = localStorage.getItem('crochet_focused_id');
        
        if (oldProjects || oldSessions) {
            console.log('🔄 Migriere alte Daten zur neuen Struktur...');
            
            // Lade alte Daten
            projects = oldProjects ? JSON.parse(oldProjects) : [];
            sessions = oldSessions ? JSON.parse(oldSessions) : [];
            focusedProjectId = oldFocusedId ? parseInt(oldFocusedId) : (projects[0]?.id || null);
            
            // Speichere in neuer Struktur
            saveToStorage();
            
            // Optional: Lösche alte Daten (auskommentiert falls du sie behalten willst)
            // localStorage.removeItem('crochet_projects');
            // localStorage.removeItem('crochet_sessions');
            // localStorage.removeItem('crochet_focused_id');
            
            console.log('✅ Migration erfolgreich!');
        }
    }
}

/**
 * Speichert alle Daten im LocalStorage
 */
function saveToStorage() {
    const data = {
        projects: projects,
        sessions: sessions,
        focusedProjectId: focusedProjectId
    };
    localStorage.setItem('haekelTrackerData', JSON.stringify(data));
}

/**
 * Exportiert alle Daten als JSON-String (für Backup)
 */
function exportData() {
    const jsonString = JSON.stringify({ projects, sessions });
    document.getElementById('io-title').innerText = "Export-Code";
    document.getElementById('io-textarea').value = jsonString;
    document.getElementById('io-textarea').readOnly = true;
    document.getElementById('io-primary-btn').innerText = "In die Zwischenablage";
    document.getElementById('io-primary-btn').onclick = () => {
        const textarea = document.getElementById('io-textarea');
        textarea.select();
        document.execCommand('copy');
        document.getElementById('io-msg').classList.remove('hidden');
        setTimeout(() => document.getElementById('io-msg').classList.add('hidden'), 2000);
    };
    document.getElementById('modal-data-io').classList.remove('hidden');
}

/**
 * Importiert Daten aus JSON-String
 */
function importData() {
    document.getElementById('io-title').innerText = "Daten importieren";
    document.getElementById('io-textarea').value = "";
    document.getElementById('io-textarea').readOnly = false;
    document.getElementById('io-primary-btn').innerText = "Import Bestätigen";
    document.getElementById('io-primary-btn').onclick = () => {
        try {
            const data = JSON.parse(document.getElementById('io-textarea').value);
            if (data.projects && data.sessions) {
                projects = data.projects;
                sessions = data.sessions;
                focusedProjectId = projects[0]?.id || null;
                saveToStorage();
                renderProjects();
                document.getElementById('modal-data-io').classList.add('hidden');
            }
        } catch (e) { 
            alert("Ungültiger Code!"); 
        }
    };
    document.getElementById('modal-data-io').classList.remove('hidden');
}

/**
 * Schließt das Import/Export Modal
 */
function closeIoModal() { 
    document.getElementById('modal-data-io').classList.add('hidden'); 
}
