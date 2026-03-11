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
    editingSessionId = null;
    
    document.getElementById('manual-project-name').innerText = project.name;
    document.getElementById('manual-modal-title').innerText = editMode ? 'Gesamtzeit korrigieren' : 'Zeit hinzufügen';
    
    // Setze Datum auf heute und Zeit auf jetzt
    document.getElementById('manual-date').value = getTodayString();
    document.getElementById('manual-time').value = getTimeString();
    
    document.getElementById('btn-delete-session').classList.add('hidden');
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
 * Öffnet das Modal zum Bearbeiten einer spezifischen Session
 * @param {number} sessionId - ID der Session
 */
/**
 * Öffnet das Modal zum Bearbeiten einer spezifischen Session
 * @param {number} sessionId - ID der Session
 */
function openEditSessionModal(sessionId) {
    console.log("Öffne Session zum Bearbeiten:", sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
        console.error("Session nicht gefunden:", sessionId);
        return;
    }
    
    const project = projects.find(p => p.id === session.projectId);
    
    targetManualProjectId = session.projectId;
    editingSessionId = sessionId;
    isEditingTotal = false;

    // Felder explizit zurücksetzen
    document.getElementById('manual-h').value = '';
    document.getElementById('manual-m').value = '';
    document.getElementById('manual-s').value = '';
    
    document.getElementById('manual-project-name').innerText = project ? project.name : 'Unbekanntes Projekt';
    document.getElementById('manual-modal-title').innerText = 'Eintrag bearbeiten';
    
    document.getElementById('manual-date').value = session.date;
    document.getElementById('manual-time').value = session.time || '00:00';
    
    const totalSecs = parseInt(session.seconds) || 0;
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    document.getElementById('manual-h').value = h > 0 ? h : '';
    document.getElementById('manual-m').value = m > 0 ? m : '';
    document.getElementById('manual-s').value = s > 0 ? s : '';
    
    document.getElementById('btn-delete-session').classList.remove('hidden');
    document.getElementById('modal-manual-time').classList.remove('hidden');
    
    lucide.createIcons();
    setTimeout(() => document.getElementById('manual-h').focus(), 50);
}

/**
 * Schließt das Manuelle-Zeit-Modal
 */
function closeManualModal() {
    document.getElementById('modal-manual-time').classList.add('hidden');
    editingSessionId = null;
    targetManualProjectId = null;
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
    const selectedTime = document.getElementById('manual-time').value;
    
    console.log("Speichere Zeit:", { editingSessionId, totalSeconds, selectedDate, selectedTime });

    if (editingSessionId) {
        // Bestehende Session bearbeiten
        sessions = sessions.map(sess => {
            if (sess.id === editingSessionId) {
                return { ...sess, seconds: totalSeconds, date: selectedDate, time: selectedTime };
            }
            return sess;
        });
    } else if (isEditingTotal) {
        // Lösche alle bisherigen Sessions für dieses Projekt
        sessions = sessions.filter(s => s.projectId !== targetManualProjectId);
        // Füge neue Gesamtzeit hinzu (falls > 0)
        if (totalSeconds > 0) {
            logSession(targetManualProjectId, totalSeconds, selectedDate, selectedTime);
        }
    } else if (totalSeconds > 0) {
        // Füge Zeit mit gewähltem Datum hinzu
        logSession(targetManualProjectId, totalSeconds, selectedDate, selectedTime);
    }
    
    saveToStorage();
    closeManualModal();
    renderProjects();
    renderStats();
}

/**
 * Löscht eine Session aus dem Modal heraus
 */
function deleteSessionFromModal() {
    console.log("Lösch-Versuch für Session ID:", editingSessionId);
    if (!editingSessionId) {
        console.warn("Keine editingSessionId gesetzt.");
        return;
    }
    
    if (confirm('Diesen Eintrag wirklich löschen?')) {
        const initialCount = sessions.length;
        sessions = sessions.filter(s => String(s.id) !== String(editingSessionId));
        console.log("Sessions vor Filter:", initialCount, "nach Filter:", sessions.length);
        
        saveToStorage();
        closeManualModal();
        renderProjects();
        renderStats();
    }
}

