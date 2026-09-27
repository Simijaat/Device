# Device Manager

Personal Android + Web device-management project.

## Architecture
- **Android App:** Kotlin + Android Studio.
- **Backend:** Node.js + TypeScript (Express).
- **Web Dashboard:** React + TypeScript (Vite + Tailwind CSS).
- **Database:** Turso (LibSQL).

## Quick Start

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
4. `npm run dev` to start locally.

### Web Dashboard
1. `cd web`
2. `npm install`
3. Copy `.env.example` to `.env` (optional, for custom VITE_API_URL).
4. `npm run dev` to start locally.

### Android App
1. Open the `/android` folder in Android Studio.
2. Build and run on your emulator or physical device.

## Further Documentation
Please see the `/docs` folder for detailed guides on:
- [Architecture](docs/architecture.md)
- [Local Development](docs/local-development.md)
- [Deployment](docs/deployment.md)
