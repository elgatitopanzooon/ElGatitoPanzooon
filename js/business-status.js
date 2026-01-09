/**
 * Sistema de Estado por Categorías - El Gatito Panzón
 * Muestra si cada categoría está disponible o cerrada
 */

import { db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Categorías disponibles
const CATEGORIES = ['tamales', 'tortas', 'dulces'];

/**
 * Cargar y mostrar el estado actual por categorías
 */
async function cargarEstado() {
    try {
        const ref = doc(db, "config", "categorias");
        
        // Escuchar cambios en tiempo real
        onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                console.log("📄 Documento de categorías no existe, creando estado por defecto");
                // Mostrar todas las categorías como abiertas por defecto
                const defaultData = {};
                CATEGORIES.forEach(category => {
                    defaultData[category] = { abierto: true };
                });
                mostrarEstadoPorCategoria(defaultData);
                return;
            }

            const data = snap.data();
            mostrarEstadoPorCategoria(data);
        });

    } catch (error) {
        console.error("❌ Error al cargar estado de categorías:", error);
        // En caso de error, mostrar como abiertas por defecto
        const defaultData = {};
        CATEGORIES.forEach(category => {
            defaultData[category] = { abierto: true };
        });
        mostrarEstadoPorCategoria(defaultData);
    }
}

/**
 * Mostrar el estado por categoría en la interfaz
 */
function mostrarEstadoPorCategoria(categoriesData) {
    // Obtener la página actual para determinar qué categoría mostrar
    const currentPage = getCurrentPageCategory();
    
    if (currentPage) {
        // Si estamos en una página específica, mostrar solo esa categoría
        mostrarEstadoCategoria(currentPage, categoriesData[currentPage] || { abierto: true });
    } else {
        // Si estamos en la página principal, mostrar resumen general
        mostrarEstadoGeneral(categoriesData);
    }
}

/**
 * Obtener la categoría de la página actual
 */
function getCurrentPageCategory() {
    const path = window.location.pathname;
    if (path.includes('tamales.html')) return 'tamales';
    if (path.includes('tortas.html')) return 'tortas';
    if (path.includes('dulces.html')) return 'dulces';
    return null; // Página principal u otra
}

/**
 * Mostrar estado de una categoría específica
 */
function mostrarEstadoCategoria(category, categoryData) {
    const abierto = categoryData.abierto !== false; // Por defecto abierto
    const estado = document.getElementById("estadoNegocio");
    const botonesCarrito = document.querySelectorAll('.add-to-cart-btn, .menu-btn, .promo-btn');
    
    // Nombres y emojis por categoría
    const categoryInfo = {
        tamales: { name: 'Tamales', emoji: '🫔', local: 'Local de Tamales' },
        tortas: { name: 'Tortas', emoji: '🥪', local: 'Local de Tortas' },
        dulces: { name: 'Dulces', emoji: '🍬', local: 'Local de Dulces' }
    };
    
    const info = categoryInfo[category] || { name: category, emoji: '🍽️', local: `Local de ${category}` };
    
    if (estado) {
        if (abierto) {
            // Si está abierto, ocultar el mensaje de estado
            estado.style.display = "none";
        } else {
            // Solo mostrar mensaje cuando está cerrado
            estado.innerHTML = `
                <span style="color: #e74c3c; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.2rem;">🔴</span>
                    <span>${info.emoji} ${info.local} Cerrado</span>
                </span>
            `;
            estado.style.cssText = `
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
                border: 2px solid #e74c3c;
                border-radius: 12px;
                padding: 0.75rem 1rem;
                text-align: center;
                margin: 1rem 0;
                box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
                display: block;
            `;
        }
    }

    // Habilitar/deshabilitar botones según disponibilidad
    actualizarBotones(abierto, botonesCarrito, info.local);
    
    console.log(`🏪 Estado de ${info.local}: ${abierto ? 'Abierto' : 'Cerrado'}`);
}

/**
 * Mostrar estado general en la página principal
 */
