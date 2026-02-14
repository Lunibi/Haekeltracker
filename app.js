let projects = JSON.parse(localStorage.getItem('crochet_projects') || '[]');
let sessions = JSON.parse(localStorage.getItem('crochet_sessions') || '[]');

let focusedProjectId = localStorage.getItem('crochet_focused_id') ? parseInt(localStorage.getItem('crochet_focused_id')) : (projects[0]?.id || null);
let activeTimerProjectId = null;
let timerSeconds = 0;
let isTimerRunning = false;
let timerInterval = null;
let lastTickTimestamp = null;
let targetManualProjectId = null;
let isEditingTotal = false;

function init() {
    renderProjects();
    lucide.createIcons();
}

function saveToStorage() {
    localStorage.setItem('crochet_projects', JSON.stringify(projects));
    localStorage.setItem('crochet_sessions', JSON.stringify(sessions));
    if(focusedProjectId) localStorage.setItem('crochet_focused_id', focusedProjectId);
}

function setView(viewName) {
    document.getElementById('view-projects').classList.toggle('hidden', viewName !== 'projects');
    document.getElementById('view-stats').classList.toggle('hidden', viewName !== 'stats');
    document.getElementById('btn-projects').className = `p-3 rounded-xl transition ${viewName === 'projects' ? 'bg-rose-100 text-rose-700' : 'text-stone-400'}`;
    document.getElementById('btn-stats').className = `p-3 rounded-xl transition ${viewName === 'stats' ? 'bg-rose-100 text-rose-700' : 'text-stone-400'}`;
    if(viewName === 'stats') renderStats();
    lucide.createIcons();
}

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
}

function focusProject(id) {
    if (activeTimerProjectId && activeTimerProjectId !== id) {
        if(!confirm("Möchtest du das aktuelle Projekt pausieren und wechseln?")) return;
        stopTimer();
    }
    focusedProjectId = id;
    saveToStorage();
    renderProjects();
}

function updateNote(id, note) {
    projects = projects.map(p => p.id === id ? {...p, note: note} : p);
    saveToStorage();
}

function handleNoteKeydown(event, id) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        event.target.blur();
        updateNote(id, event.target.value);
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function startTimer(id) {
    activeTimerProjectId = id;
    isTimerRunning = true;
    lastTickTimestamp = Date.now();
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            if (isTimerRunning) {
                const now = Date.now();
                const delta = Math.round((now - lastTickTimestamp) / 1000);
                if (delta >= 1) {
                    timerSeconds += delta;
                    lastTickTimestamp = now;
                    const display = document.getElementById(`focus-timer-display`);
                    if (display) display.innerText = formatTime(timerSeconds);
                }
            }
        }, 1000);
    }
    renderProjects();
}

function togglePause() {
    isTimerRunning = !isTimerRunning;
    if (isTimerRunning) lastTickTimestamp = Date.now();
    renderProjects();
}

function saveTimer() {
    if (timerSeconds > 0) logSession(activeTimerProjectId, timerSeconds);
    stopTimer();
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    activeTimerProjectId = null;
    isTimerRunning = false;
    timerSeconds = 0;
    renderProjects();
}

function logSession(projectId, seconds) {
    sessions.push({
        id: Date.now(),
        projectId: projectId,
        seconds: seconds,
        date: new Date().toISOString().split('T')[0]
    });
    saveToStorage();
    renderProjects();
}

function openProjectModal() {
    document.getElementById('modal-project').classList.remove('hidden');
    setTimeout(() => document.getElementById('project-name-input').focus(), 50);
}

function closeProjectModal() {
    document.getElementById('modal-project').classList.add('hidden');
    document.getElementById('project-name-input').value = '';
}

function submitNewProject() {
    const name = document.getElementById('project-name-input').value.trim();
    if (!name) return;
    const newId = Date.now();
    projects.push({ id: newId, name: name, status: 'aktiv', note: '' });
    focusedProjectId = newId;
    saveToStorage();
    closeProjectModal();
    renderProjects();
}

