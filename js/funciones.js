/**
 * FUNCIONES JAVASCRIPT - EL GATITO PANZÓN
 * Funcionalidad para la página de inicio
 */

console.log('funciones.js cargado correctamente');

// Configuración global
const CONFIG = {
    // Google Maps configuración (se configurará más adelante)
    googleMaps: {
        apiKey: 'AIzaSyCINDBknkU2zwMAmOgLfpCnV6F01dfYnbA', // Reemplazar con la clave real
        center: { lat: 19.600928, lng: -99.047452 }, // Centro entre las ubicaciones de Ecatepec
        zoom: 12
    },
    
    // Datos de productos
    products: [
        {
            id: 1,
            name: 'Tamales',
            image: '../image/tamal.png',
            category: 'tamales'
        },
        {
            id: 2,
            name: 'Tortas',
            image: '../image/torta.png',
            category: 'tortas'
        },
        {
            id: 3,
            name: 'Dulces',
            image: '../image/dulce.png',
            category: 'dulces'
        }
    ],
    
    // Ubicaciones de los locales
    locations: [
        {
            id: 1,
            name: 'TAMALES',
            lat: 19.614807100555986,
            lng: -99.00600436056601,
            address: 'México-texcoco S/N, Santa Cruz Venta de Carpio, 55060 Ecatepec de Morelos, Méx.',
            hours: 'Lunes a Domingo: 6:00 AM - 10:00 AM'
        },
        {
            id: 2,
            name: 'TORTAS',
            lat: 19.616049986705374,
            lng: -99.08766238015005,
            address: 'Calle, Sierra Fría #1, Parque Residencial Coacalco, 55719 San Francisco Coacalco, Méx.',
            hours: 'Lunes a Domingo: 6:30 AM - 1:20 PM'
        },
        {
            id: 3,
            name: 'DULCES',
            lat: 19.571029362677734,
            lng: -99.01930817324913,
            address: 'Cedro Manzana 027, Sin Nombre, 55118 Ecatepec de Morelos, Méx.',
            hours: 'Martes a Domingo: 7:00 AM - 3:00 PM'
        }
    ]
};

// Función de inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('El Gatito Panzón - Página cargada correctamente');
    
    // Inicializar funcionalidades
    initializeNavigation();
    initializeProductCards();
    initializeMapFeatures();
    initializeErrorHandling();
    
    // El mapa se inicializará cuando Google Maps API esté lista
});

// Función para inicializar la navegación
function initializeNavigation() {
    // Se implementará cuando se cree la barra de navegación
    console.log('Navegación inicializada');
}

// Función para inicializar las fichas de productos
function initializeProductCards() {
    console.log('Inicializando fichas de productos...');
    
    // Obtener todos los botones de menú
    const menuButtons = document.querySelectorAll('.menu-btn');
    console.log(`Encontrados ${menuButtons.length} botones de menú`);
    
    // Agregar event listeners a cada botón
    menuButtons.forEach((button, index) => {
        const category = button.getAttribute('data-category');
        console.log(`Configurando botón ${index + 1}: ${category}`);
        
        button.addEventListener('click', handleMenuButtonClick);
        
        // Agregar feedback visual
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Agregar efectos hover a las fichas de productos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    console.log(`Fichas de productos inicializadas: ${menuButtons.length} botones configurados`);
}

// Función para manejar clics en botones de menú
function handleMenuButtonClick(event) {
    const button = event.target;
    const category = button.getAttribute('data-category');
    
    console.log(`Navegando a menú de: ${category}`);
    
    // Feedback visual del clic
    button.style.transform = 'translateY(0)';
    setTimeout(() => {
        button.style.transform = 'translateY(-2px)';
    }, 150);
    
    // Implementar navegación a las páginas de menú
    switch(category) {
        case 'tamales':
            console.log('Navegando a menú de Tamales');
            window.location.href = 'tamales.html';
            break;
        case 'tortas':
            console.log('Navegando a menú de Tortas');
            window.location.href = 'tortas.html';
            break;
        case 'dulces':
            console.log('Navegando a menú de Dulces');
            window.location.href = 'dulces.html';
            break;
        default:
            console.log('Categoría no reconocida:', category);
    }
}

// Función para mostrar mensaje temporal (solo para casos especiales como conectividad)
function showTemporaryMessage(message) {
    // Crear elemento de mensaje si no existe
    let messageElement = document.getElementById('temp-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'temp-message';
        messageElement.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background-color: var(--color-primary, #8b0e0e);
            color: var(--color-secondary, #fff4ee);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-weight: bold;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(messageElement);
    }
    
    // Mostrar mensaje
    messageElement.textContent = message;
    messageElement.style.transform = 'translateX(0)';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageElement.style.transform = 'translateX(100%)';
    }, 3000);
}

// Variables globales para el mapa
let map;
let markers = [];
let infoWindows = [];

// Función para inicializar Google Maps (callback para la API)
function initMap() {
    console.log('Inicializando Google Maps...');
    
    try {
        // Verificar que Google Maps API esté disponible
        if (typeof google === 'undefined' || !google.maps) {
            console.error('Google Maps API no está disponible');
            showMapError('Error al cargar Google Maps. Mostrando lista de ubicaciones.');
            return;
        }
        
        console.log('Google Maps API cargada correctamente');
        
        // Configuración del mapa
        const mapOptions = {
            center: CONFIG.googleMaps.center,
            zoom: CONFIG.googleMaps.zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "transit",
                    "elementType": "labels",
                    "stylers": [{"visibility": "off"}]
                }
            ],
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        };
        
        // Crear el mapa
        const mapContainer = document.getElementById('google-map');
        if (!mapContainer) {
            console.error('Contenedor del mapa no encontrado');
            return;
        }
        
        map = new google.maps.Map(mapContainer, mapOptions);
        
        // Ocultar placeholder una vez que el mapa se carga
        const placeholder = mapContainer.querySelector('.map-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Agregar marcadores
        addMarkersToMap();
        
        // Ajustar vista para mostrar todos los marcadores
        if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds);
            
            // Asegurar zoom mínimo
            google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
                if (map.getZoom() > 15) {
                    map.setZoom(15);
                }
            });
        }
        
        console.log('Google Maps inicializado correctamente');
        
    } catch (error) {
        console.error('Error al inicializar Google Maps:', error);
        showMapError('Error al cargar el mapa. Mostrando lista de ubicaciones.');
    }
}

