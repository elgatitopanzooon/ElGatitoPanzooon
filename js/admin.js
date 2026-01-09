/**
 * Panel de Administración - El Gatito Panzón
 * Control del estado por categorías (tamales, tortas, dulces)
 */

import { auth, db } from "./firebase.js";
import { doc, updateDoc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Email del administrador autorizado
const ADMIN_EMAIL = "elgatitopanzooon@gmail.com";

// Categorías disponibles
const CATEGORIES = ['tamales', 'tortas', 'dulces'];

/**
 * Inicializar el panel de administración
 */
function initAdminPanel() {
    console.log('🔧 Inicializando panel de administración por categorías...');
    
    // Verificar autenticación
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log('❌ Usuario no autenticado, redirigiendo...');
            window.location.href = "login.html";
            return;
        }

        if (user.email !== ADMIN_EMAIL) {
            console.log('❌ Usuario no autorizado:', user.email);
            showUnauthorizedMessage();
            return;
        }

        console.log('✅ Administrador autenticado:', user.email);
        setupAdminInterface(user);
    });
}

/**
 * Configurar la interfaz de administración
 */
function setupAdminInterface(user) {
    // Mostrar información del admin
    const adminInfo = document.getElementById('admin-info');
    if (adminInfo) {
        adminInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <div style="font-size: 2rem;">👨‍💼</div>
                <div>
                    <h3 style="margin: 0; color: var(--color-white);">Administrador</h3>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">${user.email}</p>
                </div>
            </div>
        `;
    }

    // Configurar botones por categoría
    setupCategoryButtons();
    
    // Cargar estado actual de todas las categorías
    loadCategoriesStatus();
    
    // Escuchar cambios en tiempo real
    listenToStatusChanges();
    
    // Configurar botón de logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
}

/**
 * Configurar los botones por categoría
 */
function setupCategoryButtons() {
    CATEGORIES.forEach(category => {
        const btnAbrir = document.getElementById(`btnAbrir${category.charAt(0).toUpperCase() + category.slice(1)}`);
        const btnCerrar = document.getElementById(`btnCerrar${category.charAt(0).toUpperCase() + category.slice(1)}`);

        if (btnAbrir) {
            btnAbrir.addEventListener('click', () => updateCategoryStatus(category, true));
        }

        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => updateCategoryStatus(category, false));
        }
    });
}

/**
 * Actualizar el estado de una categoría específica
 */
async function updateCategoryStatus(category, isOpen) {
    try {
        const ref = doc(db, "config", "categorias");
        
        // Verificar si el documento existe
        const docSnap = await getDoc(ref);
        
        let currentData = {};
        if (docSnap.exists()) {
            currentData = docSnap.data();
        }

        // Actualizar solo la categoría específica
        const updatedData = {
            ...currentData,
            [category]: {
                abierto: isOpen,
                ultimaActualizacion: new Date(),
                administrador: auth.currentUser.email
            }
        };

        if (!docSnap.exists()) {
            // Crear el documento si no existe
            await setDoc(ref, updatedData);
        } else {
            // Actualizar el documento existente
            await updateDoc(ref, updatedData);
        }

        const status = isOpen ? 'ABIERTO' : 'CERRADO';
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        console.log(`✅ ${categoryName} actualizado: ${status}`);
        
        showSuccessMessage(`${categoryName} marcado como ${status.toLowerCase()}`);
        
    } catch (error) {
        console.error(`❌ Error al actualizar ${category}:`, error);
        showErrorMessage(`Error al actualizar el estado de ${category}`);
    }
}

/**
 * Cargar el estado actual de todas las categorías
 */
async function loadCategoriesStatus() {
    try {
        const ref = doc(db, "config", "categorias");
        const docSnap = await getDoc(ref);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            updateCategoriesDisplay(data);
        } else {
            console.log("📄 Documento de categorías no existe, creando estado por defecto");
            // Crear estado por defecto (todas abiertas)
            const defaultData = {};
            CATEGORIES.forEach(category => {
                defaultData[category] = {
                    abierto: true,
                    ultimaActualizacion: new Date(),
                    administrador: auth.currentUser.email
                };
            });
            await setDoc(ref, defaultData);
            updateCategoriesDisplay(defaultData);
        }
    } catch (error) {
        console.error("❌ Error al cargar estado de categorías:", error);
    }
}

/**
 * Escuchar cambios en tiempo real
 */
function listenToStatusChanges() {
    const ref = doc(db, "config", "categorias");
    
    onSnapshot(ref, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            updateCategoriesDisplay(data);
        }
    });
}

/**
 * Actualizar la visualización del estado de las categorías
 */
function updateCategoriesDisplay(data) {
    CATEGORIES.forEach(category => {
        const categoryData = data[category] || { abierto: true };
        const isOpen = categoryData.abierto;
        
        // Actualizar estado visual de la categoría
        const statusElement = document.getElementById(`${category}-status`);
        const btnAbrir = document.getElementById(`btnAbrir${category.charAt(0).toUpperCase() + category.slice(1)}`);
        const btnCerrar = document.getElementById(`btnCerrar${category.charAt(0).toUpperCase() + category.slice(1)}`);
        
        if (statusElement) {
            if (isOpen) {
                statusElement.textContent = '🟢 Disponible';
                statusElement.className = 'category-status available';
            } else {
                statusElement.textContent = '🔴 No Disponible';
                statusElement.className = 'category-status unavailable';
            }
        }

        // Actualizar estado de los botones
        if (btnAbrir && btnCerrar) {
            if (isOpen) {
                btnAbrir.disabled = true;
                btnAbrir.style.opacity = "0.5";
                btnCerrar.disabled = false;
                btnCerrar.style.opacity = "1";
            } else {
                btnAbrir.disabled = false;
                btnAbrir.style.opacity = "1";
                btnCerrar.disabled = true;
                btnCerrar.style.opacity = "0.5";
            }
        }
    });

    // Actualizar resumen general
    updateGeneralStatus(data);
}

/**
 * Actualizar el resumen general del estado
 */
function updateGeneralStatus(data) {
    const statusContainer = document.getElementById('categories-status');
    if (!statusContainer) return;

    let openCount = 0;
    let totalCount = CATEGORIES.length;

    CATEGORIES.forEach(category => {
        const categoryData = data[category] || { abierto: true };
        if (categoryData.abierto) openCount++;
    });

    const statusHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            ${CATEGORIES.map(category => {
                const categoryData = data[category] || { abierto: true };
                const isOpen = categoryData.abierto;
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
                const emoji = category === 'tamales' ? '🫔' : category === 'tortas' ? '🥪' : '🍬';
                
                return `
                    <div style="
                        padding: 1rem;
                        border-radius: 12px;
                        text-align: center;
                        ${isOpen 
                            ? 'background: linear-gradient(135deg, rgba(39, 174, 96, 0.2) 0%, rgba(46, 204, 113, 0.2) 100%); border: 2px solid #27ae60;'
                            : 'background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.2) 100%); border: 2px solid #e74c3c;'
                        }
                    ">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${emoji}</div>
                        <div style="color: var(--color-white); font-weight: 600; margin-bottom: 0.25rem;">${categoryName}</div>
                        <div style="color: ${isOpen ? '#27ae60' : '#e74c3c'}; font-size: 0.9rem; font-weight: 600;">
                            ${isOpen ? '🟢 Disponible' : '🔴 Cerrado'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div style="
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid var(--color-gold);
            border-radius: 16px;
            text-align: center;
        ">
            <h4 style="color: var(--color-gold); margin: 0 0 0.5rem 0; font-size: 1.2rem;">Resumen General</h4>
            <p style="color: var(--color-white); margin: 0; font-size: 1.1rem;">
                <strong>${openCount} de ${totalCount}</strong> categorías disponibles
            </p>
            ${openCount === 0 ? 
                '<p style="color: #e74c3c; margin: 0.5rem 0 0 0; font-size: 0.9rem;">⚠️ Todas las categorías están cerradas</p>' :
                openCount === totalCount ?
                '<p style="color: #27ae60; margin: 0.5rem 0 0 0; font-size: 0.9rem;">✅ Todas las categorías están disponibles</p>' :
                '<p style="color: #f39c12; margin: 0.5rem 0 0 0; font-size: 0.9rem;">⚡ Disponibilidad parcial</p>'
            }
        </div>
    `;

    statusContainer.innerHTML = statusHTML;
}

/**
 * Cerrar sesión
 */
async function logout() {
    try {
        await signOut(auth);
        console.log('✅ Sesión cerrada');
        window.location.href = "login.html";
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        showErrorMessage("Error al cerrar sesión");
    }
}

/**
 * Mostrar mensaje de usuario no autorizado
 */
function showUnauthorizedMessage() {
    document.body.innerHTML = `
        <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #152453 0%, #364277 50%, #4e598c 100%);
            padding: 2rem;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #e74c3c;
                border-radius: 20px;
                padding: 3rem;
                text-align: center;
                max-width: 500px;
                backdrop-filter: blur(10px);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
                <h2 style="color: #e74c3c; margin-bottom: 1rem;">Acceso Denegado</h2>
                <p style="color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem;">
                    No tienes permisos para acceder al panel de administración.
                </p>
                <button onclick="window.location.href='login.html'" style="
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #d4a373 0%, var(--color-orange-dark) 100%);
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    Volver al Login
                </button>
            </div>
        </div>
    `;
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccessMessage(message) {
    showToast(message, 'success');
}

/**
 * Mostrar mensaje de error
 */
function showErrorMessage(message) {
    showToast(message, 'error');
}

/**
 * Mostrar notificación toast
 */
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        ${type === 'success' 
            ? 'background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);' 
            : 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
        }
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAdminPanel);