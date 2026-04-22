// 1. Añadimos GoogleAuthProvider y signInWithPopup a las importaciones
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider(); // Proveedor de Google

// --- REGISTRO MANUAL (El que ya tenías) ---
const registrationForm = document.querySelector('form');
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const pass = document.getElementById('pass').value;
    const fakeEmail = `${username}@whiteroom.com`;

    try {
        await createUserWithEmailAndPassword(auth, fakeEmail, pass);
        alert("¡Cuenta creada!");
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// --- ACCESO CON GOOGLE ---
const googleBtn = document.getElementById('google-btn');

googleBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // Esto te da los datos del usuario de Google
        const user = result.user;
        alert(`Bienvenido, ${user.displayName}`);
        console.log("Datos de Google:", user);
        
        // Aquí podrías redirigir a la zona privada
    } catch (error) {
        console.error("Error con Google:", error);
        alert("No se pudo iniciar sesión con Google.");
    }
});