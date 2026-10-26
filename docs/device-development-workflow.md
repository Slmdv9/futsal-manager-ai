# Device Development Workflow

Use a physical Android device as the first visual check for every notable UI or behavior change. Expo Go is the fast feedback loop; a local native build is the fallback when native configuration or custom native modules change. iOS is secondary until a physical iPhone or iPad is part of the routine.

## Verified Environment

| Item | Value |
| --- | --- |
| Host | macOS (Darwin 25.5.0, arm64) |
| Node / npm | Node 22.22.3 / npm 10.9.8 |
| App stack | Expo SDK 58.0.19, Expo Router, TypeScript |
| Android device | Samsung Galaxy M13 (`SM-M135F`), Android 14, `armeabi-v7a` |
| Android SDK | `$HOME/Library/Android/sdk` |
| Expo Go | 58.0.5 (`host.exp.exponent`) |
| Connection | USB debugging plus `adb reverse` on port 8081 |

`adb` is not on the default shell `PATH` on this machine. Export the Android SDK paths first:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
adb devices -l
```

The device must appear as `device`, not `unauthorized` or `offline`.

## Fast Loop With Expo Go

Expo Go is enough while the app only uses modules bundled in the Expo Go client, including `react-native-svg`.

1. Confirm the device and forward Metro over USB:

   ```bash
   adb devices -l
   adb reverse tcp:8081 tcp:8081
   ```

2. Start Metro in one terminal:

   ```bash
   npm start -- --localhost
   ```

3. Open the project in Expo Go from another terminal:

   ```bash
   adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081
   ```

   On first launch, dismiss Expo Go's developer-menu introduction with **Continue**.

4. Edit files normally. Fast Refresh updates the running app without a manual reload.

5. Force a full JavaScript reload when needed. Relaunching the deep link is the reliable path when Metro has no interactive terminal:

   ```bash
   adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081
   ```

   In an interactive `npm start` terminal, press `r` instead. The Expo Go developer menu (`adb shell input keyevent 82`) also exposes **Reload**, but in Expo Go 58.0.5 that action can return to the launcher, so prefer the deep link or the `r` key.

### Install Or Refresh Expo Go

`npx expo start --android --localhost` can install Expo Go automatically. To install the SDK-matching client manually:

```bash
curl -L -o /tmp/Expo-Go-58.0.5.apk \
  https://github.com/expo/expo-go-releases/releases/download/Expo-Go-58.0.5/Expo-Go-58.0.5.apk
adb install -r /tmp/Expo-Go-58.0.5.apk
```

Use the client version that matches the project's Expo SDK. The current SDK 58 mapping is available from `https://api.expo.dev/v2/versions`.

## Native Dev Build

Use a native build when `app.json` native configuration changes, a custom native module is added, or Expo Go cannot represent the app.

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
npm run android
```

`npm run android` runs `expo run:android`. It prebuilds the gitignored `android/` folder, compiles a debug APK for the connected ABI, installs it, and starts the app. Keep Metro running; JavaScript changes still use Fast Refresh. The first build also downloads Gradle and the required Android NDK, so it takes longer than later builds.

The local debug application ID is currently `com.anonymous.futsalmanagerai`. Replace it with the production application ID in `app.json` before any EAS or store build.

After changing dependencies or native configuration:

```bash
npx expo prebuild --clean
npm run android
```

Full relaunch of the installed native app:

```bash
adb shell am force-stop com.anonymous.futsalmanagerai
adb shell am start -n com.anonymous.futsalmanagerai/.MainActivity
```

## Inspecting The Device From An Agent Session

The UI hierarchy is the most reliable textual check:

```bash
adb shell uiautomator dump /sdcard/window.xml
adb shell cat /sdcard/window.xml | grep -o 'text="[^"]*"' | sort -u
```

Capture a screenshot for the user when visual layout matters:

```bash
adb exec-out screencap -p > /tmp/futsal-device.png
```

Check that the app is in the foreground and that JavaScript did not crash:

```bash
adb shell dumpsys activity activities | grep -m1 topResumedActivity
adb logcat -d -t 400 | grep -iE "ReactNativeJS.*(error|exception)|FATAL EXCEPTION"
```

## Per-Change Checklist

Before handing a notable change back:

1. Run `./init.sh` and confirm it still exits 0.
2. Refresh or relaunch the app on the Android device.
3. Confirm the expected Spanish copy or behavior with `uiautomator`.
4. Check `logcat` for JavaScript errors or a fatal exception.
5. Record the device model, command, and result in `PROGRESS.md`; add durable evidence to `feature_list.json` when the change belongs to a feature.
6. Stop a background Metro process if it is no longer needed:

   ```bash
   kill "$(cat /tmp/expo-device.pid)"
   ```

## iOS

- Simulator: `npm run ios` builds and launches a native debug app; `npx expo start --ios` uses Expo Go.
- Physical iPhone or iPad: Expo Go over the LAN with `npx expo start --lan` and the QR code, or `npx expo run:ios --device` after configuring an Apple signing team.
- Physical iOS is not part of the verified routine yet. Record it in the evidence log once it is.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `adb: command not found` | Export `ANDROID_HOME` and add `platform-tools` to `PATH`. |
| Device `unauthorized` | Accept the USB debugging prompt on the phone. |
| App immediately returns to the launcher | The phone may be locked or asleep; run `adb shell input keyevent KEYCODE_WAKEUP`, `adb shell wm dismiss-keyguard`, and swipe up. |
| App cannot reach Metro | Run `adb reverse --list`; re-add `adb reverse tcp:8081 tcp:8081`. |
| Expo Go SDK warning | Install the Expo Go client matching the project SDK. |
| Port 8081 already in use | `lsof -i :8081`, or start with `--port`. |
| Native build targets the wrong ABI | Confirm `adb shell getprop ro.product.cpu.abilist`; this phone is `armeabi-v7a`. |

## Evidence Log

| Date | Change | Device | Result |
| --- | --- | --- | --- |
| 2026-10-26 | Bootstrap app shell | Samsung Galaxy M13 | Expo Go 58.0.5 and the native debug build (`com.anonymous.futsalmanagerai`) rendered the Spanish home placeholder. Fast Refresh and full relaunch verified in both. First native build: 12m 48s, 60 MB debug APK, after downloading Gradle 9.4.1, NDK 27.1, platform 37, and build-tools 37. |
