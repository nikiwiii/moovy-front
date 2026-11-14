# moovy — Frontend (Expo / React Native)

Mobile and web client for **moovy**, an AI-powered movie recommendation app built with Expo and React Native. It connects to the Moovy FastAPI backend to help solo viewers and groups decide what to watch based on shared vibes, taste profiles, runtime limits, and content exclusions.

---

## Features

- **Authentication & Token Rotation**: Email/password registration and login with JWT access and refresh token handling, automatic 401 refresh via a global `fetch` interceptor, and account deletion.
- **Taste Onboarding**: Selection of preferred and excluded vibes, release eras, anime/animation filters, and favorite movies with live title search.
- **Solo Movie Finder**: Configure group context, moodboard/vibes, maximum duration, and exclusions to generate primary and alternative AI movie recommendations.
- **Group Watch Sessions**: Create a session (`Crew`, `Date`, or `Family`), share an invite code, join existing lobbies, track member readiness, and get group recommendations.
- **Movie Details & Streaming Availability**: View posters, AI recommendation reasoning, and local streaming/rent/buy providers.
- **Profile, Watchlist & Rating History**: Manage nickname and profile picture, filter and sort watchlist items, and track rated movies.
- **Cross-Platform Storage**: Uses `expo-secure-store` on iOS/Android and `localStorage` on web.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Expo (`~55.0`), React Native (`0.83`), React (`19.2`) |
| Language | TypeScript (`~5.9`) |
| Navigation | Expo Router (`~55.0`, file-based typed routes) |
| Styling | NativeWind (`^4.2`), Tailwind CSS (`^3.4`) |
| Animations & UI | React Native Reanimated, Moti, Lucide React Native |
| Storage | `expo-secure-store` (native) / `localStorage` (web) |
| Builds | EAS Build (`eas.json`) |

---

## Project Structure

```text
movienight-front/
├── app/                     # Expo Router screens and global layout/auth interceptor
├── assets/                  # Logos, icons, and static images
├── components/              # Reusable UI components (FilmView, Moodboard, Navbar, Toast, etc.)
├── constants/               # App config (API_URL), theme colors, styles, and vibe metadata
├── hooks/                   # Custom React hooks
├── plugins/                 # Expo config plugin (Android cleartext network security config)
├── scripts/                 # Utility scripts
├── services/                # API clients (auth, sessions, movies, metadata, profile, ratings, storage)
├── .env.template            # Environment variable template
├── app.json                 # Expo app configuration
└── eas.json                 # EAS Build profiles (development, dev-fast, preview, production)
```

---

## Prerequisites

- **Node.js** (LTS recommended) and **npm**
- **Running Moovy backend** (default port: `8010`)
- For mobile testing: **Expo Go**, **Android Studio** (Android Emulator), or **Xcode** (iOS Simulator on macOS)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.template` to `.env` (or edit the existing `.env` file):

```bash
cp .env.template .env
```

Set `EXPO_PUBLIC_API_URL` according to where you run the frontend and the local backend (`port 8010`):

| Target | `EXPO_PUBLIC_API_URL` | Notes |
| --- | --- | --- |
| Web / iOS Simulator | `http://localhost:8010` | Works directly against local backend |
| Android Emulator | `http://10.0.2.2:8010` | Or `http://localhost:8010` after running `adb reverse tcp:8010 tcp:8010` |
| Physical Device (Expo Go) | `http://<YOUR_LAN_IP>:8010` | Computer and phone must be on the same local network |

If `EXPO_PUBLIC_API_URL` is omitted, `constants/config.ts` falls back to `http://localhost:8010`.

### 3. Start the local backend

Follow the instructions in the `Moovly` backend repository (e.g., `docker compose up --build` in the backend directory) and verify it responds at `http://localhost:8010/health`.

### 4. Start the app

```bash
npx expo start
```

Platform-specific scripts defined in `package.json`:

```bash
npm run android   # Run native Android build
npm run ios       # Run native iOS build
npm run web       # Start Expo Web
npm run lint      # Run Expo ESLint checks
```

#### Note for Expo Web & CORS

Expo Web starts on port `8081` by default. Make sure your backend `CORSMiddleware` `allow_origins` list includes your local web origin (for example `http://localhost:8081`), or start the web server on a port already allowed by the backend (`npx expo start --web --port 8080`).

---

## EAS Build Profiles

`eas.json` defines four build profiles:

- `development` — internal development client build
- `dev-fast` — cached Android debug APK build
- `preview` — Android APK / iOS simulator build for testing
- `production` — production release build

Set `EXPO_PUBLIC_API_URL` in EAS Environment Variables (or your build environment) when creating remote builds.

---

## License

See [LICENSE](LICENSE).
