# Document Editor Android App

## Prerequisites

1. **Android Studio**: Download and install from https://developer.android.com/studio
2. **Android SDK**: Will be installed with Android Studio
3. **Java Development Kit (JDK)**: Version 11 or higher

## Building and Running the Android App

### Option 1: Using Android Studio (Recommended)

1. Build the web app and sync with Capacitor:
   ```bash
   npm run cap:build
   ```

2. Open the Android project in Android Studio:
   ```bash
   npm run cap:android
   ```
   Or manually open the `android` folder in Android Studio

3. In Android Studio:
   - Wait for Gradle sync to complete
   - Connect your Android device via USB (enable Developer Mode and USB Debugging)
   - Or start an Android emulator
   - Click the "Run" button (green play icon)

### Option 2: Command Line

1. Build and sync:
   ```bash
   npm run cap:build
   ```

2. Run on connected device/emulator:
   ```bash
   npm run cap:run:android
   ```

## Generating APK for Distribution

1. In Android Studio:
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - The APK will be generated in `android/app/build/outputs/apk/debug/`

2. For Release APK (signed):
   - Go to `Build` → `Generate Signed Bundle / APK`
   - Follow the wizard to create a keystore and sign your APK

## Testing on Your Android Phone

1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Install via USB**:
   - Connect phone to computer via USB
   - Run `npm run cap:run:android`

3. **Install via APK**:
   - Build the APK as described above
   - Transfer the APK to your phone
   - Open the APK file on your phone to install

## Troubleshooting

- If you get Gradle errors, try:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npx cap sync android
  ```

- Make sure your Android device is connected and recognized:
  ```bash
  adb devices
  ```

## Available Scripts

- `npm run cap:build` - Build React app and sync with Capacitor
- `npm run cap:android` - Open Android project in Android Studio
- `npm run cap:run:android` - Run app on connected device/emulator
