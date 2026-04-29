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

// --- IMPORTED LOGIC ---
import { hideLoader } from "./mainlogic";

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

function renderTimeline(weekData) {
    calendarcontainer.innerHTML = "<h1>CALENDAR</h1>";
    const gadgetContainer = createElement("section", calendarcontainer, "⚙️");

    const dayIndex = (new Date().getDay() + 6) % 7; 
    const dia = diasSemana[dayIndex];

    const dayDiv = document.createElement("div");
    dayDiv.className = "🗓️";
    dayDiv.innerHTML = `<p>${dia}</p>`;

    const activityWrapper = createElement("div", dayDiv, "⏰");

    let blocks = [];
    let currentBlock = null;

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

    if (currentBlock) {
        currentBlock.endH = 48;
        blocks.push(currentBlock);
    }

    if (blocks.length > 0) {
        blocks.forEach(b => {
            const btn = document.createElement("button");
            btn.innerHTML = `
                <p>${b.name}</p>
                <section>
                    <img src="img/clock.png" width="22px">
                    <p style="font-size: 15px;">${formatHour(b.startH)} - ${formatHour(b.endH)}</p>
                </section>
            `;
            activityWrapper.appendChild(btn);
        });
        gadgetContainer.appendChild(dayDiv);
    } else {
        dayDiv.innerHTML += `<p style="font-size: 14px; padding: 10px; color: #888;">No hay actividades para hoy.</p>`;
        gadgetContainer.appendChild(dayDiv);
    }
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
    hideLoader();
});