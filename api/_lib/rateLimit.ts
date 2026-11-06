// Fixed-window rate limiting. Shared across all function instances when Redis is
// configured; otherwise best-effort per warm instance (still blocks simple loops).
import { kv, kvEnabled } from './kv.js';

const memory = new Map<string, number>();

export async function rateLimit(name: string, ip: string, limit: number, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const key = `rl:${name}:${ip}:${Math.floor(now / windowSec)}`;
  const retryAfter = windowSec - (now % windowSec);

  let count: number;
  if (kvEnabled()) {
    try {
      count = await kv<number>('INCR', key);
      if (count === 1) await kv('EXPIRE', key, windowSec);
    } catch {
      return { ok: true, retryAfter }; // never block users because Redis hiccuped
    }
  } else {
    if (memory.size > 5000) memory.clear();
    count = (memory.get(key) ?? 0) + 1;
    memory.set(key, count);
  }
  return { ok: count <= limit, retryAfter };
}
