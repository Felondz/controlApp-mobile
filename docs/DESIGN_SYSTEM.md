# Sistema de Diseño (Design System)

## Filosofía
El sistema de diseño de ControlApp Mobile busca la paridad visual con la versión web, adaptando los componentes a la experiencia nativa. Se prioriza la accesibilidad, el soporte de modo oscuro y la consistencia.

## Tecnologías
*   **NativeWind (Tailwind CSS)**: Motor de estilos principal. Permite un desarrollo rápido y consistente.
*   **React Native SVG**: Para iconos de alta calidad.

## Componentes Base (`src/shared/components/`)

### Botones (`PrimaryButton.tsx`, `SecondaryButton.tsx`)
Inspirados en el estilo "Ghost" o "Soft" de la web.
*   **Primary**: Fondo `purple-50` (Light) / `purple-900/20` (Dark). Texto `purple-700` / `purple-300`.
*   **Secondary**: Fondo `gray-100` (Light) / `gray-800` (Dark). Texto `gray-700` / `gray-300`.
*   **Altura**: `py-4` para coincidir con `Input`.
*   **Estado**: `loading` (spinner), `disabled` (opacity).

### Entradas (`Input.tsx`)
Componente text field unificado.
*   **Styles**: `bg-white` (Light) / `bg-gray-800` (Dark). Border `gray-200` / `gray-700`.
*   **Features**: Label opcional, mensaje de error integrado, padding estandarizado (`py-4`).

### Modales (`Modal.tsx`)
Wrapper genérico para diálogos y popups.
*   **Backdrop**: Fondo oscuro semitransparente con cierre al tocar fuera (opcional).
*   **Contenedor**: `bg-white` / `bg-gray-800` con `rounded-xl`.

### Otros
*   **ThemeToggle**: Botón flotante para cambiar entre Light/Dark mode. Persiste selección.
*   **ApplicationLogo**: Componente SVG reutilizable del logo de la app.

## Iconografía
Se utilizan iconos SVG exportados de la web y convertidos a componentes React Native mediante `react-native-svg`.
Ubicación: `src/shared/icons/*.tsx`.
Uso: `<HomeIcon color="#A855F7" width={24} height={24} />`.

## Temas y Modo Oscuro
El soporte de Modo Oscuro es nativo vía NativeWind (`dark:` utility classes).
El estado del tema se maneja en `settingsStore` y se sincroniza con `expo-system-ui` para evitar "flashes" blancos al inicio.
Temas de color disponibles (sincronizados con web):
*   Purple Modern (Default)
*   Forest Green
*   Ocean Blue
*   Amber Gold
*   Pink Rose
*   Scarlet Red
