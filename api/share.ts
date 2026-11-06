// GET /s/<payload or short id>  (rewritten to /api/share?id=…)
// Serves link-preview tags for social apps, then sends people on to the editor
// with the design in the URL hash (the hash never reaches a server).
import { plainText } from '../src/lib/layout.js';
import { decodeDesign, SHORT_ID } from '../src/lib/share.js';
import { escapeHtml, origin, payloadForShortId } from './_lib/http.js';

/** Bump when the renderer changes so cached previews refresh */
const RENDER_VERSION = 1;

const redirectHome = () => new Response(null, { status: 302, headers: { Location: '/' } });

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  const isShort = SHORT_ID.test(id);
  const payload = isShort ? await payloadForShortId(id).catch(() => null) : id;
  if (!payload) return redirectHome();

  let design;
  try {
    design = await decodeDesign(payload);
  } catch {
    return redirectHome();
  }

  const base = origin(req);
  const body = plainText(design.content).replace(/\s+/g, ' ').trim();
  const heading = plainText(design.title).trim();
  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  const title = clip(heading || body || 'A design made with VIZE', 70);
  const description = clip(heading && body ? body : 'Made with VIZE · thought → image', 160);
  const image = `${base}/api/og?${isShort ? `id=${id}` : `d=${payload}`}&v=${RENDER_VERSION}`;
  const target = `/#d=${payload}`;
  const e = escapeHtml;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e(title)} · VIZE</title>
<meta name="description" content="${e(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="VIZE">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${e(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${e(`${base}/s/${id}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(title)}">
<meta name="twitter:description" content="${e(description)}">
<meta name="twitter:image" content="${e(image)}">
<meta http-equiv="refresh" content="0; url=${e(target)}">
<link rel="icon" href="/favicon.svg">
</head>
<body style="background:#0b0b10;color:#f4f4f7;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0">
<p>Opening design in VIZE… <a style="color:#a48bff" href="${e(target)}">Continue</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
