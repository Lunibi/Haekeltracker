// =====================================================
// UI RENDERING FUNKTIONEN
// =====================================================

/**
 * Wechselt zwischen Projekt- und Statistik-Ansicht
 * @param {string} view - 'projects' oder 'stats'
 */
function setView(view) {
    if (view === 'projects') {
        document.getElementById('view-projects').classList.remove('hidden');
        document.getElementById('view-stats').classList.add('hidden');
        document.getElementById('btn-projects').classList.add('bg-rose-100', 'text-rose-700');
        document.getElementById('btn-projects').classList.remove('text-stone-400');
        document.getElementById('btn-stats').classList.remove('bg-rose-100', 'text-rose-700');
        document.getElementById('btn-stats').classList.add('text-stone-400');
    } else {
        document.getElementById('view-projects').classList.add('hidden');
        document.getElementById('view-stats').classList.remove('hidden');
        document.getElementById('btn-stats').classList.add('bg-rose-100', 'text-rose-700');
        document.getElementById('btn-stats').classList.remove('text-stone-400');
        document.getElementById('btn-projects').classList.remove('bg-rose-100', 'text-rose-700');
        document.getElementById('btn-projects').classList.add('text-stone-400');
        renderStats();
    }
}

/**
 * Rendert alle Projekte in der UI
 */
function renderProjects() {
    const focusArea = document.getElementById('active-focus-area');
    const compactList = document.getElementById('project-list-compact');
    
    focusArea.innerHTML = '';
    compactList.innerHTML = '';
    
    // Sortiere Projekte: Aktive zuerst, dann abgeschlossene, dann abgebrochene
    // Innerhalb jeder Gruppe: Neueste zuerst (höhere ID = neuer)
    const sortedProjects = [...projects].sort((a, b) => {
        // Status-Priorität: aktiv=0, abgeschlossen=1, abgebrochen=2
        const statusOrder = { 'aktiv': 0, 'abgeschlossen': 1, 'abgebrochen': 2 };
        const aOrder = statusOrder[a.status] || 0;
        const bOrder = statusOrder[b.status] || 0;
        
        // Erst nach Status sortieren
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Innerhalb gleicher Status-Gruppe: Neueste zuerst (ID absteigend)
        return b.id - a.id;
    });
    
    // Rendere fokussiertes Projekt oben
    if (focusedProjectId) {
        const focused = projects.find(p => p.id === focusedProjectId);
        if (focused) {
            focusArea.appendChild(createFocusedProjectCard(focused));
        }
    }
    
    // Rendere alle Projekte in kompakter Liste
    sortedProjects.forEach(project => {
        compactList.appendChild(createCompactProjectCard(project));
    });
    
    // Lucide Icons neu initialisieren
    lucide.createIcons();
}

/**
 * Erstellt die große Karte für das fokussierte Projekt
 * @param {Object} project - Projekt-Objekt
 * @returns {HTMLElement} Die Projekt-Karte
 */
