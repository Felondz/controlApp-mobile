# Guía de Integración Mobile-Backend (ControlApp)

Este documento detalla la arquitectura de comunicación entre la aplicación móvil (React Native) y el backend (Laravel), especificando qué tecnologías se usan para cada tipo de interacción y cómo asegurar la sincronización en tiempo real.

## 1. Arquitectura de Comunicación (Triple Capa)

ControlApp utiliza una arquitectura híbrida para optimizar el rendimiento en dispositivos móviles:

| Capa | Tecnología | Uso Principal |
| :--- | :--- | :--- |
| **Datos** | **GraphQL** | CRUD de entidades, consultas anidadas y reportes. |
| **Acciones** | **REST API** | Auth, subida de archivos, operaciones atómicas y legacy sync. |
| **Tiempo Real** | **WebSockets (Echo/Reverb)** | Notificaciones instantáneas y sincronización de estado entre dispositivos. |

---

## 2. Capa de Tiempo Real (WebSockets)

Utilizamos **Laravel Echo** con el broadcaster **Reverb**.

### Canales
- **Canal Privado del Usuario**: `App.Models.User.{userId}`
  - Requiere autenticación (Bearer Token en el handshake).

### Eventos a Escuchar
1.  **Nuevas Notificaciones**: `.notification` (Evento nativo de Laravel)
    -   **Payload**: El objeto JSON definido en el `toArray()` de la notificación.
    -   **Acción**: Mostrar notificación in-app y actualizar contador local de la campana.
2.  **Sincronización de Limpieza**: `.NotificationsCleared`
    -   **Payload**:
        ```json
        {
          "type": "chat_message",
          "project_uuid": "...",
          "cleared_at": "ISO-TIMESTAMP"
        }
        ```
    -   **Acción**: Eliminar de la vista local las notificaciones que coincidan con el tipo y proyecto especificado.

---

## 3. Capa de Datos (GraphQL)

El punto de acceso principal es `/graphql`. Se debe usar el header `Authorization: Bearer {token}`.

### Entidades Principales
- **Proyectos**: Listado, detalles y configuración.
- **Tareas**: CRUD, asignación y estados.
- **Finanzas**: Transacciones, cuentas y categorías.

*Nota: Consultar el esquema (`schema.graphql`) para definiciones exactas de tipos.*

---

## 4. Capa de Acciones Especializadas (REST API)

### Gestión de Notificaciones (Sincronización)
Cuando el usuario interactúa con una notificación en Mobile, debe llamar a estos endpoints para que la Web se entere en tiempo real:

-   **Eliminar Notificación Individual**: `DELETE /api/notifications/{uuid}`
-   **Limpiar Todas por Proyecto**: `DELETE /api/notifications/all?project_uuid={uuid}`

### Subida de Archivos
-   **Imágenes de Perfil/Proyecto**: `POST /api/user/photo` o `POST /api/projects/{uuid}/image`.
-   Se debe usar `multipart/form-data`.

---

## 5. Estrategia de Sincronización (Web ↔ Mobile)

Para garantizar que el usuario no vea "notificaciones fantasma" que ya leyó en otro dispositivo:

1.  **Al Abrir la App**: Realizar un fetch inicial de `unread_messages_count` y el listado de notificaciones vía GraphQL o REST.
2.  **Durante el Uso**: Mantener abierta la conexión WebSocket.
3.  **Al Recibir `NotificationsCleared`**: Actualizar el estado global de la app móvil inmediatamente.
4.  **Al Leer Contenido**: Notificar al servidor vía REST para que este emita el broadcast a los demás dispositivos.

---

## 6. Convenciones Críticas
- **UUIDs**: Siempre usar `uuid` para parámetros de ruta en REST y para identificar recursos en eventos de WebSocket.
- **Moneda**: Los valores monetarios viajan en **centavos** (enteros). Usar `formatCurrency` en el cliente para el display.
- **Tipado**: Mobile debe respetar estrictamente los tipos devueltos por el backend para evitar crashes en el parseo de JSON.
