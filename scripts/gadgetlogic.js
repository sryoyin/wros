import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, increment, collection, getDocs, query, where, documentId } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const progcontainer = document.getElementById("prog-gadget");
const dailyprog = document.getElementById("dailybar");
const weeklyprog = document.getElementById("weeklybar");
const diasSemana = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const getWeeklyRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return { start: formatDate(monday), end: formatDate(sunday) };
};

// --- IMPORTED LOGIC ---
import { hideLoader } from "./mainlogic.js";

// --- PROGRESS LOGIC ---
const getTodayID = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

async function saveProgress(userId, slotsobv, counter, parent) {
    // Reference: schedules -> usuario -> dailyProgress -> fechaHoy
    const progressRef = doc(db, "schedules", userId, "dailyProgress", getTodayID());
    parent.style.pointerEvents = "none";
    parent.style.opacity = "0";
    parent.style.visibility = "hidden";
    
    try {
        await setDoc(progressRef, { 
            "completedCount": {
                [0]: increment(slotsobv), 
                [1]: increment(counter) 
            }
        }, { merge: true });
        
        console.log("Progreso actualizado");
        location.reload();
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

function getLocalWeekNumber(d) {
    // Copiamos la fecha para no modificar la original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // El lunes es el primer día de la semana en este cálculo
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { week: weekNo, year: d.getUTCFullYear() };
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
    const blocksFiltradosPorContador = blocks.filter(b => b.endH > completedCount[0]);

    // 2. Filtrar por tiempo
    const pendingBlocks = blocksFiltradosPorContador.filter(b => currentSlot <= (b.endH + tolerance));

    if (pendingBlocks.length > 0) {
        pendingBlocks.forEach((b, index) => {
            const btn = createElement("button", activityWrapper);

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
                    const slotsobviar = b.endH - completedCount[0];
                    const slotsParaSumar = b.endH - b.startH;
                    btn.onclick = () => saveProgress(userId, slotsobviar, slotsParaSumar, btn);
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
}

function renderProgress(list, collect) {
    const dailypercentage = (list[1] * 100) / 33;
    const weeklypercentage = (collect * 100) / 231;

    dailyprog.style.width = `${dailypercentage}%`;
    weeklyprog.style.width = `${weeklypercentage}%`;

    dailyprog.parentElement.parentElement.firstElementChild.lastElementChild.textContent = `${Math.floor(dailypercentage)}%`;
    weeklyprog.parentElement.parentElement.firstElementChild.lastElementChild.textContent = `${Math.floor(weeklypercentage)}%`;
}

async function getWeeklyTotal(userId) {
    const { start, end } = getWeeklyRange();
    const progressColRef = collection(db, "schedules", userId, "dailyProgress");
    const q = query(
        progressColRef,
        where(documentId(), ">=", start),
        where(documentId(), "<=", end)
    );

    const querySnapshot = await getDocs(q);
    let totalWeekly = 0;

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.completedCount) {
            const valorSemanal = data.completedCount[1] || 0;
            totalWeekly += Number(valorSemanal);
        }
    });
    
    return totalWeekly;
}

async function saveData(userId, data) {
    const noteRef = doc(db, "users", userId);

    try {
        await setDoc(noteRef, { 
            "notes": data
        }, { merge: true });
        alert("Notas actualizadas!");
    } catch (error) {
        console.error("Error al guardar progreso:", error);
    }
}

function renderNotes(data, userId) {
    const container = document.getElementById("note-gadget-container");
    const send = document.getElementById("note-gadget-updater")

    container.value = data;

    send.onclick = () => saveData(userId, container.value)
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // DAY LOGIC
        const hoy = getLocalWeekNumber(new Date());
        const docIdActual = `${hoy.year}_${hoy.week}`;

        const docRef = doc(db, "schedules", user.uid, "scheduled", docIdActual);
        const docSnap = await getDoc(docRef);

        // PROGRESS DAY
        const progressRef = doc(db, "schedules", user.uid, "dailyProgress", getTodayID());
        const progressSnap = await getDoc(progressRef);
        let completedCount = progressSnap.exists() ? progressSnap.data().completedCount : [0, 0];

        // PROGRESS WEEK
        const totalWeekly = await getWeeklyTotal(user.uid);

        // NOTE LOGIC
        const noteRef = doc(db, "users", user.uid,);
        const noteSnap = await getDoc(noteRef);
        const noteData = noteSnap.data()?.notes || "";

        if (docSnap.exists()) {
            const data = docSnap.data().weekData;
            renderTimeline(data, completedCount, user.uid);
            renderProgress(completedCount, totalWeekly);
        } else {
            calendarcontainer.innerHTML = `
                <h1>CALENDAR</h1>
                <h2>No schedule found</h2>
            `;
            progcontainer.innerHTML = `
                <h1>PROGRESS</h1>
                <h2>No progress made yet</h2>
            `;
        }
        renderNotes(noteData, user.uid);
    }
    hideLoader();
});