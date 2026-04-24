import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
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
const provider = new GoogleAuthProvider();

// --- REGISTRO MANUAL ---
const registrationForm = document.getElementById('register-form');

if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const pass = document.getElementById('pass').value;
        const fakeEmail = `${username}@whiteroom.com`;

        try {
            await createUserWithEmailAndPassword(auth, fakeEmail, pass);
            alert("¡Cuenta creada!");
            window.location.href = "main.html"; 
        } catch (error) {
            alert("Error: " + error.message);
        }
    })
};

// --- ACCESO CON GOOGLE ---
const googleBtn = document.getElementById('google-btn');

googleBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        alert(`Bienvenido, ${user.displayName}`);
        console.log("Datos de Google:", user);
        window.location.href = "main"; 
    } catch (error) {
        console.error("Error con Google:", error);
        alert("No se pudo iniciar sesión con Google.");
    }
});

// --- INICIO DE SESIÓN MANUAL ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        const fakeEmail = `${username}@whiteroom.com`;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, pass);
            const user = userCredential.user;
            
            alert(`Acceso concedido. Bienvenido de nuevo, ${username}.`);
            
            window.location.href = "main.html"; 
        } catch (error) {
            console.error("Error al iniciar sesión:", error.code);
            
            if (error.code === 'auth/invalid-credential') {
                alert("Usuario o contraseña incorrectos. Por favor, verifica tus datos.");
            } else if (error.code === 'auth/user-not-found') {
                alert("Este usuario no existe en la White Room.");
            } else {
                alert("Ocurrió un error inesperado al intentar acceder.");
            }
        }
    })
};