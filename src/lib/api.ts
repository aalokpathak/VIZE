// Client for VIZE's serverless API. Every feature degrades gracefully: if the API
// isn't reachable (e.g. a static host or `vite preview`), the UI simply hides it.
import { create } from 'zustand';

interface ServerState {
  /** The API answered — server rendering & link previews are available */
  online: boolean;
  /** AI assist is configured (ANTHROPIC_API_KEY set) */
  ai: boolean;
  /** Short links are configured (Redis connected) */
  shortLinks: boolean;
}

export const useServer = create<ServerState>()(() => ({ online: false, ai: false, shortLinks: false }));

export async function loadServerConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return;
    const cfg = (await res.json()) as Partial<ServerState>;
    useServer.setState({ online: true, ai: !!cfg.ai, shortLinks: !!cfg.shortLinks });
  } catch {
    // offline / no API — keep everything server-backed hidden
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export const createShortLink = (payload: string) => post<{ id: string; url: string }>('/api/links', { payload });

export type AiAction = 'polish' | 'shorten' | 'emphasize' | 'titles' | 'caption';
export interface AiResult {
  text?: string;
  titles?: string[];
  caption?: string;
  hashtags?: string[];
}

export const runAiAssist = (action: AiAction, title: string, content: string) =>
  post<AiResult>('/api/ai', { action, title, content });
