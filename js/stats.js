// =====================================================
// STATISTIK FUNKTIONEN
// =====================================================

/**
 * Rendert die Statistik-Ansicht mit täglichen Aktivitäten
 */
function renderStats() {
    // Sammle Sessions nach Datum
    const daily = {};
    let total = 0;
    
    sessions.forEach(s => { 
        daily[s.date] = (daily[s.date] || 0) + s.seconds; 
        total += s.seconds; 
    });
    
    // Zeige Gesamtzeit
    document.getElementById('total-time-display').innerText = formatTime(total);
    
    const statsContainer = document.getElementById('daily-stats');
    statsContainer.innerHTML = '';
    
    // Sortiere Daten nach Datum (neueste zuerst) und nimm die letzten 7 Tage
    const sortedDates = Object.keys(daily)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 7);
    
    // Falls keine Daten vorhanden
    if (sortedDates.length === 0) {
        statsContainer.innerHTML = '<p class="text-center text-stone-300 text-xs py-4">Noch keine Daten für die Statistik.</p>';
        return;
    }
    
    // Erstelle für jeden Tag einen Balken
    sortedDates.forEach(date => {
        const sec = daily[date];
        const dayName = new Date(date).toLocaleDateString('de-DE', { 
            weekday: 'short', 
            day: '2-digit' 
        });
        
        const row = document.createElement('div');
        row.className = 'flex flex-col gap-1';
        
        // Balken-Breite: Maximal 100% bei 2 Stunden (7200 Sekunden)
        const barWidth = Math.min((sec / 7200) * 100, 100);
        
        row.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-[10px] font-black text-stone-400 uppercase">${dayName}</span>
                <span class="text-xs font-bold text-stone-800">${formatTime(sec)}</span>
            </div>
            <div class="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden">
                <div class="h-full bg-rose-400 rounded-full" style="width: ${barWidth}%"></div>
            </div>
        `;
        
        statsContainer.appendChild(row);
    });
}
