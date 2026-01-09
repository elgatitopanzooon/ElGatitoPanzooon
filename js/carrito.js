/**
 * SISTEMA DE CARRITO - EL GATITO PANZÓN
 * Funcionalidad completa del carrito de compras
 */

console.log('🛒 Sistema de carrito cargado');

// Variables globales del carrito
let cartCurrentUser = null;
let cartItems = [];

// Base de datos de productos
const PRODUCTS_DATABASE = {
    // Tamales
    'tamal-pollo': { name: 'Tamal de Pollo', price: 25.00, image: 'images/tamal.png' },
    'tamal-cerdo': { name: 'Tamal de Cerdo', price: 28.00, image: 'images/tamal.png' },
    'tamal-queso': { name: 'Tamal de Queso', price: 22.00, image: 'images/tamal.png' },
    'tamal-dulce': { name: 'Tamal Dulce', price: 20.00, image: 'images/tamal.png' },
    'tamal-oaxaqueno': { name: 'Tamal Oaxaqueño', price: 35.00, image: 'images/tamal.png' },
    'tamal-rajas': { name: 'Tamal de Rajas con Queso', price: 26.00, image: 'images/tamal.png' },
    'tamal-frijol': { name: 'Tamal de Frijol', price: 24.00, image: 'images/tamal.png' },
    'tamal-verde': { name: 'Tamal Verde', price: 30.00, image: 'images/tamal.png' },
    'tamal-mole': { name: 'Tamal de Mole', price: 32.00, image: 'images/tamal.png' },
    'tamal-elote': { name: 'Tamal de Elote', price: 23.00, image: 'images/tamal.png' },
    
    // Tortas
    'torta-jamon': { name: 'Torta de Jamón', price: 45.00, image: 'images/torta.png' },
    'torta-milanesa': { name: 'Torta de Milanesa', price: 55.00, image: 'images/torta.png' },
    'torta-ahogada': { name: 'Torta Ahogada', price: 50.00, image: 'images/torta.png' },
    'torta-pollo': { name: 'Torta de Pollo', price: 48.00, image: 'images/torta.png' },
    'torta-cubana': { name: 'Torta Cubana', price: 65.00, image: 'images/torta.png' },
    'torta-carnitas': { name: 'Torta de Carnitas', price: 52.00, image: 'images/torta.png' },
    'torta-chorizo': { name: 'Torta de Chorizo', price: 47.00, image: 'images/torta.png' },
    'torta-pastor': { name: 'Torta de Pastor', price: 49.00, image: 'images/torta.png' },
    'torta-quesadilla': { name: 'Torta Quesadilla', price: 44.00, image: 'images/torta.png' },
    'torta-lomo': { name: 'Torta de Lomo', price: 58.00, image: 'images/torta.png' },
    
    // Dulces
    'cocadas': { name: 'Cocadas', price: 15.00, image: 'images/dulce.png' },
    'alegrias': { name: 'Alegrías', price: 18.00, image: 'images/dulce.png' },
    'palanquetas': { name: 'Palanquetas', price: 12.00, image: 'images/dulce.png' },
    'jamoncillos': { name: 'Jamoncillos', price: 20.00, image: 'images/dulce.png' },
    'mueganos': { name: 'Muéganos', price: 16.00, image: 'images/dulce.png' },
    'obleas': { name: 'Obleas con Cajeta', price: 14.00, image: 'images/dulce.png' },
    'mazapan': { name: 'Mazapán', price: 10.00, image: 'images/dulce.png' },
    'pepitorias': { name: 'Pepitorias', price: 17.00, image: 'images/dulce.png' },
    'borrachitos': { name: 'Borrachitos', price: 19.00, image: 'images/dulce.png' },
    'gaznates': { name: 'Gaznates', price: 21.00, image: 'images/dulce.png' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando carrito...');
    
    // Asegurar que solo el contenedor correcto esté visible al inicio
    const emptyContainer = document.getElementById('empty-cart-container');
    const cartContainer = document.getElementById('cart-items-container');
    
    if (emptyContainer) {
        emptyContainer.style.display = 'block';
        emptyContainer.classList.remove('force-hidden');
    }
    
    if (cartContainer) {
        cartContainer.style.display = 'none';
        cartContainer.classList.add('force-hidden');
    }
    
    // Esperar a que Firebase esté disponible
    const waitForFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('👤 Estado de autenticación:', user ? user.email : 'No autenticado');
                cartCurrentUser = user;
                loadAndDisplayCart();
                updateCartCounter();
            });
        } else {
            setTimeout(waitForFirebase, 100);
        }
    };
    
    waitForFirebase();
});

