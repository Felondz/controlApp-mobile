# Internacionalización (i18n)

## Sistema de Traducción
La aplicación soporta múltiples idiomas (actualmente Español e Inglés) mediante un sistema cliente-servidor sincronizado.

### Estructura
*   **Archivos**: `src/shared/translations/es.json` y `en.json`.
*   **Hook**: `useTranslate` (`src/shared/hooks/useTranslate.ts`).
*   **Store**: `settingsStore` maneja la preferencia de idioma del usuario (`locale`).

### Uso
**Nunca** utilizar textos "quemados" (hardcoded) en los componentes. Siempre utilizar el hook `useTranslate`.

```tsx
import { useTranslate } from '../../src/shared/hooks';

export default function MyComponent() {
    const { t } = useTranslate();

    return (
        <Text>{t('auth.login_button')}</Text> // "Iniciar Sesión"
    );
}
```

### Fallback
Si una clave de traducción no existe, el hook retorna la clave misma o un valor por defecto si se especifica (aunque lo ideal es asegurar que el JSON esté completo).

`t('clave.inexistente')` -> "clave.inexistente"

### Sincronización
Es responsabilidad del desarrollador mantener la paridad de claves entre `es.json`, `en.json` y el backend/web para asegurar una experiencia consistente.
