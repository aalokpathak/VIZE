// Optional Redis storage via Upstash's REST API (free tier, one click from the
// Vercel Marketplace). Everything that uses it degrades gracefully when it's absent.

const url = () => process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvEnabled = () => Boolean(url() && token());

/** Run one Redis command, e.g. kv('SET', 'key', 'value', 'EX', 60) */
export async function kv<T = unknown>(...command: (string | number)[]): Promise<T> {
  const res = await fetch(url()!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(4000),
  });
  const body = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || body.error) throw new Error(`KV error: ${body.error ?? res.status}`);
  return body.result as T;
}
