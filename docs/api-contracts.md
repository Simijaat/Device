# API Contracts (Phase 2)

These are the planned API contracts for the future backend. They are currently stubbed in the web dashboard using mock data. **Do not implement real transmission of sensitive data yet.**

## Base URL

Configurable via `VITE_API_URL` on the frontend. Default local: `http://localhost:3000`

## Endpoints

### `GET /health`
- **Description**: Returns the health status of the API.
- **Response**: `{ "status": "ok" }`

### `POST /device/register`
- **Description**: Registers a new device or updates an existing one.
- **Payload**:
  ```json
  {
    "deviceId": "string",
    "model": "string",
    "manufacturer": "string",
    "androidVersion": "string",
    "sdkVersion": 34,
    "appVersion": "1.0.0"
  }
  ```
- **Response**: `{ "success": true }`

### `POST /device/status`
- **Description**: Updates the current status of the device (battery, network).
- **Payload**:
  ```json
  {
    "deviceId": "string",
    "batteryPercentage": 85,
    "isCharging": false,
    "networkState": "WiFi"
  }
  ```
- **Response**: `{ "success": true }`

### `GET /device`
- **Description**: Retrieves a list of all registered devices.
- **Response**: Array of `Device` objects.

### `GET /messages`
- **Description**: Retrieves a list of synced messages, optionally filtered by `deviceId`.
- **Query Params**: `deviceId` (optional)
- **Response**: Array of `Message` objects.

### `GET /calls`
- **Description**: Retrieves a list of synced calls, optionally filtered by `deviceId`.
- **Query Params**: `deviceId` (optional)
- **Response**: Array of `Call` objects.

### `GET /locations`
- **Description**: Retrieves a list of synced location updates, optionally filtered by `deviceId`.
- **Query Params**: `deviceId` (optional)
- **Response**: Array of `Location` objects.
