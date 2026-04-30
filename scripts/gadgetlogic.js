import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBkcY2_W3oge3KjBCtpv5y9i2mPWlVl5nE",
    authDomain: "whiteroom-d7dc5.firebaseapp.com",
    projectId: "whiteroom-d7dc5",
    storageBucket: "whiteroom-d7dc5.firebasestorage.app",
    messagingSenderId: "21894988618",
    appId: "1:21894988618:web:bcffe128cc8a633789f7b3",
    measurementId: "G-GG49JZYVEM"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- USEFULS ---
const calendarcontainer = document.getElementById("cal-gadget");
const diasSemana = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

// --- IMPORTED LOGIC ---
import { hideLoader } from "./mainlogic.js";

// --- PROGRESS LOGIC ---
const getTodayID = () => new Date().toISOString().split('T')[0];

async function saveProgress(userId, slots) {
    // Reference: schedules -> usuario -> dailyProgress -> fechaHoy
    const progressRef = doc(db, "schedules", userId, "dailyProgress", getTodayID());
    
    try {
        await setDoc(progressRef, { 
            completedCount: increment(slots) 
        }, { merge: true });
        
        console.log("Progreso actualizado");
    } catch (error) {
        console.error("Error al guardar progreso:", error);
    }
}

// --- FUNCTIONS ---
function createElement(type, parent, classname) {
    const element = document.createElement(type);
    if (classname) {
        element.className = classname;
    }
    parent.appendChild(element);
    return element;
}

function formatHour(index) {
    const totalMinutes = 330 + (index * 30);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getCurrentSlot() {
    const now = new Date();
    const minutesSinceMidnight = (now.getHours() * 60) + now.getMinutes();
    return (minutesSinceMidnight - 330) / 30;
}

function renderTimeline(weekData, completedCount, userId) {
    calendarcontainer.innerHTML = "<h1>CALENDAR</h1>";
    const gadgetContainer = createElement("section", calendarcontainer, "⚙️");

    const dayIndex = (new Date().getDay() + 6) % 7; 
    const dia = diasSemana[dayIndex];

    const dayDiv = createElement("div", gadgetContainer, "🗓️");
    dayDiv.innerHTML = `<p>${dia}</p>`;
    const activityWrapper = createElement("div", dayDiv, "⏰");

    let blocks = [];
    let currentBlock = null;

    // --- PROCESAMIENTO DE SLOTS ---
    for (let h = 0; h < 48; h++) {
        const slotIdx = (h * 7) + dayIndex;
        const activity = weekData[`slot_${slotIdx}`] || "";

        if (activity === "") {
            if (currentBlock) {
                currentBlock.endH = h;
                blocks.push(currentBlock);
                currentBlock = null;
            }
            continue;
        }

        if (!currentBlock) {
            currentBlock = { name: activity, startH: h };
        } else if (currentBlock.name !== activity) {
            currentBlock.endH = h;
            blocks.push(currentBlock);
            currentBlock = { name: activity, startH: h };
        }
    }
    if (currentBlock) { currentBlock.endH = 48; blocks.push(currentBlock); }

    // --- APLICACIÓN DE REGLAS (FILTRADO Y TOLERANCIA) ---
    const currentSlot = getCurrentSlot();
    const tolerance = 10 / 30; // 10 min

    // 1. Filtrar por contador
    const blocksFiltradosPorContador = blocks.filter(b => b.endH > completedCount);

    // 2. Filtrar por tiempo
    const pendingBlocks = blocksFiltradosPorContador.filter(b => currentSlot <= (b.endH + tolerance));

    if (pendingBlocks.length > 0) {
        pendingBlocks.forEach((b, index) => {
            // Creamos el botón manualmente para asegurar la estructura exacta
            const btn = createElement("button", activityWrapper);
            
            // Estructura interna: P para el nombre, SECTION para la derecha
            btn.innerHTML = `
                <p>${b.name}</p>
                <section>
                    <img src="img/clock.png" width="22px">
                    <p style="font-size: 15px;">${formatHour(b.startH)} - ${formatHour(b.endH)}</p>
                </section>
            `;

            if (index === 0) {
                const diezMinAntes = b.endH - (10 / 30);
                const ventanaAbierta = currentSlot >= diezMinAntes && currentSlot <= (b.endH + tolerance);

                if (ventanaAbierta) {
                    const slotsParaSumar = b.endH - completedCount;
                    btn.onclick = () => saveProgress(userId, slotsParaSumar);
                    btn.style.cursor = "pointer";
                } else {
                    btn.style.opacity = "0.7";
                    btn.style.cursor = "wait";
                    btn.title = "Espera a que la actividad esté por finalizar.";
                }
            } else {
                btn.style.opacity = "0.3";
                btn.style.cursor = "not-allowed";
            }
        });
    } else {
        dayDiv.innerHTML += `<p style="font-size: 14px; padding: 10px; color: #888;">No hay actividades pendientes.</p>`;
    }

    hideLoader();
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "schedules", user.uid);
        const docSnap = await getDoc(docRef);

        // PROGRESS
        const progressRef = doc(db, "schedules", user.uid, "dailyProgress", getTodayID());
        const progressSnap = await getDoc(progressRef);
        let completedCount = progressSnap.exists() ? progressSnap.data().completedCount : 0;

        if (docSnap.exists()) {
            const data = docSnap.data().weekData;
            renderTimeline(data, completedCount, user.uid);
        } else {
            calendarcontainer.innerHTML = "<h1>No schedule found.</h1>";
        }
    }
    hideLoader();
});