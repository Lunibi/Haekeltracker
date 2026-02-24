# 🧶 Häkel-Tracker

Ein einfacher Zeit-Tracker für Häkelprojekte mit Timer-Funktion, Notizen und Statistiken.

## 📁 Dateistruktur

```
häkel-tracker/
├── index.html          # Haupt-HTML-Datei (die musst du im Browser öffnen)
├── styles.css          # Alle Styles
├── js/                 # JavaScript-Dateien
│   ├── app.js         # App-Initialisierung (wird als letztes geladen)
│   ├── data.js        # Datenstrukturen und globale Variablen
│   ├── storage.js     # LocalStorage-Verwaltung (Speichern/Laden/Import/Export)
│   ├── timer.js       # Timer-Funktionen (Start/Stop/Zeit-Berechnung)
│   ├── modals.js      # Alle Modal-Funktionen (Öffnen/Schließen/Speichern)
│   ├── projects.js    # Projekt-Verwaltung (Erstellen/Löschen/Status ändern)
│   ├── stats.js       # Statistik-Berechnungen
│   └── ui.js          # UI-Rendering (Projekt-Karten erstellen)
└── README.md          # Diese Datei
```

## 🚀 Installation & Verwendung

### Lokal verwenden:
1. Lade alle Dateien herunter
2. Öffne `index.html` in deinem Browser
3. Fertig! Die App speichert alles im Browser (LocalStorage)

### Auf GitHub hochladen:

#### Variante 1: Alles in main (einfachste Methode)
```bash
# Alle Dateien einfach in dein Repository hochladen:
# - index.html
# - styles.css
# - js/ (ganzer Ordner mit allen .js Dateien)
# - README.md
```

#### Variante 2: Mit GitHub Pages (zum Hosten)
1. Erstelle ein neues Repository auf GitHub
2. Lade alle Dateien hoch (Struktur beibehalten!)
3. Gehe zu Settings → Pages
4. Wähle "main" Branch als Source
5. Deine App ist dann unter `https://dein-username.github.io/repo-name/` erreichbar

## 📝 Funktionen

- ⏱️ Timer zum Tracken der Häkelzeit
- ➕ Manuelles Hinzufügen von Zeit
- 📊 Statistiken über die letzten 7 Tage
- 📝 Notizen zu jedem Projekt
- ✅ Projekte als "abgeschlossen" markieren
- 💾 Export/Import-Funktion für Backup
- 🎯 Fokus-Projekt prominent anzeigen

## 🔧 Änderungen vornehmen

Die Dateien sind jetzt sauber getrennt und kommentiert. Wenn du etwas ändern möchtest:

- **Farben ändern**: `styles.css`
- **Text ändern**: `index.html`
- **Timer-Logik**: `js/timer.js`
- **Projekt-Verwaltung**: `js/projects.js`
- **Speichern/Laden**: `js/storage.js`
- **Wie Projekte aussehen**: `js/ui.js`

Jede Funktion ist kommentiert, damit man versteht was sie macht!

## 💡 Wichtig

Die Reihenfolge der JavaScript-Dateien in `index.html` ist wichtig! Sie müssen so geladen werden:
1. `data.js` - Zuerst die Variablen
2. `storage.js` - Dann Speicher-Funktionen
3. `timer.js` - Timer-Funktionen
4. `modals.js` - Modal-Funktionen
5. `projects.js` - Projekt-Funktionen
6. `stats.js` - Statistik-Funktionen
7. `ui.js` - UI-Rendering
8. `app.js` - Zuletzt die Initialisierung

## 📦 Externe Bibliotheken

Die App nutzt:
- Tailwind CSS (vom CDN)
- Lucide Icons (vom CDN)

Diese werden automatisch geladen, du musst nichts installieren!
