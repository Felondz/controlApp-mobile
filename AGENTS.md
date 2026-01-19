# AGENTS.md - ControlApp Mobile

## Reglas de Trabajo

### 🔴 REGLA PRINCIPAL
El usuario es nuevo en React Native. Antes de CUALQUIER acción:
1. **Explicar QUÉ** se va a hacer
2. **Explicar POR QUÉ** es necesario
3. **Mostrar opciones** si las hay
4. **Esperar aprobación** antes de ejecutar

---

## Stack Técnico

| Categoría | Tecnología | Notas |
|-----------|------------|-------|
| Framework | Expo SDK 54 + React Native 0.81 | Actualizado Ene 2026 |
| Lenguaje | TypeScript 5.9 | |
| Package Manager | **pnpm** | NO usar npm |
| UI | NativeWind 4.2 (TailwindCSS) | Responsive: sm/md/lg breakpoints |
| Navegación | **Expo Router 6** | File-based routing |
| Estado | Zustand 5 | authStore, settingsStore |
| API | Axios + React Query 5 | |
| Persistencia | AsyncStorage, SecureStore | Tokens en SecureStore |

---

## Arquitectura

### Estructura de Carpetas
```
controlApp-mobile/
├── app/                      # Expo Router
│   ├── (auth)/              # Sin autenticar
│   └── (app)/               # Autenticado + Tabs
├── src/
│   ├── modules/             # Por módulo (como web)
│   ├── shared/
│   │   ├── components/      # Design System
│   │   ├── hooks/           # useTranslate, etc.
│   │   ├── icons/           # SVG → react-native-svg
│   │   └── translations/    # en.json, es.json
│   ├── stores/              # Zustand stores
│   └── services/            # api.ts
```

### Patrón de Estado (equivalente a MVVM)
- **Screen** → View (UI)
- **Custom Hook** → ViewModel (lógica)
- **Zustand Store** → Estado persistente
- **API Service** → Repository

---

## API Backend

**Base URL**: Configurable en `.env` (`API_URL`)  
**Auth**: Bearer Token (Laravel Sanctum)

### Endpoints Principales:
- Auth: `/register`, `/login`, `/logout`, `/user`
- Projects: `/proyectos`, `/proyectos/{id}`
- Finance: `/proyectos/{id}/cuentas`, `/proyectos/{id}/transacciones`
- Tasks: `/proyectos/{id}/tasks`
- Inventory: `/proyectos/{id}/inventory/items`
- Operations: `/proyectos/{id}/operations/lotes`

---

## Documentación de Referencia

### Web Docs (en `docs web para referencia/docs/`)
| Documento | Ruta | Contenido |
|-----------|------|-----------|
| API | `public/es/API.md` | Endpoints y ejemplos |
| Auth | `public/es/AUTHENTICATION.md` | Flujo Sanctum |
| Database | `public/es/DATABASE.md` | Esquema y relaciones |
| Dev Overview | `public/es/dev-overview.md` | Arquitectura backend |
| IA Collaboration | `private/es/03-ia-collaboration/` | Guías para IAs |

---

## Design System

### Componentes (`src/shared/components/`)
- `Button` - primary, secondary, danger, outline
- `TextInput` - con label y error
- `PasswordInput` - con toggle show/hide
- `Alert` - info, warning, success, error
- `Modal` - con sizes y backdrop

### Iconos (`src/shared/icons/`)
EyeIcon, EyeOffIcon, HomeIcon, FolderIcon, PlusIcon, CheckIcon, etc.

### Temas (`src/shared/themes.ts`)
6 temas: purple-modern, forest-green, ocean-blue, amber-gold, pink-rose, scarlet-red

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