// =====================================================
// STATISTIK FUNKTIONEN
// =====================================================

let currentStatsMonth = new Date();

/**
 * Rendert die Statistik-Ansicht mit Kalender und Timeline
 */
function renderStats() {
    // Gesamtzeit berechnen
    const total = sessions.reduce((sum, s) => sum + s.seconds, 0);
    const totalDisplay = document.getElementById('total-time-display');
    if (totalDisplay) {
        totalDisplay.innerText = formatTime(total);
    }

    const statsContainer = document.getElementById('daily-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = '';

    // Gruppiere Sessions nach Datum und Projekt
    const dailyData = {};
    sessions.forEach(s => {
        if (!dailyData[s.date]) {
            dailyData[s.date] = {};
        }
        if (!dailyData[s.date][s.projectId]) {
            dailyData[s.date][s.projectId] = 0;
        }
        dailyData[s.date][s.projectId] += s.seconds;
    });

    // === MONATSKALENDER ===
    renderMonthCalendar(statsContainer, dailyData);

    // Trennlinie
    const divider = document.createElement('div');
    divider.className = 'border-t border-stone-200 my-6';
    statsContainer.appendChild(divider);

    // === TIMELINE LISTE ===
    renderTimeline(statsContainer, dailyData);

    // Lucide Icons aktualisieren
    if (window.lucide) {
        lucide.createIcons();
    }
}

/**
 * Rendert den Monatskalender
 */
function renderMonthCalendar(container, dailyData) {
    const monthNav = document.createElement('div');
    monthNav.className = 'flex justify-between items-center mb-4';

    const monthName = currentStatsMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

    monthNav.innerHTML = `
        <button onclick="changeStatsMonth(-1)" class="p-2 hover:bg-stone-100 rounded-lg transition">
            <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </button>
        <h3 class="font-bold text-stone-700">${monthName}</h3>
        <button onclick="changeStatsMonth(1)" class="p-2 hover:bg-stone-100 rounded-lg transition">
            <i data-lucide="chevron-right" class="w-5 h-5"></i>
        </button>
    `;
    container.appendChild(monthNav);

    // Kalender-Grid erstellen
    const calendar = document.createElement('div');
    calendar.className = 'grid grid-cols-7 gap-2';

    // Wochentag-Header
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'text-center text-[10px] font-bold text-stone-400 uppercase pb-2';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Erster Tag des Monats
    const firstDay = new Date(currentStatsMonth.getFullYear(), currentStatsMonth.getMonth(), 1);
    const lastDay = new Date(currentStatsMonth.getFullYear(), currentStatsMonth.getMonth() + 1, 0);

    // Offset für ersten Tag (Montag = 0)
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    // Leere Zellen vor dem ersten Tag
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        calendar.appendChild(empty);
    }

    // Tage des Monats
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const year = currentStatsMonth.getFullYear();
        const month = currentStatsMonth.getMonth() + 1;
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = dailyData[dateString];

        const dayCell = document.createElement('button');
        dayCell.className = 'aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative p-1 transition-all';

        if (dayData) {
            const totalSeconds = Object.values(dayData).reduce((sum, s) => sum + s, 0);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const barHeight = Math.min((totalSeconds / 7200) * 100, 100);

            dayCell.className += ' bg-white border-2 border-rose-200 hover:border-rose-400 cursor-pointer';
            dayCell.onclick = () => scrollToDate(dateString);

            dayCell.innerHTML = `
                <div class="font-bold text-stone-800 mb-1">${day}</div>
                <div class="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-1">
                    <div class="h-full bg-rose-400 rounded-full" style="width: ${barHeight}%"></div>
                </div>
                <div class="text-[7px] font-bold text-rose-600 whitespace-nowrap">${hours > 0 ? hours + 'h' : ''} ${minutes}m</div>
            `;
        } else {
            dayCell.className += ' bg-stone-50 text-stone-400 cursor-default';
            dayCell.innerHTML = `<div class="font-medium">${day}</div>`;
        }

        if (dateString === getTodayString()) {
            dayCell.className += ' ring-2 ring-rose-500';
        }

        calendar.appendChild(dayCell);
    }

    container.appendChild(calendar);
}

/**
 * Rendert die Timeline-Liste
 */
