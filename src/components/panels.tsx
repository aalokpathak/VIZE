import { useMemo, useState } from 'react';
import { FORMATS } from '../lib/formats';
import { textStats } from '../lib/layout';
import { resolvePalette, resolveTheme } from '../lib/render';
import { getTheme, themeCss } from '../lib/themes';
import { useDesign, useStats, type Design, type Divider, type Pattern, type TextEffect } from '../store';
import { AiAssist } from './AiAssist';
import { ColorPicker } from './ColorPicker';
import { FontPicker } from './FontPicker';
import { IconAlign, IconVAlign } from './icons';
import { ThemePicker } from './ThemePicker';
import { Field, Section, Segmented, Slider, Toggle } from './ui';

const useSet = () => useDesign((s) => s.set);

/** Palette the theme would use with no colour overrides — what "Auto" means right now */
function useAutoPalette() {
  const d = useDesign();
  return useMemo(() => {
    const plain: Design = { ...d, textColor: null, titleColor: null, emphasisColor: null };
    return resolvePalette(plain, resolveTheme(plain, getTheme(d.themeId)));
  }, [d]);
}

// ---------------------------------------------------------------- Text

type ColorTarget = 'textColor' | 'titleColor' | 'emphasisColor';

export function TextPanel() {
  const d = useDesign();
  const { title, content, signature, titleUppercase } = d;
  const set = useSet();
  const auto = useAutoPalette();
  const colors = { textColor: d.textColor, titleColor: d.titleColor, emphasisColor: d.emphasisColor };
  const [target, setTarget] = useState<ColorTarget>('textColor');
  const autoFor = { textColor: auto.text, titleColor: auto.title, emphasisColor: auto.emphasis }[target];
  // Counts what ends up in the image: title + text, without the *emphasis* markers
  const stats = useMemo(() => textStats([title, content].filter((t) => t.trim()).join('\n\n')), [title, content]);

  return (
    <>
      <Section title="Content">
        <input
          className="input"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => set({ title: e.target.value })}
        />
        <textarea
          className="input"
          rows={8}
          placeholder={'Write your thoughts or paste a quote…\n\nWrap words in *asterisks* to highlight them.'}
          value={content}
          onChange={(e) => set({ content: e.target.value })}
        />
        <dl className={`text-stats${stats.chars > 1500 ? ' warn' : ''}`} aria-live="polite">
          <div><dt>Words</dt><dd>{stats.words.toLocaleString()}</dd></div>
          <div><dt>Characters</dt><dd>{stats.chars.toLocaleString()}</dd></div>
          <div><dt>No spaces</dt><dd>{stats.charsNoSpaces.toLocaleString()}</dd></div>
          <div><dt>Paragraphs</dt><dd>{stats.paragraphs}</dd></div>
        </dl>
        <p className="hint">
          Blank line = new paragraph · <code>*word*</code> = emphasis colour
        </p>
        <input
          className="input"
          placeholder="Signature / handle, e.g. @yourname"
          value={signature}
          onChange={(e) => set({ signature: e.target.value })}
        />
      </Section>

      <AiAssist />

      <Section title="Font">
        <FontPicker />
        <Toggle label="Uppercase title" checked={titleUppercase} onChange={(v) => set({ titleUppercase: v })} />
      </Section>

      <Section
        title="Font colour"
        action={
          colors[target] !== null && (
            <button type="button" className="link" onClick={() => set({ [target]: null })}>
              Use theme colour
            </button>
          )
        }
      >
        <Segmented<ColorTarget>
          value={target}
          onChange={setTarget}
          options={[
            { value: 'textColor', label: 'Body' },
            { value: 'titleColor', label: 'Title' },
            { value: 'emphasisColor', label: '*Emphasis*' },
          ]}
        />
        <ColorPicker value={colors[target]} autoColor={autoFor} onChange={(v) => set({ [target]: v })} />
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Style

export function StylePanel() {
  const d = useDesign();
  const set = useSet();

  return (
    <>
      <Section title="Canvas size">
        <div className="format-grid">
          {FORMATS.map((f) => {
            const k = 34 / Math.max(f.w, f.h);
            return (
              <button
                key={f.id}
                type="button"
                className={`format-card${d.formatId === f.id ? ' active' : ''}`}
                onClick={() => set({ formatId: f.id })}
                title={`${f.w} × ${f.h}`}
              >
                <span className="format-shape" style={{ width: f.w * k, height: f.h * k }} />
                <strong>{f.ratio}</strong>
                <small>{f.name}</small>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Theme">
        <ThemePicker />
      </Section>

      <Section title="Custom background">
        <Toggle label="Use my own colours" checked={d.useCustomBg} onChange={(v) => set({ useCustomBg: v })} />
        {d.useCustomBg && (
          <>
            <div
              className="custom-preview"
              style={{ background: themeCss(resolveTheme(d, getTheme(d.themeId))) }}
            />
            <div className="custom-row">
              <label className="color-well big">
                <input type="color" value={d.customFrom} onChange={(e) => set({ customFrom: e.target.value })} />
                <span style={{ background: d.customFrom }} />
              </label>
              {!d.customSolid && (
                <label className="color-well big">
                  <input type="color" value={d.customTo} onChange={(e) => set({ customTo: e.target.value })} />
                  <span style={{ background: d.customTo }} />
                </label>
              )}
              <Segmented
                value={d.customSolid ? 'solid' : 'gradient'}
                onChange={(v) => set({ customSolid: v === 'solid' })}
                options={[
                  { value: 'gradient', label: 'Gradient' },
                  { value: 'solid', label: 'Solid' },
                ]}
              />
            </div>
            {!d.customSolid && (
              <Slider label="Angle" value={d.customAngle} min={0} max={360} step={5} unit="°" onChange={(v) => set({ customAngle: v })} />
            )}
          </>
        )}
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Layout

export function LayoutPanel() {
  const d = useDesign();
  const set = useSet();
  const computedSize = useStats((s) => s.bodySize);
  const manual = (patch: Partial<Design>) => set({ ...patch, mode: 'manual' });

  return (
    <>
      <Section title="Sizing">
        <Segmented
          value={d.mode}
          onChange={(mode) => set(mode === 'manual' ? { mode, fontSize: computedSize } : { mode })}
          options={[
            { value: 'auto', label: 'Auto fit', title: 'Size picked from text length' },
            { value: 'fill', label: 'Fill space', title: 'As large as fits' },
            { value: 'manual', label: 'Manual', title: 'You choose the size' },
          ]}
        />
        <Slider
          label="Font size"
          value={d.mode === 'manual' ? d.fontSize : computedSize}
          hint={d.mode !== 'manual' ? d.mode : undefined}
          min={12}
          max={240}
          unit="px"
          onChange={(v) => manual({ fontSize: v })}
        />
        <Slider label="Title size" value={d.titleScale} min={80} max={220} step={5} unit="%" onChange={(v) => set({ titleScale: v })} />
      </Section>

      <Section title="Alignment">
        <Segmented
          label="Horizontal"
          value={d.align}
          onChange={(align) => set({ align })}
          options={(['left', 'center', 'right', 'justify'] as const).map((a) => ({
            value: a, label: <IconAlign kind={a} />, title: a,
          }))}
        />
        <Segmented
          label="Vertical"
          value={d.vAlign}
          onChange={(vAlign) => set({ vAlign })}
          options={(['top', 'center', 'bottom'] as const).map((a) => ({
            value: a, label: <IconVAlign kind={a} />, title: a,
          }))}
        />
      </Section>

      <Section
        title="Spacing"
        action={
          <button
            type="button"
            className="link"
            onClick={() => set({ lineHeight: 150, paraGap: 100, letterSpacing: 0, margin: 80, padding: 140, zoom: 100 })}
          >
            Reset spacing
          </button>
        }
      >
        <Slider label="Line height" value={d.lineHeight} min={90} max={240} step={2} unit="%" onChange={(v) => set({ lineHeight: v })} />
        <Slider label="Paragraph gap" value={d.paraGap} min={0} max={300} step={5} unit="%" onChange={(v) => set({ paraGap: v })} />
        <Slider label="Letter spacing" value={d.letterSpacing} min={-8} max={40} unit="%" onChange={(v) => set({ letterSpacing: v })} />
        <Slider label="Side margins" value={d.margin} min={20} max={300} step={2} unit="px" onChange={(v) => set({ margin: v })} />
        <Slider label="Vertical padding" value={d.padding} min={40} max={500} step={5} unit="px" onChange={(v) => set({ padding: v })} />
        <Slider label="Content zoom" value={d.zoom} min={50} max={150} unit="%" onChange={(v) => set({ zoom: v })} />
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Effects

const EFFECTS: { value: TextEffect; label: string }[] = [
  { value: 'none', label: 'Plain' },
  { value: 'highlight', label: 'Caption boxes' },
  { value: 'shadow', label: 'Shadow' },
  { value: 'outline', label: 'Outline' },
  { value: 'glow', label: 'Glow' },
];

const PATTERNS: { value: Pattern; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'grain', label: 'Film grain' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'lines', label: 'Ruled' },
];

export function EffectsPanel() {
  const d = useDesign();
  const set = useSet();

  return (
    <>
      <Section title="Text effect">
        <div className="option-grid">
          {EFFECTS.map((e) => (
            <button
              key={e.value}
              type="button"
              className={`option-card effect-${e.value}${d.effect === e.value ? ' active' : ''}`}
              onClick={() => set({ effect: e.value })}
            >
              <span className="option-demo">Aa</span>
              {e.label}
            </button>
          ))}
        </div>
        {d.effect === 'highlight' && (
          <Field label="Box colour">
            <ColorPicker value={d.highlightColor} allowAuto={false} onChange={(v) => v && set({ highlightColor: v })} />
          </Field>
        )}
      </Section>

      <Section title="Title divider">
        <Segmented<Divider>
          value={d.divider}
          onChange={(divider) => set({ divider })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'line', label: '—' },
            { value: 'double', label: '=' },
            { value: 'dots', label: '•••' },
            { value: 'diamond', label: '—◆—' },
          ]}
        />
        {!d.title.trim() && <p className="hint">Shown under the title — add one in the Text tab.</p>}
      </Section>

      <Section title="Texture">
        <div className="option-grid">
          {PATTERNS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`option-card pattern-${p.value}${d.pattern === p.value ? ' active' : ''}`}
              onClick={() => set({ pattern: p.value })}
            >
              <span className="option-demo" />
              {p.label}
            </button>
          ))}
        </div>
        {d.pattern !== 'none' && (
          <Slider label="Intensity" value={d.patternOpacity} min={5} max={100} unit="%" onChange={(v) => set({ patternOpacity: v })} />
        )}
      </Section>

      <Section title="Decorations">
        <Toggle label="Vignette" hint="Darkened edges" checked={d.vignette} onChange={(v) => set({ vignette: v })} />
        <Toggle label="Corner accents" checked={d.corners} onChange={(v) => set({ corners: v })} />
        <Toggle label="Border frame" checked={d.frame} onChange={(v) => set({ frame: v })} />
      </Section>
    </>
  );
}
