# 🧪 Estrategia de Testing (Consolidado) - ControlApp

**Este documento fusiona la arquitectura de pruebas, el aislamiento de BD y los comandos de ejecución de tests.**

---

## 1. 🎯 Filosofía de Testing y QA

* **Estado Actual**:
    - **Backend**: 312+ tests pasando con 1000+ assertions (cobertura robusta).
    - **Frontend**: 264 tests pasando en 47 archivos de prueba (cobertura comprehensiva).
    - **Total**: 567+ tests con cobertura sólida
    - **Omitidos**: 1 test (`DraggableWidgetGrid`) pendiente de refactorizar por requisitos complejos de mocking
* **Regla de Oro (Quality Gate)**: Si los tests fallan, el código tiene un error. **No hagas commit/push hasta que todos pasen**.
* **Convención**: Usar nombres descriptivos: `test_admin_puede_crear_usuario` (backend), `renders correctly` (frontend).
* **CI/CD**: Todos los tests se ejecutan automáticamente en GitHub Actions en cada push/PR.

---

## 2. 🗄️ Testing Backend (PHPUnit)

### Aislamiento de Base de Datos (SQLite In-Memory)
 
La suite de tests está configurada para usar **SQLite en memoria** (`:memory:`).
 
*   **Ventajas**:
    *   🚀 **Velocidad**: Los tests se ejecutan mucho más rápido
    *   🛠️ **Simplicidad**: No requiere servidor MySQL
    *   🔄 **Aislamiento**: Base de datos fresca en cada test
*   **Trait RefreshDatabase**: Migra la base de datos en memoria antes de cada test.

### Estructura de Directorios

- **Backend Tests**: `tests/Unit`, `tests/Feature`
- **Frontend Tests**: `tests/Frontend` (Mirroring `resources/js` structure)
- **E2E Tests**: `tests/Browser` (Dusk)

### Organización de Tests

Los tests están organizados por tipo en `tests/Feature`:

- **Api**: Tests de endpoints API (`tests/Feature/Api`)
- **Web**: Tests de controladores Web/Inertia (`tests/Feature/Web`)
- **Auth**: Tests de flujos de autenticación (`tests/Feature/Auth`)
- **Mail**: Tests de contenido y envío de correos (`tests/Feature/Mail`)
- **Database**: Tests de seeders y migraciones (`tests/Feature/Database`)
- **Modules**: Tests específicos de módulos (`tests/Feature/Modules`)

### Comandos de Ejecución
 
| Propósito | Comando (Local) | Comando (Sail/Docker) |
| :--- | :--- | :--- |
| **Ejecutar todos los tests** | `./vendor/bin/sail test` | `./vendor/bin/sail test` |
| **Ejecutar con testdox** | `./vendor/bin/sail test --testdox` | `./vendor/bin/sail test --testdox` |
| **Ejecutar archivo específico** | `./vendor/bin/sail test tests/Feature/EjemploTest.php` | `./vendor/bin/sail test tests/Feature/EjemploTest.php` |
| **Ejecutar test específico** | `./vendor/bin/sail test --filter=nombre_del_test` | `./vendor/bin/sail test --filter=nombre_del_test` |
| **Ejecutar en paralelo** | `./vendor/bin/sail test --parallel` | `./vendor/bin/sail test --parallel` |

### Ejemplos de Tests de Feature

- `tests/Feature/Auth/AuthenticationTest.php`: Login, Registro, Logout.
- `tests/Feature/ChatSystemTest.php`: Sistema de chat, mensajes, estado online y contadores.
- `tests/Feature/ProyectosApiTest.php`: CRUD de proyectos.
- `tests/Feature/Modules/Finance/ScheduledTransactionTest.php`: Lógica de transacciones programadas y balances.

### Assertions y Estructura

*   **Estructura del Test (AAA)**:
    1.  `Arrange`: Preparar datos con Factories.
    2.  `Act`: Ejecutar la acción (ej. `$this->postJson(...)`).
    3.  `Assert`: Validar el resultado (`assertStatus`, `assertDatabaseHas`, `assertJson`, etc.).

    * `$this->assertDatabaseMissing('users', [...])`
    * `Mail::assertSent(...)` (Para validar emails)

### Testing de Eventos de Módulo (Architecture V2)

Debido a que los eventos de módulo (`BaseModuleEvent`) se despachan a través del `ModuleEventBus` y no el Dispatcher estándar de Laravel, **`Event::fake()` no funciona** para validar estos eventos.

