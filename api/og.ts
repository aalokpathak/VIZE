// GET /api/og?d=<payload>|id=<short id> — 1200×630 link-preview card (cached at the edge)
import { CACHE_IMMUTABLE, designFromQuery, fail } from './_lib/http.js';
import { renderPreviewCard } from './_lib/renderer.js';

export async function GET(req: Request) {
  let design;
  try {
    design = await designFromQuery(new URL(req.url).searchParams);
  } catch {
    return fail(400, 'Invalid or missing design');
  }
  const image = await renderPreviewCard(design);
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': CACHE_IMMUTABLE },
  });
}
