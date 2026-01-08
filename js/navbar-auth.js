/**
 * AUTENTICACIÓN EN NAVBAR - EL GATITO PANZÓN
 * Maneja el estado de autenticación en la barra de navegación
 */

// Variables globales
let currentUser = null;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navbar auth inicializado');
    initializeNavbarAuth();
});

// Función para inicializar la autenticación en el navbar
function initializeNavbarAuth() {
    // Esperar a que Firebase esté disponible
    const checkFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            // Escuchar cambios en el estado de autenticación
            firebase.auth().onAuthStateChanged((user) => {
                currentUser = user;
                updateNavbarForUser(user);
            });
            
            // Configurar event listeners
            setupNavbarEventListeners();
        } else {
            setTimeout(checkFirebase, 100);
        }
    };
    
    checkFirebase();
}

// Función para actualizar el navbar según el usuario
function updateNavbarForUser(user) {
    const loginLink = document.getElementById('login-link');
    const userMenu = document.getElementById('user-menu');
    const userGreeting = document.getElementById('user-greeting');
    
    if (user) {
        // Usuario autenticado - mostrar menú de usuario
        if (loginLink) loginLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Actualizar saludo con el nombre del usuario
        const displayName = user.displayName || user.email.split('@')[0];
        if (userGreeting) {
            userGreeting.textContent = `👤 Hola, ${displayName}`;
        }
        
        console.log('Usuario autenticado en navbar:', displayName);
    } else {
        // Usuario no autenticado - mostrar enlace de login
        if (loginLink) loginLink.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        
        console.log('Usuario no autenticado en navbar');
    }
}

// Función para configurar event listeners del navbar
function setupNavbarEventListeners() {
    // Dropdown toggle
    const userGreeting = document.getElementById('user-greeting');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userGreeting && userDropdown) {
        userGreeting.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
        });
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!userGreeting.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('navbar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleNavbarLogout);
    }
}

// Función para manejar logout desde el navbar
async function handleNavbarLogout() {
    try {
        await firebase.auth().signOut();
        console.log('Usuario desconectado desde navbar');
        
        // Mostrar mensaje de éxito
        showNavbarMessage('Has cerrado sesión correctamente', 'success');
        
        // Opcional: recargar la página después de un breve delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showNavbarMessage('Error al cerrar sesión', 'error');
    }
}

// Función para mostrar mensajes en el navbar
function showNavbarMessage(message, type = 'info') {
    // Crear elemento de mensaje si no existe
    let messageElement = document.getElementById('navbar-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'navbar-message';
        messageElement.className = 'navbar-message';
        document.body.appendChild(messageElement);
    }
    
    // Configurar mensaje
    messageElement.textContent = message;
    messageElement.className = `navbar-message ${type} show`;
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000);
}

// Exportar funciones para uso global
window.navbarAuth = {
    getCurrentUser: () => currentUser,
    logout: handleNavbarLogout
};