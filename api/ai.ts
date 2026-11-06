// POST /api/ai { action, title, content } → AI writing assist (needs ANTHROPIC_API_KEY)
import Anthropic from '@anthropic-ai/sdk';
import { LIMITS } from '../src/lib/design.js';
import { AiDeclinedError, aiEnabled, isAiAction, runAi } from './_lib/ai.js';
import { clientIp, fail, json } from './_lib/http.js';
import { rateLimit } from './_lib/rateLimit.js';

export async function POST(req: Request) {
  if (!aiEnabled()) return fail(501, 'AI assist is not configured');

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  const title = typeof body?.title === 'string' ? body.title.slice(0, LIMITS.title) : '';
  const content = typeof body?.content === 'string' ? body.content.slice(0, LIMITS.content) : '';
  if (!isAiAction(action)) return fail(400, 'Unknown action');
  if (!content.trim()) return fail(400, 'Write some text first');

  const limit = await rateLimit('ai', clientIp(req), 20, 600);
  if (!limit.ok) {
    return fail(429, 'AI limit reached — try again in a few minutes', { 'Retry-After': String(limit.retryAfter) });
  }

  try {
    return json(await runAi(action, title, content));
  } catch (err) {
    if (err instanceof AiDeclinedError) return fail(422, err.message);
    if (err instanceof Anthropic.RateLimitError) return fail(429, 'The AI is busy — try again shortly');
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error', err.status, err.message);
      return fail(502, 'The AI service is unavailable right now');
    }
    console.error('AI assist failed', err);
    return fail(500, 'AI assist failed');
  }
}
