// Small helpers shared by the API routes (web-standard Request/Response).
import type { Design } from '../../src/lib/design.js';
import { decodeDesign, SHORT_ID } from '../../src/lib/share.js';
import { kv, kvEnabled } from './kv.js';

/** Renders of a given URL never change → let browsers and Vercel's CDN keep them */
export const CACHE_IMMUTABLE = 'public, max-age=86400, s-maxage=31536000, immutable';

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export const fail = (status: number, error: string, headers?: Record<string, string>) =>
  json({ error }, status, headers);

export function origin(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? url.host;
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  return `${proto}://${host}`;
}

export function clientIp(req: Request) {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'anonymous'
  );
}

/** Look up the payload behind a short link id */
export async function payloadForShortId(id: string): Promise<string | null> {
  if (!kvEnabled()) return null;
  return kv<string | null>('GET', `link:${id}`);
}

/** Resolve `?d=<payload>` or `?id=<short id>` into a validated design */
export async function designFromQuery(params: URLSearchParams): Promise<Design> {
  const id = params.get('id');
  const payload = id && SHORT_ID.test(id) ? await payloadForShortId(id) : params.get('d') ?? id;
  if (!payload) throw new Error('Design not found');
  return decodeDesign(payload);
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
