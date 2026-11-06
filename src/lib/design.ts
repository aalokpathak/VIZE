// The design model, shared by the browser app and the serverless API.
// Keep this file free of DOM / React imports — it runs on the server too.
import { FONTS } from './fontList.js';
import { FORMATS } from './formats.js';
import { THEMES } from './themes.js';

export type Mode = 'auto' | 'fill' | 'manual';
export type Align = 'left' | 'center' | 'right' | 'justify';
export type VAlign = 'top' | 'center' | 'bottom';
export type Divider = 'none' | 'line' | 'dots' | 'double' | 'diamond';
export type TextEffect = 'none' | 'highlight' | 'shadow' | 'outline' | 'glow';
export type Pattern = 'none' | 'grain' | 'dots' | 'grid' | 'diagonal' | 'lines';
export type ExportType = 'png' | 'jpeg';

export interface Design {
  // Content
  title: string;
  content: string;
  signature: string;

  // Canvas & background
  formatId: string;
  themeId: string;
  useCustomBg: boolean;
  customFrom: string;
  customTo: string;
  customAngle: number;
  customSolid: boolean;

  // Typography
  fontId: string;
  titleUppercase: boolean;
  /** null = use the theme's colour */
  textColor: string | null;
  titleColor: string | null;
  emphasisColor: string | null;

  // Layout
  mode: Mode;
  fontSize: number;
  titleScale: number;
  margin: number;
  padding: number;
  zoom: number;
  lineHeight: number;
  paraGap: number;
  letterSpacing: number;
  align: Align;
  vAlign: VAlign;

  // Effects
  divider: Divider;
  effect: TextEffect;
  highlightColor: string;
  pattern: Pattern;
  patternOpacity: number;
  vignette: boolean;
  corners: boolean;
  frame: boolean;

  // Export
  exportType: ExportType;
}

export const DEFAULTS: Design = {
  title: '',
  content: '',
  signature: '',

  formatId: 'story',
  themeId: 'pure-white',
  useCustomBg: false,
  customFrom: '#7c5cff',
  customTo: '#ff3d8b',
  customAngle: 160,
  customSolid: false,

  fontId: 'inter',
  titleUppercase: true,
  textColor: null,
  titleColor: null,
  emphasisColor: null,

  mode: 'auto',
  fontSize: 48,
  titleScale: 120,
  margin: 80,
  padding: 140,
  zoom: 100,
  lineHeight: 150,
  paraGap: 100,
  letterSpacing: 0,
  align: 'center',
  vAlign: 'center',

  divider: 'line',
  effect: 'none',
  highlightColor: '#111111',
  pattern: 'none',
  patternOpacity: 30,
  vignette: false,
  corners: false,
  frame: false,

  exportType: 'png',
};

export const DESIGN_KEYS = Object.keys(DEFAULTS) as (keyof Design)[];

/** Copy just the design fields out of any object that carries them (e.g. the store) */
export function pickDesign(src: Design): Design {
  const out = {} as Record<string, unknown>;
  for (const k of DESIGN_KEYS) out[k] = src[k];
  return out as unknown as Design;
}

// ---------- Validation (for designs arriving from URLs / requests) ----------

export const LIMITS = { title: 300, content: 5000, signature: 80 } as const;

const RANGES: Partial<Record<keyof Design, [number, number]>> = {
  fontSize: [12, 240],
  titleScale: [80, 220],
  margin: [20, 300],
  padding: [40, 500],
  zoom: [50, 150],
  lineHeight: [90, 240],
  paraGap: [0, 300],
  letterSpacing: [-8, 40],
  customAngle: [0, 360],
  patternOpacity: [5, 100],
};

const ENUMS: Partial<Record<keyof Design, readonly string[]>> = {
  mode: ['auto', 'fill', 'manual'],
  align: ['left', 'center', 'right', 'justify'],
  vAlign: ['top', 'center', 'bottom'],
  divider: ['none', 'line', 'dots', 'double', 'diamond'],
  effect: ['none', 'highlight', 'shadow', 'outline', 'glow'],
  pattern: ['none', 'grain', 'dots', 'grid', 'diagonal', 'lines'],
  exportType: ['png', 'jpeg'],
  themeId: THEMES.map((t) => t.id),
  fontId: FONTS.map((f) => f.id),
  formatId: FORMATS.map((f) => f.id),
};

const HEX = /^#[0-9a-f]{6}$/i;
const NULLABLE_COLORS = new Set<keyof Design>(['textColor', 'titleColor', 'emphasisColor']);
const COLORS = new Set<keyof Design>(['customFrom', 'customTo', 'highlightColor']);

/**
 * Build a safe, complete Design from untrusted input: unknown keys are dropped,
 * wrong types fall back to defaults, numbers are clamped and text is length-limited.
 */
export function sanitizeDesign(input: unknown): Design {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: Design = { ...DEFAULTS };
  const o = out as unknown as Record<string, unknown>;

  for (const key of DESIGN_KEYS) {
    if (!(key in src)) continue;
    const v = src[key];
    const range = RANGES[key];
    const allowed = ENUMS[key];

    if (range) {
      if (typeof v === 'number' && Number.isFinite(v)) o[key] = Math.min(range[1], Math.max(range[0], Math.round(v)));
    } else if (allowed) {
      if (typeof v === 'string' && allowed.includes(v)) o[key] = v;
    } else if (NULLABLE_COLORS.has(key)) {
      if (v === null || (typeof v === 'string' && HEX.test(v))) o[key] = v === null ? null : v.toLowerCase();
    } else if (COLORS.has(key)) {
      if (typeof v === 'string' && HEX.test(v)) o[key] = v.toLowerCase();
    } else if (key in LIMITS) {
      if (typeof v === 'string') o[key] = v.slice(0, LIMITS[key as keyof typeof LIMITS]);
    } else if (typeof DEFAULTS[key] === 'boolean') {
      if (typeof v === 'boolean') o[key] = v;
    }
  }
  return out;
}

/** Only the fields that differ from the defaults — keeps share links short */
export function designDiff(d: Design): Partial<Design> {
  const out: Record<string, unknown> = {};
  for (const k of DESIGN_KEYS) if (d[k] !== DEFAULTS[k]) out[k] = d[k];
  return out as Partial<Design>;
}
