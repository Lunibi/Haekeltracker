// =====================================================
// TIMER FUNKTIONEN
// =====================================================

/**
 * Gibt das heutige Datum im Format YYYY-MM-DD zurück (lokale Zeit!)
 * @returns {string} Datum als String
 */
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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
    timerStartTimeStr = getTimeString(); // Speichere die exakte Start-Uhrzeit
    timerInterval = setInterval(updateTimerDisplay, 1000);
    renderProjects();
}

/**
 * Stoppt den laufenden Timer und speichert die Zeit
 */
function stopTimer() {
    if (!activeTimerProjectId || !timerStartTime) return;
    
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    logSession(activeTimerProjectId, elapsed, getTodayString(), timerStartTimeStr);
    
    clearInterval(timerInterval);
    activeTimerProjectId = null;
    timerStartTime = null;
    timerStartTimeStr = null;
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
 * Gibt die aktuelle Uhrzeit im Format HH:mm zurück
 * @returns {string} Uhrzeit als String
 */
function getTimeString() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Speichert eine Zeit-Session
 * @param {number} projectId - Projekt-ID
 * @param {number} seconds - Anzahl Sekunden
 * @param {string} date - Optional: Datum im Format YYYY-MM-DD (default: heute)
 * @param {string} time - Optional: Uhrzeit im Format HH:mm (default: jetzt)
 */
function logSession(projectId, seconds, date = null, time = null) {
    const sessionDate = date || getTodayString();
    const sessionTime = time || getTimeString();
    
    sessions.push({
        id: Date.now() + Math.floor(Math.random() * 1000), // Eindeutige ID
        projectId: projectId,
        seconds: seconds,
        date: sessionDate,
        time: sessionTime
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
