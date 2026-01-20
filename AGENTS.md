# AGENTS.md - ControlApp Mobile

## 🏆 REGLAS DE ORO (GOLDEN RULES)

Estas 3 reglas son **INVIOLABLES** y deben verificarse en cada paso del desarrollo:

### 1. 🎨 UI & Temas son Prioridad
La estética no es negociable. La aplicación debe verse profesional, moderna y consistente.
- **Respetar el Sistema de Diseño:** Usar siempre los componentes base (`PrimaryButton`, `SecondaryButton`, `Input`).
- **Dark Mode First:** Verificar siempre cómo se ve el componente en modo oscuro (`dark:` classes).
- **Temas:** La aplicación soporta múltiples temas. Asegurar que los colores principales provengan de la configuración del tema.

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

## Design System

### Componentes (`src/shared/components/`)
- `PrimaryButton` / `SecondaryButton` - Estilo Web (Ghost/Soft)
- `Input` - Standarizado (Height + Dark Mode)
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