import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- OPCIONES DE ETIQUETA ---
let options = ["", "Traslation", "Hygiene", "Breakfast", "Lunch", "Dinner", "Studying", "Homework", "Exercising", "Break", "FAILURE AUDIT", "END OF DAY"];

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

function generateSchedule(savedData = null, isReadOnly = false) {
    const localcontainer = createElement("div", localparent);
    localcontainer.classList.add("📋");
    const rows = 33;
    const columns = 7;
    let localhour = 330;
    let counter = 0;

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
            if (isReadOnly && savedData) {
                // MODO BLOQUEADO
                const activity = savedData[`slot_${counter}`] || "---";
                const cell = createElement("div", localcontainer, activity);
                cell.classList.add("cell-locked"); 
            } else {
                const selector = createElement("select", localcontainer);
                selector.required = true;

                options.forEach(option => {
                    const optElement = createElement("option", selector, option);
                    optElement.value = option;

                    if (option === "") {
                        optElement.value = "";
                        optElement.textContent = "Select...";
                        optElement.disabled = true;
                    }
                });
            }
            counter++;
        }
    localhour += 30;
    }
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

function renderScheduleUI(data = null, isReadOnly = false) {
    localparent.innerHTML = "";
    const title = createElement("h1", localparent, "SCHEDULE");
    title.style.fontWeight = "600";
    
    if (!isReadOnly) {
        setupCustomLabelUI();
    }
    generateSchedule(data.weekData, isReadOnly);

    if (!isReadOnly) {
        const submitschedule = createElement("button", localparent, "Submit");
        submitschedule.type = "submit";
    }
    
    if (buttongen.parentElement) buttongen.parentElement.remove();
    if (img) img.remove();
    localparent.style.justifyContent = "center";
    localparent.style.flexDirection = "column";
}

function setupCustomLabelUI() {
    // --- INPUT ---
    const customgen = createElement("section", localparent);
    const input = createElement("input", customgen, "Create custom activity");
    input.type = "text";
    input.placeholder = "New activity";
    input.style.marginRight = "20px";
    
    // --- BOTON PARA AÑADIR NUEVOS LABELS ---
    const buttonaddlabel = createElement("button", customgen, "Create custom label");
    buttonaddlabel.type = "button";
    
    buttonaddlabel.addEventListener("click", async () => {
        const newLabel = input.value.trim();
        if (newLabel && !options.includes(newLabel)) {
            // 1. Añadir al array local
            options.push(newLabel);
        
            // 2. Actualizar todos los selectores existentes en el DOM
            document.querySelectorAll(".📋 select").forEach(select => {
                const newOpt = createElement("option", select, newLabel);
                newOpt.value = newLabel;
            });

            const userRef = doc(db, "users", auth.currentUser.uid);
            // Intentar actualizar, si falla (porque el doc no existe), crear uno nuevo
            await setDoc(userRef, { customlabels: arrayUnion(newLabel) }, { merge: true});
            input.value = "";
            alert("Etiqueta añadida y guardada!");
        }
    });
}

// --- CREAR HORARIO ---
const buttongen = document.getElementById("gen-schedule");
const img = document.getElementById("scheduleimg");
const labels = ["Hour", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const localparent = document.getElementById("schedule");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // --- ETIQUETAS ---
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().customLabels) {
            const savedLabels = userSnap.data().customLabels;
            options = [...new Set([...options, ...savedLabels])];
            console.log("Etiquetas cargadas y actualizadas!", options)
        }

        // --- VERIFICAR SI EXISTE UN HORARIO VIGENTE ---
        const scheduleRef = doc(db, "schedules", user.uid);
        const scheduleSnap = await getDoc(scheduleRef);

        if (scheduleSnap.exists()) {
            const data = scheduleSnap.data();
            const fechaGuardado = data.updatedAt.toDate();
            
            const hoy = getLocalWeekNumber(new Date());
            const registro = getLocalWeekNumber(fechaGuardado);

            // Si es la misma semana y año, cargamos modo lectura
            if (hoy.week === registro.week && hoy.year === registro.year) {
                console.log("Horario vigente detectado.");
                renderScheduleUI(data.weekData, true);
            } else {
                // Semana vieja: mostrar botón para crear uno nuevo
                buttongen.style.display = "block";
            }
        } else {
            // Usuario nuevo sin horarios
            buttongen.style.display = "block";
        }
    }
});

buttongen.addEventListener("click", async () => renderScheduleUI());

// --- ENVIAR HORARIO ---
localparent.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("¡Formulario validado y listo para enviarse a Firebase!");

    const scheduleData = {};
    const selectors = document.querySelectorAll("select");
    
    selectors.forEach((sel, index) => {
        scheduleData[`slot_${index}`] = sel.value;
    });

    try {
        await setDoc(doc(db, "schedules", auth.currentUser.uid), {
        weekData: scheduleData,
        updatedAt: serverTimestamp()
        });
        alert("Horario gaurdado!");
        location.reload();
    } catch (error) {
        console.error("Error al guardar:", error);
    }
});