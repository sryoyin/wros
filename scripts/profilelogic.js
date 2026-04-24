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

onAuthStateChanged(auth, (user) => {
    if (user) {
    // Nombre y Foto
    document.getElementById('accimg').src = user.photoURL || "img/student.png";
    document.getElementById('accname').textContent = user.displayName || user.email.split('@')[0];
    
    // Fecha de creación
    const fecha = new Date(user.metadata.creationTime).toLocaleDateString();
    document.getElementById('accdate').textContent = `Member since: ${fecha}`;
    
    // ID
    document.getElementById('accID').textContent = `Student ID: ${user.uid.substring(0, 8).toUpperCase()}`;
    }
});

// --- LOGOUT ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.replace("login");
        } catch (error) {
            console.error("Error al salir:", error);
        }
    })
};