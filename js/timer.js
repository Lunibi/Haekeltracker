// =====================================================
// TIMER FUNKTIONEN
// =====================================================

/**
 * Startet den Timer für ein Projekt
 * @param {number} id - Projekt-ID
 */
function startTimer(id) {
    if (activeTimerProjectId) {
        // Falls ein anderer Timer läuft, stoppe ihn erst
        stopTimer();
    }
    activeTimerProjectId = id;
    timerStartTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 1000);
    renderProjects();
}

/**
 * Stoppt den laufenden Timer und speichert die Zeit
 */
function stopTimer() {
    if (!activeTimerProjectId || !timerStartTime) return;
    
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    logSession(activeTimerProjectId, elapsed);
    
    clearInterval(timerInterval);
    activeTimerProjectId = null;
    timerStartTime = null;
    timerInterval = null;
    renderProjects();
}

/**
 * Aktualisiert die Timer-Anzeige jede Sekunde
 */
function updateTimerDisplay() {
    if (!activeTimerProjectId || !timerStartTime) return;
    
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    const display = document.getElementById(`timer-display-${activeTimerProjectId}`);
    if (display) {
        display.innerText = formatTime(elapsed);
    }
}

/**
 * Speichert eine Zeit-Session
 * @param {number} projectId - Projekt-ID
 * @param {number} seconds - Anzahl Sekunden
 * @param {string} date - Optional: Datum im Format YYYY-MM-DD (default: heute)
 */
function logSession(projectId, seconds, date = null) {
    const sessionDate = date || new Date().toISOString().split('T')[0];
    sessions.push({
        projectId: projectId,
        seconds: seconds,
        date: sessionDate
    });
    saveToStorage();
}

/**
 * Formatiert Sekunden in lesbares Format (z.B. "2h 34m 12s")
 * @param {number} totalSeconds - Anzahl Sekunden
 * @returns {string} Formatierte Zeit
 */
function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
}

/**
 * Berechnet die Gesamtzeit für ein Projekt
 * @param {number} projectId - Projekt-ID
 * @returns {number} Gesamtzeit in Sekunden
 */
function getTotalTime(projectId) {
    return sessions
        .filter(s => s.projectId === projectId)
        .reduce((sum, s) => sum + s.seconds, 0);
}
