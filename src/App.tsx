import { useEffect, useState } from 'react';
import { CanvasStage } from './components/CanvasStage';
import { Header } from './components/Header';
import { IconLayout, IconPalette, IconSparkle, IconText } from './components/icons';
import { EffectsPanel, LayoutPanel, StylePanel, TextPanel } from './components/panels';
import { Toast } from './components/Toast';
import { copyImage, downloadImage, useSession } from './lib/actions';

const TABS = [
  { id: 'text', label: 'Text', icon: IconText, Panel: TextPanel },
  { id: 'style', label: 'Style', icon: IconPalette, Panel: StylePanel },
  { id: 'layout', label: 'Layout', icon: IconLayout, Panel: LayoutPanel },
  { id: 'effects', label: 'Effects', icon: IconSparkle, Panel: EffectsPanel },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Workspace() {
  const [tab, setTab] = useState<TabId>('text');
  const { Panel } = TABS.find((t) => t.id === tab)!;

  return (
    <main className="workspace">
      <aside className="sidebar">
        <nav className="tabs" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="panel" role="tabpanel">
          <Panel />
        </div>
      </aside>
      <CanvasStage />
    </main>
  );
}

export default function App() {
  // Changing the key remounts the workspace, clearing all local UI state like a page reload
  const epoch = useSession((s) => s.epoch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        downloadImage();
      } else if (key === 'c' && e.shiftKey) {
        e.preventDefault();
        copyImage();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <Header />
      <Workspace key={epoch} />
      <Toast />
    </div>
  );
}
