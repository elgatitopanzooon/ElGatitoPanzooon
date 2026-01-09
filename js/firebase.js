/**
 * Configuración centralizada de Firebase - El Gatito Panzón
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCGO_EAAEfOFCCzkg4C-1Lo9as9feFOrDo",
    authDomain: "elgatitopanzoon.firebaseapp.com",
    projectId: "elgatitopanzoon",
    storageBucket: "elgatitopanzoon.firebasestorage.app",
    messagingSenderId: "248328568972",
    appId: "1:248328568972:web:56ca92b059f2d05e087ba9",
    measurementId: "G-XMHRPNKKBS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exportar instancias
export { auth, db, analytics };