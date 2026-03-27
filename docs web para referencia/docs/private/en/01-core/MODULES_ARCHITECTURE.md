# 🏗️ Modular Architecture

**Version**: 2.8.0
**Status**: Stable
**Architecture**: Event-Driven Modular Monolith

---

## 1. Core Principles

ControlApp follows a strict architecture to ensure scalability and maintainability:

1.  **Isolation**: Each module (`app/Modules/{Name}`) is an independent logical unit.
2.  **Zero Direct Coupling**: A module must NEVER import classes (Models, Controllers) from another module.
3.  **Event-Driven Communication**: All interaction between modules happens via the `ModuleEventBus`.
4.  **Centralized Registry**: `ModuleRegistry` manages the module lifecycle.

---

## 2. Module Map

### 💰 Finance Module (`app/Modules/Finance`)
- **Responsibility**: Management of accounts, transactions, and budgets.
- **Dependencies**: None (Core).
- **Emitted Events**:
    - `finance.transaction.created`
    - `finance.transaction.updated`
    - `finance.account.created`
- **Consumed Events**: None (Previously Tasks, now decoupled).

### ✅ Tasks Module (`app/Modules/Tasks`)
- **Responsibility**: Task management, projects, and Kanban board.
- **Dependencies**: None.
- **Emitted Events**:
    - `tasks.task.completed`
    - `tasks.financial_task.created`
- **Consumed Events**:
    - `finance.transaction.created` (Logging/Audit only, no business logic).

### 💬 Chat Module (`app/Modules/Chat`)
- **Responsibility**: Real-time communication.
- **Dependencies**: None.
- **Emitted Events**:
    - `chat.message.sent`
    - `chat.message.read`
- **Consumed Events**: None.
- **Async Listeners**: `UpdateUnreadCount` (updates unread message counter).

### 📦 Inventory Module (`app/Modules/Inventory`)
- **Responsibility**: Centralized inventory management (SKUs, stock, movements).
- **Dependencies**: None (Core).
- **Emitted Events**:
    - `inventory.stock.low`
    - `inventory.item.created`
- **Consumed Events**:
    - `finance.contract.executed` → Create draft inventory entry
    - `operations.lote.finished` → Add finished goods to stock
- **Async Listeners**: `CreateInventoryDraftEntry`, `CreateFinishedGoodsEntry`, `CreateReplenishmentTask`.

### ⚙️ Operations Module (`app/Modules/Operations`)
- **Responsibility**: Production management (batches, stages, processes).
- **Dependencies**: Tasks, Finance, Inventory.
- **Emitted Events**:
    - `operations.lote.stage_changed`
    - `operations.lote.finished`
- **Consumed Events**: None (emits events for other modules).
- **Async Listeners**: `GenerateStageTasks` (auto-generates tasks when stage changes).

---

## 3. Data Flow (Event Bus)

The `ModuleEventBus` acts as the system's main artery.

### Example: Transaction Creation
1.  **Frontend**: User creates a transaction.
2.  **FinanceModule**: Processes and saves to DB.
3.  **EventBus**: Dispatches `finance.transaction.created`.
4.  **Listeners**:
    - `AnalyticsModule` (if active): Updates metrics.
    - `TasksModule`: Registers audit log.

---

## 4. Async EventBus (v2.8.0+)

> **IMPORTANT**: All module listeners now implement `ShouldQueue` for async execution via Redis.

### Event Pattern
All events must extend `BaseModuleEvent`:

```php
class LoteFinished extends BaseModuleEvent
{
    public function getName(): string {
        return 'operations.lote.finished';
    }
}
```

### Listener Pattern
```php
class GenerateStageTasks implements ShouldQueue
{
    use InteractsWithQueue;
    public $connection = 'redis';
    
    public function handle(ModuleEvent $event): void { ... }
}
```

### Module Registration
Use strings (not FQCN classes):
```php
public function getEventListeners(): array
{
    return [
        'operations.lote.stage_changed' => [GenerateStageTasks::class],
    ];
}
```

### Configuration
| Variable | Description |
|----------|-------------|
| `MODULE_EVENT_ASYNC=true` | Enable async execution |
| `MODULE_EVENT_LOG=true` | Logging to `storage/logs/modules.log` |

---

## 5. Validation Rules

To maintain architecture integrity:

- ❌ **FORBIDDEN**: `use App\Modules\Finance\Models\Account;` inside `TasksModule`.
- ✅ **ALLOWED**: `ModuleEventBus::dispatch('finance.account.created', $payload);`.

---

## 6. Directory Structure (v2.8.0)

The backend modular refactoring is **complete**. Models, Controllers, and Services now reside in their respective modules:

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
