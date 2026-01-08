/**
 * AUTENTICACIÓN FIREBASE - EL GATITO PANZÓN
 * Funcionalidad para login y registro de usuarios
 */

// Variables globales
let currentUser = null;

// Función de inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de autenticación cargado');
    
    // Verificar que Firebase esté disponible
    setTimeout(() => {
        if (typeof firebase === 'undefined') {
            console.error('Firebase no se cargó correctamente');
            showMessage('Error: No se pudo cargar Firebase. Verifica tu conexión a internet.', 'error');
        } else {
            console.log('Firebase disponible:', firebase);
        }
    }, 1000);
    
    // Inicializar funcionalidades
    initializeAuthForms();
    initializeAuthState();
});

// Función para inicializar los formularios de autenticación
function initializeAuthForms() {
    console.log('Inicializando formularios de autenticación...');
    
    // Obtener elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Event listeners para cambiar entre formularios
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', showRegisterForm);
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginForm);
    }
    
    // Event listeners para los formularios
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Event listener para cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Validación en tiempo real
    initializeRealTimeValidation();
    
    console.log('Formularios de autenticación inicializados');
}
// Función para mostrar el formulario de registro
function showRegisterForm() {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    
    if (loginContainer && registerContainer) {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
        
        // Limpiar formularios
        clearForm('login-form');
        clearForm('register-form');
        clearMessages();
        
        // Focus en el primer campo
        const firstInput = registerContainer.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Función para mostrar el formulario de login
function showLoginForm() {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    
    if (loginContainer && registerContainer) {
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
        
        // Limpiar formularios
        clearForm('login-form');
        clearForm('register-form');
        clearMessages();
        
        // Focus en el primer campo
        const firstInput = loginContainer.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validar campos
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Mostrar estado de carga
    setLoadingState('login-btn', true);
    clearMessages();
    
    try {
        // Intentar iniciar sesión con Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Usuario autenticado:', user.email);
        const userName = user.displayName || user.email.split('@')[0];
        showMessage(`¡Bienvenido de vuelta, ${userName}! Redirigiendo...`, 'success');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        handleAuthError(error);
    } finally {
        setLoadingState('login-btn', false);
    }
}

// Función para manejar el registro
async function handleRegister(event) {
    event.preventDefault();
    
    console.log('Iniciando proceso de registro...');
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    console.log('Datos del formulario:', { name, email, passwordLength: password.length });
    
    // Validar campos
    if (!validateRegisterForm(name, email, password, confirmPassword)) {
        console.log('Validación de formulario falló');
        return;
    }
    
    console.log('Validación de formulario exitosa');
    
    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('Firebase no está disponible');
        showMessage('Error: Firebase no está cargado correctamente.', 'error');
        return;
    }
    
    // Mostrar estado de carga
    setLoadingState('register-btn', true);
    clearMessages();
    
    try {
        console.log('Intentando crear usuario con Firebase...');
        
        // Crear usuario con Firebase
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Usuario creado exitosamente:', user.uid);
        
        // Actualizar el perfil con el nombre
        await user.updateProfile({
            displayName: name
        });
        
        console.log('Perfil actualizado con nombre:', name);
        console.log('Usuario registrado:', user.email);
        showMessage(`¡Cuenta creada exitosamente! Bienvenido a El Gatito Panzón, ${name}!`, 'success');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error detallado al registrar usuario:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje de error:', error.message);
        handleAuthError(error);
    } finally {
        setLoadingState('register-btn', false);
    }
}
// Función para manejar el cierre de sesión
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log('Usuario desconectado');
        showMessage('Has cerrado sesión correctamente.', 'success');
        
        // Mostrar formularios de login después de un breve delay
        setTimeout(() => {
            showLoginForm();
        }, 1000);
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showMessage('Error al cerrar sesión. Inténtalo de nuevo.', 'error');
    }
}

// Función para inicializar el estado de autenticación
function initializeAuthState() {
    console.log('Inicializando estado de autenticación...');
    
    // Esperar a que Firebase esté disponible
    const checkFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            console.log('Firebase está disponible, configurando listener de autenticación');
            
            // Escuchar cambios en el estado de autenticación
            firebase.auth().onAuthStateChanged((user) => {
                console.log('Estado de autenticación cambió:', user ? user.email : 'No autenticado');
                currentUser = user;
                updateUIForAuthState(user);
            });
        } else {
            console.log('Firebase no está disponible aún, reintentando...');
            // Reintentar después de un breve delay
            setTimeout(checkFirebase, 100);
        }
    };
    
    checkFirebase();
}

