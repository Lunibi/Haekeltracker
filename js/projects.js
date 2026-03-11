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
 * Setzt den Status eines Projekts (aktiv, abgeschlossen, abgebrochen)
 * @param {number} id - Projekt-ID
 * @param {string} status - Der neue Status
 */
function setStatus(id, status) {
    projects = projects.map(p => {
        if (p.id === id) {
            return {...p, status: status};
        }
        return p;
    });
    saveToStorage();
    renderProjects();
}

/**
 * Löscht ein Projekt (Zwei-Stufen-Bestätigung ohne Popup)
 * @param {number} id - Projekt-ID
 * @param {HTMLElement} btn - Der Button-Element
 */
let deleteProjectTimeouts = {};

function deleteProject(id, btn) {
    const label = btn.querySelector('.delete-label');
    
    // Falls bereits im "Sicher?"-Modus -> Jetzt löschen!
    if (btn.classList.contains('confirming')) {
        clearTimeout(deleteProjectTimeouts[id]);
        
        // Stoppe Timer falls er für dieses Projekt läuft
        if (activeTimerProjectId === id) {
            stopTimer();
        }
        
        // Finde das Projekt und verschiebe es in den Papierkorb
        const projectToDelete = projects.find(p => p.id === id);
        if (projectToDelete) {
            trash.projects.push(projectToDelete);
            
            // Zugehörige Sessions ebenfalls in den Papierkorb verschieben
            const projectSessions = sessions.filter(s => s.projectId === id);
            trash.sessions.push(...projectSessions);
            
            // Aus Hauptarrays entfernen
            projects = projects.filter(p => p.id !== id);
            sessions = sessions.filter(s => s.projectId !== id);
        }
        
        // Falls das gelöschte Projekt fokussiert war, fokussiere ein anderes
        if (focusedProjectId === id) {
            focusedProjectId = projects[0]?.id || null;
        }
        
        saveToStorage();
        renderProjects();
        return;
    }
    
    // In "Sicher?"-Modus wechseln
    btn.classList.add('confirming', 'bg-red-50', 'text-red-600', 'rounded-lg', 'px-3');
    btn.classList.remove('text-stone-400');
    if (label) label.classList.remove('hidden');
    
    // Nach 3 Sekunden zurücksetzen
    deleteProjectTimeouts[id] = setTimeout(() => {
        if (btn) {
            btn.classList.remove('confirming', 'bg-red-50', 'text-red-600', 'rounded-lg', 'px-3');
            btn.classList.add('text-stone-400');
            if (label) label.classList.add('hidden');
        }
    }, 3000);
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
