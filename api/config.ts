// GET /api/config — which optional server features are switched on
import { aiEnabled } from './_lib/ai.js';
import { json } from './_lib/http.js';
import { kvEnabled } from './_lib/kv.js';

export function GET() {
  return json(
    { ai: aiEnabled(), shortLinks: kvEnabled() },
    200,
    { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
  );
}
