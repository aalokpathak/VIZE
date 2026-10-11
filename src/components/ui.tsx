import type { CSSProperties, ReactNode } from 'react';

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      <header className="section-head">
        <h3>{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step = 1, unit = '', hint, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider">
      <span className="slider-head">
        <span>{label}</span>
        <span className="slider-value">
          {hint && <em>{hint}</em>}
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${Math.min(100, Math.max(0, pct))}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  label?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="field">
      {label && <span className="field-label">{label}</span>}
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            title={o.title}
            className={value === o.value ? 'active' : ''}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; hint?: string; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  );
}

export function Field({ label, children, aside }: { label: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="field">
      <span className="field-label">
        {label}
        {aside}
      </span>
      {children}
    </div>
  );
}