// Función para agregar marcadores al mapa
function addMarkersToMap() {
    if (!map) {
        console.error('Mapa no inicializado');
        return;
    }
    
    // Limpiar marcadores existentes
    clearMarkers();
    
    // Obtener ubicaciones desde la configuración y el HTML
    const locations = getLocationsData();
    
    locations.forEach((location, index) => {
        // Crear marcador
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#8b0e0e"/>
                        <circle cx="15" cy="15" r="8" fill="#fff4ee"/>
                        <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="#8b0e0e">🍽️</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 40),
                anchor: new google.maps.Point(15, 40)
            },
            animation: google.maps.Animation.DROP
        });
        
        // Crear InfoWindow
        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(location)
        });
        
        // Agregar event listener para clic en marcador
        marker.addListener('click', function() {
            // Cerrar otras InfoWindows
            infoWindows.forEach(iw => iw.close());
            
            // Abrir esta InfoWindow
            infoWindow.open(map, marker);
            
            // Centrar mapa en el marcador
            map.panTo(marker.getPosition());
        });
        
        // Guardar referencias
        markers.push(marker);
        infoWindows.push(infoWindow);
    });
    
    console.log(`${markers.length} marcadores agregados al mapa`);
    
    // Agregar interactividad mejorada
    enhanceMarkerInteractivity();
}

// Función para obtener datos de ubicaciones
function getLocationsData() {
    const locations = [...CONFIG.locations]; // Copiar ubicaciones de configuración
    
    // Agregar ubicaciones desde el HTML
    const locationElements = document.querySelectorAll('.location-item');
    locationElements.forEach(element => {
        const lat = parseFloat(element.getAttribute('data-lat'));
        const lng = parseFloat(element.getAttribute('data-lng'));
        const name = element.querySelector('.location-name')?.textContent || 'Ubicación';
        const address = element.querySelector('.location-address')?.textContent || '';
        const hours = element.querySelector('.location-hours')?.textContent || '';
        
        if (!isNaN(lat) && !isNaN(lng)) {
            // Verificar si ya existe en CONFIG
            const exists = locations.some(loc => 
                Math.abs(loc.lat - lat) < 0.001 && Math.abs(loc.lng - lng) < 0.001
            );
            
            if (!exists) {
                locations.push({ lat, lng, name, address, hours });
            }
        }
    });
    
    return locations;
}

// Función para crear contenido de InfoWindow
function createInfoWindowContent(location) {
    return `
        <div style="max-width: 250px; font-family: Arial, sans-serif;">
            <h4 style="color: #8b0e0e; margin: 0 0 8px 0; font-size: 16px;">${location.name}</h4>
            <p style="margin: 4px 0; color: #020d04; font-size: 14px;">
                <strong>📍 Dirección:</strong><br>
                ${location.address}
            </p>
            <p style="margin: 4px 0; color: #020d04; font-size: 14px;">
                <strong>🕒 Horarios:</strong><br>
                ${location.hours}
            </p>
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="openDirections(${location.lat}, ${location.lng})" 
                        style="background: #8b0e0e; color: #fff4ee; border: none; padding: 6px 12px; 
                               border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Cómo llegar
                </button>
            </div>
        </div>
    `;
}

