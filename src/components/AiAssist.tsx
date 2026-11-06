import { useState } from 'react';
import { toast } from '../lib/actions';
import { runAiAssist, useServer, type AiAction } from '../lib/api';
import { useDesign } from '../store';
import { IconCopy, IconWand } from './icons';
import { Section } from './ui';

const ACTIONS: { id: AiAction; label: string; hint: string }[] = [
  { id: 'polish', label: 'Polish', hint: 'Fix grammar, spelling & flow' },
  { id: 'shorten', label: 'Shorten', hint: 'Cut it ~40% to fit one image' },
  { id: 'emphasize', label: 'Auto-highlight', hint: 'Mark the key phrases with **' },
  { id: 'titles', label: 'Title ideas', hint: 'Suggest headlines' },
  { id: 'caption', label: 'Post caption', hint: 'Caption + hashtags to post with it' },
];

const DONE: Partial<Record<AiAction, string>> = {
  polish: 'Text polished',
  shorten: 'Text shortened',
  emphasize: 'Key phrases highlighted',
};

/** AI writing assist — rendered only when the server has AI configured */
export function AiAssist() {
  const enabled = useServer((s) => s.ai);
  const set = useDesign((s) => s.set);
  const [busy, setBusy] = useState<AiAction | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [caption, setCaption] = useState<{ caption: string; hashtags: string[] } | null>(null);

  if (!enabled) return null;

  const run = async (action: AiAction) => {
    const { title, content } = useDesign.getState();
    if (!content.trim()) return toast('Write some text first', { kind: 'error' });
    setBusy(action);
    try {
      const res = await runAiAssist(action, title, content);
      if (res.text !== undefined) {
        const before = content;
        set({ content: res.text });
        toast(DONE[action] ?? 'Done', { action: { label: 'Undo', run: () => set({ content: before }) } });
      } else if (res.titles) {
        setTitles(res.titles);
      } else if (res.caption !== undefined) {
        setCaption({ caption: res.caption, hashtags: res.hashtags ?? [] });
      }
    } catch (err) {
      toast((err as Error).message || 'AI assist failed', { kind: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const captionText = caption ? `${caption.caption}\n\n${caption.hashtags.map((h) => `#${h}`).join(' ')}` : '';

  return (
    <Section title="AI assist">
      <div className="ai-grid">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`ai-btn${busy === a.id ? ' busy' : ''}`}
            disabled={busy !== null}
            title={a.hint}
            onClick={() => run(a.id)}
          >
            {busy === a.id ? <span className="spinner" aria-hidden /> : <IconWand width={15} height={15} />}
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {titles.length > 0 && (
        <div className="ai-result">
          <div className="ai-result-head">
            <span>Pick a title</span>
            <button type="button" className="link" onClick={() => setTitles([])}>Dismiss</button>
          </div>
          <div className="chips">
            {titles.map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                onClick={() => {
                  set({ title: t });
                  setTitles([]);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {caption && (
        <div className="ai-result">
          <div className="ai-result-head">
            <span>Caption for your post</span>
            <button type="button" className="link" onClick={() => setCaption(null)}>Dismiss</button>
          </div>
          <p className="ai-caption">{caption.caption}</p>
          <p className="ai-tags">{caption.hashtags.map((h) => `#${h}`).join(' ')}</p>
          <button
            type="button"
            className="btn ghost small"
            onClick={() =>
              navigator.clipboard.writeText(captionText).then(
                () => toast('Caption copied'),
                () => toast('Copy is blocked by this browser', { kind: 'error' }),
              )
            }
          >
            <IconCopy width={15} height={15} />
            <span>Copy caption</span>
          </button>
        </div>
      )}
      <p className="hint">AI suggestions can be wrong — give them a read before posting.</p>
    </Section>
  );
}