function openManualModal(id, editMode = false) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    targetManualProjectId = id;
    isEditingTotal = editMode;
    document.getElementById('manual-project-name').innerText = project.name;
    document.getElementById('manual-modal-title').innerText = editMode ? 'Gesamtzeit korrigieren' : 'Zeit hinzufügen';
    document.getElementById('modal-manual-time').classList.remove('hidden');
    if (editMode) {
        const total = sessions.filter(s => s.projectId === id).reduce((sum, s) => sum + s.seconds, 0);
        document.getElementById('manual-h').value = Math.floor(total / 3600) || '';
        document.getElementById('manual-m').value = Math.floor((total % 3600) / 60) || '';
        document.getElementById('manual-s').value = total % 60 || '';
    } else {
        document.getElementById('manual-h').value = ''; 
        document.getElementById('manual-m').value = ''; 
        document.getElementById('manual-s').value = '';
    }
    setTimeout(() => document.getElementById('manual-h').focus(), 50);
}

function closeManualModal() {
    document.getElementById('modal-manual-time').classList.add('hidden');
}

function submitManualTime() {
    const h = parseInt(document.getElementById('manual-h').value) || 0;
    const m = parseInt(document.getElementById('manual-m').value) || 0;
    const s = parseInt(document.getElementById('manual-s').value) || 0;
    const totalSeconds = (h * 3600) + (m * 60) + s;
    if (isEditingTotal) {
        sessions = sessions.filter(s => s.projectId !== targetManualProjectId);
        if (totalSeconds > 0) logSession(targetManualProjectId, totalSeconds);
    } else if (totalSeconds > 0) {
        logSession(targetManualProjectId, totalSeconds);
    }
    closeManualModal();
    renderProjects();
}

function closeIoModal() { 
    document.getElementById('modal-data-io').classList.add('hidden'); 
}

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

function toggleStatus(id) {
    projects = projects.map(p => p.id === id ? {...p, status: p.status === 'aktiv' ? 'abgeschlossen' : 'aktiv'} : p);
    saveToStorage();
    renderProjects();
}

function deleteProject(id) {
    if (!confirm("Dieses Projekt wirklich unwiderruflich löschen?")) return;
    if (activeTimerProjectId === id) stopTimer();
    projects = projects.filter(p => p.id !== id);
    sessions = sessions.filter(s => s.projectId !== id);
    if (focusedProjectId === id) focusedProjectId = projects[0]?.id || null;
    saveToStorage();
    renderProjects();
}

