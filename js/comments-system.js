/**
 * Sistema de Comentarios y Calificaciones - El Gatito Panzón
 * Usando Firebase SDK v12.7.0
 */

// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
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

// Variables globales del sistema de comentarios
let estrellasSeleccionadas = 0;
let paginaActual = '';

/**
 * Clase principal del sistema de comentarios
 */
class CommentsSystem {
    constructor(pageName) {
        this.pageName = pageName;
        this.init();
    }

    /**
     * Inicializar el sistema de comentarios
     */
    init() {
        console.log(`🌟 Inicializando sistema de comentarios para: ${this.pageName}`);
        paginaActual = this.pageName;
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSystem());
        } else {
            this.setupSystem();
        }
    }

    /**
     * Configurar todo el sistema
     */
    setupSystem() {
        this.setupStarRating();
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.loadComments();
    }

    /**
     * Configurar el sistema de estrellas
     */
    setupStarRating() {
        const stars = document.querySelectorAll("#rating span");
        
        stars.forEach(star => {
            star.addEventListener("click", () => {
                estrellasSeleccionadas = Number(star.dataset.value);
                this.updateStarDisplay();
                console.log(`⭐ Estrellas seleccionadas: ${estrellasSeleccionadas}`);
            });

            // Efecto hover
            star.addEventListener("mouseenter", () => {
                const hoverValue = Number(star.dataset.value);
                stars.forEach(s => {
                    s.style.opacity = Number(s.dataset.value) <= hoverValue ? "1" : "0.3";
                });
            });
        });

        // Restaurar estado al salir del hover
        const ratingContainer = document.getElementById("rating");
        if (ratingContainer) {
            ratingContainer.addEventListener("mouseleave", () => {
                this.updateStarDisplay();
            });
        }
    }

    /**
     * Actualizar la visualización de las estrellas
     */
    updateStarDisplay() {
        document.querySelectorAll("#rating span").forEach(s => {
            s.style.opacity = Number(s.dataset.value) <= estrellasSeleccionadas ? "1" : "0.3";
        });
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        const submitBtn = document.getElementById("btnEnviarComentario");
        if (submitBtn) {
            submitBtn.addEventListener("click", () => this.submitComment());
        }

        // Enter en textarea para enviar
        const textarea = document.getElementById("comentario");
        if (textarea) {
            textarea.addEventListener("keydown", (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.submitComment();
                }
            });
        }
    }

    /**
     * Configurar listener del estado de autenticación
     */
    setupAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            this.handleAuthStateChange(user);
        });
    }

    /**
     * Manejar cambios en el estado de autenticación
     */
    handleAuthStateChange(user) {
        const commentForm = document.getElementById('comment-form');
        const loginRequired = document.getElementById('login-required');
        const nameInput = document.getElementById('nombre');

        if (user) {
            // Usuario autenticado
            if (commentForm) commentForm.style.display = 'block';
            if (loginRequired) loginRequired.style.display = 'none';
            
            // Pre-llenar el nombre con el email del usuario
            if (nameInput && user.email) {
                nameInput.value = user.email.split('@')[0];
            }
            
            console.log(`👤 Usuario autenticado: ${user.email}`);
        } else {
            // Usuario no autenticado
            if (commentForm) commentForm.style.display = 'none';
            if (loginRequired) loginRequired.style.display = 'block';
            
            console.log('🚫 Usuario no autenticado');
        }
    }

    /**
     * Enviar comentario
     */
    async submitComment() {
        try {
            // Verificar autenticación
            const user = auth.currentUser;
            if (!user) {
                alert("Debes iniciar sesión para comentar");
                return;
            }

            // Obtener datos del formulario
            const nombre = document.getElementById("nombre").value.trim();
            const comentario = document.getElementById("comentario").value.trim();

            // Validar datos
            if (!nombre || !comentario || estrellasSeleccionadas === 0) {
                alert("Completa todos los campos y selecciona una calificación");
                return;
            }

            // Deshabilitar botón mientras se envía
            const submitBtn = document.getElementById("btnEnviarComentario");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Enviando...";
            }

            // Crear documento en Firestore
            await addDoc(collection(db, "comentarios"), {
                nombre,
                comentario,
                estrellas: estrellasSeleccionadas,
                fecha: new Date(),
                pagina: this.pageName,
                userId: user.uid,
                userEmail: user.email
            });

            // Limpiar formulario
            this.clearForm();
            
            // Recargar comentarios
            await this.loadComments();
            
            alert("¡Comentario enviado exitosamente!");
            console.log(`✅ Comentario enviado para ${this.pageName}`);

        } catch (error) {
            console.error("Error al enviar comentario:", error);
            alert("Error al enviar el comentario. Inténtalo de nuevo.");
        } finally {
            // Rehabilitar botón
            const submitBtn = document.getElementById("btnEnviarComentario");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Enviar comentario";
            }
        }
    }

    /**
     * Limpiar formulario después de enviar
     */
    clearForm() {
        const comentarioInput = document.getElementById("comentario");
        if (comentarioInput) {
            comentarioInput.value = "";
        }

        estrellasSeleccionadas = 0;
        this.updateStarDisplay();
    }

    /**
     * Cargar comentarios desde Firestore
     */
    async loadComments() {
        try {
            console.log(`📥 Cargando comentarios para: ${this.pageName}`);

            const q = query(
                collection(db, "comentarios"),
                orderBy("fecha", "desc")
            );
            
            const snapshot = await getDocs(q);
            
            let total = 0;
            let cantidad = 0;
            const contenedor = document.getElementById("listaComentarios");
            
            if (!contenedor) {
                console.warn("No se encontró el contenedor de comentarios");
                return;
            }

            contenedor.innerHTML = "";

            snapshot.forEach(doc => {
                const c = doc.data();
                
                // Solo mostrar comentarios de la página actual
                if (c.pagina === this.pageName) {
                    total += c.estrellas;
                    cantidad++;
                    
                    const fechaFormateada = this.formatDate(c.fecha);
                    const commentHTML = this.createCommentHTML(c, fechaFormateada);
                    
                    contenedor.innerHTML += commentHTML;
                }
            });

            // Actualizar promedio
            this.updateAverage(total, cantidad);
            
            console.log(`📊 Comentarios cargados: ${cantidad} para ${this.pageName}`);

        } catch (error) {
            console.error("Error al cargar comentarios:", error);
        }
    }

    /**
     * Formatear fecha
     */
    formatDate(firebaseDate) {
        if (firebaseDate?.toDate) {
            return firebaseDate.toDate().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else if (firebaseDate) {
            return new Date(firebaseDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        return 'Fecha no disponible';
    }

    /**
     * Crear HTML para un comentario
     */
    createCommentHTML(comment, formattedDate) {
        const stars = '⭐'.repeat(comment.estrellas);
        
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <strong class="comment-author">${this.escapeHtml(comment.nombre)}</strong>
                    <span class="comment-rating">${stars}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p class="comment-text">${this.escapeHtml(comment.comentario)}</p>
            </div>
        `;
    }

    /**
     * Escapar HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Actualizar promedio de calificaciones
     */
    updateAverage(total, cantidad) {
        const promedioElement = document.getElementById("promedio");
        if (promedioElement) {
            const promedio = cantidad ? (total / cantidad).toFixed(1) : "0";
            promedioElement.textContent = promedio;
        }
    }
}

// Función global para inicializar el sistema de comentarios
window.initCommentsSystem = function(pageName) {
    return new CommentsSystem(pageName);
};

// Exportar para uso como módulo
export { CommentsSystem };

console.log('📦 Sistema de comentarios cargado correctamente');