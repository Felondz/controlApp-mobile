# 🏗️ Arquitectura Modular

**Versión**: 2.8.0
**Estado**: Estable
**Arquitectura**: Monolito Modular basado en Eventos (Event-Driven Modular Monolith)

---

## 1. Principios Core

ControlApp sigue una arquitectura estricta para garantizar la escalabilidad y mantenibilidad:

1.  **Aislamiento**: Cada módulo (`app/Modules/{Nombre}`) es una unidad lógica independiente.
2.  **Cero Acoplamiento Directo**: Un módulo NUNCA debe importar clases (Modelos, Controladores) de otro módulo.
3.  **Comunicación por Eventos**: Toda interacción entre módulos ocurre a través del `ModuleEventBus`.
4.  **Registro Centralizado**: `ModuleRegistry` gestiona el ciclo de vida de los módulos.

---

## 2. Mapa de Módulos

### 💰 Módulo Finance (`app/Modules/Finance`)
- **Responsabilidad**: Gestión de cuentas, transacciones y presupuestos.
- **Dependencias**: Ninguna (Core).
- **Eventos Emitidos**:
    - `finance.transaction.created`
    - `finance.transaction.updated`
    - `finance.account.created`
- **Eventos Consumidos**: Ninguno (Anteriormente Tasks, ahora desacoplado).

### ✅ Módulo Tasks (`app/Modules/Tasks`)
- **Responsabilidad**: Gestión de tareas, proyectos y tablero Kanban.
- **Dependencias**: Ninguna.
- **Eventos Emitidos**:
    - `tasks.task.completed`
    - `tasks.financial_task.created`
- **Eventos Consumidos**:
    - `finance.transaction.created` (Solo para logging/auditoría, no lógica de negocio).

### 💬 Módulo Chat (`app/Modules/Chat`)
- **Responsabilidad**: Comunicación en tiempo real.
- **Dependencias**: Ninguna.
- **Eventos Emitidos**:
    - `chat.message.sent`
    - `chat.message.read`
- **Eventos Consumidos**: Ninguno.
- **Listeners Async**: `UpdateUnreadCount` (actualiza contador de mensajes no leídos).

### 📦 Módulo Inventory (`app/Modules/Inventory`)
- **Responsabilidad**: Gestión de inventario centralizado (SKUs, stock, movimientos).
- **Dependencias**: Ninguna (Core).
- **Eventos Emitidos**:
    - `inventory.stock.low`
    - `inventory.item.created`
- **Eventos Consumidos**:
    - `finance.contract.executed` → Crear entrada de inventario borrador
    - `operations.lote.finished` → Agregar producto terminado al stock
- **Listeners Async**: `CreateInventoryDraftEntry`, `CreateFinishedGoodsEntry`, `CreateReplenishmentTask`.

### ⚙️ Módulo Operations (`app/Modules/Operations`)
- **Responsabilidad**: Gestión de producción (lotes, etapas, procesos).
- **Dependencias**: Tasks, Finance, Inventory.
- **Eventos Emitidos**:
    - `operations.lote.stage_changed`
    - `operations.lote.finished`
- **Eventos Consumidos**: Ninguno (emite eventos para otros módulos).
- **Listeners Async**: `GenerateStageTasks` (genera tareas automáticas al cambiar etapa).

---

## 3. Flujo de Datos (Event Bus)

El `ModuleEventBus` actúa como la arteria principal del sistema.

### Ejemplo: Creación de Transacción
1.  **Frontend**: Usuario crea transacción.
2.  **FinanceModule**: Procesa y guarda en BD.
3.  **EventBus**: Dispara `finance.transaction.created`.
4.  **Listeners**:
    - `AnalyticsModule` (si activo): Actualiza métricas.
    - `TasksModule`: Registra log de auditoría.

---

## 4. EventBus Asíncrono (v2.8.0+)

> **IMPORTANTE**: Todos los listeners de módulos ahora implementan `ShouldQueue` para ejecución asíncrona via Redis.

### Patrón de Eventos
Todos los eventos deben extender `BaseModuleEvent`:

```php
class LoteFinished extends BaseModuleEvent
{
    public function getName(): string {
        return 'operations.lote.finished';
    }
}
```

### Patrón de Listeners
```php
class GenerateStageTasks implements ShouldQueue
{
    use InteractsWithQueue;
    public $connection = 'redis';
    
    public function handle(ModuleEvent $event): void { ... }
}
```

### Registro en Módulo
Usar strings (no clases FQCN):
```php
public function getEventListeners(): array
{
    return [
        'operations.lote.stage_changed' => [GenerateStageTasks::class],
    ];
}
```

### Configuración
| Variable | Descripción |
|----------|-------------|
| `MODULE_EVENT_ASYNC=true` | Habilitar ejecución asíncrona |
| `MODULE_EVENT_LOG=true` | Logging a `storage/logs/modules.log` |

---

## 5. Reglas de Validación

Para mantener la integridad de la arquitectura:

- ❌ **PROHIBIDO**: `use App\Modules\Finance\Models\Account;` dentro de `TasksModule`.
- ✅ **PERMITIDO**: `ModuleEventBus::dispatch('finance.account.created', $payload);`.

---

## 6. Estructura de Directorios (v2.8.0)

La refactorización modular del backend está **completada**. Los Modelos, Controladores y Servicios ahora residen en sus respectivos módulos:

```
app/Modules/
├── Finance/
│   ├── Models/          # Cuenta, Transaccion, Categoria
│   ├── Controllers/     # TransaccionController, CuentaController
│   ├── Requests/        # StoreTransaccionRequest, UpdateTransaccionRequest
│   ├── Jobs/            # ProcessAutoBills, ProcessRecurringBills
│   ├── Services/        # CreditCardBillingService, FinancialCalculatorService
│   ├── Events/          # SupplyContractExecuted
│   ├── Policies/        # CuentaPolicy, CategoriaPolicy, TransaccionPolicy
│   └── Observers/       # TransaccionObserver
├── Tasks/
│   ├── Models/          # Task
│   └── Controllers/     # TaskController
├── Chat/
│   ├── Models/          # Message
│   ├── Events/          # MessageSent
│   └── Listeners/       # UpdateUnreadCount (async)
├── Analytics/           # Listeners, Services, Jobs
├── Notifications/       # Listeners, Notifications, Services
├── Inventory/
│   ├── Models/          # InventoryItem, InventoryTransaction
│   ├── Controllers/     # InventoryItemController
│   ├── Events/          # InventoryLowStock
│   └── Listeners/       # CreateInventoryDraftEntry, CreateFinishedGoodsEntry, CreateReplenishmentTask (async)
└── Operations/
    ├── Models/          # LoteProduccion, EtapaProceso, ProductionProcess
    ├── Controllers/     # LoteController
    ├── Events/          # StageChanged, LoteFinished
    └── Listeners/       # GenerateStageTasks (async)
```