**Estrategia Correcta (Spying):**
Usar `spy()` en el `ModuleEventBus` para verificar que el método `dispatch` fue llamado con el evento correcto.

```php
// Test Example
public function test_example_event_dispatch()
{
    // 1. Spy on ModuleEventBus
    $busSpy = $this->spy(\App\Core\Events\ModuleEventBus::class);

    // 2. Execute Action
    // ... code that dispatches event ...

    // 3. Verify Dispatch
    $busSpy->shouldHaveReceived('dispatch')->withArgs(function ($event) {
        return $event instanceof MyExpectedEvent
            && $event->getPayload()['key'] === 'value';
    })->once();
}
```

---

## 3. 🎨 Testing Frontend (Vitest + Testing Library)

### Cobertura de Tests

86: **Estadísticas:**
87: - **Total de Tests**: ~275 tests (Incremento continuo)
88: - **Cobertura**: Cobertura comprehensiva de componentes React y Widgets
89: - **Framework**: Vitest + @testing-library/react
90: - **Tests Omitidos**: Ninguno crítico actualmente
91: 
92: **Categorías de Tests:**
93: 
94: 1. **Componentes UI Core**
95:    - Checkbox, TextInput, PasswordInput, InputLabel, InputError
96:    - PrimaryButton, SecondaryButton, DangerButton
97:    - Dropdown, Modal, Alert
98:    - RangeSlider, QuantityInput, SelectGroup, ToggleGroup, InputGroup
99: 
100: 2. **Componentes de Funcionalidad (Feature & Widgets)**
101:    - ImageUploader, Sidebar, ProjectCard, ChatWidget
102:    - BottomNavigation, ToolsSheet, TypographySelector, ThemeToggle
103:    - ApplicationLogo, LocaleSelector, SummaryCard, AccountsList, ToolCard
104:    - **Inventory Modules**: InventorySummaryWidget, LowStockWidget, InventoryItemsWidget
105:    - **Finance Modules**: FinanceWidget, TasksWidget, TransactionsWidget

3. **Tests de Arquitectura**
   - Verificaciones de calidad ComponentStandards

### Comandos de Ejecución

| Propósito | Comando |
| :--- | :--- |
| **Ejecutar todos los tests frontend** | `pnpm run test` |
| **Ejecutar en modo CI** | `pnpm run test:ci` |
| **Ejecutar en modo watch** | `pnpm run test:watch` |
| **Ejecutar archivo específico** | `npx vitest run ComponentName.test.jsx` |

### Infraestructura de Tests

**Mocks Globales** (`test-setup.js`):
- `@inertiajs/react` (usePage, router, Link, useForm)
- `@/hooks/useTranslate`
- `@/Contexts/GlobalThemeContext`
124: - `global.route` (Ziggy) - Incluye soporte para `route().current()` y `route().has()`
125: - `axios`
126: - `Element.prototype.scrollIntoView`
127: 
128: **Ubicación de Tests**: `tests/Frontend/Components` y `tests/Frontend/Modules`
129: 
130: ### Mejores Prácticas
131: 
132: - ✅ Usar queries semánticas (`getByRole`, `getByLabelText`)
133: - ✅ Testear comportamiento del usuario, no detalles de implementación
134: - ✅ Esperar operaciones asíncronas con `waitFor`
135: - ✅ Verificar claves de traducción, no texto traducido
136: - ✅ Mantener tests aislados e independientes
137: - ✅ Seguir patrón AAA (Arrange, Act, Assert)
138: 
139: ---
140: 
141: ## 4. 🎯 Mejores Prácticas Generales
142: 
143: - ✅ Cada test debe ser independiente
144: - ✅ Usar nombres descriptivos
145: - ✅ Seguir el patrón AAA
146: - ✅ Usar Factories/Mocks para datos de prueba
147: - ✅ Limpiar después de los tests (RefreshDatabase/cleanup)
148: - ✅ Testear casos de éxito y fallo
149: - ✅ Ejecutar tests localmente antes de push
150: - ✅ Todos los tests deben pasar en CI/CD (usar `npm run test:ci`)
151: 
152: ---
153: 
154: **Última Actualización**: 12 de Diciembre, 2025
155: **Estado**: ✅ Estrategia de testing completamente configurada (Backend + Frontend)
156: **Nota**: Todos los tests del frontend han sido actualizados para usar claves de traducción y mocks robustos.
