import { useEffect, useState } from 'react';
import { EXTRA_COLORS, PRIMARY_COLORS, type Swatch } from '../lib/colors';

interface Props {
  value: string | null;
  onChange: (hex: string | null) => void;
  /** Show an "Auto" chip that resets to the theme colour */
  allowAuto?: boolean;
  /** Colour that "Auto" currently resolves to, for its preview dot */
  autoColor?: string;
}

const HEX = /^#[0-9a-f]{6}$/i;

function Chip({ swatch, active, onClick }: { swatch: Swatch; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`color-chip${active ? ' active' : ''}`}
      style={{ background: swatch.hex }}
      title={swatch.name}
      aria-label={swatch.name}
      aria-pressed={active}
      onClick={onClick}
    />
  );
}

/** Colour picker with the primary colours up front, extra presets, and a custom colour/hex input */
export function ColorPicker({ value, onChange, allowAuto = true, autoColor }: Props) {
  const current = value?.toLowerCase() ?? null;
  const [hex, setHex] = useState(value ?? '');
  useEffect(() => setHex(value ?? ''), [value]);

  const isPreset = [...PRIMARY_COLORS, ...EXTRA_COLORS].some((s) => s.hex === current);

  return (
    <div className="color-picker">
      <div className="color-row">
        <span className="color-row-label">Primary</span>
        <div className="color-chips">
          {allowAuto && (
            <button
              type="button"
              className={`color-chip auto${current === null ? ' active' : ''}`}
              style={autoColor ? { background: autoColor } : undefined}
              title="Auto — use the theme's colour"
              aria-pressed={current === null}
              onClick={() => onChange(null)}
            >
              A
            </button>
          )}
          {PRIMARY_COLORS.map((s) => (
            <Chip key={s.hex} swatch={s} active={current === s.hex} onClick={() => onChange(s.hex)} />
          ))}
        </div>
      </div>
      <div className="color-row">
        <span className="color-row-label">More</span>
        <div className="color-chips">
          {EXTRA_COLORS.map((s) => (
            <Chip key={s.hex} swatch={s} active={current === s.hex} onClick={() => onChange(s.hex)} />
          ))}
        </div>
      </div>
      <div className="color-custom">
        <label className={`color-well${current && !isPreset ? ' active' : ''}`} title="Pick any colour">
          <input
            type="color"
            value={value ?? autoColor ?? '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
          />
          <span style={{ background: value ?? autoColor ?? '#ffffff' }} />
        </label>
        <input
          className="hex-input"
          value={hex}
          placeholder={allowAuto ? 'Auto' : '#rrggbb'}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            setHex(e.target.value);
            if (HEX.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setHex(value ?? '')}
        />
      </div>
    </div>
  );
}
