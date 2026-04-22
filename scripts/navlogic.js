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
    if (user) {
        // --- SI HAY UN USUARIO LOGUEADO ---
        if (user.providerData[0].providerId === 'google.com') {
            userImg.src = user.photoURL;
            }
        } else {
            console.log("No hay sesión iniciada");
        }
    });