// Función para actualizar la UI según el estado de autenticación
function updateUIForAuthState(user) {
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const userPanel = document.getElementById('user-panel');
    
    if (user) {
        // Usuario autenticado - mostrar panel de usuario
        if (loginContainer) loginContainer.style.display = 'none';
        if (registerContainer) registerContainer.style.display = 'none';
        if (userPanel) {
            userPanel.style.display = 'block';
            
            // Actualizar información del usuario
            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            
            if (userName) userName.textContent = user.displayName || 'Usuario';
            if (userEmail) userEmail.textContent = user.email;
        }
    } else {
        // Usuario no autenticado - mostrar formularios
        if (userPanel) userPanel.style.display = 'none';
        if (loginContainer) loginContainer.style.display = 'block';
        if (registerContainer) registerContainer.style.display = 'none';
    }
}

// Función para validar el formulario de login
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Validar email
    if (!email) {
        showFieldError('login-email-error', 'El correo electrónico es requerido');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('login-email-error', 'Ingresa un correo electrónico válido');
        isValid = false;
    } else {
        clearFieldError('login-email-error');
    }
    
    // Validar contraseña
    if (!password) {
        showFieldError('login-password-error', 'La contraseña es requerida');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('login-password-error', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    } else {
        clearFieldError('login-password-error');
    }
    
    return isValid;
}
// Función para validar el formulario de registro
function validateRegisterForm(name, email, password, confirmPassword) {
    let isValid = true;
    
    // Validar nombre
    if (!name) {
        showFieldError('register-name-error', 'El nombre es requerido');
        isValid = false;
    } else if (name.length < 2) {
        showFieldError('register-name-error', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    } else {
        clearFieldError('register-name-error');
    }
    
    // Validar email
    if (!email) {
        showFieldError('register-email-error', 'El correo electrónico es requerido');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('register-email-error', 'Ingresa un correo electrónico válido');
        isValid = false;
    } else {
        clearFieldError('register-email-error');
    }
    
    // Validar contraseña
    if (!password) {
        showFieldError('register-password-error', 'La contraseña es requerida');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('register-password-error', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    } else {
        clearFieldError('register-password-error');
    }
    
    // Validar confirmación de contraseña
    if (!confirmPassword) {
        showFieldError('register-confirm-password-error', 'Confirma tu contraseña');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('register-confirm-password-error', 'Las contraseñas no coinciden');
        isValid = false;
    } else {
        clearFieldError('register-confirm-password-error');
    }
    
    return isValid;
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar errores en campos específicos
function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Agregar clase de error al input
        const input = errorElement.previousElementSibling;
        if (input) {
            input.classList.add('error');
        }
    }
}

// Función para limpiar errores de campos específicos
function clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Remover clase de error del input
        const input = errorElement.previousElementSibling;
        if (input) {
            input.classList.remove('error');
        }
    }
}
// Función para mostrar mensajes generales mejorada
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('auth-message');
    if (messageElement) {
        // Agregar iconos según el tipo
        let icon = '';
        switch (type) {
            case 'success':
                icon = '🎉 ';
                break;
            case 'error':
                icon = '⚠️ ';
                break;
            case 'info':
                icon = 'ℹ️ ';
                break;
        }
        
        messageElement.innerHTML = `<span style="margin-left: 30px;">${icon}${message}</span>`;
        messageElement.className = `auth-message ${type}`;
        messageElement.style.display = 'block';
        
        // Trigger animation
        messageElement.style.animation = 'none';
        messageElement.offsetHeight; // Trigger reflow
        messageElement.style.animation = 'slideInDown 0.4s ease-out';
        
        // Auto-ocultar después de tiempo específico
        const hideTime = type === 'success' ? 4000 : type === 'error' ? 6000 : 5000;
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                messageElement.style.display = 'none';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            }, 300);
        }, hideTime);
    }
}

// Función para limpiar mensajes
function clearMessages() {
    const messageElement = document.getElementById('auth-message');
    if (messageElement) {
        messageElement.style.display = 'none';
        messageElement.textContent = '';
    }
    
    // Limpiar todos los errores de campos
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
    
    // Remover clases de error de inputs
    const inputs = document.querySelectorAll('.form-input.error');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Función para limpiar formularios
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        
        // Limpiar errores específicos del formulario
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
        });
        
        // Remover clases de error
        const inputs = form.querySelectorAll('.form-input.error');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }
}

// Función para manejar estados de carga en botones
function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (button) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (isLoading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
}