// Función principal para cargar y mostrar el carrito
function loadAndDisplayCart() {
    console.log('📦 Cargando carrito...');
    
    if (!cartCurrentUser) {
        console.log('❌ Usuario no autenticado');
        cartItems = [];
        showEmptyCart();
        return;
    }
    
    // Cargar carrito del usuario
    const userId = cartCurrentUser.uid;
    const cartKey = `gatito_cart_${userId}`;
    
    try {
        const cartData = JSON.parse(localStorage.getItem(cartKey) || '{"items": []}');
        console.log(`📊 Datos del carrito para ${userId}:`, cartData);
        
        if (cartData.items && Array.isArray(cartData.items) && cartData.items.length > 0) {
            cartItems = cartData.items;
            console.log(`✅ Cargados ${cartItems.length} productos`);
            showCartWithItems();
        } else {
            console.log('📭 No hay productos en el carrito');
            cartItems = [];
            showEmptyCart();
        }
    } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
        cartItems = [];
        showEmptyCart();
    }
}

// Mostrar carrito vacío
function showEmptyCart() {
    console.log('🔍 Mostrando carrito vacío');
    
    const emptyContainer = document.getElementById('empty-cart-container');
    const cartContainer = document.getElementById('cart-items-container');
    
    if (emptyContainer) {
        emptyContainer.style.display = 'block';
        emptyContainer.classList.remove('force-hidden');
        console.log('✅ empty-cart-container mostrado');
    }
    
    if (cartContainer) {
        cartContainer.style.display = 'none';
        cartContainer.classList.add('force-hidden');
        console.log('✅ cart-items-container ocultado');
    }
    
    // Asegurar que el total del carrito esté oculto
    const cartTotal = document.querySelector('.cart-total');
    if (cartTotal) {
        cartTotal.style.display = 'none';
        console.log('✅ cart-total ocultado');
    }
    
    console.log('✅ Carrito vacío configurado');
}

// Mostrar carrito con productos
function showCartWithItems() {
    console.log('🔍 Mostrando carrito con productos');
    
    const emptyContainer = document.getElementById('empty-cart-container');
    const cartContainer = document.getElementById('cart-items-container');
    
    if (emptyContainer) {
        emptyContainer.style.display = 'none';
        emptyContainer.classList.add('force-hidden');
    }
    
    if (cartContainer) {
        cartContainer.style.display = 'block';
        cartContainer.classList.remove('force-hidden');
    }
    
    // Asegurar que el total del carrito esté visible
    const cartTotal = document.querySelector('.cart-total');
    if (cartTotal) {
        cartTotal.style.display = 'block';
    }
    
    // Generar HTML de productos
    const cartItemsList = document.getElementById('cart-items-list');
    if (cartItemsList) {
        const itemsHTML = cartItems.map(item => createCartItemHTML(item)).join('');
        cartItemsList.innerHTML = itemsHTML;
    }
    
    // Actualizar total
    updateCartTotal();
    console.log('✅ Carrito con productos configurado');
}

// Crear HTML de un producto
function createCartItemHTML(item) {
    return `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} c/u</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Eliminar producto">🗑️</button>
            </div>
        </div>
    `;
}

// Actualizar total del carrito
function updateCartTotal() {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cart-total-amount');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Actualizar cantidad de producto
function updateQuantity(productId, newQuantity) {
    console.log(`🔄 Actualizando cantidad de ${productId} a ${newQuantity}`);
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCartToStorage();
        showCartWithItems();
        updateCartCounter();
        showMessage('Cantidad actualizada', 'success');
    }
}

