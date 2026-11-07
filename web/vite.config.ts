import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function productionApiProxyPlugin(): Plugin {
  return {
    name: 'production-api-proxy-middleware',
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

        try {
          const targetUrl = new URL(req.url, 'https://backend-ttml.onrender.com');
          const headers: Record<string, string> = {
            host: 'backend-ttml.onrender.com',
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
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          const response = await fetch(targetUrl.toString(), {
            method: req.method,
            headers,
            body: bodyBuffer,
            signal: controller.signal,
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
        } catch (err: any) {
          console.warn('[Proxy Warning] Production backend unreachable:', err.message);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(
            JSON.stringify({
              success: false,
              error:
                'Production backend (https://backend-ttml.onrender.com) is currently waking up or unreachable. Please retry in a few seconds.',
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), productionApiProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
