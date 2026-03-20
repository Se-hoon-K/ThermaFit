# ThermaFit — Setup Guide

## 1. WeatherAPI.com API Key

1. Sign up (free) at https://www.weatherapi.com — no credit card required
2. Copy your API key from the dashboard
3. Open `app.json` and replace `"YOUR_WEATHERAPI_KEY_HERE"` with your key:
   ```json
   "extra": {
     "weatherApiKey": "abc123yourkey"
   }
   ```
   **Free tier:** 100,000 calls/month · Commercial use permitted

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
   - The JS side writes to AsyncStorage. For the iOS widget to read it,
     add a native module that mirrors the snapshot to `UserDefaults` with
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
adjusts your temperature sensitivity setting and notifies you.

## 6. Weather Cache

Weather data is cached for 30 minutes. The app will reuse cached data if:
- Less than 30 minutes have passed since the last fetch
- You haven't moved more than ~1 km

Tapping **Refresh** always fetches fresh data regardless of cache.

## 7. Project Structure

```
src/
  types/          — TypeScript interfaces
  constants/      — Theme + layer rules table
  logic/          — Pure outfit/layer engine (layerEngine.ts)
  services/       — WeatherAPI.com integration (weatherService.ts)
  storage/        — AsyncStorage: preferences, feedback, cache, widget bridge
  hooks/          — useLocation, useWeather, usePreferences
  components/     — Reusable UI components
  screens/        — HomeScreen, SettingsScreen
  navigation/     — Bottom tab navigator
  widgets/        — Android widget component + task handler
ios/
  ThermaFitWidget/ — iOS WidgetKit Swift extension
```
