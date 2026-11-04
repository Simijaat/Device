# Device Manager

Personal Android + Web device-management project.

## Project Overview

This project is currently in **Phase 3 (Live Backend Integration)**. The objective of Phase 3 is full integration with production Turso Database and remote Render endpoints. All mock data has been removed and real backend services are functional.

**Current Limitations**:
- Sensitive data collection (SMS, Call logs, Location tracking) is not yet active.

## Architecture
- **Android App:** Kotlin + Android Studio. MVVM Architecture with Navigation Component.
- **Backend:** Node.js + TypeScript (Express). (Fully implemented API)
- **Web Dashboard:** React + TypeScript (Vite + Tailwind CSS).
- **Database:** Turso (LibSQL).

## Folder Structure
- `/android`: Kotlin Android App.
- `/backend`: Node.js API.
- `/web`: React Frontend Dashboard.
- `/docs`: Additional architecture and API documentation.

## Local Setup

### Web Dashboard
1. `cd web`
2. `npm install`
3. Optional: Configure `.env` from `.env.example`.
4. `npm run dev` to start locally with live backend API.
5. Build: `npm run build`
6. Test: `npm test`

### Android App
1. Open the `/android` folder in Android Studio.
2. Build and run on an emulator or physical device.
3. Test from command line: `./gradlew testDebugUnitTest`

## Future Plan (Phase 4)
- Implement backend data models and Turso connection.
- Enable live device registration, telemetry collection, and background sync logic.
- Maintain web frontend and connect to the actual backend API.
- Deploy the production database and backend API.
