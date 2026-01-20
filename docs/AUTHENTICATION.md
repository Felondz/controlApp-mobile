# Autenticación y Seguridad

## Sistema de Autenticación
La aplicación utiliza autenticación basada en Tokens (Bearer Token) contra una API Laravel Sanctum.

### Componentes Clave
1.  **authStore (`src/stores/authStore.ts`)**:
    *   Maneja el estado de sesión (`user`, `token`, `isAuthenticated`).
    *   Persiste el token en `SecureStore` (encriptado).
    *   Métodos: `login`, `register`, `logout`, `checkAuth`.

2.  **Interceptor de Axios (`src/services/api.ts`)**:
    *   **Request**: Inyecta automáticamente el header `Authorization: Bearer <token>` si existe un token en el store.
    *   **Response**: Intercepta errores 401 (Unauthorized) para cerrar sesión automáticamente si el token expira.

## Flujos Implementados

### 1. Iniciar Sesión (`login.tsx`)
*   Usuario ingresa credenciales.
*   `authStore.login()` llama a `/api/login`.
*   Si exitoso:
    *   Guarda Token en SecureStore.
    *   Guarda User en memoria.
    *   Redirige a `/(app)`.

### 2. Registro (`register.tsx`)
*   Usuario completa formulario.
*   `authStore.register()` llama a `/api/register`.
*   Backend crea usuario y dispara evento `Registered`.
*   Si backend retorna token (configuración actual): Auto-login y redirección.
*   Si no: Redirección a Login.

### 3. Recuperación de Contraseña
*   **Forgot Password**: Solicita email -> API envía link.
*   **Reset Password**:
    *   Usuario recibe link (Deep Link `controlapp://reset-password?token=...`).
    *   App intercepta link (configurado en `app.json` scheme).
    *   Navega a pantalla `reset-password.tsx`.
    *   Envía nuevo password + token al backend.

### 4. Verificación de Email
*   Backend envía correo con link firmado.
*   Deep Link `controlapp://verify-email?id=...&hash=...`.
*   App intercepta y navega a `verify-email.tsx`.
*   Valida firma contra API.
*   Actualiza estado de usuario (si fuera necesario).

## Deep Linking
Configurado mediante Expo Router.
*   **Scheme**: `controlapp`
*   **Configuración**: `app.json` -> `scheme`.
*   **Manejo**: Archivos en `app/(auth)/` capturan parámetros de URL (`useLocalSearchParams`).
