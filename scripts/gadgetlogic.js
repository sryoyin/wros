import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- FUNCTIONS ---
function createElement(type, parent, classname) {
    const element = document.createElement(type);
    if (classname) {
        element.className = classname;
    }
    parent.appendChild(element);
    return element;
}

function formatHour(hOffset) {
    let hour = (hOffset + 5) % 24;
    return `${hour.toString().padStart(2, '0')}:30`;
}

function renderTimeline(weekData) {
    calendarcontainer.innerHTML = "<h1>CALENDAR</h1>";
    const gadgetContainer = createElement("section", calendarcontainer, "⚙️");

    diasSemana.forEach((dia, dayIndex) => {
        const dayDiv = document.createElement("div");
        dayDiv.className = "🗓️";
        dayDiv.innerHTML = `<p>${dia}</p>`;

        const activityWrapper = createElement("div", dayDiv);
        activityWrapper.className = "⏰";

        let blocks = [];
        let currentBlock = null;

        // Recorremos las 24 horas del día actual
        for (let h = 0; h < 24; h++) {
            // CÁLCULO CRÍTICO: En schedulelogic usas (i * 7) + j
            // h es la hora (i), dayIndex es el día (j)
            const slotIdx = (h * 7) + dayIndex;
            const activity = weekData[`slot_${slotIdx}`] || "";

            if (activity === "") {
                // Si hay un bloque activo y llegamos a un espacio vacío, lo cerramos
                if (currentBlock) {
                    currentBlock.endH = h;
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
                continue;
            }

            if (!currentBlock) {
                // Iniciamos un nuevo bloque
                currentBlock = { name: activity, startH: h };
            } else if (currentBlock.name !== activity) {
                // Si la actividad cambia, cerramos el anterior y empezamos uno nuevo
                currentBlock.endH = h;
                blocks.push(currentBlock);
                currentBlock = { name: activity, startH: h };
            }
            // Si la actividad es la misma, el bucle sigue "apilando" sin hacer nada
        }

        // Si al terminar el día quedó un bloque abierto, lo cerramos en la hora 24
        if (currentBlock) {
            currentBlock.endH = 24;
            blocks.push(currentBlock);
        }

        // Solo añadimos el día al contenedor si tiene actividades
        if (blocks.length > 0) {
            blocks.forEach(b => {
                const btn = createElement("button", activityWrapper);
                btn.innerHTML = `
                    <p>${b.name}</p>
                    <section>
                        <img src="img/clock.png" width="22px">
                        <p style="font-size: 15px;">${formatHour(b.startH)} - ${formatHour(b.endH)}</p>
                    </section>
                `;
            });
            gadgetContainer.appendChild(dayDiv);
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "schedules", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data().weekData;
            renderTimeline(data);
        } else {
            calendarcontainer.innerHTML = "<h1>No schedule found.</h1>";
        }
    }
});