function renderTimeline(container, dailyData) {
    const timelineTitle = document.createElement('h3');
    timelineTitle.className = 'text-xs font-black text-stone-400 uppercase tracking-widest mb-4';
    timelineTitle.textContent = 'Alle Aktivitäten';
    container.appendChild(timelineTitle);

    const sortedDates = Object.keys(dailyData).sort((a, b) => b.localeCompare(a));

    if (sortedDates.length === 0) {
        container.innerHTML += '<p class="text-center text-stone-300 text-xs py-4">Noch keine Daten für die Statistik.</p>';
        return;
    }

    sortedDates.forEach(date => {
        const dayData = dailyData[date];
        const totalSeconds = Object.values(dayData).reduce((sum, s) => sum + s, 0);

        const dateObj = new Date(date);
        const dateLabel = dateObj.toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });

        const dayCard = document.createElement('div');
        dayCard.id = `timeline-${date}`;
        dayCard.className = 'bg-white rounded-xl p-4 mb-3 border border-stone-100';

        // Finde alle Sessions für diesen Tag
        const daySessions = sessions
            .filter(s => s.date === date)
            .sort((a, b) => (b.time || '00:00').localeCompare(a.time || '00:00'));

        let sessionsHTML = '';
        daySessions.forEach(session => {
            const project = projects.find(p => p.id === session.projectId);
            const projectName = project ? project.name : 'Gelöschtes Projekt';
            const displayTime = session.time || '--:--';

            sessionsHTML += `
                <div class="flex justify-between items-center py-3 border-b border-stone-50 last:border-0">
                    <div class="flex items-center gap-3">
                        <div class="text-[10px] font-black text-stone-300 w-8">${displayTime}</div>
                        <div>
                            <div class="text-sm font-bold text-stone-700">${projectName}</div>
                            <div class="text-[10px] text-stone-400 font-bold">${formatTime(session.seconds)}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="openEditSessionModal(${session.id})" class="p-2 text-stone-400 hover:text-rose-500 transition-colors">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button id="delete-btn-${session.id}" onclick="confirmDelete(${session.id}, this)" 
                            class="p-2 text-stone-300 hover:text-red-500 transition-all flex items-center gap-1 overflow-hidden whitespace-nowrap">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                            <span class="delete-label hidden text-[10px] font-black uppercase">Sicher?</span>
                        </button>
                    </div>
                </div>
            `;
        });

        dayCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <p class="text-xs font-black text-stone-400 uppercase">${dateLabel}</p>
                    <p class="text-lg font-bold text-stone-800">${formatTime(totalSeconds)}</p>
                </div>
            </div>
            <div class="space-y-1 border-t border-stone-100 pt-1">
                ${sessionsHTML}
            </div>
        `;

        container.appendChild(dayCard);
    });
}

/**
 * Zwei-Stufen-Löschung für Sessions in der Timeline
 */
let deleteTimeouts = {};

function confirmDelete(sessionId, btn) {
    const label = btn.querySelector('.delete-label');
    
    // Falls bereits im "Sicher?"-Modus -> Löschen!
    if (btn.classList.contains('confirming')) {
        clearTimeout(deleteTimeouts[sessionId]);
        
        // Robustes Filtern: Wir stellen sicher, dass wir nur den EINEN Eintrag entfernen
        const index = sessions.findIndex(s => String(s.id) === String(sessionId));
        if (index !== -1) {
            sessions.splice(index, 1);
            saveToStorage();
            renderStats();
            renderProjects();
        }
        return;
    }
    
    // In "Sicher?"-Modus wechseln
    btn.classList.add('confirming', 'bg-red-50', 'text-red-600', 'rounded-lg', 'px-3');
    btn.classList.remove('text-stone-300');
    if (label) label.classList.remove('hidden');
    
    // Nach 3 Sekunden zurücksetzen
    deleteTimeouts[sessionId] = setTimeout(() => {
        if (btn) {
            btn.classList.remove('confirming', 'bg-red-50', 'text-red-600', 'rounded-lg', 'px-3');
            btn.classList.add('text-stone-300');
            if (label) label.classList.add('hidden');
        }
    }, 3000);
}

/**
 * Wechselt den angezeigten Monat
 */
function changeStatsMonth(direction) {
    currentStatsMonth.setMonth(currentStatsMonth.getMonth() + direction);
    renderStats();
}

/**
 * Scrollt zu einem bestimmten Datum in der Timeline
 */
function scrollToDate(dateString) {
    const element = document.getElementById(`timeline-${dateString}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-rose-300');
        setTimeout(() => {
            element.classList.remove('ring-2', 'ring-rose-300');
        }, 2000);
    }
}
