# Architecture

## Stack
- Android app: Kotlin
- Backend/API: Node.js + TypeScript
- Web dashboard: React + TypeScript
- Database: Turso (LibSQL)

## Principles
- **No hardcoded secrets**: All API keys and DB connection strings must be set via environment variables.
- **Client Security**: Do not expose Turso credentials in the Android APK or Web dashboard. They must route through the backend.
- **Phase 1 Limitations**: Sensitive data collection (SMS, OTP, Calls, Location) is intentionally left unimplemented in this foundational phase.