function mostrarEstadoGeneral(categoriesData) {
    // En la página principal, no mostrar mensaje de estado general
    // Solo controlar los botones de las fichas de productos individualmente
    // Y agregar indicadores visuales en las fichas
    
    const categoryInfo = {
        tamales: { name: 'Tamales', emoji: '🫔', local: 'Local de Tamales' },
        tortas: { name: 'Tortas', emoji: '🥪', local: 'Local de Tortas' },
        dulces: { name: 'Dulces', emoji: '🍬', local: 'Local de Dulces' }
    };
    
    // Controlar cada categoría individualmente
    CATEGORIES.forEach(category => {
        const categoryData = categoriesData[category] || { abierto: true };
        const isOpen = categoryData.abierto !== false;
        const info = categoryInfo[category];
        
        // Buscar la ficha de producto correspondiente
        const productCard = document.querySelector(`[data-category="${category}"]`);
        
        if (productCard) {
            // Remover indicador anterior si existe
            const existingIndicator = productCard.querySelector('.closed-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            if (!isOpen) {
                // Agregar indicador de "Cerrado por hoy"
                const closedIndicator = document.createElement('div');
                closedIndicator.className = 'closed-indicator';
                closedIndicator.style.cssText = `
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
                    z-index: 10;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                `;
                closedIndicator.innerHTML = '🔴 Cerrado por hoy';
                
                // Asegurar que la ficha tenga position relative
                productCard.style.position = 'relative';
                productCard.insertBefore(closedIndicator, productCard.firstChild);
                
                // Agregar efecto visual a la ficha cerrada
                productCard.style.opacity = '0.7';
                productCard.style.filter = 'grayscale(30%)';
            } else {
                // Restaurar apariencia normal
                productCard.style.opacity = '1';
                productCard.style.filter = 'none';
            }
        }
        
        // Buscar botones específicos de esta categoría por data-category
        const categoryButtons = document.querySelectorAll(`[data-category="${category}"]`);
        
        // También buscar botones promocionales relacionados
        const promoButtons = document.querySelectorAll('.promo-btn');
        promoButtons.forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            const isRelated = buttonText.includes(category) || 
                            (category === 'tamales' && (buttonText.includes('tamal') || buttonText.includes('combo'))) ||
                            (category === 'tortas' && buttonText.includes('torta')) ||
                            (category === 'dulces' && buttonText.includes('dulce'));
            
            if (isRelated) {
                // Agregar a la lista de botones a controlar
                actualizarBoton(button, isOpen, info.local);
            }
        });
        
        // Actualizar estado de los botones de esta categoría
        categoryButtons.forEach(button => {
            actualizarBoton(button, isOpen, info.local);
        });
        
        console.log(`🏪 ${info.local}: ${isOpen ? 'Abierto' : 'Cerrado'}`);
    });
    
    // Ocultar el elemento de estado si existe en la página principal
    const estado = document.getElementById("estadoNegocio");
    if (estado) {
        estado.style.display = "none";
    }
}

/**
 * Actualizar un botón individual
 */
function actualizarBoton(button, isOpen, localName) {
    if (!button) return;
    
    button.disabled = !isOpen;
    if (!isOpen) {
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
        button.title = `${localName} cerrado por hoy`;
        
        // Remover listeners anteriores para evitar duplicados
        button.removeEventListener('click', button._categoryClickHandler);
        
        // Crear nuevo handler
        button._categoryClickHandler = (e) => {
            if (!isOpen) {
                e.preventDefault();
                e.stopPropagation();
                mostrarMensajeCerrado(localName);
            }
        };
        
        // Agregar nuevo listener
        button.addEventListener('click', button._categoryClickHandler);
    } else {
        button.style.opacity = "1";
        button.style.cursor = "pointer";
        button.title = "";
        
        // Remover listener de categoría cerrada si existe
        if (button._categoryClickHandler) {
            button.removeEventListener('click', button._categoryClickHandler);
            button._categoryClickHandler = null;
        }
    }
}

/**
 * Actualizar estado de los botones
 */
function actualizarBotones(disponible, botones, localName) {
    botones.forEach(boton => {
        if (boton) {
            boton.disabled = !disponible;
            if (!disponible) {
                boton.style.opacity = "0.5";
                boton.style.cursor = "not-allowed";
                boton.title = `${localName} cerrado por hoy`;
                
                // Agregar evento para mostrar mensaje cuando esté cerrado
                boton.addEventListener('click', (e) => {
                    if (!disponible) {
                        e.preventDefault();
                        e.stopPropagation();
                        mostrarMensajeCerrado(localName);
                    }
                });
            } else {
                boton.style.opacity = "1";
                boton.style.cursor = "pointer";
                boton.title = "";
            }
        }
    });
}

/**
 * Mostrar mensaje cuando el negocio está cerrado
 */
function mostrarMensajeCerrado(localName = 'el local') {
    // Remover mensaje anterior si existe
    const existingMessage = document.getElementById('category-closed-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Crear modal de mensaje
    const modal = document.createElement('div');
    modal.id = 'category-closed-message';
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

    const isGeneral = localName === 'productos' || localName === 'el local';
    const title = isGeneral ? '¡Local Cerrado!' : `¡${localName} Cerrado!`;
    const message = isGeneral 
        ? 'Lo sentimos, en este momento no estamos atendiendo. Por favor, inténtalo mañana.'
        : `Lo sentimos, el ${localName.toLowerCase()} está cerrado por hoy. Por favor, revisa nuestras otras opciones o inténtalo mañana.`;

    messageContent.innerHTML = `
        <div style="font-size: 4.5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));">🔴</div>
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
        ">
            👍 Entendido
        </button>
    `;

    modal.appendChild(messageContent);
    document.body.appendChild(modal);

    // Agregar estilos de animación
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
    `;
    document.head.appendChild(style);

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarEstado);

// Exportar función para uso manual
export { cargarEstado };