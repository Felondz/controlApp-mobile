# GEMINI.md - ControlApp Mobile

## 🏆 REGLAS DE ORO (GOLDEN RULES)

Estas 3 reglas son **INVIOLABLES** y deben verificarse en cada paso del desarrollo:

### 1. 🎨 UI & Temas son Prioridad
La estética no es negociable. La aplicación debe verse profesional, moderna y consistente.
- **Respetar el Sistema de Diseño:** Usar siempre los componentes base (`PrimaryButton`, `SecondaryButton`, `Input`).
- **Dark Mode First:** Verificar siempre cómo se ve el componente en modo oscuro (`dark:` classes).
- **Temas:** La aplicación soporta múltiples temas. Usar CSS variables (`--color-primary-*`, `--color-secondary-*`).

### 2. 🖥️ Paridad con Diseño Web
Para cada vista o componente nuevo, **SIEMPRE verificar el diseño de la versión web** (`controlApp/resources/js/...`).
- El objetivo es que la experiencia móvil sea un reflejo fiel pero adaptado de la web.
- Si existe en la web, debe existir en móvil con el mismo "look & feel".
- **Consultar código web:** Usar `view_file` en el código fuente web antes de implementar en móvil.

### 3. 🌍 Traducciones Estrictas
**NUNCA** hardcodear textos.
- Usar siempre el hook `useTranslate`: `const { t } = useTranslate();`.
- Estructura: `{t('auth.login_button')}`.
- Si falta una clave, agregarla a `src/shared/translations/en.json` y `es.json` **antes** de usarla.
- Mantener la misma estructura de claves que en el backend/web.

---

## 🚦 Protocolo de Trabajo AI
El usuario es nuevo en React Native. Antes de actuar:
1. **Explicar QUÉ** se va a hacer.
2. **Explicar POR QUÉ** es necesario.
3. **Mostrar opciones** si las hay.
4. **Esperar aprobación** antes de ejecutar cambios complejos.

---

## 🛠️ Comandos de Desarrollo
| Acción | Comando |
|-----------|------------|
| **Pruebas en Tablet (QR)** | `npx expo start -c --android` |
| Instalar Dependencias | `pnpm install` |

---

## Stack Técnico

| Categoría | Tecnología | Notas |
|-----------|------------|-------|
| Framework | Expo SDK 54 + React Native 0.81 | |
| Lenguaje | TypeScript 5.9 | |
| Package Manager | **pnpm** | NO usar npm |
| UI | NativeWind 4.2 (TailwindCSS) | Responsive: sm/md/lg breakpoints |
| Navegación | **Expo Router 6** | File-based routing |
| Estado | Zustand 5 | authStore, settingsStore |
| **API Data** | **Apollo Client 4 + GraphQL** | Módulos (Inventory, Operations, Finance) |
| **API Auth** | **Axios REST** | Login, logout, register |
| Persistencia | AsyncStorage, SecureStore | Tokens en SecureStore |

---

## Arquitectura

### Estructura de Carpetas
```
controlApp-mobile/
├── app/                      # Expo Router
│   ├── _layout.tsx          # Root con ApolloProvider
│   ├── (auth)/              # Sin autenticar
│   └── (app)/               # Autenticado
├── src/
│   ├── modules/             # Por módulo
│   │   ├── inventory/       # useInventory.ts
│   │   ├── operations/     # useOperations.ts
│   │   └── finance/        # useFinance.ts
│   ├── shared/
│   │   ├── components/      # Design System
│   │   │   ├── buttons/    # PrimaryButton, SecondaryButton, DangerButton
│   │   │   ├── inputs/     # Input, TextInput, InputLabel, InputError
│   │   │   ├── feedback/   # Alert, Modal, Skeleton
│   │   │   └── layouts/    # AuthLayout, AppLayout
│   │   ├── hooks/          # useTranslate
│   │   ├── icons/          # SVG iconos
│   │   └── translations/   # en.json, es.json
│   ├── stores/             # Zustand stores
│   └── services/
│       ├── api.ts          # Axios REST (Auth)
│       └── graphql/        # Apollo Client (Data Modules)
│           ├── client.ts
│           ├── queries.ts
│           └── mutations.ts
```

### Patrón de Estado (MVVM)
- **Screen** → View (UI)
- **Custom Hook** → ViewModel (lógica de datos)
- **Zustand Store** → Estado persistente
- **Apollo Client** → Repository (GraphQL)

---

## API Architecture

### GraphQL (Data Modules - Mobile First)
**Endpoint**: `.env` (`GRAPHQL_URL`)  
**Librería**: Apollo Client 4

```typescript
// src/services/graphql/
├── client.ts      // ApolloClient config con auth link
├── queries.ts    // GraphQL queries
└── mutations.ts  // GraphQL mutations
```