// Remover producto del carrito
function removeFromCart(productId) {
    console.log(`🗑️ Removiendo producto ${productId}`);
    
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    if (itemIndex >= 0) {
        const removedItem = cartItems.splice(itemIndex, 1)[0];
        saveCartToStorage();
        updateCartCounter();
        
        if (cartItems.length === 0) {
            showEmptyCart();
        } else {
            showCartWithItems();
        }
        
        showMessage(`${removedItem.name} eliminado del carrito`, 'info');
    }
}

// Limpiar carrito
function clearCart() {
    if (cartItems.length === 0) {
        showMessage('El carrito ya está vacío', 'info');
        return;
    }
    
    showConfirmModal(
        '🗑️ Vaciar Carrito',
        '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
        'Esta acción no se puede deshacer.',
        () => {
            cartItems = [];
            saveCartToStorage();
            updateCartCounter();
            showEmptyCart();
            showMessage('✅ Carrito vaciado correctamente', 'success');
        }
    );
}

// Guardar carrito en localStorage
function saveCartToStorage() {
    if (!cartCurrentUser) return;
    
    const userId = cartCurrentUser.uid;
    const cartKey = `gatito_cart_${userId}`;
    const cartData = {
        items: cartItems,
        userId: userId,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem(cartKey, JSON.stringify(cartData));
        console.log(`💾 Carrito guardado para usuario: ${userId}`);
    } catch (error) {
        console.error('❌ Error al guardar carrito:', error);
    }
}

// Actualizar contador del carrito en navbar
function updateCartCounter() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Actualizar en todas las páginas
    const cartLinks = document.querySelectorAll('#cart-link');
    cartLinks.forEach(link => {
        if (totalItems > 0) {
            link.textContent = `🛒 Carrito (${totalItems})`;
        } else {
            link.textContent = '🛒 Carrito';
        }
    });
}

