# Deployment

## Backend & Web (Render)
1. Push your repository to GitHub.
2. In Render, create a new Web Service pointing to your repository.
3. Set the Root Directory to `backend` or use a monorepo setup to deploy both.
4. Add the required Environment Variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

## Database (Turso)
1. Install Turso CLI: `curl -sSf https://get.turso.tech/install.sh | bash`
2. Authenticate: `turso auth login`
3. Create DB: `turso db create device-manager`
4. Get token: `turso db tokens create device-manager`

## Android (GitHub Actions)
The APK is built automatically via the `.github/workflows/build-android.yml` action on every push to `main`.
