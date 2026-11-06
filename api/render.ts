// GET /api/render?d=<payload>|id=<short id>[&type=png|jpeg][&download=1]
// Full-resolution image of a design, rendered by the same engine as the editor.
// The output depends only on the URL, so Vercel's CDN caches every render.
import { CACHE_IMMUTABLE, designFromQuery, fail } from './_lib/http.js';
import { renderDesignImage } from './_lib/renderer.js';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  let design;
  try {
    design = await designFromQuery(params);
  } catch {
    return fail(400, 'Invalid or missing design');
  }

  const type = params.get('type') === 'jpeg' ? 'jpeg' : 'png';
  const ext = type === 'jpeg' ? 'jpg' : 'png';
  const image = await renderDesignImage(design, type);
  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': `image/${type}`,
      'Cache-Control': CACHE_IMMUTABLE,
      'Content-Disposition': `${params.get('download') ? 'attachment' : 'inline'}; filename="vize-${design.formatId}.${ext}"`,
    },
  });
}
