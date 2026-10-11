import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface DesignStore extends Design {
  set: (patch: Partial<Design>) => void;
  /** Restore every setting and text field to its default. Returns the previous design for undo. */
  reset: () => Design;
  restore: (design: Design) => void;
}

const pickDesign = (s: DesignStore): Design => {
  const out = {} as Record<string, unknown>;
  for (const k of Object.keys(DEFAULTS)) out[k] = s[k as keyof Design];
  return out as unknown as Design;
};

export const useDesign = create<DesignStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => {
        const prev = pickDesign(get());
        set({ ...DEFAULTS });
        return prev;
      },
      restore: (design) => set({ ...design }),
    }),
    {
      name: 'vize-design-v2',
      version: 1,
      partialize: (s) => pickDesign(s),
      // Fill in any settings added in newer versions
      merge: (persisted, current) => ({ ...current, ...DEFAULTS, ...(persisted as Partial<Design>) }),
    },
  ),
);

/** Layout results reported back by the renderer (not persisted) */
interface RenderStats {
  bodySize: number;
  fill: number;
  setStats: (s: { bodySize: number; fill: number }) => void;
}

export const useStats = create<RenderStats>()((set) => ({
  bodySize: DEFAULTS.fontSize,
  fill: 0,
  setStats: (s) => set(s),
}));
