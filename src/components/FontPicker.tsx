import { useMemo, useState } from 'react';
import { FONT_CATEGORIES, FONTS, getFont, type FontCategory } from '../lib/fonts';
import { useDesign } from '../store';
import { IconChevron } from './icons';

/** Font dropdown. Font names are previewed in their own typeface only once the list is opened,
 *  so the 30 font files aren't downloaded until someone actually browses them. */
export function FontPicker() {
  const fontId = useDesign((s) => s.fontId);
  const set = useDesign((s) => s.set);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<FontCategory | 'all'>('all');
  const font = getFont(fontId);

  const list = useMemo(() => FONTS.filter((f) => cat === 'all' || f.category === cat), [cat]);

  const pick = (id: string) => {
    const next = getFont(id);
    const { lineHeight } = useDesign.getState();
    // Snap to the new font's ideal line height, unless the user tuned it by hand
    const presets = new Set(FONTS.map((f) => f.lineHeight));
    set({ fontId: id, ...(presets.has(lineHeight) ? { lineHeight: next.lineHeight } : {}) });
    setOpen(false);
  };

  return (
    <div className={`font-picker${open ? ' open' : ''}`}>
      <button type="button" className="font-current" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span style={{ fontFamily: font.family, fontWeight: font.title }}>{font.name}</span>
        <small>{FONT_CATEGORIES.find((c) => c.id === font.category)?.label}</small>
        <IconChevron className="chev" />
      </button>
      {open && (
        <div className="font-panel">
          <div className="chips">
            {[{ id: 'all' as const, label: 'All' }, ...FONT_CATEGORIES].map((c) => (
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
          <div className="font-list" role="listbox" aria-label="Fonts">
            {list.map((f) => (
              <button
                key={f.id}
                type="button"
                role="option"
                aria-selected={f.id === fontId}
                className={`font-option${f.id === fontId ? ' active' : ''}`}
                onClick={() => pick(f.id)}
              >
                <span style={{ fontFamily: f.family, fontWeight: f.body }}>{f.name}</span>
                {f.note && <small>{f.note}</small>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
