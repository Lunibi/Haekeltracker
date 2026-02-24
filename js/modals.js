// =====================================================
// MODAL FUNKTIONEN
// =====================================================

// ----------------
// Neues Projekt Modal
// ----------------

/**
 * Öffnet das Modal zum Erstellen eines neuen Projekts
 */
function openProjectModal() {
    document.getElementById('modal-project').classList.remove('hidden');
    setTimeout(() => document.getElementById('project-name-input').focus(), 50);
}

/**
 * Schließt das Neues-Projekt-Modal
 */
function closeProjectModal() {
    document.getElementById('modal-project').classList.add('hidden');
    document.getElementById('project-name-input').value = '';
}

/**
 * Erstellt ein neues Projekt
 */
function submitNewProject() {
    const name = document.getElementById('project-name-input').value.trim();
    if (!name) return;
    
    const newId = Date.now();
    projects.push({ 
        id: newId, 
        name: name, 
        status: 'aktiv', 
        note: '' 
    });
    focusedProjectId = newId;
    saveToStorage();
    closeProjectModal();
    renderProjects();
}

// ----------------
// Projekt Bearbeiten Modal
// ----------------

/**
 * Öffnet das Modal zum Bearbeiten eines Projekts
 * @param {number} id - Projekt-ID
 */
function openEditProjectModal(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    editingProjectId = id;
    document.getElementById('edit-project-name-input').value = project.name;
    document.getElementById('modal-edit-project').classList.remove('hidden');
    setTimeout(() => document.getElementById('edit-project-name-input').focus(), 50);
}

/**
 * Schließt das Bearbeiten-Modal
 */
function closeEditProjectModal() {
    document.getElementById('modal-edit-project').classList.add('hidden');
    editingProjectId = null;
}

/**
 * Speichert die Änderungen am Projektnamen
 */
function submitEditProject() {
    const newName = document.getElementById('edit-project-name-input').value.trim();
    if (!newName || !editingProjectId) return;
    
    projects = projects.map(p => 
        p.id === editingProjectId ? {...p, name: newName} : p
    );
    saveToStorage();
    closeEditProjectModal();
    renderProjects();
}

// ----------------
// Manuelle Zeit Modal
// ----------------

/**
 * Öffnet das Modal zum manuellen Hinzufügen/Bearbeiten von Zeit
 * @param {number} id - Projekt-ID
 * @param {boolean} editMode - True = Gesamtzeit korrigieren, False = Zeit hinzufügen
 */
function openManualModal(id, editMode = false) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    targetManualProjectId = id;
    isEditingTotal = editMode;
    document.getElementById('manual-project-name').innerText = project.name;
    document.getElementById('manual-modal-title').innerText = editMode ? 'Gesamtzeit korrigieren' : 'Zeit hinzufügen';
    
    // Setze Datum auf heute (lokale Zeit!)
    document.getElementById('manual-date').value = getTodayString();
    
    document.getElementById('modal-manual-time').classList.remove('hidden');
    
    if (editMode) {
        // Im Edit-Modus: Zeige aktuelle Gesamtzeit
        const total = getTotalTime(id);
        document.getElementById('manual-h').value = Math.floor(total / 3600) || '';
        document.getElementById('manual-m').value = Math.floor((total % 3600) / 60) || '';
        document.getElementById('manual-s').value = total % 60 || '';
    } else {
        // Im Hinzufügen-Modus: Leere Felder
        document.getElementById('manual-h').value = '';
        document.getElementById('manual-m').value = '';
        document.getElementById('manual-s').value = '';
    }
    
    setTimeout(() => document.getElementById('manual-h').focus(), 50);
}

/**
 * Schließt das Manuelle-Zeit-Modal
 */
function closeManualModal() {
    document.getElementById('modal-manual-time').classList.add('hidden');
}

/**
 * Speichert die manuell eingegebene Zeit
 */
function submitManualTime() {
    const h = parseInt(document.getElementById('manual-h').value) || 0;
    const m = parseInt(document.getElementById('manual-m').value) || 0;
    const s = parseInt(document.getElementById('manual-s').value) || 0;
    const totalSeconds = (h * 3600) + (m * 60) + s;
    const selectedDate = document.getElementById('manual-date').value;
    
    if (isEditingTotal) {
        // Lösche alle bisherigen Sessions für dieses Projekt
        sessions = sessions.filter(s => s.projectId !== targetManualProjectId);
        // Füge neue Gesamtzeit hinzu (falls > 0)
        if (totalSeconds > 0) {
            logSession(targetManualProjectId, totalSeconds, selectedDate);
        }
    } else if (totalSeconds > 0) {
        // Füge Zeit mit gewähltem Datum hinzu
        logSession(targetManualProjectId, totalSeconds, selectedDate);
    }
    
    closeManualModal();
    renderProjects();
}
