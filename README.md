# Device Manager

Personal Android + Web device-management project.

## Project Overview

This project is currently in **Phase 2 (Local Functional Foundation)**. The objective of Phase 2 is to create a robust local UI, mock services, error handling, permission architecture, and functional foundations on both Android and Web, **without** connecting to production databases or remote endpoints.

**Current Limitations**:
- The web dashboard uses mock data (`web/src/mock/data.ts`).
- Turso Database and Render hosting are intentionally NOT configured.
- Sensitive data collection (SMS, Call logs, Location tracking) is not yet active.
- API endpoints are stubbed.

## Architecture
- **Android App:** Kotlin + Android Studio. MVVM Architecture with Navigation Component.
- **Backend:** Node.js + TypeScript (Express). *(API contracts defined only)*
- **Web Dashboard:** React + TypeScript (Vite + Tailwind CSS).
- **Database:** Turso (LibSQL). *(Not active in Phase 2)*

## Folder Structure
- `/android`: Kotlin Android App.
- `/backend`: Node.js API (to be fully implemented).
- `/web`: React Frontend Dashboard.
- `/docs`: Additional architecture and API documentation.

## Local Setup

### Web Dashboard
1. `cd web`
2. `npm install`
3. Optional: Configure `.env` from `.env.example`.
4. `npm run dev` to start locally with mock data.
5. Build: `npm run build`
6. Test: `npm test`

### Android App
1. Open the `/android` folder in Android Studio.
2. Build and run on an emulator or physical device.
3. Test from command line: `./gradlew testDebugUnitTest`

## Future Plan (Phase 3)
- Implement backend data models and Turso connection.
- Enable live device registration, telemetry collection, and background sync logic.
- Remove web mock data and connect to the actual backend API.
- Deploy the production database and backend API.
