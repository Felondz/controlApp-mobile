# ControlApp Mobile

ControlApp Mobile is the native mobile client for the ControlApp platform, built with modern cross-platform technologies to ensure high performance and code shareability. This application allows users to manage projects, tasks, finances, and inventory directly from their mobile devices, maintaining full synchronization with the web platform.

## Architecture and Design

The application follows a modular architecture based on Expo Router for file-based navigation. The design system corresponds strictly to the web version, implementing a consistent interface using NativeWind (Tailwind CSS for React Native).

State management is handled via Zustand for lightweight and efficient global state (authentication, user settings), while API interactions are managed through a centralized Axios client with interceptors for security and token handling.

## Technology Stack

The project relies on the following core technologies:

### Core
*   **Expo SDK 54**: The framework for universal React applications.
*   **React Native 0.81**: The core mobile development library.
*   **TypeScript 5.9**: Ensures type safety and code robustness.

### Navigation and Routing
*   **Expo Router 6**: Provides filesystem-based routing, deep linking, and layout management.

### Styling and UI
*   **NativeWind 4**: Allows the use of Tailwind CSS utility classes directly in React Native components.
*   **Expo System UI**: Manages system UI elements like the root view background color.

### State Management and Data
*   **Zustand 5**: A small, fast, and scalable bearbones state-management solution.
*   **React Query 5**: Powerful asynchronous state management for server data synchronization.
*   **Axios**: Promise-based HTTP client for the browser and node.js.

## Project Structure

*   **/app**: Contains the Expo Router file-based navigation structure.
*   **/src/shared**: Reusable components, hooks, themes, and translations.
*   **/src/stores**: Global state definitions using Zustand.
*   **/src/services**: API clients and external service integrations.
*   **/src/modules**: Feature-specific logic and components (Finance, Tasks, Inventory).

## Getting Started

1.  **Install dependencies**:
    `npm install` or `pnpm install`

2.  **Prebuild the project** (Optional but recommended for native code generation):
    `npx expo prebuild`

3.  **Run the application**:
    `npx expo run:android` for Android
    `npx expo run:ios` for iOS

## Localization

The application supports multiple languages (English and Spanish) through a custom hook `useTranslate`, allowing seamless switching between locales based on user preference or system settings.

## Dark Mode

Full support for dark mode is implemented using NativeWind and a persisted user setting store, ensuring the application adapts to user preferences and system themes.