// Proceder al checkout - NUEVA IMPLEMENTACIÓN SIMPLE
function proceedToCheckout() {
    console.log('🔍 Procediendo al checkout');
    
    if (!cartCurrentUser) {
        showMessage('Debes iniciar sesión para continuar', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (cartItems.length === 0) {
        showMessage('Tu carrito está vacío', 'error');
        return;
    }
    
    // Mostrar modal simple de checkout
    showCheckoutModal();
}

// Mostrar modal de checkout simple
function showCheckoutModal() {
    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Crear resumen de productos
    const itemsSummary = cartItems.map(item => 
        `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #152453 0%, #364277 50%, #4e598c 100%);
        border: 3px solid var(--color-gold);
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">💳</div>
        <h3 style="color: var(--color-white); font-size: 1.8rem; font-weight: 800; margin: 0 0 1.5rem 0;">
            Finalizar Pedido
        </h3>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 1.5rem; margin: 1.5rem 0; text-align: left;">
            <h4 style="color: var(--color-gold); margin: 0 0 1rem 0; font-size: 1.2rem;">Resumen del Pedido:</h4>
            <div id="modal-items-summary" style="color: var(--color-white); font-size: 0.95rem; line-height: 1.6;">
                ${cartItems.map(item => `
                    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                        <span>${item.name} x${item.quantity}</span>
                        <span style="color: #d4a373; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div style="border-top: 2px solid var(--color-gold); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--color-white); font-size: 1.3rem; font-weight: 700;">Total:</span>
                <span style="color: #d4a373; font-size: 1.8rem; font-weight: 900;">$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <form id="simple-checkout-form">
            <div style="margin: 1rem 0; text-align: left;">
                <label style="color: var(--color-white); font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    Nombre Completo:
                </label>
                <input type="text" id="modal-customer-name" required 
                       style="width: 100%; padding: 0.8rem; border: none; border-radius: 10px; 
                              background: rgba(255, 255, 255, 0.9); color: #152453; font-weight: 600;
                              box-sizing: border-box;"
                       placeholder="Tu nombre completo">
            </div>
            
            <div style="margin: 1rem 0; text-align: left;">
                <label style="color: var(--color-white); font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    Teléfono de Contacto:
                </label>
                <input type="tel" id="modal-customer-phone" required 
                       style="width: 100%; padding: 0.8rem; border: none; border-radius: 10px; 
                              background: rgba(255, 255, 255, 0.9); color: #152453; font-weight: 600;
                              box-sizing: border-box;"
                       placeholder="55 1234 5678">
            </div>
            
            <div style="margin: 1rem 0; text-align: left;">
                <label style="color: var(--color-white); font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    Dirección de Entrega:
                </label>
                <textarea id="modal-customer-address" required rows="3"
                          style="width: 100%; padding: 0.8rem; border: none; border-radius: 10px; 
                                 background: rgba(255, 255, 255, 0.9); color: #152453; font-weight: 600;
                                 box-sizing: border-box; resize: vertical;"
                          placeholder="Calle, número, colonia, referencias"></textarea>
            </div>
            
            <div style="margin: 1rem 0; text-align: left;">
                <label style="color: var(--color-white); font-weight: 600; display: block; margin-bottom: 0.5rem;">
                    Método de Pago:
                </label>
                <select id="modal-payment-method" required 
                        style="width: 100%; padding: 0.8rem; border: none; border-radius: 10px; 
                               background: rgba(255, 255, 255, 0.9); color: #152453; font-weight: 600;
                               box-sizing: border-box; cursor: pointer;">
                    <option value="">Selecciona método de pago</option>
                    <option value="efectivo">💵 Efectivo (al recibir)</option>
                    <option value="tarjeta">💳 Tarjeta Crédito/Débito (con terminal al recibir)</option>
                </select>
            </div>
            
            <div id="payment-info" style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0; display: none;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--color-white);">
                    <span id="payment-icon" style="font-size: 1.5rem;">💵</span>
                    <span id="payment-text" style="font-weight: 600;">Pago seleccionado</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button type="button" id="modal-cancel-checkout" style="
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.15);
                    color: var(--color-white);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    min-width: 120px;
                ">
                    Cancelar
                </button>
                <button type="submit" style="
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: linear-gradient(135deg, #d4a373 0%, var(--color-orange-dark) 100%);
                    color: var(--color-white);
                    box-shadow: 0 4px 15px rgba(212, 163, 115, 0.4);
                    min-width: 120px;
                ">
                    🛒 Realizar Pedido
                </button>
            </div>
        </form>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-50px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Event listeners
    document.getElementById('modal-cancel-checkout').addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    // Manejar cambio de método de pago
    document.getElementById('modal-payment-method').addEventListener('change', (e) => {
        const paymentInfo = document.getElementById('payment-info');
        const paymentIcon = document.getElementById('payment-icon');
        const paymentText = document.getElementById('payment-text');
        
        if (e.target.value) {
            paymentInfo.style.display = 'block';
            
            if (e.target.value === 'efectivo') {
                paymentIcon.textContent = '💵';
                paymentText.textContent = 'Pago en Efectivo (al recibir)';
            } else if (e.target.value === 'tarjeta') {
                paymentIcon.textContent = '💳';
                paymentText.textContent = 'Tarjeta Crédito/Débito (con terminal al recibir)';
            }
        } else {
            paymentInfo.style.display = 'none';
        }
    });
    
    document.getElementById('simple-checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('modal-customer-name').value.trim();
        const phone = document.getElementById('modal-customer-phone').value.trim();
        const address = document.getElementById('modal-customer-address').value.trim();
        const paymentMethod = document.getElementById('modal-payment-method').value;
        
        if (!name || !phone || !address || !paymentMethod) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Procesar pedido
        processOrder(name, phone, address, paymentMethod);
        modal.remove();
        style.remove();
    });
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
}

