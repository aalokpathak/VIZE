// Share-link payloads: design → (diff vs defaults) → JSON → deflate → base64url.
// Uses only web-standard APIs (CompressionStream, TextEncoder, btoa), so the same
// code runs in the browser and in Vercel's Node runtime.
import { designDiff, sanitizeDesign, type Design } from './design.js';

/** Payloads longer than this are rejected (keeps URLs well under every browser/CDN limit) */
export const MAX_PAYLOAD = 8000;
/** Short link ids: 7 chars of [A-Za-z0-9]. Payloads are always longer, so the two never collide. */
export const SHORT_ID = /^[A-Za-z0-9]{7}$/;
const PAYLOAD = /^[A-Za-z0-9_-]+$/;
const VERSION = 1;

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

function toBase64Url(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function encodeDesign(d: Design): Promise<string> {
  const json = JSON.stringify({ v: VERSION, ...designDiff(d) });
  return toBase64Url(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw')));
}

/** Decode and validate a payload. Throws on anything malformed. */
export async function decodeDesign(payload: string): Promise<Design> {
  if (!payload || payload.length > MAX_PAYLOAD || !PAYLOAD.test(payload)) throw new Error('Invalid share link');
  const bytes = await pipe(fromBase64Url(payload), new DecompressionStream('deflate-raw'));
  if (bytes.length > 64_000) throw new Error('Invalid share link');
  return sanitizeDesign(JSON.parse(new TextDecoder().decode(bytes)));
}

export const isPayload = (s: string) => s.length <= MAX_PAYLOAD && PAYLOAD.test(s) && !SHORT_ID.test(s);
