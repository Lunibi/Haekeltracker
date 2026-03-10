// =====================================================
// LOCALSTORAGE VERWALTUNG
// =====================================================

/**
 * Lädt alle Daten aus dem LocalStorage
 */
function loadFromStorage() {
    // 1. Zuerst aus LocalStorage laden für schnelles Anzeigen
    const stored = localStorage.getItem('haekelTrackerData');
    if (stored) {
        const data = JSON.parse(stored);
        projects = data.projects || [];
        sessions = (data.sessions || []).map(s => {
            // Falls alte Daten ohne ID existieren, ID nachreichen
            if (!s.id) {
                s.id = Date.now() + Math.floor(Math.random() * 10000);
            }
            return s;
        });
        focusedProjectId = data.focusedProjectId || (projects[0]?.id || null);
    }

    // 2. Dann Firebase-Cloud-Daten im Hintergrund synchronisieren
    // Startet automatisch den Snapshot-Listener in firebase-handler.js
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

    // Sicherheits-Backup (nur lokal, wird nicht von Cloud-Sync überschrieben)
    // Behält immer den Stand von VOR 5 Minuten oder so (simpel: eine Kopie)
    if (projects.length > 0 || sessions.length > 0) {
        localStorage.setItem('haekelTrackerSafetyBackup', JSON.stringify(data));
    }

    // Auch in die Firebase Cloud speichern (falls bereit)
    if (typeof saveToCloud === "function") {
        saveToCloud();
    }
}

/**
 * Versucht, Daten aus dem lokalen Sicherheits-Backup zu retten
 */
function recoverFromSafetyBackup() {
    const backup = localStorage.getItem('haekelTrackerSafetyBackup');
    if (backup) {
        const data = JSON.parse(backup);
        if (confirm(`Möchtest du versuchen, ${data.projects.length} Projekte und ${data.sessions.length} Sessions aus dem lokalen Backup wiederherzustellen?`)) {
            projects = data.projects;
            sessions = data.sessions;
            saveToStorage();
            renderProjects();
            renderStats();
            alert("Wiederherstellung erfolgreich!");
        }
    } else {
        alert("Kein lokales Backup gefunden.");
    }
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
