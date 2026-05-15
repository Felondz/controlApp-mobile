# Guía Técnica Completa de Integración Backend (ControlApp)

>> **Última Actualización**: 15 de Mayo, 2026 - v3.3.2 (Full Feature Sync)

Esta guía proporciona la especificación técnica definitiva para la integración de clientes móviles con el backend de ControlApp.

---

## 1. Estrategia de Comunicación (Triple Vía)

ControlApp utiliza una arquitectura distribuida para maximizar el rendimiento en dispositivos móviles:

1.  **Data Layer (GraphQL)**: Vía principal para **lectura de datos**. Permite al cliente móvil solicitar exactamente lo que necesita en una sola petición (ej: Dashboard con Proyecto + Tareas + Últimas Transacciones).
2.  **Action Layer (REST API)**: Vía para **acciones imperativas**. Mutaciones complejas, subida de archivos (multipart), procesos de autenticación y exportación de datos.
3.  **State Layer (WebSockets)**: Vía para **sincronización reactiva**. Notificaciones, indicadores de escritura en chat, y actualizaciones de estado de la UI sin refresco.

---

## 2. Autenticación y Seguridad (Sanctum)

El backend utiliza **Laravel Sanctum**. El cliente móvil debe gestionar un `Bearer Token`.

### Flujo de Login (REST)
- **Endpoint**: `POST /api/login`
- **Body**: `{ "email": "...", "password": "...", "device_name": "iPhone_15" }`
- **Respuesta**: `{ "token": "controlapp_...", "user": { ... } }`

### Google OAuth (Mobile Native)
1. El cliente móvil obtiene el `idToken` de Google.
2. Envía el token a: `POST /api/auth/google/token`
3. Recibe el token de ControlApp para sesiones futuras.

> [!IMPORTANT]
> Todas las peticiones posteriores deben incluir el header: `Authorization: Bearer {token}`.

---

## 3. Data Layer: GraphQL Reference

- **Endpoint**: `/graphql`
- **Headers**: `Authorization` + `Accept: application/json`

### Consultas (Queries) Principales
| Query | Argumentos | Uso |
| :--- | :--- | :--- |
| `me` | Ninguno | Perfil, settings y tours completados. |
| `proyectos` | `first`, `page` | Listado paginado de proyectos. |
| `tasks` | `proyecto_id!` | Tareas con `users`, `comments`, `related` y `images`. |
| `inventoryItems` | `proyecto_id!` | Insumos y existencias. |

### Mutaciones (Mutations) Principales

#### 1. Finanzas: `createTransaccion`
- **Campos**: `proyecto_id`, `cuenta_id`, `categoria_id`, `monto`, `fecha`.
- **Relación con Tareas**: `task_id: ID` (vínculo automático).

#### 2. Tareas: `createTaskComment`
- **Campos**: `task_id: ID!`, `content: String!`.
- **Menciones**: Soporta `@username`. El backend notifica automáticamente a los mencionados.

---

## 4. Action Layer: REST API Specification

### 4.1. Módulo de Tareas (Últimas Mejoras)
**Endpoint Base**: `/api/proyectos/{proyecto}/tasks`

> [!CAUTION]
> **Nota Técnica Crítica**: El campo `task_id_string` (ej: `TASK-12`) es **exclusivamente para visualización** en la UI. Para todas las operaciones de API, parámetros de ruta y relaciones, se **debe** usar siempre el `uuid`.

- **Visualización**: Usar `task_id_string` para labels en la UI.
- **Relaciones (`related`)**: Para vincular tareas a otros módulos:
    - `related_type`: Nombre de la clase (ej: `App\Modules\Operations\Models\LoteProduccion`).
    - `related_id`: UUID del recurso relacionado.
- **Archivos**:
    - `image`: Foto principal.
    - `images[]`: Array de fotos para la galería.

### 4.2. Módulo de Finanzas (Automatización)
- **Pay Bill Direct**: `POST bills/{transaccion}/pay-direct` — Ejecuta el pago de una factura pendiente usando su cuenta predeterminada.
- **Recurrencia**: Al crear transacciones, `is_recurring: true` y `recurrence_day: 1-30` activa la generación automática mensual.

### 4.3. Gestión de Notificaciones (Sync)
- **Borrar una**: `DELETE /api/notifications/{uuid}`.
- **Borrar todas**: `DELETE /api/notifications/all`.
> [!NOTE]
> Estas acciones disparan un evento de WebSocket para limpiar la UI en otros dispositivos abiertos.

---

## 5. State Layer: Sincronización Real-Time (WebSockets)

### Canales Críticos
1.  **Privado Usuario**: `App.Models.User.{id}`
    - Escuchar: `.notification` (Payload con `title`, `message`, `project_uuid`).
    - Escuchar: `.NotificationsCleared` (Para sincronización entre Web y Mobile).
2.  **Presencia Chat**: `project.{projectId}.chat` (UUID del proyecto).
    - Eventos: `MessageSent`, `MessageUpdated`, `MessageDeleted`.
    - Whispers: `typing` (Indicator de escritura).

---

## 6. Estándares Técnicos de Datos

### UUID Routing
**Regla Estricta**: Todas las rutas de la API esperan el **UUID** para el Route Model Binding.
- ✅ `/api/proyectos/{proyecto_uuid}/tasks/{task_uuid}`

### Moneda y Centavos
- **Siempre Integer**: El backend almacena y espera centavos.
- **Conversión**: `$1.00` <-> `100`.

---

## 7. Referencias de DTOs y Requests
Para validaciones exactas, consultar:
- **Finance**: `app/Modules/Finance/Requests/StoreTransaccionRequest.php`
- **Tasks**: `app/Modules/Tasks/Controllers/TaskController.php` (Validación inline)
- **Operations**: `app/Modules/Operations/DTOs/`
