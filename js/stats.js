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
    document.getElementById('total-time-display').innerText = formatTime(total);
    
    const statsContainer = document.getElementById('daily-stats');
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
    lucide.createIcons();
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
        const date = new Date(currentStatsMonth.getFullYear(), currentStatsMonth.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const dayData = dailyData[dateString];
        
        const dayCell = document.createElement('div');
        dayCell.className = 'aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative';
        
        if (dayData) {
            // Es gibt Daten für diesen Tag
            const totalSeconds = Object.values(dayData).reduce((sum, s) => sum + s, 0);
            const hours = totalSeconds / 3600;
            
            // Intensität basierend auf Stunden (0-4+ Stunden)
            let intensity = 'bg-stone-100';
            if (hours >= 4) intensity = 'bg-rose-400 text-white font-bold';
            else if (hours >= 3) intensity = 'bg-rose-300 text-white font-bold';
            else if (hours >= 2) intensity = 'bg-rose-200 text-rose-800 font-bold';
            else if (hours >= 1) intensity = 'bg-rose-100 text-rose-700';
            
            dayCell.className += ` ${intensity} cursor-pointer`;
            dayCell.onclick = () => scrollToDate(dateString);
        } else {
            dayCell.className += ' bg-stone-50 text-stone-400';
        }
        
        // Heutiger Tag markieren
        const today = new Date().toISOString().split('T')[0];
        if (dateString === today) {
            dayCell.className += ' ring-2 ring-rose-500';
        }
        
        dayCell.textContent = day;
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
        
        let projectsHTML = '';
        Object.entries(dayData).forEach(([projectId, seconds]) => {
            const project = projects.find(p => p.id === parseInt(projectId));
            const projectName = project ? project.name : 'Gelöschtes Projekt';
            
            projectsHTML += `
                <div class="flex justify-between items-center py-1">
                    <span class="text-sm text-stone-600">${projectName}</span>
                    <span class="text-xs font-bold text-stone-800">${formatTime(seconds)}</span>
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
            <div class="space-y-1 border-t border-stone-100 pt-3">
                ${projectsHTML}
            </div>
        `;
        
        container.appendChild(dayCard);
    });
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
        // Kurzes Highlight
        element.classList.add('ring-2', 'ring-rose-300');
        setTimeout(() => {
            element.classList.remove('ring-2', 'ring-rose-300');
        }, 2000);
    }
}