// Función para limpiar marcadores
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    infoWindows.forEach(iw => iw.close());
    infoWindows = [];
}

// Función para mostrar error del mapa
function showMapError(message) {
    const mapContainer = document.getElementById('google-map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-error">
                <div class="map-error-content">
                    <div class="map-error-icon">🗺️</div>
                    <h4 class="map-error-title">Error al cargar el mapa</h4>
                    <p class="map-error-message">${message}</p>
                    <p class="map-error-suggestion">Consulta la lista de ubicaciones a continuación para encontrar nuestros puntos de venta.</p>
                </div>
            </div>
        `;
    }
}

// Función para manejar errores de carga de imágenes
function handleImageError(img, fallbackText = '📷') {
    img.style.display = 'flex';
    img.style.alignItems = 'center';
    img.style.justifyContent = 'center';
    img.style.background = 'linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%)';
    img.style.color = '#ff8c42';
    img.style.fontSize = '2rem';
    img.style.minHeight = '150px';
    img.innerHTML = fallbackText;
    img.removeAttribute('src');
}

// Función para inicializar manejo de errores de recursos
function initializeErrorHandling() {
    console.log('Inicializando manejo de errores...');
    
    // Manejar errores de imágenes
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Error cargando imagen: ${this.src}`);
            
            if (this.classList.contains('hero-logo')) {
                handleImageError(this, '🍽️');
                this.style.width = '200px';
                this.style.height = '200px';
                this.style.borderRadius = '50%';
                this.style.border = '3px solid #ff8c42';
            } else if (this.classList.contains('product-image')) {
                handleImageError(this, '📷');
            }
        });
        
        // También manejar casos donde src está vacío
        if (!img.src || img.src === '' || img.src === '#') {
            img.dispatchEvent(new Event('error'));
        }
    });
    
    // Manejar errores de Google Maps con timeout
    setTimeout(() => {
        if (typeof google === 'undefined' || !map) {
            console.warn('Google Maps no se cargó correctamente');
            showMapError('No se pudo cargar Google Maps. Verifica tu conexión a internet.');
        }
    }, 10000); // 10 segundos timeout
    
    // Manejar errores de red
    window.addEventListener('online', function() {
        console.log('Conexión restaurada');
        showTemporaryMessage('Conexión a internet restaurada');
    });
    
    window.addEventListener('offline', function() {
        console.warn('Conexión perdida');
        showTemporaryMessage('Sin conexión a internet. Algunas funciones pueden no estar disponibles.');
    });
}

// Función para abrir direcciones en Google Maps
function openDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Función para agregar interactividad adicional a los marcadores
function enhanceMarkerInteractivity() {
    if (!map || markers.length === 0) {
        return;
    }
    
    // Agregar efectos hover a los marcadores
    markers.forEach((marker, index) => {
        // Efecto hover - cambiar icono
        marker.addListener('mouseover', function() {
            marker.setIcon({
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="35" height="45" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 0C7.835 0 0 7.835 0 17.5c0 9.665 17.5 27.5 17.5 27.5s17.5-17.835 17.5-27.5C35 7.835 27.165 0 17.5 0z" fill="#020d04"/>
                        <circle cx="17.5" cy="17.5" r="10" fill="#fff4ee"/>
                        <text x="17.5" y="22" text-anchor="middle" font-family="Arial" font-size="14" fill="#8b0e0e">🍽️</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(35, 45),
                anchor: new google.maps.Point(17.5, 45)
            });
        });
        
        marker.addListener('mouseout', function() {
            marker.setIcon({
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#8b0e0e"/>
                        <circle cx="15" cy="15" r="8" fill="#fff4ee"/>
                        <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="#8b0e0e">🍽️</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 40),
                anchor: new google.maps.Point(15, 40)
            });
        });
        
        // Agregar animación al hacer clic
        marker.addListener('click', function() {
            // Animar el marcador
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 2000);
        });
    });
    
    // Conectar lista de ubicaciones con marcadores
    const locationItems = document.querySelectorAll('.location-item');
    locationItems.forEach((item, index) => {
        if (markers[index]) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function() {
                // Trigger click en el marcador correspondiente
                google.maps.event.trigger(markers[index], 'click');
                
                // Scroll al mapa
                document.getElementById('google-map').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
            
            // Efectos hover en la lista
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(139, 14, 14, 0.05)';
                this.style.transform = 'translateX(5px)';
                
                // Trigger hover en el marcador
                google.maps.event.trigger(markers[index], 'mouseover');
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
                this.style.transform = 'translateX(0)';
                
                // Trigger mouseout en el marcador
                google.maps.event.trigger(markers[index], 'mouseout');
            });
        }
    });
}

