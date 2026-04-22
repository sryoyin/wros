import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();

const userImg = document.getElementById("accimg");

onAuthStateChanged(auth, (user) => {
    if (user) {
        // --- SI HAY UN USUARIO LOGUEADO ---
        if (user.providerData[0].providerId === 'google.com') {
            userImg.src = user.photoURL;
            }
        }
    });