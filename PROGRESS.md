# ControlApp Mobile - Bitácora de Desarrollo

> **Última actualización**: 2026-03-27

---

## ✅ Completado (Sesión Actual)

### Infraestructura y Estabilidad
- [x] **Fix Crítico de Navegación**: Solucionado el error `Couldn't find a navigation context` que ocurría al interactuar con el toggle en `new.tsx`.
    - **Solución**: Refactorizado el layout para usar `tabBarButton: () => null` para ocultar pestañas del UI sin eliminarlas del manifiesto de rutas.
    - **Mejora**: Simplificación de `AppLayout` y eliminación de hooks inestables como `useRootNavigationState` para garantizar que el navegador esté en la raíz del árbol de renderizado.
- [x] **Arreglo de Referencia de Usuario**: Corregido `ReferenceError: Property 'user' doesn't exist` en `app/(app)/_layout.tsx` mediante la correcta desestructuración desde `useAuthStore()`.
- [x] **Consistencia de Tipos**: Corregidos múltiples errores de TypeScript relacionados con IDs (string vs number) y propiedades de usuario.
- [x] **Iconografía**: Añadidos iconos faltantes (`Bars3`, `Tag`, `LockClosed`, `AcademicCap`, `Freelancer`, `Startup`) para asegurar paridad con la web.

### UI & UX (Refactorización de Navegación)
- [x] **Sidebar Contextual e Inteligente**:
    - **Modo Global**: Dashboard, Mercado e Invitaciones.
    - **Modo Proyecto**: Resumen (Overview), Finanzas, Inventario y Operaciones.
    - **Ajustes Dinámicos**: Etiquetas automáticas entre "Ajustes Globales" y "Ajustes del Proyecto".
- [x] **Estética "Naked Icons" (Web Parity)**:
    - Eliminación de marcos cuadrados en los iconos del Sidebar.
    - Iconos coloreados dinámicamente con el color primario del tema activo cuando están seleccionados.
    - Diseño minimalista y limpio reflejando la versión profesional de la web.
- [x] **Gestión de Herramientas**:
    - Implementada lógica para mostrar herramientas activadas por el usuario (ej: **Calculadora Financiera**) de forma independiente al proyecto actual.
- [x] **Bottombar (Tabs) Adaptativa**:
    - Ocultamiento dinámico de pestañas según el contexto (Global vs Proyecto) sin romper el stack de navegación.
- [x] **Selector de Proyectos Pro**: Rediseñado el `ProjectSelector` en el Dashboard para usar la nueva estética de iconos y bordes ultra-redondeados.

### Pantallas y Funcionalidad
- [x] **Logo Corporativo**: Refactorizado `ApplicationLogo` con efecto de degradado basado en el tema.
- [x] **Búsqueda Meilisearch**: Implementado `SearchOverlay` funcional para búsqueda de proyectos en tiempo real.
- [x] **Creación de Proyectos**: Pantalla `new.tsx` totalmente funcional con soporte para Templates y Modo Manual con lógica de dependencias.

---

## 🛑 Flujo de Trabajo y Errores Corregidos

### Errores Solucionados
1.  **Lost Navigation Context**: Ocurría porque el Layout desmontaba el navegador al cambiar estados locales. Se solucionó manteniendo el árbol de navegación estable.
2.  **ReferenceError (User)**: Error de scope al intentar acceder a `enabled_tools` sin haber extraído `user` del store.
3.  **TypeError (displayName)**: Error de importación circular al traer componentes desde un `index.ts` (barrel export). Solucionado mediante importaciones directas desde los archivos de componentes.

### Flujo de Navegación Refinado
1.  **Login** -> **Dashboard Global** (Selector de proyectos).
2.  **Selección de Proyecto** -> **Dashboard de Proyecto** (Sidebar cambia a módulos específicos).
3.  **Botón Atrás en Header** -> Limpia proyecto activo y vuelve al Dashboard Global.

---

## ✅ Completado (Fases Previas)

### Fase 1: Expo Router
- [x] Expo SDK 54 + React Native 0.81 inicializado
- [x] pnpm como gestor de paquetes
- [x] Expo Router 6 configurado
- [x] Auth flow automático

### Fase 2: Design System & UI
- [x] Componentes Base: PrimaryButton, SecondaryButton, DangerButton, Input, Skeleton.
- [x] **Dark Mode** & **6 Temas Dinámicos**.
- [x] **AppImage** optimizado con caching.

### Fase 3: GraphQL Integration
- [x] Apollo Client 4 + Cache persistence.
- [x] Queries & Mutations para Inventory, Operations, Finance.

---

## 🔧 Stack Técnico

| Tecnología | Versión |
|------------|---------|
| Expo SDK | 54.0.31 |
| React Native | 0.81.5 |
| Expo Router | 6.0.21 |
| NativeWind | 4.2.1 |
| Apollo Client | 4.1.6 |
| Zustand | 5.0.10 |
