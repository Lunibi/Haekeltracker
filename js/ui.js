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
    
    // Sortiere Projekte: Aktive zuerst, dann abgeschlossene
    const sortedProjects = [...projects].sort((a, b) => {
        if (a.status === 'aktiv' && b.status !== 'aktiv') return -1;
        if (a.status !== 'aktiv' && b.status === 'aktiv') return 1;
        return 0;
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
    
    const card = document.createElement('div');
    card.className = 'active-project-card rounded-[2rem] p-6 shadow-xl space-y-4';
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h3 class="text-xl font-black mb-1">${project.name}</h3>
                <p class="text-stone-400 text-[10px] uppercase font-black tracking-widest">Fokus-Projekt</p>
            </div>
            <button onclick="openEditProjectModal(${project.id})" class="text-stone-400 hover:text-rose-500 p-2">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
        </div>
        
        <div class="bg-white/50 rounded-2xl p-4 text-center">
            <p class="text-stone-400 text-[10px] uppercase font-black tracking-widest mb-1">Gesamtzeit</p>
            <p id="timer-display-${project.id}" class="text-3xl font-black text-rose-600">${formatTime(totalTime)}</p>
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
        
        <textarea 
            class="note-input w-full bg-white/50 rounded-xl px-4 py-3 text-sm border-2 border-transparent focus:border-rose-200 outline-none transition-all" 
            placeholder="Notizen..." 
            oninput="updateNote(${project.id}, this.value); autoGrowTextarea(this)"
            onload="autoGrowTextarea(this)"
        >${project.note || ''}</textarea>
    `;
    
    // Auto-grow für die Textarea beim Laden
    setTimeout(() => {
        const textarea = card.querySelector('textarea');
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
    
    const card = document.createElement('div');
    card.className = `bg-white rounded-2xl p-4 border-2 ${isFocused ? 'border-rose-200' : 'border-stone-100'} space-y-3`;
    
    const statusIcon = project.status === 'aktiv' 
        ? '<i data-lucide="circle" class="w-3 h-3 text-green-500"></i>' 
        : '<i data-lucide="check-circle" class="w-3 h-3 text-stone-300"></i>';
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1" onclick="setFocus(${project.id})" style="cursor: pointer;">
                <div class="flex items-center gap-2 mb-1">
                    ${statusIcon}
                    <h4 class="font-bold text-stone-800">${project.name}</h4>
                </div>
                <p class="text-xs text-stone-500">${formatTime(totalTime)}</p>
            </div>
            <div class="flex gap-1">
                <button onclick="openManualModal(${project.id}, true)" class="text-stone-400 hover:text-rose-500 p-2" title="Zeit korrigieren">
                    <i data-lucide="clock" class="w-4 h-4"></i>
                </button>
                <button onclick="toggleStatus(${project.id})" class="text-stone-400 hover:text-rose-500 p-2" title="Status ändern">
                    <i data-lucide="check" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteProject(${project.id})" class="text-stone-400 hover:text-red-500 p-2" title="Löschen">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}