**Hooks disponibles:**
- `useInventoryItems(proyectoId, options)` → Inventory
- `useProductionProcesses(proyectoId)` → Operations
- `useLoteProducciones(proyectoId, status)` → Operations
- `useTransacciones(proyectoId, status)` → Finance
- `useCuentas(proyectoId)` → Finance
- `useCategorias(proyectoId)` → Finance

### REST (Auth - Laravel Sanctum)
**Endpoint**: `.env` (`API_URL`)  
**Librería**: Axios

```typescript
// src/services/api.ts
authApi.login(), .register(), .logout()
projectsApi.getAll(), .getOne(id)
```

---

## Design System

### Componentes (`src/shared/components/`)
| Componente | Props | Descripción |
|-----------|-------|-------------|
| `PrimaryButton` | `size`, `loading`, `fullWidth` | Botón primario estilo Ghost |
| `SecondaryButton` | `size`, `variant` (default/outline) | Botón secundario |
| `DangerButton` | `variant` (filled/soft) | Botón de peligro |
| `Input` | `label`, `error` | Input con label |
| `InputLabel` | `required` | Label con * requerido |
| `InputError` | - | Mensaje de error |
| `PasswordInput` | hereda Input | Con toggle show/hide |
| `Alert` | `type` (info/warning/success/error) | Alertas |
| `Modal` | `size` (sm/md/lg/xl/full) | Modal con backdrop |
| `Skeleton` | `width`, `height`, `count` | Loading placeholder |

### CSS Variables (Tokens)
```css
/* Primary (theme-dependent) */
--color-primary-50 ... --color-primary-950

/* Secondary (grays) */
--color-secondary-50 ... --color-secondary-950

/* Danger */
--color-danger-50 ... --color-danger-950
```

### Temas (`src/shared/themes.ts`)
6 temas: purple-modern, forest-green, ocean-blue, amber-gold, pink-rose, scarlet-red

---

## Responsive Breakpoints

| Breakpoint | Min | Layout |
|------------|-----|--------|
| xs | 0px | Mobile |
| md | 768px | Tablet (Sidebar visible) |
| lg | 1024px | Desktop (Sidebar + Header) |

### Navegación
- **< 768px**: Bottom Navigation + Hamburger Menu drawer
- **≥ 768px**: Header simple
- **≥ 1024px**: Sidebar (w-64) + Header

---

## Archivos Migrados desde Web

| Web | Mobile | Estado |
|-----|--------|--------|
| `currencyHelpers.js` | `src/shared/currency.ts` | ✅ |
| `categoryHelpers.js` | `src/shared/category.ts` | ✅ |
| `ownerHelpers.js` | `src/shared/owner.ts` | ✅ |
| `themeStyles.js` | `src/shared/themes.ts` | ✅ (RGB→HEX) |
| `lang/en/en.json` | `src/shared/translations/en.json` | ✅ |
| `lang/es/es.json` | `src/shared/translations/es.json` | ✅ |
| `graphql/schema` | `src/services/graphql/` | ✅ |

---

## GraphQL Schema Reference

### Inventory Module
```graphql
query GetInventoryItems($proyecto_id: ID!, $first: Int = 15) {
  inventoryItems(proyecto_id: $proyecto_id, first: $first) {
    paginatorInfo { currentPage, total, hasMorePages }
    data { id, name, type, unit, current_stock, sale_price }
  }
}
```

### Operations Module
```graphql
query GetLoteProducciones($proyecto_id: ID!, $status: String) {
  loteProducciones(proyecto_id: $proyecto_id, status: $status) {
    data { id, code, status, current_quantity, stage { name } }
  }
}
```

### Finance Module
```graphql
query GetTransacciones($proyecto_id: Int!, $status: String) {
  transacciones(proyecto_id: $proyecto_id, status: $status) {
    { id, monto, titulo, fecha, cuenta { nombre }, categoria { nombre } }
  }
}
```

---

## React Native Best Practices (Vercel Skills)

### List Performance (CRITICAL)
- Usar `FlashList` de `@shopify/flash-list` para listas largas
- Memoizar componentes de items con `React.memo`
- Evitar objetos inline en estilos
- Extraer funciones fuera del render

### Images
- Usar `expo-image` (componente `AppImage`) para caching automático
- Props: `placeholder`, `contentFit`, `transition`, `priority`, `cachePolicy`

### Native Modals
- Usar `Modal` nativo con `presentationStyle="formSheet"`
- Evitar librerías JS-based de bottom sheets

### Animations
- Animar solo `transform` y `opacity` (GPU-accelerated)
- Evitar animar `width`, `height`, `margin`, `padding`
- Usar `react-native-reanimated` para animaciones complejas

### Navigation
- Expo Router usa native-stack por defecto ✅
- Navegadores nativos para mejor performance

### State Management
- Zustand para estado global
- Minimizar suscripciones de estado
- Dispatcher pattern para callbacks
