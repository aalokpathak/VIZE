import type { RGB } from './colors';

export interface Glow {
  /** Centre, relative to canvas width / height (0–1) */
  x: number;
  y: number;
  /** Radius, relative to the canvas' longer side */
  r: number;
  c: RGB;
  a: number;
}

export interface Gradient {
  /** CSS linear-gradient degrees (0 = bottom→top, 90 = left→right) */
  angle: number;
  stops: [number, RGB][];
  glows?: Glow[];
}

export type ThemeCategory = 'solid' | 'gradient' | 'mesh';

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  /** Fallback / base colour */
  bg: RGB;
  title: RGB;
  text: RGB;
  /** Dividers, corner accents, frame and *emphasis* text */
  accent: RGB;
  grad?: Gradient;
}

const solid = (name: string, bg: RGB, title: RGB, text: RGB, accent: RGB): Theme => ({
  id: slug(name), name, category: 'solid', bg, title, text, accent,
});

const gradient = (
  name: string, category: ThemeCategory, bg: RGB, title: RGB, text: RGB, accent: RGB, grad: Gradient,
): Theme => ({ id: slug(name), name, category, bg, title, text, accent, grad });

function slug(s: string) {
  return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const THEMES: Theme[] = [
  // ---------- Solid ----------
  solid('Pure White', [255, 255, 255], [10, 10, 10], [28, 28, 28], [185, 185, 185]),
  solid('Midnight Black', [10, 10, 10], [255, 255, 255], [218, 218, 218], [90, 90, 90]),
  solid('Warm Cream', [252, 246, 234], [36, 20, 6], [64, 44, 28], [198, 150, 95]),
  solid('Ink & Paper', [237, 235, 225], [10, 10, 10], [32, 32, 32], [168, 158, 138]),
  solid('Charcoal Smoke', [34, 34, 38], [242, 242, 246], [202, 202, 208], [110, 110, 125]),
  solid('Slate Blue', [18, 26, 46], [226, 236, 255], [188, 200, 228], [90, 120, 190]),
  solid('Royal Navy', [8, 14, 38], [180, 210, 255], [148, 178, 220], [70, 110, 210]),
  solid('Ice Blue', [230, 242, 255], [8, 40, 90], [20, 60, 120], [90, 140, 210]),
  solid('Cerulean', [0, 119, 190], [255, 255, 255], [220, 240, 255], [140, 210, 255]),
  solid('Deep Forest', [14, 34, 24], [210, 255, 220], [170, 220, 185], [80, 160, 110]),
  solid('Sage & Linen', [236, 240, 228], [38, 50, 28], [58, 70, 44], [120, 145, 95]),
  solid('Emerald Dark', [4, 44, 28], [160, 255, 190], [130, 220, 160], [40, 160, 95]),
  solid('Dusty Rose', [243, 229, 229], [56, 16, 30], [74, 36, 46], [190, 120, 135]),
  solid('Crimson Night', [28, 6, 10], [255, 190, 200], [230, 160, 170], [200, 50, 75]),
  solid('Blush Editorial', [255, 238, 238], [90, 20, 30], [110, 40, 50], [220, 120, 130]),
  solid('Amber Glow', [255, 230, 170], [60, 30, 0], [80, 44, 8], [200, 120, 20]),
  solid('Burnt Sienna', [46, 20, 8], [255, 210, 170], [230, 180, 140], [210, 120, 60]),
  solid('Terracotta', [195, 90, 50], [255, 240, 220], [245, 220, 195], [255, 190, 140]),
  solid('Deep Violet', [18, 8, 40], [220, 200, 255], [185, 168, 235], [140, 100, 240]),
  solid('Lavender Haze', [234, 228, 248], [40, 20, 80], [58, 36, 100], [140, 110, 200]),
  solid('Neon Night', [4, 4, 12], [0, 255, 180], [0, 210, 150], [255, 0, 170]),
  solid('Solar Flare', [255, 100, 0], [255, 255, 220], [255, 240, 180], [255, 210, 120]),
  solid('Butter', [255, 244, 196], [40, 34, 10], [60, 52, 20], [220, 170, 30]),
  solid('Matcha', [196, 214, 160], [28, 40, 16], [42, 56, 26], [90, 120, 50]),
  solid('Brick Red', [160, 32, 32], [255, 236, 220], [255, 214, 200], [255, 170, 140]),
  solid('Electric Blue', [30, 60, 255], [255, 255, 255], [225, 232, 255], [255, 220, 0]),

  // ---------- Gradient ----------
  gradient('Sunset Reel', 'gradient', [255, 70, 70], [255, 255, 255], [255, 255, 255], [255, 235, 160], {
    angle: 160, stops: [[0, [255, 20, 110]], [0.5, [255, 80, 50]], [1, [255, 150, 0]]],
    glows: [{ x: 0.9, y: 0.5, r: 0.55, c: [255, 225, 40], a: 0.75 }],
  }),
  gradient('Orange Blaze', 'gradient', [255, 120, 30], [18, 10, 6], [18, 10, 6], [120, 20, 60], {
    angle: 180,
    stops: [[0, [250, 125, 40]], [0.45, [255, 125, 20]], [0.72, [255, 95, 45]], [0.9, [255, 45, 95]], [1, [255, 20, 115]]],
    glows: [
      { x: 0.0, y: 0.08, r: 0.4, c: [220, 60, 85], a: 0.75 },
      { x: 1.0, y: 0.5, r: 0.3, c: [255, 225, 60], a: 0.95 },
    ],
  }),
  gradient('Aqua Lime', 'gradient', [40, 200, 160], [18, 18, 18], [24, 24, 24], [10, 80, 120], {
    angle: 220, stops: [[0, [60, 170, 255]], [0.4, [20, 215, 200]], [0.75, [30, 215, 90]], [1, [245, 190, 20]]],
  }),
  gradient('Insta Glow', 'gradient', [220, 60, 120], [255, 255, 255], [255, 245, 250], [255, 230, 140], {
    angle: 30,
    stops: [[0, [254, 218, 117]], [0.3, [250, 126, 30]], [0.55, [214, 41, 118]], [0.8, [150, 47, 191]], [1, [79, 91, 213]]],
  }),
  gradient('Purple Haze', 'gradient', [150, 50, 200], [255, 255, 255], [245, 235, 255], [255, 200, 240], {
    angle: 150, stops: [[0, [100, 40, 230]], [0.55, [190, 50, 200]], [1, [255, 90, 150]]],
    glows: [{ x: 0.15, y: 0.15, r: 0.5, c: [80, 160, 255], a: 0.45 }],
  }),
  gradient('Ocean Dusk', 'gradient', [40, 40, 110], [255, 255, 255], [225, 230, 255], [255, 160, 180], {
    angle: 180, stops: [[0, [12, 20, 70]], [0.55, [80, 40, 150]], [1, [235, 95, 125]]],
  }),
  gradient('Mango Tango', 'gradient', [255, 160, 40], [45, 20, 0], [60, 28, 4], [180, 40, 40], {
    angle: 135, stops: [[0, [255, 225, 40]], [0.55, [255, 150, 40]], [1, [255, 90, 70]]],
  }),
  gradient('Cotton Candy', 'gradient', [210, 190, 240], [50, 30, 90], [66, 44, 110], [200, 60, 140], {
    angle: 135, stops: [[0, [165, 205, 255]], [0.5, [215, 190, 250]], [1, [255, 185, 215]]],
  }),
  gradient('Mint Breeze', 'gradient', [150, 230, 220], [10, 50, 60], [20, 70, 80], [0, 120, 140], {
    angle: 160, stops: [[0, [190, 255, 215]], [1, [120, 195, 255]]],
  }),
  gradient('Peach Fuzz', 'gradient', [255, 190, 170], [80, 30, 30], [100, 45, 40], [200, 70, 80], {
    angle: 180, stops: [[0, [255, 220, 180]], [1, [255, 150, 165]]],
    glows: [{ x: 0.8, y: 0.2, r: 0.45, c: [255, 245, 210], a: 0.6 }],
  }),
  gradient('Lemonade', 'gradient', [255, 230, 120], [40, 30, 0], [60, 46, 6], [230, 80, 60], {
    angle: 200, stops: [[0, [255, 250, 190]], [0.55, [255, 225, 90]], [1, [255, 170, 120]]],
  }),
  gradient('Rose Gold', 'gradient', [230, 180, 165], [70, 30, 30], [90, 46, 44], [170, 100, 70], {
    angle: 135, stops: [[0, [250, 215, 195]], [0.5, [230, 175, 160]], [1, [200, 140, 140]]],
  }),
  gradient('Forest Mist', 'gradient', [40, 90, 70], [235, 255, 240], [205, 235, 215], [180, 230, 140], {
    angle: 180, stops: [[0, [80, 140, 110]], [1, [14, 40, 30]]],
  }),
  gradient('Monochrome Fade', 'gradient', [60, 60, 60], [255, 255, 255], [225, 225, 225], [150, 150, 150], {
    angle: 180, stops: [[0, [90, 90, 96]], [1, [8, 8, 10]]],
  }),
  gradient('Berry Smoothie', 'gradient', [140, 30, 90], [255, 240, 248], [255, 220, 236], [255, 170, 210], {
    angle: 145, stops: [[0, [90, 20, 110]], [0.5, [170, 30, 100]], [1, [240, 80, 110]]],
  }),
  gradient('Coral Reef', 'gradient', [255, 130, 110], [255, 255, 255], [255, 245, 240], [20, 90, 110], {
    angle: 160, stops: [[0, [255, 110, 100]], [0.6, [255, 150, 110]], [1, [80, 200, 200]]],
  }),

  // ---------- Mesh (soft blurred colour blobs) ----------
  gradient('Aurora', 'mesh', [8, 16, 34], [230, 255, 245], [200, 235, 225], [0, 230, 160], {
    angle: 180, stops: [[0, [6, 12, 30]], [1, [14, 24, 48]]],
    glows: [
      { x: 0.2, y: 0.25, r: 0.6, c: [0, 230, 160], a: 0.45 },
      { x: 0.85, y: 0.6, r: 0.55, c: [140, 60, 255], a: 0.45 },
    ],
  }),
  gradient('Cyber Grape', 'mesh', [30, 10, 60], [255, 255, 255], [230, 220, 255], [255, 60, 200], {
    angle: 200, stops: [[0, [20, 5, 50]], [0.6, [60, 15, 110]], [1, [180, 20, 140]]],
    glows: [{ x: 0.1, y: 0.9, r: 0.5, c: [0, 220, 255], a: 0.35 }],
  }),
  gradient('Midnight Mesh', 'mesh', [10, 10, 30], [255, 255, 255], [220, 225, 245], [120, 160, 255], {
    angle: 180, stops: [[0, [12, 12, 32]], [1, [6, 6, 18]]],
    glows: [
      { x: 0.1, y: 0.1, r: 0.55, c: [60, 80, 255], a: 0.55 },
      { x: 0.9, y: 0.45, r: 0.45, c: [255, 40, 140], a: 0.4 },
      { x: 0.3, y: 0.95, r: 0.5, c: [0, 200, 255], a: 0.35 },
    ],
  }),
  gradient('Pastel Dream', 'mesh', [250, 240, 250], [50, 30, 70], [70, 50, 90], [190, 80, 160], {
    angle: 180, stops: [[0, [252, 246, 252]], [1, [244, 240, 255]]],
    glows: [
      { x: 0.0, y: 0.0, r: 0.6, c: [255, 190, 220], a: 0.85 },
      { x: 1.0, y: 0.35, r: 0.5, c: [180, 220, 255], a: 0.85 },
      { x: 0.2, y: 1.0, r: 0.55, c: [210, 255, 220], a: 0.8 },
    ],
  }),
  gradient('Lava Lamp', 'mesh', [40, 0, 20], [255, 240, 220], [255, 220, 200], [255, 180, 60], {
    angle: 180, stops: [[0, [50, 0, 25]], [1, [20, 0, 10]]],
    glows: [
      { x: 0.8, y: 0.15, r: 0.5, c: [255, 90, 30], a: 0.7 },
      { x: 0.15, y: 0.6, r: 0.5, c: [255, 30, 90], a: 0.6 },
      { x: 0.7, y: 1.0, r: 0.45, c: [255, 190, 40], a: 0.55 },
    ],
  }),
  gradient('Tropical', 'mesh', [0, 160, 150], [255, 255, 255], [240, 255, 250], [255, 230, 80], {
    angle: 180, stops: [[0, [0, 170, 160]], [1, [0, 110, 140]]],
    glows: [
      { x: 0.9, y: 0.1, r: 0.5, c: [255, 220, 60], a: 0.7 },
      { x: 0.1, y: 0.8, r: 0.5, c: [255, 90, 120], a: 0.55 },
    ],
  }),
];

export const getTheme = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[0];

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'mesh', label: 'Mesh' },
];

/** CSS equivalent of a theme background, used for swatch buttons */
export function themeCss(theme: Pick<Theme, 'bg' | 'grad'>) {
  if (!theme.grad) return `rgb(${theme.bg.join(',')})`;
  const layers = (theme.grad.glows ?? []).map(
    (g) => `radial-gradient(circle at ${g.x * 100}% ${g.y * 100}%, rgba(${g.c.join(',')},${g.a}), transparent 60%)`,
  );
  const stops = theme.grad.stops.map(([p, c]) => `rgb(${c.join(',')}) ${p * 100}%`).join(', ');
  layers.push(`linear-gradient(${theme.grad.angle}deg, ${stops})`);
  return layers.join(', ');
}