function createFocusedProjectCard(project) {
    const totalTime = getTotalTime(project.id);
    const isRunning = activeTimerProjectId === project.id;
    
    // Status-abhängige Styling
    let cardBg = 'active-project-card'; // Standard für aktiv
    let statusIcon = 'circle';
    let statusColor = 'text-stone-300';
    let statusLabel = 'Aktiv';
    
    if (project.status === 'abgeschlossen') {
        cardBg = 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200';
        statusIcon = 'check-circle';
        statusColor = 'text-green-500';
        statusLabel = 'Abgeschlossen';
    } else if (project.status === 'abgebrochen') {
        cardBg = 'bg-gradient-to-br from-stone-100 to-stone-200 border-2 border-stone-300';
        statusIcon = 'x-circle';
        statusColor = 'text-stone-500';
        statusLabel = 'Abgebrochen';
    }
    
    const card = document.createElement('div');
    card.className = `${cardBg} rounded-[2rem] p-6 shadow-xl space-y-4`;
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h3 class="text-xl font-black mb-1">${project.name}</h3>
                <p class="text-stone-400 text-[10px] uppercase font-black tracking-widest">Fokus-Projekt</p>
            </div>
            <div class="flex gap-1">
                <button onclick="openEditProjectModal(${project.id})" class="text-stone-400 hover:text-rose-500 p-2" title="Projekt umbenennen">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button onclick="toggleStatus(${project.id})" class="p-2 bg-white rounded-xl shadow-sm border border-rose-100" title="Status wechseln: ${statusLabel}">
                    <i data-lucide="${statusIcon}" class="w-5 h-5 ${statusColor}"></i>
                </button>
            </div>
        </div>
        
        <div class="bg-white/50 rounded-2xl p-4 text-center">
            <p class="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1">Gesamtzeit</p>
            <p id="timer-display-${project.id}" class="text-3xl font-black text-rose-600">${formatTime(totalTime)}</p>
        </div>
        
        <div class="flex gap-2 items-start">
            <textarea 
                id="note-${project.id}"
                class="note-input flex-1 bg-white/50 rounded-xl px-4 py-2 text-sm border-2 border-transparent focus:border-rose-200 outline-none transition-all resize-none overflow-hidden" 
                placeholder="Notizen..." 
                style="min-height: 38px; line-height: 1.5;"
                oninput="handleNoteInput(${project.id}, this)"
            >${project.note || ''}</textarea>
            <button 
                id="note-save-btn-${project.id}"
                onclick="saveNote(${project.id})"
                class="hidden bg-rose-500 text-white px-4 py-2 rounded-xl font-bold shadow-sm active:scale-95 transition-transform"
                style="min-height: 38px;"
            >
                <i data-lucide="check" class="w-4 h-4"></i>
            </button>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
            ${isRunning ? 
                `<button onclick="stopTimer()" class="flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-100 active:scale-95 transition-transform">
                    <i data-lucide="square" class="w-4 h-4"></i>
                    Stopp
                </button>` 
                : 
                `<button onclick="startTimer(${project.id})" class="flex items-center justify-center gap-2 bg-rose-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-100 active:scale-95 transition-transform">
                    <i data-lucide="play" class="w-4 h-4"></i>
                    Start
                </button>`
            }
            <button onclick="openManualModal(${project.id})" class="flex items-center justify-center gap-2 bg-white border-2 border-stone-100 py-3 rounded-xl text-stone-600 font-bold active:bg-stone-50 transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Zeit
            </button>
        </div>
    `;
    
    // Auto-grow für die Textarea beim Laden
    setTimeout(() => {
        const textarea = card.querySelector(`#note-${project.id}`);
        if (textarea) autoGrowTextarea(textarea);
    }, 0);
    
    return card;
}

/**
 * Erstellt eine kompakte Projekt-Karte für die Liste
 * @param {Object} project - Projekt-Objekt
 * @returns {HTMLElement} Die Projekt-Karte
 */
function createCompactProjectCard(project) {
    const totalTime = getTotalTime(project.id);
    const isFocused = project.id === focusedProjectId;
    
    // Status-abhängige Styling
    let cardBg = 'bg-white';
    let borderColor = isFocused ? 'border-rose-200' : 'border-stone-100';
    let statusIcon = 'circle';
    let statusColor = 'text-stone-400';
    
    if (project.status === 'abgeschlossen') {
        cardBg = 'bg-gradient-to-br from-green-50 to-white';
        borderColor = 'border-green-200';
        statusIcon = 'check-circle';
        statusColor = 'text-green-500';
    } else if (project.status === 'abgebrochen') {
        cardBg = 'bg-gradient-to-br from-stone-100 to-white';
        borderColor = 'border-stone-300';
        statusIcon = 'x-circle';
        statusColor = 'text-stone-500';
    }
    
    const card = document.createElement('div');
    card.className = `${cardBg} rounded-2xl p-4 border-2 ${borderColor} space-y-3`;
    
    // Notiz-Preview (erste Zeile, max 50 Zeichen)
    let notePreview = '';
    if (project.note && project.note.trim()) {
        const firstLine = project.note.split('\n')[0];
        notePreview = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    }
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1" onclick="setFocus(${project.id})" style="cursor: pointer;">
                <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-stone-800">${project.name}</h4>
                </div>
                <p class="text-xs text-stone-500">${formatTime(totalTime)}</p>
                ${notePreview ? `<p class="text-xs text-stone-400 italic mt-1">${notePreview}</p>` : ''}
            </div>
            <div class="flex gap-1">
                <button onclick="openManualModal(${project.id}, true)" class="text-stone-400 hover:text-rose-500 p-2" title="Zeit korrigieren">
                    <i data-lucide="clock" class="w-4 h-4"></i>
                </button>
                <button onclick="toggleStatus(${project.id})" class="p-2" title="Status ändern">
                    <i data-lucide="${statusIcon}" class="w-4 h-4 ${statusColor}"></i>
                </button>
                <button onclick="deleteProject(${project.id})" class="text-stone-400 hover:text-red-500 p-2" title="Löschen">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}
