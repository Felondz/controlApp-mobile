# Arquitectura del Proyecto

## Visión General
ControlApp Mobile es una aplicación nativa construida con React Native y Expo, diseñada para ser un cliente fiel de la plataforma web ControlApp. La arquitectura prioriza la modularidad, el rendimiento y la paridad de características con la versión web.

## Estructura de Directorios

```
controlApp-mobile/
├── app/                  # Rutas de Expo Router (File-based routing)
│   ├── (auth)/          # Rutas públicas (Login, Register, etc.)
│   ├── (app)/           # Rutas protegidas (Dashboard, etc.)
│   └── _layout.tsx      # Layout raíz con proveedores de contexto
├── src/
│   ├── modules/         # Lógica de negocio por dominio (Finance, Tasks, etc.)
│   ├── services/        # Clientes de API y servicios externos
│   ├── shared/          # Código reutilizable transversal
│   │   ├── components/  # Sistema de Diseño
│   │   ├── hooks/       # Hooks personalizados (useTranslate, etc.)
│   │   ├── icons/       # Iconos SVG
│   │   ├── themes/      # Definiciones de estilos y temas
│   │   └── translations/# Archivos de internacionalización (JSON)
│   └── stores/          # Gestión de estado global (Zustand)
└── docs/                # Documentación del proyecto
```

## Stack Tecnológico

*   **Core**: React Native 0.81, Expo SDK 54, TypeScript 5.9.
*   **Routing**: Expo Router 6.
*   **Estilos**: NativeWind 4 (Tailwind CSS).
*   **Estado Global**: Zustand 5 (ligero, sin boilerplate).
*   **Estado Servidor**: React Query 5 (caching, invalidation).
*   **HTTP Client**: Axios (interceptors centralizados).
*   **Storage**: Expo SecureStore (tokens) + AsyncStorage (preferencias).

## Patrones de Diseño

### 1. MVVM (Model-View-ViewModel) Adaptado
*   **View**: Componentes de React en `app/` y `src/shared/components`. Se encargan solo de renderizar UI.
*   **ViewModel**: Custom Hooks en `src/modules/*/hooks` o `src/shared/hooks`. Manejan la lógica de presentación y llamadas a stores/api.
*   **Model**: Interfaces de TypeScript y Stores de Zustand.

### 2. Repository Pattern (Parcial)
La capa de servicios (`src/services/api.ts` y futuros módulos) actúa como repositorio de datos, abstrayendo la comunicación HTTP de los componentes.

### 3. Atomic Design (Simplificado)
*   **Átomos/Moléculas**: `src/shared/components` (Button, Input).
*   **Organismos**: Widgets en `src/modules/*/components`.
*   **Templates/Pages**: Pantallas en `app/`.

## Flujo de Datos
1.  **Componente** solicita datos vía Custom Hook (ej. `useAuth`).
2.  **Hook** consulta al Store (Zustand) o al API (React Query/Axios).
3.  **API** realiza la petición con Interceptors (inyecta Token).
4.  **Respuesta** actualiza el Store o Cache.
5.  **Componente** se renderiza reactivamente.
