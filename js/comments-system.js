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
        
        // Suprimir alerts del navegador para comentarios
        this.suppressBrowserAlerts();
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSystem());
        } else {
            this.setupSystem();
        }
    }

    /**
     * Suprimir alerts del navegador relacionados con comentarios
     */
    suppressBrowserAlerts() {
        // Guardar la función alert original
        const originalAlert = window.alert;
        
        // Sobrescribir alert temporalmente para suprimir mensajes de comentarios
        window.alert = function(message) {
            // Si el mensaje contiene palabras relacionadas con comentarios, no mostrarlo
            if (message && typeof message === 'string') {
                const commentRelated = message.toLowerCase().includes('comentario') || 
                                     message.toLowerCase().includes('enviado') ||
                                     message.toLowerCase().includes('exitoso') ||
                                     message.toLowerCase().includes('success');
                
                if (commentRelated) {
                    console.log('🔇 Alert suprimido:', message);
                    return; // No mostrar el alert
                }
            }
            
            // Para otros mensajes, usar el alert original
            originalAlert.call(this, message);
        };
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
                this.showFriendlyMessage("¡Hola! 👋", "Para dejar tu comentario necesitas iniciar sesión primero. Es rápido y fácil, ¡solo toma unos segundos!", "info");
                return;
            }

            // Obtener datos del formulario
            const nombre = document.getElementById("nombre").value.trim();
            const comentario = document.getElementById("comentario").value.trim();

            // Validar datos
            if (!nombre || !comentario || estrellasSeleccionadas === 0) {
                if (!nombre) {
                    this.showFriendlyMessage("¡Falta tu nombre! 👤", "Por favor escribe tu nombre para que sepamos quién nos está comentando.", "info");
                } else if (!comentario) {
                    this.showFriendlyMessage("¡Falta tu comentario! 💬", "No olvides escribir tu opinión sobre nuestros productos.", "info");
                } else if (estrellasSeleccionadas === 0) {
                    this.showFriendlyMessage("¡Falta tu calificación! ⭐", "Por favor selecciona las estrellas para calificar tu experiencia.", "info");
                }
                return;
            }

            // Deshabilitar botón mientras se envía
            const submitBtn = document.getElementById("btnEnviarComentario");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Enviando...";
            }

            // Crear documento en Firestore
            const docRef = await addDoc(collection(db, "comentarios"), {
                nombre,
                comentario,
                estrellas: estrellasSeleccionadas,
                fecha: new Date(),
                pagina: this.pageName,
                userId: user.uid,
                userEmail: user.email
            });

            // Limpiar formulario inmediatamente
            this.clearForm();
            
            // Recargar comentarios inmediatamente para mostrar el nuevo comentario
            await this.loadComments();
            
            // Mostrar mensaje amigable de éxito (sin bloquear la UI)
            setTimeout(() => {
                this.showSuccessToast("¡Comentario enviado correctamente! ✨");
            }, 100);
            
            console.log(`✅ Comentario enviado para ${this.pageName}`);

        } catch (error) {
            console.error("Error al enviar comentario:", error);
            this.showFriendlyMessage("¡Ups! Algo salió mal 😔", "No pudimos enviar tu comentario en este momento. Por favor, verifica tu conexión e inténtalo de nuevo.", "error");
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

    /**
     * Mostrar notificación toast de éxito (menos intrusiva)
     */
    showSuccessToast(message) {
        // Remover toast anterior si existe
        const existingToast = document.getElementById('comment-success-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Crear toast
        const toast = document.createElement('div');
        toast.id = 'comment-success-toast';
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
            z-index: 9999;
            font-weight: 600;
            font-size: 1rem;
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
            word-wrap: break-word;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">🎉</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animar salida y remover
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 3000);
    }

    /**
     * Mostrar mensaje amigable al usuario
     */
    showFriendlyMessage(title, message, type = 'success') {
        // Remover mensaje anterior si existe
        const existingMessage = document.getElementById('friendly-comment-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Crear el modal de mensaje
        const modal = document.createElement('div');
        modal.id = 'friendly-comment-message';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(12px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.4s ease;
        `;

        const messageContent = document.createElement('div');
        messageContent.style.cssText = `
            background: linear-gradient(135deg, #152453 0%, #364277 50%, #4e598c 100%);
            border: 3px solid var(--color-gold);
            border-radius: 24px;
            padding: 3rem 2.5rem;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            animation: slideInScale 0.4s ease;
            position: relative;
            overflow: hidden;
        `;

        // Agregar efecto de brillo sutil
        messageContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); animation: shimmer 2s ease-in-out infinite;"></div>
            <div style="font-size: 4.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));">${type === 'success' ? '🎉' : type === 'error' ? '😔' : 'ℹ️'}</div>
            <h3 style="color: var(--color-white); font-size: 1.8rem; font-weight: 800; margin: 0 0 1.25rem 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); line-height: 1.2;">
                ${title}
            </h3>
            <p style="color: rgba(255, 255, 255, 0.95); font-size: 1.15rem; line-height: 1.6; margin: 0 0 2.5rem 0; font-weight: 400;">
                ${message}
            </p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 1rem 2.5rem;
                border: none;
                border-radius: 16px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, #d4a373 0%, var(--color-orange-dark) 100%);
                color: var(--color-white);
                box-shadow: 0 6px 20px rgba(212, 163, 115, 0.5);
                min-width: 140px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
            " onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(212, 163, 115, 0.7)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 6px 20px rgba(212, 163, 115, 0.5)'">
                ${type === 'success' ? '✨ ¡Perfecto!' : type === 'error' ? '🔄 Intentar de nuevo' : '👍 Entendido'}
            </button>
        `;

        modal.appendChild(messageContent);
        document.body.appendChild(modal);

        // Agregar estilos de animación mejorados
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInScale {
                from { 
                    transform: translateY(-60px) scale(0.8); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0) scale(1); 
                    opacity: 1; 
                }
            }
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    modal.remove();
                    style.remove();
                }, 300);
            }
        });

        // Auto-cerrar después de 3 segundos si es mensaje de éxito
        if (type === 'success') {
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        modal.remove();
                        style.remove();
                    }, 300);
                }
            }, 3000);
        }

        // Agregar animación de salida
        style.textContent += `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
    }
}

// Función global para inicializar el sistema de comentarios
window.initCommentsSystem = function(pageName) {
    return new CommentsSystem(pageName);
};

// Exportar para uso como módulo
export { CommentsSystem };

console.log('📦 Sistema de comentarios cargado correctamente');