import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Prepare Turso/LibSQL client (using dummy defaults if missing so build passes, but env variables required for prod)
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

// Initialize db connection only if this isn't just a build step
const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

// Basic health-check API
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