// Función para manejar errores de Firebase
function handleAuthError(error) {
    console.log('Manejando error de Firebase:', error);
    
    let message = 'Ha ocurrido un error. Inténtalo de nuevo.';
    
    switch (error.code) {
        case 'auth/user-not-found':
            message = 'No existe una cuenta con este correo electrónico.';
            break;
        case 'auth/wrong-password':
            message = 'Contraseña incorrecta.';
            break;
        case 'auth/email-already-in-use':
            message = 'Ya existe una cuenta con este correo electrónico.';
            break;
        case 'auth/weak-password':
            message = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
            break;
        case 'auth/invalid-email':
            message = 'El correo electrónico no es válido.';
            break;
        case 'auth/too-many-requests':
            message = 'Demasiados intentos fallidos. Inténtalo más tarde.';
            break;
        case 'auth/network-request-failed':
            message = 'Error de conexión. Verifica tu internet.';
            break;
        case 'auth/operation-not-allowed':
            message = 'El registro de usuarios no está habilitado. Contacta al administrador.';
            break;
        case 'auth/invalid-api-key':
            message = 'Error de configuración. Contacta al administrador.';
            break;
        case 'auth/unauthorized-domain':
            message = 'Este dominio no está autorizado. Contacta al administrador.';
            break;
        case 'auth/app-not-authorized':
            message = 'La aplicación no está autorizada para usar Firebase Authentication.';
            break;
        case 'auth/invalid-user-token':
            message = 'Token de usuario inválido. Intenta cerrar sesión e iniciar de nuevo.';
            break;
        case 'auth/user-token-expired':
            message = 'Tu sesión ha expirado. Inicia sesión de nuevo.';
            break;
        default:
            console.error('Error de Firebase no manejado:', error.code, error.message);
            message = `Error (${error.code}): ${error.message}`;
    }
    
    showMessage(message, 'error');
}
// Función para inicializar validación en tiempo real
function initializeRealTimeValidation() {
    // Validación para campos de login
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                showFieldError('login-email-error', 'Ingresa un correo electrónico válido');
            } else if (email) {
                clearFieldError('login-email-error');
            }
        });
        
        loginEmail.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError('login-email-error');
            }
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('input', function() {
            if (this.value.length >= 6) {
                clearFieldError('login-password-error');
            }
        });
    }
    
    // Validación para campos de registro
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    
    if (registerName) {
        registerName.addEventListener('input', function() {
            if (this.value.trim().length >= 2) {
                clearFieldError('register-name-error');
            }
        });
    }
    
    if (registerEmail) {
        registerEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                showFieldError('register-email-error', 'Ingresa un correo electrónico válido');
            } else if (email) {
                clearFieldError('register-email-error');
            }
        });
        
        registerEmail.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError('register-email-error');
            }
        });
    }
    
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            if (this.value.length >= 6) {
                clearFieldError('register-password-error');
            }
            
            // Validar confirmación de contraseña si ya tiene valor
            const confirmPassword = document.getElementById('register-confirm-password');
            if (confirmPassword && confirmPassword.value) {
                if (this.value === confirmPassword.value) {
                    clearFieldError('register-confirm-password-error');
                } else {
                    showFieldError('register-confirm-password-error', 'Las contraseñas no coinciden');
                }
            }
        });
    }
    
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener('input', function() {
            const password = document.getElementById('register-password');
            if (password && this.value === password.value) {
                clearFieldError('register-confirm-password-error');
            } else if (this.value) {
                showFieldError('register-confirm-password-error', 'Las contraseñas no coinciden');
            }
        });
    }
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return currentUser;
}

// Función para verificar si el usuario está autenticado
function isUserAuthenticated() {
    return currentUser !== null;
}

// Exportar funciones para uso global
window.authFunctions = {
    getCurrentUser,
    isUserAuthenticated,
    handleLogout
};
// Función de prueba para verificar Firebase
function testFirebaseConnection() {
    console.log('Probando conexión con Firebase...');
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase no está definido');
        return false;
    }
    
    if (!firebase.auth) {
        console.error('Firebase Auth no está disponible');
        return false;
    }
    
    try {
        const auth = firebase.auth();
        console.log('Firebase Auth inicializado correctamente:', auth);
        return true;
    } catch (error) {
        console.error('Error al acceder a Firebase Auth:', error);
        return false;
    }
}

// Función para mostrar información de depuración
function showDebugInfo() {
    console.log('=== INFORMACIÓN DE DEPURACIÓN ===');
    console.log('Firebase disponible:', typeof firebase !== 'undefined');
    console.log('Firebase Auth disponible:', typeof firebase !== 'undefined' && firebase.auth);
    console.log('Usuario actual:', currentUser);
    console.log('URL actual:', window.location.href);
    console.log('================================');
}

// Agregar función de depuración al objeto global
window.debugAuth = {
    testFirebaseConnection,
    showDebugInfo,
    getCurrentUser,
    isUserAuthenticated
};
// Función de prueba para registro
async function testRegistration() {
    console.log('Probando registro con datos de prueba...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'test123456';
    
    try {
        console.log('Intentando crear usuario de prueba...');
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(testEmail, testPassword);
        console.log('✅ Usuario de prueba creado exitosamente:', userCredential.user.uid);
        
        // Eliminar usuario de prueba
        await userCredential.user.delete();
        console.log('✅ Usuario de prueba eliminado');
        
        return true;
    } catch (error) {
        console.error('❌ Error en prueba de registro:', error);
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        return false;
    }
}

// Agregar función de prueba al objeto de depuración
window.debugAuth.testRegistration = testRegistration;