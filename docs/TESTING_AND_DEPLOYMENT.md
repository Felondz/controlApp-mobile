# Testing y Despliegue

## Estrategia de Testing (Planificada)

### 1. Unit Testing
*   **Herramientas**: Jest.
*   **Objetivo**: Probar lógica pura (funciones helpers, hooks complejos, reducers de Zustand).
*   **Ejecución**: `pnpm test`

### 2. Component Testing
*   **Herramientas**: React Native Testing Library (RNTL).
*   **Objetivo**: Verificar que los componentes (Botones, Inputs, Cards) renderizan correctamente y responden a eventos de usuario.

### 3. Integration/E2E Testing
*   **Herramientas**: Maestro (recomendado para Expo).
*   **Objetivo**: Validar flujos completos (Login -> Dashboard -> Crear Proyecto).

---

## Estrategia de Despliegue (EAS)

La aplicación utiliza **Expo Application Services (EAS)** para la construcción y distribución de binarios.

### Requisitos Previos
1.  Cuenta en Expo.dev.
2.  EAS CLI instalado: `npm install -g eas-cli`.
3.  Login: `eas login`.

### Configuración (`eas.json`)
Define perfiles de build (development, preview, production).

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Generación de Builds (Android)

**Development Client (para testing en dispositivo físico):**
```bash
eas build --profile development --platform android
```
Esto genera un APK que se puede instalar y permite hot-reloading conectándose al servidor de desarrollo (`npx expo start`).

**APK de Producción (para Play Store):**
```bash
eas build --profile production --platform android
```
Genera un AAB (Android App Bundle) firmado y listo para subir.

### Gestión de Secretos
Las variables de entorno sensibles (API Keys, URLs de producción) **NO** se commitean. Se gestionan mediante EAS Secrets:

```bash
eas secret:create --scope project --name API_URL --value "https://mi-api.com"
```
Durante el build, EAS inyecta estos valores en el `.env` del contenedor.
