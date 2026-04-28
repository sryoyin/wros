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

function renderTimeline(weekData) {
    calendarcontainer.innerHTML = "<h1>CALENDAR</h1>";
    const gadgetContainer = createElement("section", calendarcontainer, "⚙️");

    diasSemana.forEach((dia, dayIndex) => {
        // Crear el div del día 🗓️
        const dayDiv = createElement("div", gadgetContainer, "🗓️");
        dayDiv.innerHTML = `<p>${dia}</p>`;

        const activityWrapper = createElement("div", dayDiv, "⏰");

        let currentBlocks = [];
        let startHour = 0;

        for (let hour = 0; hour <= 24; hour++) {
            const slotKey = `slot_${(dayIndex * 24) + hour}`;
            const activity = weekData[slotKey] || "";

            if (hour > 0) {
                const prevSlotKey = `slot_${(dayIndex * 24) + (hour - 1)}`;
                const prevActivity = weekData[prevSlotKey] || "";

                if (activity !== prevActivity || hour === 24) {
                    if (prevActivity !== "") {
                        currentBlocks.push({
                            name: prevActivity,
                            start: formatTime(startHour),
                            end: formatTime(hour)
                        });
                    }
                    startHour = hour;
                }
            }
        }

        if (currentBlocks.length > 0) {
            currentBlocks.forEach(block => {
                const btn = createElement("button", activityWrapper);
                btn.innerHTML = `
                    <p>${block.name}</p>
                    <section>
                        <img src="img/clock.png" width="22px">
                        <p style="font-size: 15px;">${block.start} - ${block.end}</p>
                    </section>
                `;
            });
        }
    });
}

function formatTime(h) {
    return `${h.toString().padStart(2, '0')}:00`;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "schedules", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data().weekData;
            renderTimeline(data);
        } else {
            calendarcontainer.innerHTML = "<h1>No schedule found. Go to Schedule to create one!</h1>";
        }
    }
});