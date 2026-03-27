# Arquitectura Modular del Sistema (SaaS Ready)

Este documento define la estructura modular de la aplicación, diseñada para escalar hacia un modelo SaaS donde los módulos pueden ser activados o desactivados según el plan del usuario o la configuración del proyecto.

## 1. Principios de Diseño

- **Aislamiento**: Cada módulo debe ser lo más independiente posible. Los widgets y componentes de un módulo solo deben ser visibles y funcionales dentro de su contexto, o explícitamente compartidos en el "Overview".
- **Interoperabilidad**: Los módulos se comunican a través de eventos o servicios compartidos (Core), no mediante dependencias directas.
- **Configurabilidad**: La activación de módulos se controla mediante `enabled_tools` en el modelo `User` o `modules` en el `Proyecto`.

## 2. Definición de Módulos

### Core (General)
- **Responsabilidad**: Gestión de proyectos, usuarios, autenticación, dashboard principal (Overview).
- **Widgets Compartidos**: Resumen de proyecto, actividad reciente.
- **Visibilidad**: Siempre activo para todos los usuarios.

### Finanzas (`finance`)
- **Responsabilidad**: Gestión de presupuesto, cuentas, transacciones y facturas.
- **Componentes Clave**:
    - `Cuenta`, `Transaccion`, `Categoria`.
    - Dashboard Financiero (`ProjectDashboard.jsx`).
- **Widgets**: `BalanceSummary`, `PendingBills`, `FinancialCharts`, etc.
- **Acceso**: Controlado por rol (Admin/Miembro) y configuración del proyecto.

### Tareas (`tasks`)
- **Responsabilidad**: Gestión de tareas, tablero Kanban, asignaciones.
- **Componentes Clave**:
    - `Task`, `TaskList`, `TaskBoard`.
    - Tablero de Tareas (`Index.jsx`).
- **Widgets**: `TasksSummary`, `UserTasksLoad`.
- **Acceso**: Generalmente abierto a todos los miembros, pero con permisos de edición configurables.

### Comunicaciones (`communications` / `chat`)
- **Responsabilidad**: Chat de equipo, mensajes directos, notificaciones.
- **Componentes Clave**:
    - `Message`, `ChatWidget`.
- **Widgets**: `ChatRecentWidget`.
- **Acceso**: Configurable.

## 3. Control de Acceso y SaaS

### Modelo de Datos
- **Module** (Nueva Entidad): Tabla maestra de módulos disponibles en el sistema.
    - Campos: `key` (id único), `name`, `description`, `price`, `is_free`, `is_active`, `coming_soon`.
    - Permite gestión centralizada de precios y disponibilidad (SaaS).
- **User**: Campo `enabled_tools` (JSON) para definir qué herramientas tiene disponibles globalmente (según plan).
- **Project**: Campo `modules` (JSON) almacena las keys de los módulos activos (ej. `['finance', 'tasks']`). Se valida contra la tabla `Module`.

### Middleware/Gates
- Implementar Gates (`can:access-module, 'finance'`) para restringir rutas y controladores.
- El frontend debe verificar estos permisos antes de renderizar enlaces o widgets.

## 4. Frontend: Sistema de Widgets

- **Registry**: `widgetRegistry.js` define todos los widgets disponibles. Cada widget tiene una propiedad `module`.
- **Filtering**:
    - Los Dashboards específicos (ej. Finanzas) deben filtrar widgets usando `allowedModules={['finance']}` en `DraggableWidgetGrid` y `WidgetSettingsModal`.
    - El Dashboard General puede mostrar widgets de `core` y resúmenes de otros módulos activos.

## 5. Comunicación entre Módulos

- **Event Bus / Props**: El Dashboard principal recibe datos (`dashboardData`) del controlador y los pasa a los widgets.
- **Enlaces**: Los widgets deben usar `route()` para navegar a las vistas completas de sus módulos (ej. "Ver todas" en Tareas).

## 6. Estructura de Directorios (Implementado)

La refactorización modular del backend está **completada**. Los modelos, controladores y servicios ahora residen en sus respectivos módulos:

```
app/Modules/
├── Finance/
│   ├── Models/          # Cuenta, Transaccion, Categoria
│   ├── Controllers/     # TransaccionController, CuentaController
│   ├── Requests/        # StoreTransaccionRequest, UpdateTransaccionRequest
│   ├── Jobs/            # ProcessAutoBills, ProcessRecurringBills, ProcessInterestAccrual
│   ├── Services/        # CreditCardBillingService, FinancialCalculatorService
│   ├── Policies/        # CuentaPolicy, CategoriaPolicy, TransaccionPolicy
│   └── Observers/       # TransaccionObserver
├── Tasks/
│   ├── Models/          # Task
│   └── Controllers/     # TaskController
├── Chat/
│   └── Models/          # Message
├── Analytics/           # Listeners, Services, Jobs (Event-driven)
├── Notifications/       # Listeners, Notifications, Services
├── Inventory/           # Models, Controllers
└── Operations/          # Models (LoteProduccion, etc.)
```

### Futuro
- Implementar Lazy Loading de componentes React para módulos pesados.
- Migrar widgets frontend a una estructura modular similar.