// Procesar pedido
function processOrder(customerName, customerPhone, customerAddress, paymentMethod) {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Crear datos del pedido
    const orderData = {
        orderId: generateOrderId(),
        customer: { 
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            email: cartCurrentUser.email 
        },
        items: [...cartItems],
        total: total,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'confirmado'
    };
    
    // Guardar pedido en localStorage
    const orders = JSON.parse(localStorage.getItem('gatito_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('gatito_orders', JSON.stringify(orders));
    
    console.log('📋 Pedido creado:', orderData);
    
    // Enviar pedido por email
    enviarPedidoEmail(orderData);
    
    // Mostrar confirmación
    showOrderConfirmation(orderData);
    
    // Limpiar carrito
    cartItems = [];
    saveCartToStorage();
    updateCartCounter();
    showEmptyCart();
}

// Generar ID de pedido único
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `GP${timestamp}${random}`;
}

// Mostrar confirmación de pedido
function showOrderConfirmation(orderData) {
    showMessage(`✅ ¡Pedido ${orderData.orderId} realizado! Llegará en 30-45 minutos`, 'success');
    
    // Mostrar modal de confirmación
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #152453 0%, #364277 50%, #4e598c 100%);
        border: 3px solid var(--color-gold);
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
        <h3 style="color: var(--color-white); font-size: 1.8rem; font-weight: 800; margin: 0 0 1rem 0;">
            ¡Pedido Realizado!
        </h3>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; margin: 1rem 0;">
            Tu pedido ha sido enviado correctamente.<br>
            <strong style="color: var(--color-gold);">Llegará en 30-45 minutos</strong>
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 1.5rem; margin: 2rem 0; text-align: left;">
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Número de Pedido:</strong> ${orderData.orderId}
            </p>
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Cliente:</strong> ${orderData.customer.name}
            </p>
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Teléfono:</strong> ${orderData.customer.phone}
            </p>
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Dirección:</strong> ${orderData.customer.address}
            </p>
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Total:</strong> $${orderData.total.toFixed(2)}
            </p>
            <p style="margin: 0.5rem 0; color: var(--color-white);">
                <strong style="color: var(--color-gold);">Método de Pago:</strong> ${orderData.paymentMethod === 'efectivo' ? '💵 Efectivo (al recibir)' : '💳 Tarjeta Crédito/Débito (con terminal al recibir)'}
            </p>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
            <a href="index.html" style="
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, var(--color-orange-dark) 0%, var(--color-primary) 50%, #d4a373 100%);
                color: var(--color-white);
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 120px;
            ">
                🏠 Volver al Inicio
            </a>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, #d4a373 0%, var(--color-orange-dark) 100%);
                color: var(--color-white);
                min-width: 120px;
            ">
                ✅ Cerrar
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Mostrar mensajes
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('cart-message');
    if (messageElement) {
        let icon = '';
        let bgColor = '';
        
        switch (type) {
            case 'success':
                icon = '✅ ';
                bgColor = '#27ae60';
                break;
            case 'error':
                icon = '❌ ';
                bgColor = '#e74c3c';
                break;
            case 'info':
                icon = 'ℹ️ ';
                bgColor = '#3498db';
                break;
        }
        
        messageElement.innerHTML = `${icon}${message}`;
        messageElement.style.backgroundColor = bgColor;
        messageElement.style.color = 'white';
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 4000);
    }
}

// Función global para agregar productos al carrito (llamada desde otras páginas)
window.addToCart = function(productId, quantity = 1) {
    console.log(`🛒 Agregando al carrito: ${productId}`);
    
    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('❌ Firebase no está disponible');
        alert('Error: Sistema no disponible. Recarga la página.');
        return false;
    }
    
    // Obtener usuario actual directamente de Firebase
    const user = firebase.auth().currentUser;
    
    // Verificar autenticación
    if (!user) {
        alert('Debes iniciar sesión para agregar productos al carrito');
        window.location.href = 'login.html';
        return false;
    }
    
    const product = PRODUCTS_DATABASE[productId];
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        alert('Error: Producto no encontrado');
        return false;
    }
    
    // Cargar carrito actual
    const userId = user.uid;
    const cartKey = `gatito_cart_${userId}`;
    let cartData = JSON.parse(localStorage.getItem(cartKey) || '{"items": []}');
    
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cartData.items.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        cartData.items[existingItemIndex].quantity += quantity;
    } else {
        cartData.items.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Guardar carrito
    cartData.userId = userId;
    cartData.timestamp = Date.now();
    localStorage.setItem(cartKey, JSON.stringify(cartData));
    
    console.log(`✅ ${product.name} agregado al carrito`);
    
    // Mostrar mensaje de confirmación
    showCartNotification(`✅ ${product.name} agregado al carrito`);
    
    // Actualizar contador en todas las páginas
    updateCartCounterGlobal();
    
    return true;
};

