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
 * Wechselt den Status eines Projekts (aktiv ↔ abgeschlossen)
 * @param {number} id - Projekt-ID
 */
function toggleStatus(id) {
    projects = projects.map(p => 
        p.id === id 
            ? {...p, status: p.status === 'aktiv' ? 'abgeschlossen' : 'aktiv'} 
            : p
    );
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
 * Passt die Höhe der Notiz-Textarea automatisch an den Inhalt an
 * @param {HTMLElement} textarea - Das Textarea-Element
 */
function autoGrowTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}
