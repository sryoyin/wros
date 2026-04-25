import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// --- FUNCIONES ---
function getTime(time) {
    const hours = Math.floor(time / 60).toString().padStart(2, '0');
    const minutes = (time % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function createElement(type, parent, text) {
    const element = document.createElement(type);
    if (text) {
        element.textContent = text;
    }
    parent.appendChild(element);
    return element;
}

function generateSchedule() {
    localcontainer = createElement("div", localparent);
    localcontainer.classList.add("📋");
    const rows = 33;
    const columns = 7;
    let localhour = 330;

    labels.forEach(label => {
        const labeldiv = createElement("div", localcontainer);
        const labelp = createElement("p", labeldiv, label);
        labelp.style.fontWeight = "600";
    });

    for (let i = 0; i < rows; i++) {
        const hour1 = getTime(localhour);
        const hour2 = getTime(localhour + 30);
        const hourdiv = createElement("div", localcontainer);
        const hourp = createElement("p", hourdiv, hour1 + ' - ' + hour2);
        hourp.style.fontSize = "14px";

        for (let j = 0; j < columns; j++) {
            const selector = createElement("select", localcontainer);
            selector.required = true;

            options.forEach(option => {
                const optElement = createElement("option", selector, option);

                if (option === "") {
                    optElement.value = "";
                    optElement.textContent = "Select...";
                    optElement.disabled = true;
                }
            });
        }

    localhour += 30;
    }
}

// --- OPCIONES DE ETIQUETA ---
let options = ["", "Traslation", "Hygiene", "Breakfast", "Lunch", "Dinner", "Studying", "Homework", "Exercising", "Break", "FAILURE AUDIT", "END OF DAY"];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Traer etiquetas del usuario desde Firestore
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().customLabels) {
            // Combinar etiquetas base con las del usuario (evitando duplicados)
            const savedLabels = userSnap.data().customLabels;
            options = [...new Set([...options, ...savedLabels])];
        }
    }
});

// --- CREAR HORARIO ---
const buttongen = document.getElementById("gen-schedule");
const img = document.getElementById("scheduleimg");
const labels = ["Hour", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const localparent = document.getElementById("schedule");
let localcontainer;

buttongen.addEventListener("click", async () => {
    // --- TITLE ---
    const title = createElement("h1", localparent, "SCHEDULE");
    title.style.fontWeight = "600";
    // --- INPUT ---
    const customgen = createElement("section", localparent);

    const input = createElement("input", customgen, "Create custom activity");
    input.type = "text";
    input.style.marginRight = "20px";
    
    // --- BOTON PARA AÑADIR NEUVOS LABELS ---
    const buttonaddlabel = createElement("button", customgen, "Create custom label");
    buttonaddlabel.type = "button";
    const newLabel = input.value.trim();
    
    buttonaddlabel.addEventListener("click", async () => {
        const newLabel = input.value.trim();
    
        if (newLabel && !options.includes(newLabel)) {
            // 1. Añadir al array local
            options.push(newLabel);
        
            // 2. Actualizar todos los selectores existentes en el DOM
            const allSelectors = localcontainer.querySelectorAll("select");
            allSelectors.forEach(select => {
                const newOpt = document.createElement("option");
                newOpt.value = newLabel;
                newOpt.textContent = newLabel;
                select.appendChild(newOpt);
            });

            // 3. GUARDAR EN FIREBASE (Persistencia)
            // Asumiendo que tienes acceso al 'user' de Firebase Auth
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                customLabels: arrayUnion(newLabel)
            });

            input.value = ""; // Limpiar input
            alert("Etiqueta añadida y guardada!");
        }
    });

    // --- SCHEDULE ---
    generateSchedule();
    const submitschedule = createElement("button", localparent, "Submit ");
    submitschedule.type = "submit";
    // --- FIX ---
    buttongen.parentElement.remove();
    img.remove();
    localparent.style.justifyContent = "center";
    localparent.style.flexDirection = "column";
});

// --- ENVIAR HORARIO ---
localparent.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("¡Formulario validado y listo para enviarse a Firebase!");

    const scheduleData = {};
    const selectors = localcontainer.querySelectorAll("select");
    
    selectors.forEach((sel, index) => {
        scheduleData[`slot_${index}`] = sel.value;
    });

    // Guardar en Firebase
    await setDoc(doc(db, "schedules", auth.currentUser.uid), {
        weekData: scheduleData,
        updatedAt: serverTimestamp()
    });
    
    alert("Horario sincronizado con éxito.");
});