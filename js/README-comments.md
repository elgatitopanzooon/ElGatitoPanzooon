# Sistema de Comentarios y Calificaciones - El Gatito Panzón

## Descripción
Sistema modular de comentarios y calificaciones usando Firebase SDK v12.7.0 para las páginas de menú (tamales, tortas, dulces).

## Características
- ⭐ Sistema de calificación con 5 estrellas
- 💬 Comentarios con autenticación requerida
- 🔒 Seguridad con escape de HTML (prevención XSS)
- 📱 Diseño responsivo
- 🔄 Carga automática de comentarios
- 📊 Cálculo automático de promedio de calificaciones
- 🎨 Efectos hover en estrellas
- ⌨️ Soporte para Ctrl+Enter para enviar

## Archivos
- `comments-system.js` - Sistema principal modular
- `tamales.html` - Implementación para tamales
- `tortas.html` - Implementación para tortas  
- `dulces.html` - Implementación para dulces

## Uso
```javascript
// Inicializar sistema para una página específica
import { CommentsSystem } from './js/comments-system.js';
new CommentsSystem('nombre-pagina');
```

## Estructura de Datos (Firestore)
```javascript
{
  nombre: "Nombre del usuario",
  comentario: "Texto del comentario", 
  estrellas: 5, // 1-5
  fecha: new Date(),
  pagina: "tamales|tortas|dulces",
  userId: "firebase-user-id",
  userEmail: "user@email.com"
}
```

## Compatibilidad
- Firebase SDK v12.7.0 (modular)
- Compatible con sistema de autenticación existente (v9.23.0 compat)
- Funciona en todos los navegadores modernos

## Seguridad
- Autenticación requerida para comentar
- Escape de HTML para prevenir XSS
- Validación de datos en cliente y servidor
- Filtrado por página para mostrar solo comentarios relevantes