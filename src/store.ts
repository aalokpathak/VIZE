import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULTS, pickDesign, type Design } from './lib/design';
import { unreadableOverrides } from './lib/render';
import { getTheme } from './lib/themes';

export * from './lib/design';

interface DesignStore extends Design {
  set: (patch: Partial<Design>) => void;
  /** Restore every setting and text field to its default. Returns the previous design for undo. */
  reset: () => Design;
  restore: (design: Design) => void;
}

const BACKGROUND_KEYS: (keyof Design)[] = ['themeId', 'useCustomBg', 'customFrom', 'customTo', 'customSolid', 'effect'];

export const useDesign = create<DesignStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      set: (patch) => {
        // A new background may make manual font colours unreadable — fall back to Auto for those
        if (BACKGROUND_KEYS.some((k) => k in patch)) {
          const next = { ...pickDesign(get()), ...patch };
          patch = { ...patch, ...unreadableOverrides(next, getTheme(next.themeId)) };
        }
        set(patch);
      },
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