// Función para mostrar notificaciones del carrito
function showCartNotification(message) {
    // Remover notificación anterior si existe
    const existingNotification = document.getElementById('cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        font-weight: bold;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar salida y remover
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para actualizar contador del carrito globalmente
function updateCartCounterGlobal() {
    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined' || !firebase.auth) {
        return;
    }
    
    const user = firebase.auth().currentUser;
    if (!user) {
        // Usuario no autenticado, mostrar carrito vacío
        const cartLinks = document.querySelectorAll('#cart-link');
        cartLinks.forEach(link => {
            link.textContent = '🛒 Carrito';
        });
        return;
    }
    
    const userId = user.uid;
    const cartKey = `gatito_cart_${userId}`;
    const cartData = JSON.parse(localStorage.getItem(cartKey) || '{"items": []}');
    const totalItems = cartData.items ? cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    const cartLinks = document.querySelectorAll('#cart-link');
    cartLinks.forEach(link => {
        if (totalItems > 0) {
            link.textContent = `🛒 Carrito (${totalItems})`;
        } else {
            link.textContent = '🛒 Carrito';
        }
    });
}

// Exponer funciones globalmente
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

// Función para mostrar modal de confirmación estético
function showConfirmModal(title, message, subtitle, onConfirm) {
    // Remover modal anterior si existe
    const existingModal = document.getElementById('confirm-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 450px;
        width: 90%;
        text-align: center;
        backdrop-filter: blur(15px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">${title.split(' ')[0]}</div>
        <h3 style="color: var(--color-white); font-size: 1.5rem; font-weight: 800; margin: 0 0 1rem 0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);">
            ${title.substring(title.indexOf(' ') + 1)}
        </h3>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.1rem; line-height: 1.5; margin: 0 0 0.5rem 0;">
            ${message}
        </p>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; margin: 0 0 2rem 0; font-style: italic;">
            ${subtitle}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="modal-cancel" style="
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: rgba(255, 255, 255, 0.15);
                color: var(--color-white);
                border: 2px solid rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(10px);
                min-width: 100px;
            ">
                Cancelar
            </button>
            <button id="modal-confirm" style="
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: var(--color-white);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
                min-width: 100px;
            ">
                Confirmar
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-50px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        #modal-cancel:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
        }
        #modal-confirm:hover {
            background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.6);
        }
    `;
    document.head.appendChild(style);
    
    // Event listeners
    document.getElementById('modal-cancel').addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            style.remove();
        }, 300);
    });
    
    document.getElementById('modal-confirm').addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            style.remove();
            onConfirm();
        }, 300);
    });
    
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
    
    // Agregar animación de salida
    style.textContent += `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
}

console.log('✅ Sistema de carrito completamente cargado');

// Función para enviar pedido por email usando EmailJS
function enviarPedidoEmail(orderData) {
    console.log('📧 Enviando pedido por email...', orderData);
    
    // Preparar los parámetros para EmailJS
    const params = {
        nombre: orderData.customer.name,
        email: orderData.customer.email,
        contacto: orderData.customer.phone,
        direccion: orderData.customer.address,
        total: `$${orderData.total.toFixed(2)}`,
        pedido_id: orderData.orderId,
        metodo: orderData.paymentMethod === 'efectivo' ? 'Efectivo (al recibir)' : 'Tarjeta Crédito/Débito (con terminal al recibir)',
        pedido: orderData.items.map(item => 
            `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n'),
        fecha: new Date(orderData.timestamp).toLocaleString('es-MX')
    };
    
    console.log('📧 Parámetros del email:', params);
    
    // Enviar email usando EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.send("service_cztcm8a", "template_5zydgma", params)
            .then((response) => {
                console.log('✅ Email enviado correctamente:', response);
                showMessage('✅ Pedido enviado por email correctamente', 'success');
            })
            .catch((error) => {
                console.error('❌ Error al enviar email:', error);
                showMessage('⚠️ Pedido guardado, pero hubo un problema al enviar el email', 'info');
            });
    } else {
        console.warn('⚠️ EmailJS no está disponible');
        showMessage('⚠️ Pedido guardado correctamente', 'info');
    }
}