// ----------------
// Papierkorb Modal
// ----------------

/**
 * Öffnet das Papierkorb-Modal und listet gelöschte Elemente auf
 */
function openTrashModal() {
    const container = document.getElementById('trash-content');
    container.innerHTML = '';

    if (trash.projects.length === 0 && trash.sessions.length === 0) {
        container.innerHTML = '<p class="text-center text-stone-300 py-8 text-sm">Der Papierkorb ist leer.</p>';
    }

    // Gelöschte Projekte auflisten
    if (trash.projects.length > 0) {
        const section = document.createElement('div');
        section.innerHTML = '<h4 class="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 px-2">Projekte</h4>';
        trash.projects.forEach(p => {
            const item = document.createElement('div');
            item.className = 'bg-stone-50 p-4 rounded-2xl flex justify-between items-center mb-2';
            item.innerHTML = `
                <div>
                    <p class="font-bold text-stone-800 text-sm">${p.name}</p>
                    <p class="text-[10px] text-stone-400">ID: ${p.id}</p>
                </div>
                <button onclick="restoreProject(${p.id})" class="bg-white p-2 rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 transition-all" title="Wiederherstellen">
                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                </button>
            `;
            section.appendChild(item);
        });
        container.appendChild(section);
    }

    // Gelöschte Sessions auflisten
    if (trash.sessions.length > 0) {
        const section = document.createElement('div');
        section.innerHTML = '<h4 class="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-6 mb-2 px-2">Einzelne Einträge</h4>';
        trash.sessions.forEach(s => {
            const project = projects.find(p => p.id === s.projectId) || trash.projects.find(p => p.id === s.projectId);
            const projectName = project ? project.name : 'Unbekanntes Projekt';
            
            const item = document.createElement('div');
            item.className = 'bg-stone-50 p-4 rounded-2xl flex justify-between items-center mb-2';
            item.innerHTML = `
                <div>
                    <p class="font-bold text-stone-800 text-sm">${projectName}</p>
                    <p class="text-[10px] text-stone-400">${s.date} • ${formatTime(s.seconds)}</p>
                </div>
                <button onclick="restoreSession(${s.id})" class="bg-white p-2 rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 transition-all" title="Wiederherstellen">
                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                </button>
            `;
            section.appendChild(item);
        });
        container.appendChild(section);
    }

    document.getElementById('modal-trash').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * Schließt das Papierkorb-Modal
 */
function closeTrashModal() {
    document.getElementById('modal-trash').classList.add('hidden');
}

/**
 * Stellt ein Projekt aus dem Papierkorb wieder her
 */
function restoreProject(id) {
    const project = trash.projects.find(p => p.id === id);
    if (!project) return;

    // Aus Papierkorb entfernen
    trash.projects = trash.projects.filter(p => p.id !== id);
    
    // Zu Projekten hinzufügen
    projects.push(project);
    
    // Auch alle zugehörigen Sessions aus dem Papierkorb retten
    const relatedSessions = trash.sessions.filter(s => s.projectId === id);
    if (relatedSessions.length > 0) {
        sessions.push(...relatedSessions);
        trash.sessions = trash.sessions.filter(s => s.projectId !== id);
    }

    saveToStorage();
    renderProjects();
    renderStats();
    openTrashModal(); // Liste aktualisieren
}

/**
 * Stellt eine einzelne Session wieder her
 */
function restoreSession(id) {
    const session = trash.sessions.find(s => s.id === id);
    if (!session) return;

    // Aus Papierkorb entfernen
    trash.sessions = trash.sessions.filter(s => s.id !== id);
    
    // Zu Sessions hinzufügen
    sessions.push(session);

    saveToStorage();
    renderProjects();
    renderStats();
    openTrashModal(); // Liste aktualisieren
}

/**
 * Leert den Papierkorb endgültig
 */
function emptyTrash() {
    if (confirm('Möchtest du den Papierkorb wirklich endgültig leeren? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        trash = { projects: [], sessions: [] };
        saveToStorage();
        openTrashModal();
    }
}
