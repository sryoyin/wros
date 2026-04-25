import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const userImg = document.getElementById("accimg");

onAuthStateChanged(auth, (user) => {
    const paginasPrivadas = ['main', 'oaa', 'schedule', 'profile'];
    const urlActual = window.location.href.toLowerCase();

    if (user) {
        if (user.providerData.some(p => p.providerId === 'google.com') && user.photoURL) {
            userImg.src = user.photoURL;
        } else {
            userImg.src = "img/student.png";
        }
        console.log("Usuario detectado en la página");
    } else {
        const esPaginaPrivada = paginasPrivadas.some(pagina => urlActual.includes(pagina));

        if (esPaginaPrivada) {
            console.log("Intento de acceso no autorizado. Redirigiendo...");
            window.location.replace("login");
        }
        userImg.src = "img/student.png";
        console.log("No hay sesión iniciada");
    }
    userImg.style.opacity = "1";
});