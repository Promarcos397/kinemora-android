# Kinemora Android Build Guide

## Quick Start

```bash
cd C:\Users\ibrah\.gemini\antigravity\scratch\kinemora-android

# Open in Android Studio
npx cap open android
```

Then in Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)

## CLI Build (Alternative)

```bash
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Project Structure

```
kinemora-android/
├── android/           # Native Android project (generated)
├── dist/              # Built web assets
├── components/        # React components
├── pages/             # App pages
├── utils/
│   ├── platformAdapter.ts  # Electron/Capacitor bridge
│   └── streamCache.ts      # Stream caching
└── capacitor.config.ts     # Capacitor config
```

## Key Differences from Electron

| Feature | Electron | Android |
|---------|----------|---------|
| Streaming | IPC via preload | Direct HTTP |
| Cloud Comics | Supabase via main | Direct Supabase |
| File System | Node.js fs | Capacitor Filesystem |

## Commands

### Rebuild
```bash
npm run build && npx cap sync android
```

### Live Reload (Dev)
```bash
npx cap run android --live-reload
```
