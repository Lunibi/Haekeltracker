// =====================================================
// PROJEKT VERWALTUNG
// =====================================================

/**
 * Setzt ein Projekt als fokussiert (wird oben angezeigt)
 * @param {number} id - Projekt-ID
 */
function setFocus(id) {
    focusedProjectId = id;
    saveToStorage();
    renderProjects();
}

/**
 * Wechselt den Status eines Projekts durch: aktiv → abgeschlossen → abgebrochen → aktiv
 * @param {number} id - Projekt-ID
 */
function toggleStatus(id) {
    projects = projects.map(p => {
        if (p.id === id) {
            let newStatus;
            if (p.status === 'aktiv') newStatus = 'abgeschlossen';
            else if (p.status === 'abgeschlossen') newStatus = 'abgebrochen';
            else newStatus = 'aktiv';
            return {...p, status: newStatus};
        }
        return p;
    });
    saveToStorage();
    renderProjects();
}

/**
 * Löscht ein Projekt (mit Bestätigung)
 * @param {number} id - Projekt-ID
 */
function deleteProject(id) {
    if (!confirm("Dieses Projekt wirklich unwiderruflich löschen?")) return;
    
    // Stoppe Timer falls er für dieses Projekt läuft
    if (activeTimerProjectId === id) {
        stopTimer();
    }
    
    // Entferne Projekt und alle zugehörigen Sessions
    projects = projects.filter(p => p.id !== id);
    sessions = sessions.filter(s => s.projectId !== id);
    
    // Falls das gelöschte Projekt fokussiert war, fokussiere ein anderes
    if (focusedProjectId === id) {
        focusedProjectId = projects[0]?.id || null;
    }
    
    saveToStorage();
    renderProjects();
}

/**
 * Speichert die Notiz eines Projekts
 * @param {number} id - Projekt-ID
 * @param {string} note - Notiztext
 */
function updateNote(id, note) {
    projects = projects.map(p => 
        p.id === id ? {...p, note: note} : p
    );
    saveToStorage();
}

/**
 * Wird bei jeder Eingabe im Notizfeld aufgerufen
 * Zeigt den Speichern-Button an und passt die Höhe an
 * @param {number} id - Projekt-ID
 * @param {HTMLElement} textarea - Das Textarea-Element
 */
function handleNoteInput(id, textarea) {
    // Zeige Speichern-Button
    const saveBtn = document.getElementById(`note-save-btn-${id}`);
    if (saveBtn) {
        saveBtn.classList.remove('hidden');
    }
    
    // Auto-grow
    autoGrowTextarea(textarea);
}

/**
 * Speichert die Notiz und versteckt den Button wieder
 * @param {number} id - Projekt-ID
 */
function saveNote(id) {
    const textarea = document.getElementById(`note-${id}`);
    const saveBtn = document.getElementById(`note-save-btn-${id}`);
    
    if (textarea) {
        updateNote(id, textarea.value);
        
        // Verstecke Button
        if (saveBtn) {
            saveBtn.classList.add('hidden');
        }
        
        // Minimiere Textarea wenn leer
        if (!textarea.value.trim()) {
            textarea.style.height = '38px';
        }
        
        // Blur um Tastatur zu schließen
        textarea.blur();
    }
}

/**
 * Passt die Höhe der Notiz-Textarea automatisch an den Inhalt an
 * @param {HTMLElement} textarea - Das Textarea-Element
 */
function autoGrowTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(38, textarea.scrollHeight) + 'px';
}
