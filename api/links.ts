// POST /api/links { payload } → { id, url }   (needs Redis — see README)
// Short links are content-addressed: the same design always gets the same id,
// so re-sharing never creates duplicates.
import { decodeDesign, MAX_PAYLOAD } from '../src/lib/share.js';
import { clientIp, fail, json, origin } from './_lib/http.js';
import { kv, kvEnabled } from './_lib/kv.js';
import { rateLimit } from './_lib/rateLimit.js';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ONE_YEAR = 60 * 60 * 24 * 365;

async function idFor(payload: string, salt: number) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${payload}`)));
  return Array.from(digest.subarray(0, 7), (b) => ALPHABET[b % 62]).join('');
}

export async function POST(req: Request) {
  if (!kvEnabled()) return fail(501, 'Short links are not configured');

  const limit = await rateLimit('links', clientIp(req), 30, 600);
  if (!limit.ok) return fail(429, 'Too many links — try again in a few minutes', { 'Retry-After': String(limit.retryAfter) });

  const body = (await req.json().catch(() => null)) as { payload?: unknown } | null;
  const payload = typeof body?.payload === 'string' ? body.payload : '';
  if (!payload || payload.length > MAX_PAYLOAD) return fail(400, 'Invalid design');
  try {
    await decodeDesign(payload);
  } catch {
    return fail(400, 'Invalid design');
  }

  // Same design → same id. On the (astronomically rare) collision, salt and retry.
  for (let salt = 0; salt < 3; salt++) {
    const id = await idFor(payload, salt);
    const created = await kv<string | null>('SET', `link:${id}`, payload, 'NX', 'EX', ONE_YEAR);
    if (created === 'OK' || (await kv<string | null>('GET', `link:${id}`)) === payload) {
      return json({ id, url: `${origin(req)}/s/${id}` }, 201);
    }
  }
  return fail(500, 'Could not create a short link');
}
