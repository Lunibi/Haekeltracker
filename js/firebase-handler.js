// =====================================================
// FIREBASE KONFIGURATION UND UNTERSTÜTZUNG
// =====================================================

// Firebase-Konfiguration von der Konsole
const firebaseConfig = {
    apiKey: "AIzaSyDduC5L1SWqCBL-2KdN-2-K7q7Qj6OoDIw",
    authDomain: "haekeltracker.firebaseapp.com",
    projectId: "haekeltracker",
    storageBucket: "haekeltracker.firebasestorage.app",
    messagingSenderId: "40221858555",
    appId: "1:40221858555:web:eb7e913c355337dcc02e5e"
};

// Diese Variablen werden in firebase-handler.js befüllt
let db = null;

/**
 * Initialisiert Firebase und Firestore
 */
async function initFirebase() {
    try {
        // Firebase Apps importieren (via CDN für einfaches HTML/JS)
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getFirestore, doc, setDoc, getDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        console.log("🔥 Firebase verbunden!");

        // Echtzeit-Update: Lausche auf Änderungen in der Cloud
        onSnapshot(doc(db, "user_data", "main"), (docSnap) => {
            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                console.log("☁️ Daten aus der Cloud empfangen");

                // Nur aktualisieren, wenn Cloud-Daten neuer oder anders sind
                // (Einfache Version: Cloud gewinnt immer)
                projects = cloudData.projects || [];
                sessions = cloudData.sessions || [];
                focusedProjectId = cloudData.focusedProjectId || (projects[0]?.id || null);

                // UI aktualisieren
                renderProjects();
                if (document.getElementById('view-stats').style.display !== 'none') {
                    renderStats();
                }
            } else {
                console.log("ℹ️ Keine Cloud-Daten gefunden, starte mit leeren Daten.");
                // Falls Cloud leer, pushen wir einmal den aktuellen LocalStorage Stand hoch
                saveToCloud();
            }
        });

    } catch (error) {
        console.error("❌ Firebase Fehler:", error);
    }
}

/**
 * Speichert den aktuellen Stand in die Firebase Cloud
 */
async function saveToCloud() {
    if (!db) return;

    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

        const dataToSave = {
            projects: projects,
            sessions: sessions,
            focusedProjectId: focusedProjectId,
            lastUpdated: new Date().toISOString()
        };

        await setDoc(doc(db, "user_data", "main"), dataToSave);
        console.log("✅ Erfolgreich in Cloud gespeichert");
    } catch (error) {
        console.error("❌ Fehler beim Cloud-Speichern:", error);
    }
}
