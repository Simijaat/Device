import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function devApiPlugin(): Plugin {
  // In-memory data store for isolated development/demo testing
  const mockDevices = [
    {
      id: "demo-dev-101",
      name: "Pixel 8 Pro (Demo Unit)",
      model: "Google Pixel 8 Pro",
      android_version: "Android 14",
      app_version: "1.0",
      last_seen: new Date().toISOString(),
      is_online: 1,
      battery_level: 86,
      is_charging: 1,
      network_type: "WiFi"
    }
  ];

  const mockMessages = [
    {
      id: "demo-msg-1",
      device_id: "demo-dev-101",
      sender: "Courier Service",
      content: "Your security patch delivery has been scheduled.",
      type: "inbox",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: "demo-msg-2",
      device_id: "demo-dev-101",
      sender: "+1 (555) 019-2834",
      content: "System synchronization test confirmed.",
      type: "sent",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    }
  ];

  const mockCalls = [
    {
      id: "demo-call-1",
      device_id: "demo-dev-101",
      number: "+1 (555) 019-2834",
      type: "incoming",
      duration: 120,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    }
  ];

  const mockLocations = [
    {
      id: "demo-loc-1",
      device_id: "demo-dev-101",
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 12.0,
      timestamp: new Date().toISOString()
    }
  ];

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        const isMockRequested = req.headers['x-mock-mode'] === 'true' || process.env.VITE_USE_MOCK === 'true';

        // If NOT explicitly in mock mode, pass to the real backend via proxy
        if (!isMockRequested) {
          try {
            const targetUrl = new URL(req.url, 'https://backend-ttml.onrender.com');
            const headers: Record<string, string> = {
              'host': 'backend-ttml.onrender.com',
            };
            if (req.headers.authorization) {
              headers['authorization'] = req.headers.authorization;
            }
            if (req.headers['content-type']) {
              headers['content-type'] = req.headers['content-type'] as string;
            }

            let bodyBuffer: Buffer | undefined;
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              bodyBuffer = Buffer.concat(chunks);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(targetUrl.toString(), {
              method: req.method,
              headers,
              body: bodyBuffer,
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              const lower = key.toLowerCase();
              if (
                lower !== 'content-encoding' &&
                lower !== 'content-length' &&
                lower !== 'transfer-encoding' &&
                lower !== 'connection' &&
                lower !== 'access-control-allow-origin'
              ) {
                res.setHeader(key, value);
              }
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');

            const resData = await response.arrayBuffer();
            res.end(Buffer.from(resData));
            return;
          } catch (err: any) {
            console.warn('[Proxy Warning] Production backend unreachable, returning structured error:', err.message);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              success: false,
              error: `Production backend unreachable (https://backend-ttml.onrender.com). The remote server may be waking up. Please retry or switch to Demo Mode.`
            }));
            return;
          }
        }

        // ISOLATED MOCK MODE (Only activated when explicitly requested)
        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;
        const method = req.method;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Data-Source', 'in-memory-mock');

        const readBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
            });
          });
        };

        if (pathname === '/api/auth/login' && method === 'POST') {
          const body = await readBody();
          res.end(JSON.stringify({
            success: true,
            token: 'demo-isolated-session-token',
            user: { id: 'demo-user-1', username: body.username || 'demo_user' }
          }));
          return;
        }

        if (pathname === '/api/auth/register' && method === 'POST') {
          res.end(JSON.stringify({
            success: true,
            message: 'Demo registration simulated successfully'
          }));
          return;
        }

        if (pathname === '/api/devices' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: mockDevices }));
          return;
        }

        if (pathname === '/api/messages' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: mockMessages }));
          return;
        }

        if (pathname === '/api/calls' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: mockCalls }));
          return;
        }

        if (pathname === '/api/locations' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: mockLocations }));
          return;
        }

        if (pathname === '/api/contacts' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: [] }));
          return;
        }

        if (pathname === '/api/apps' && method === 'GET') {
          res.end(JSON.stringify({ success: true, data: [] }));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: 'Endpoint not found in mock store' }));
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
})
