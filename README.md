# Device Manager

Personal Android + Web device-management project.

## Project Overview

This project is currently in **Phase 8 (Security, Testing, Release and Documentation)**. All bugs found in the audit report have been addressed and the single owner model is enforced via the web dashboard.

**Current Features**:
- Strict single user login system with secure JWT verification
- Device limit tracking and ownership constraints via API
- Enhanced Android Permissions Center utilizing the double-gate protocol (OS Permission + Sync toggle)
- Completely refactored and stylized Web Dashboard in Liquid Glass style

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

## Release Notes (Phase 8 update)
- Ensure to use `DeviceManagerRelease.zip` to unpack the APK and deploy your device setup.
- Play Protect might still raise warnings on sensitive data (SMS, Calls), but permissions are requested safely.