function renderProjects() {
    const activeArea = document.getElementById('active-focus-area');
    const compactList = document.getElementById('project-list-compact');
    
    activeArea.innerHTML = '';
    compactList.innerHTML = '';

    if (projects.length === 0) {
        activeArea.innerHTML = `
            <div class="bg-white border-2 border-dashed border-stone-200 rounded-[2.5rem] p-10 text-center text-stone-400">
                <p class="font-bold">Keine Projekte vorhanden.</p>
                <p class="text-xs mt-2">Klicke oben auf "Neu", um zu starten.</p>
            </div>`;
        return;
    }

    const focusProject = projects.find(p => p.id === focusedProjectId) || projects[0];
    focusedProjectId = focusProject.id;
    const focusTotal = sessions.filter(s => s.projectId === focusProject.id).reduce((sum, s) => sum + s.seconds, 0);
    const isCurrentlyTimer = activeTimerProjectId === focusProject.id;

    activeArea.innerHTML = `
        <div class="active-project-card rounded-[2.5rem] p-8 shadow-xl shadow-rose-100 animate-in relative overflow-hidden">
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-black text-stone-900 leading-tight">${focusProject.name}</h3>
                        <p class="text-[10px] font-black uppercase text-rose-400 tracking-widest mt-1">Aktueller Fokus</p>
                    </div>
                    <button onclick="toggleStatus(${focusProject.id})" class="p-2 bg-white rounded-xl shadow-sm border border-rose-100">
                        <i data-lucide="check-circle" class="w-5 h-5 ${focusProject.status === 'abgeschlossen' ? 'text-green-500' : 'text-stone-300'}"></i>
                    </button>
                </div>

                <div class="mb-6">
                     <div class="bg-stone-100/50 rounded-xl px-3 py-2 flex items-start gap-2 border border-stone-200/50 focus-within:border-rose-200 transition-all">
                        <i data-lucide="sticky-note" class="w-3.5 h-3.5 text-stone-400 mt-1"></i>
                        <textarea
                            placeholder="Notiz hinzufügen (z.B. Runde 9)..." 
                            class="bg-transparent text-xs font-semibold text-stone-600 outline-none w-full note-input py-0.5" 
                            oninput="autoResizeTextarea(this)"
                            onkeydown="handleNoteKeydown(event, ${focusProject.id})"
                            onchange="updateNote(${focusProject.id}, this.value)">${focusProject.note || ''}</textarea>
                    </div>
                </div>

                <div class="flex items-center gap-3 mb-8">
                    <div class="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-rose-50">
                        <p class="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Gesamtzeit</p>
                        <p class="font-mono font-black text-stone-800">${formatTime(focusTotal)}</p>
                    </div>
                    <button onclick="openManualModal(${focusProject.id}, true)" class="text-stone-300 hover:text-rose-500">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="space-y-3">
                    ${isCurrentlyTimer ? `
                        <div class="bg-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-200">
                            <p class="text-[10px] font-bold uppercase opacity-70 mb-1 text-center">Laufende Session</p>
                            <p id="focus-timer-display" class="text-4xl font-black text-center font-mono mb-6">${formatTime(timerSeconds)}</p>
                            <div class="flex gap-2">
                                <button onclick="togglePause()" class="flex-1 bg-white/20 backdrop-blur py-3 rounded-xl font-bold active:bg-white/30 transition-all">
                                    <i data-lucide="${isTimerRunning ? 'pause' : 'play'}" class="w-5 h-5 mx-auto"></i>
                                </button>
                                <button onclick="saveTimer()" class="flex-[2] bg-white text-rose-600 py-3 rounded-xl font-black shadow-sm active:scale-95 transition-transform">
                                    Session beenden
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="flex gap-2">
                            <button onclick="startTimer(${focusProject.id})" class="flex-[2] bg-stone-900 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-2">
                                <i data-lucide="play" class="w-5 h-5 fill-current"></i> Starten
                            </button>
                            <button onclick="openManualModal(${focusProject.id})" class="flex-1 bg-white border-2 border-stone-100 text-stone-600 py-5 rounded-[1.5rem] font-bold flex items-center justify-center">
                                <i data-lucide="plus" class="w-6 h-6"></i>
                            </button>
                        </div>
                    `}
                </div>
            </div>
            <div class="absolute -bottom-6 -right-6 opacity-[0.03] rotate-12">
                <i data-lucide="clock" class="w-48 h-48"></i>
            </div>
        </div>
    `;
    
    const tx = activeArea.querySelector('textarea');
    if(tx) autoResizeTextarea(tx);

    projects.forEach(p => {
        if (p.id === focusedProjectId) return;
        
        const projectTotal = sessions.filter(s => s.projectId === p.id).reduce((sum, s) => sum + s.seconds, 0);
        const item = document.createElement('div');
        item.className = `flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-100 active:border-rose-200 transition-all ${p.status === 'abgeschlossen' ? 'opacity-50' : ''}`;
        
        item.innerHTML = `
            <div onclick="focusProject(${p.id})" class="flex-1 cursor-pointer">
                <h4 class="font-bold text-stone-800 leading-tight">${p.name}</h4>
                <div class="flex items-center gap-2">
                    <p class="text-[10px] font-mono font-bold text-stone-400">${formatTime(projectTotal)}</p>
                    ${p.note ? `<span class="text-[10px] text-rose-300 font-bold italic truncate max-w-[120px]">"${p.note.replace(/\n/g, ' ')}"</span>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="deleteProject(${p.id})" class="p-2 text-stone-200 hover:text-red-400 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        compactList.appendChild(item);
    });

    lucide.createIcons();
}

function renderStats() {
    const daily = {}; 
    let total = 0;
    sessions.forEach(s => { 
        daily[s.date] = (daily[s.date] || 0) + s.seconds; 
        total += s.seconds; 
    });
    document.getElementById('total-time-display').innerText = formatTime(total);
    const statsContainer = document.getElementById('daily-stats');
    statsContainer.innerHTML = '';
    const sortedDates = Object.keys(daily).sort((a,b) => b.localeCompare(a)).slice(0, 7);
    if (sortedDates.length === 0) {
        statsContainer.innerHTML = '<p class="text-center text-stone-300 text-xs py-4">Noch keine Daten für die Statistik.</p>';
        return;
    }
    sortedDates.forEach(date => {
        const sec = daily[date];
        const dayName = new Date(date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' });
        const row = document.createElement('div');
        row.className = 'flex flex-col gap-1';
        row.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-[10px] font-black text-stone-400 uppercase">${dayName}</span>
                <span class="text-xs font-bold text-stone-600">${formatTime(sec)}</span>
            </div>
            <div class="w-full bg-stone-100 rounded-full h-2">
                <div class="bg-rose-400 h-2 rounded-full" style="width: ${Math.min((sec / 3600) * 10, 100)}%"></div>
            </div>
        `;
        statsContainer.appendChild(row);
    });
}

window.onload = init;
