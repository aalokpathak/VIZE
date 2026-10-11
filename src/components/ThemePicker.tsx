import { useState } from 'react';
import { THEME_CATEGORIES, THEMES, themeCss, type ThemeCategory } from '../lib/themes';
import { rgbToHex } from '../lib/colors';
import { useDesign } from '../store';

export function ThemePicker() {
  const themeId = useDesign((s) => s.themeId);
  const useCustomBg = useDesign((s) => s.useCustomBg);
  const set = useDesign((s) => s.set);
  const [cat, setCat] = useState<ThemeCategory | 'all'>('all');
  const list = THEMES.filter((t) => cat === 'all' || t.category === cat);

  return (
    <>
      <div className="chips">
        {[{ id: 'all' as const, label: `All ${THEMES.length}` }, ...THEME_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip${cat === c.id ? ' active' : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="theme-grid">
        {list.map((t) => {
          const active = !useCustomBg && t.id === themeId;
          return (
            <button
              key={t.id}
              type="button"
              className={`theme-card${active ? ' active' : ''}`}
              style={{ background: themeCss(t) }}
              title={t.name}
              aria-pressed={active}
              onClick={() => set({ themeId: t.id, useCustomBg: false })}
            >
              <span className="theme-aa" style={{ color: rgbToHex(t.title) }}>Aa</span>
              <span className="theme-name">{t.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
