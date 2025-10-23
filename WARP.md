# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commonly Used Commands

### Development
- `npm start`: Starts the development server for the web app.
- `npm test`: Runs the test suite.

### Building
- `npm run build`: Builds the web app for production.

### Capacitor (for mobile development)
- `npm run cap:build`: Builds the web app and syncs it with Capacitor for the native app.
- `npm run cap:android`: Opens the Android project in Android Studio.
- `npm run cap:run:android`: Runs the app on a connected Android device or emulator.

## Code Architecture

This is a React and TypeScript project that uses Capacitor to create a native Android application. The core of the application is a document editor.

- **`src/App.tsx`**: This is the main component that contains the routing logic and the `EditorPage` component.
- **`src/pages/Home.tsx`**: The home screen of the application.
- **`EditorPage` in `src/App.tsx`**: This component integrates the `@syncfusion/ej2-react-documenteditor`, which is the rich text editor. It also handles saving documents.
- **`src/TextEditorToolbar.tsx`**: A custom toolbar for the text editor.
- **`src/syncfusion-license.ts`**: This file contains the license key for the Syncfusion components. The key is read from the `REACT_APP_SYNCFUSION_LICENSE_KEY` environment variable.
- **Capacitor Configuration**: `capacitor.config.ts` contains the configuration for the native app.
- **Android Project**: The native Android project is located in the `android/` directory. The `ANDROID_README.md` file has more details on how to build and run the Android app.
