# ThermaFit — Setup Guide

## 1. OpenWeatherMap API Key

1. Sign up at https://openweathermap.org and get a free API key
2. Open `app.json` and replace `"YOUR_OWM_API_KEY_HERE"` with your key:
   ```json
   "extra": {
     "owmApiKey": "abc123yourkey"
   }
   ```

## 2. Run the app

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 3. iOS Widget Setup (Xcode — macOS only)

The iOS widget requires manual Xcode setup:

1. Open `ios/ThermaFit.xcworkspace` in Xcode
2. **Add Widget Extension target:**
   - File → New → Target → Widget Extension
   - Product Name: `ThermaFitWidget`
   - Uncheck "Include Configuration Intent"
3. **Replace generated files** with the files in `ios/ThermaFitWidget/`
4. **Configure App Group** for both the main app and widget targets:
   - Select the main app target → Signing & Capabilities → + App Groups
   - Add group: `group.com.thermafit`
   - Repeat for the `ThermaFitWidget` target
5. **Write snapshot to App Groups** (optional native bridge):
   - The JS side currently writes to AsyncStorage. For the iOS widget to read it,
     you can add a native module that mirrors the snapshot to `UserDefaults` with
     the `group.com.thermafit` suite name. The Swift widget reads from this store.
6. Build and run on a real device or simulator

## 4. Android Widget Setup

Android widgets are configured automatically via `react-native-android-widget`.
The plugin in `app.json` handles the manifest registration.

To add the widget to the home screen:
1. Long-press the home screen
2. Tap "Widgets"
3. Find "ThermaFit" and drag it to your home screen

## 5. Adaptive Learning

The app asks "How was your outfit?" approximately 4 hours after each use.
After 3 consistent answers of "Too cold" or "Too warm", it automatically
adjusts your sensitivity setting and notifies you.

## 6. Project Structure

```
src/
  types/          — TypeScript interfaces
  constants/      — Theme + layer rules table
  logic/          — Pure outfit/layer engine (layerEngine.ts)
  services/       — OpenWeatherMap API calls
  storage/        — AsyncStorage helpers + auto-calibration
  hooks/          — useLocation, useWeather, usePreferences
  components/     — Reusable UI components
  screens/        — HomeScreen, SettingsScreen
  navigation/     — Bottom tab navigator
  widgets/        — Android widget component + task handler
ios/
  ThermaFitWidget/ — iOS WidgetKit Swift extension
```
