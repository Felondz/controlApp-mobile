# 🧪 Testing Strategy (Consolidated) - ControlApp

**This document merges the test architecture, database isolation and test execution commands.**

---

## 1. 🎯 Testing Philosophy and QA

*   **Current Status**: 
    - **Backend**: 303 tests passing with 1000+ assertions (robust coverage)
    - **Frontend**: 264 tests passing in 47 test files (comprehensive component coverage)
    - **Total**: 567+ tests with strong coverage
    - **Skipped**: 1 test (`DraggableWidgetGrid`) pending refactor due to complex mocking requirements
*   **Golden Rule (Quality Gate)**: If tests fail, the code has an error. **Do not commit/push until all pass**.
*   **Convention**: Use descriptive test names: `test_admin_can_create_user` (backend), `renders correctly` (frontend).
*   **CI/CD**: All tests run automatically on GitHub Actions for every push/PR.

---

## 2. 🗄️ Backend Testing (PHPUnit)

### Database Isolation (Critical Strategy)

The test suite uses the `Illuminate\Foundation\Testing\RefreshDatabase` trait in each `TestCase`.

* **Setup**: Data is prepared using **Factories** to generate isolated and realistic instances for each test.

### 2. Directory Structure

- **Backend Tests**: `tests/Unit`, `tests/Feature`
- **Frontend Tests**: `tests/Frontend` (Mirroring `resources/js` structure)
- **E2E Tests**: `tests/Browser` (Dusk)

### Test Organization

Tests are organized by type in `tests/Feature`:

- **Api**: API endpoint tests (`tests/Feature/Api`)
- **Web**: Web/Inertia controller tests (`tests/Feature/Web`)
- **Auth**: Authentication flow tests (`tests/Feature/Auth`)
- **Mail**: Email content and sending tests (`tests/Feature/Mail`)
- **Database**: Seeder and migration tests (`tests/Feature/Database`)

### Execution Commands

All tests must be run inside the application container through **Sail**.

| Purpose | Command |
| :--- | :--- |
| **Run all tests (Main)** | `./vendor/bin/sail artisan test --testdox` |
| **Run a specific file** | `./vendor/bin/sail artisan test tests/Feature/Auth/LoginTest.php` |
| **Run a specific test** | `./vendor/bin/sail artisan test --filter=can_user_login` |
| **Run tests in parallel** | `./vendor/bin/sail artisan test --parallel` |
| **Run testing migrations** | `./vendor/bin/sail artisan migrate --env=testing` |

### Assertions and Structure

* **Test Structure (AAA)**:
    1.  `Arrange`: Prepare data with Factories.
    2.  `Act`: Execute the action (ex. `$this->postJson(...)`).
    3.  `Assert`: Validate the result (`assertStatus`, `assertDatabaseHas`, `assertJson`, etc.).

* **Common Assertions**:
    * `$response->assertStatus(200)` or `assertStatus(201)` (Created)
    * `$response->assertStatus(403)` (Forbidden) or `assertStatus(404)` (Not Found)
    * `$this->assertDatabaseHas('users', [...])`
    * `$this->assertDatabaseMissing('users', [...])`
    * `Mail::assertSent(...)` (To validate emails)

---

## 3. 🎨 Frontend Testing (Vitest + Testing Library)

### Test Coverage

76: **Statistics:**
77: - **Total Tests**: ~275 tests (Continuously increasing)
78: - **Coverage**: Comprehensive React component and Widget coverage
79: - **Framework**: Vitest + @testing-library/react
80: - **Skipped Tests**: None critical at the moment
81: 
82: **Test Categories:**
83: 
84: 1. **UI Core Components**
85:    - Checkbox, TextInput, PasswordInput, InputLabel, InputError
86:    - PrimaryButton, SecondaryButton, DangerButton
87:    - Dropdown, Modal, Alert
88:    - RangeSlider, QuantityInput, SelectGroup, ToggleGroup, InputGroup
89: 
90: 2. **Feature Components & Widgets**
91:    - ImageUploader, Sidebar, ProjectCard, ChatWidget
92:    - BottomNavigation, ToolsSheet, TypographySelector, ThemeToggle
93:    - ApplicationLogo, LocaleSelector, SummaryCard, AccountsList, ToolCard
94:    - **Inventory Modules**: InventorySummaryWidget, LowStockWidget, InventoryItemsWidget
95:    - **Finance Modules**: FinanceWidget, TasksWidget, TransactionsWidget

3. **Architecture Tests**
   - ComponentStandards quality checks

### Execution Commands

| Purpose | Command |
| :--- | :--- |
| **Run all frontend tests** | `npm run test` |
| **Run tests in CI mode** | `npm run test:ci` |
| **Run tests in watch mode** | `npm run test:watch` |
| **Run specific test file** | `npx vitest run ComponentName.test.jsx` |

### Test Infrastructure

**Global Mocks** (`test-setup.js`):
- `@inertiajs/react` (usePage, router, Link, useForm)
- `@/hooks/useTranslate`
- `@/Contexts/GlobalThemeContext`
114: - `global.route` (Ziggy) - Includes support for `route().current()` and `route().has()`
115: - `axios`
116: - `Element.prototype.scrollIntoView`
117: 
118: **Test Location**: `tests/Frontend/Components` and `tests/Frontend/Modules`
119: 
120: ### Best Practices
121: 
122: - ✅ Use semantic queries (`getByRole`, `getByLabelText`)
123: - ✅ Test user behavior, not implementation details
124: - ✅ Wait for async operations with `waitFor`
125: - ✅ Verify translation keys, not translated text
126: - ✅ Keep tests isolated and independent
127: - ✅ Follow AAA pattern (Arrange, Act, Assert)
128: 
129: ---
130: 
131: ## 4. 🎯 General Best Practices
132: 
133: - ✅ Each test should be independent
134: - ✅ Use descriptive test names
135: - ✅ Follow the AAA pattern
136: - ✅ Use Factories/Mocks for test data
137: - ✅ Clean up after tests (RefreshDatabase/cleanup)
138: - ✅ Test both success and failure cases
139: - ✅ Run tests locally before pushing
140: - ✅ All tests must pass in CI/CD (use `npm run test:ci`)
141: 
142: ---
143: 
144: **Last Updated**: December 12, 2025
145: **Status**: ✅ Testing strategy fully configured (Backend + Frontend)
146: **Note**: All frontend tests have been updated to use translation keys and robust mocks.
