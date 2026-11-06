// Dev-only: serve /api/* functions (and the /s/:id rewrite) from `npm run dev`,
// mirroring how Vercel runs them in production — no Vercel CLI or login needed.
import fs from 'node:fs';
import type { IncomingMessage } from 'node:http';
import path from 'node:path';
import { loadEnv, type Plugin } from 'vite';

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export function vercelApi(): Plugin {
  return {
    name: 'vize-vercel-api',
    apply: 'serve',
    configureServer(server) {
      // Make .env / .env.local values (e.g. ANTHROPIC_API_KEY) visible to the functions
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''));

      server.middlewares.use(async (req, res, next) => {
        let url = req.url ?? '/';
        const share = /^\/s\/([^/?#]+)/.exec(url);
        if (share) url = `/api/share?id=${share[1]}`; // same rewrite as vercel.json

        const route = /^\/api\/([a-z]+)(?=[/?]|$)/.exec(url)?.[1];
        if (!route) return next();
        const file = path.join(server.config.root, 'api', `${route}.ts`);
        if (!fs.existsSync(file)) {
          res.statusCode = 404;
          return res.end('Not found');
        }

        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod[req.method ?? 'GET'];
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            return res.end('Method not allowed');
          }
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
          }
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(new URL(url, `http://${req.headers.host ?? 'localhost'}`), {
            method: req.method,
            headers,
            body: hasBody ? new Uint8Array(await readBody(req)) : undefined,
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          next(err);
        }
      });
    },
  };
}