// Función para inicializar funcionalidades del mapa
function initializeMapFeatures() {
    console.log('Inicializando funcionalidades del mapa...');
    
    // Verificar si Google Maps está disponible
    if (typeof google !== 'undefined' && google.maps) {
        // Inicializar mapa inmediatamente si la API ya está cargada
        initMap();
    } else {
        // Esperar a que se cargue la API
        console.log('Esperando a que se cargue Google Maps API...');
    }
    
    // Agregar funcionalidad a la lista de ubicaciones independientemente del mapa
    const locationItems = document.querySelectorAll('.location-item');
    locationItems.forEach(item => {
        item.style.transition = 'all 0.3s ease';
        item.style.padding = '1rem';
        item.style.borderRadius = '8px';
        item.style.marginBottom = '0.5rem';
    });
    
    // Optimizaciones móviles
    initializeMobileOptimizations();
}

// Función para optimizaciones móviles
function initializeMobileOptimizations() {
    console.log('Inicializando optimizaciones móviles...');
    
    // Detectar dispositivo móvil
    const isMobile = window.innerWidth <= 1023;
    const isVerySmall = window.innerWidth <= 479;
    
    if (isMobile) {
        // Optimizar imágenes para móviles
        optimizeImagesForMobile();
        
        // Mejorar interacciones táctiles
        enhanceTouchInteractions();
        
        // Optimizar rendimiento en móviles
        optimizeMobilePerformance();
    }
    
    // Listener para cambios de orientación
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            handleOrientationChange();
        }, 100);
    });
    
    // Listener para redimensionamiento de ventana
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleWindowResize();
        }, 250);
    });
}

// Función para optimizar imágenes en móviles
function optimizeImagesForMobile() {
    const images = document.querySelectorAll('.hero-logo, .product-image');
    
    images.forEach(img => {
        // Lazy loading nativo si está disponible
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
        
        // Manejar errores de carga de imagen
        img.addEventListener('error', function() {
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.background = 'linear-gradient(135deg, #fff4ee 0%, #f8f0e8 100%)';
            this.style.color = '#8b0e0e';
            this.style.fontSize = '2rem';
            this.innerHTML = this.classList.contains('hero-logo') ? '🍽️' : '📷';
        });
        
        // Optimizar carga de imágenes
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
}

// Función para mejorar interacciones táctiles
function enhanceTouchInteractions() {
    const touchElements = document.querySelectorAll('.menu-btn, .navbar-link, .location-item, .product-card, .promo-card');
    
    touchElements.forEach(element => {
        // Agregar feedback táctil
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Prevenir doble tap zoom en elementos interactivos
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // Mejorar scroll suave en listas
    const scrollableElements = document.querySelectorAll('.locations-list');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.scrollBehavior = 'smooth';
    });
}

// Función para optimizar rendimiento en móviles
function optimizeMobilePerformance() {
    // Reducir animaciones en dispositivos de bajo rendimiento
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition-duration: 0.1s !important;
                animation-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Optimizar renderizado
    const heavyElements = document.querySelectorAll('.video-container, .google-map, .product-card');
    heavyElements.forEach(element => {
        element.style.willChange = 'transform';
        element.style.backfaceVisibility = 'hidden';
    });
}

// Función para manejar cambios de orientación
function handleOrientationChange() {
    console.log('Orientación cambiada');
    
    // Reajustar mapa si existe
    if (map && typeof google !== 'undefined') {
        setTimeout(() => {
            google.maps.event.trigger(map, 'resize');
            if (markers.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                markers.forEach(marker => {
                    bounds.extend(marker.getPosition());
                });
                map.fitBounds(bounds);
            }
        }, 300);
    }
    
    // Reajustar alturas de elementos
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        container.style.height = 'auto';
    });
}

// Función para manejar redimensionamiento de ventana
function handleWindowResize() {
    const newWidth = window.innerWidth;
    const isMobile = newWidth <= 1023;
    
    // Reinicializar optimizaciones si cambió el tipo de dispositivo
    if (isMobile) {
        initializeMobileOptimizations();
    }
    
    // Reajustar mapa
    if (map && typeof google !== 'undefined') {
        google.maps.event.trigger(map, 'resize');
    }
}