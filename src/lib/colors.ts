export type RGB = [number, number, number];

export const rgb = (c: RGB, a = 1) => (a >= 1 ? `rgb(${c.join(',')})` : `rgba(${c.join(',')},${a})`);

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgbToHex = (c: RGB) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

/** Relative luminance (0 = black, 1 = white), WCAG formula */
export function luminance([r, g, b]: RGB) {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export const isDark = (c: RGB) => luminance(c) < 0.4;

export const mix = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB;

export interface Swatch {
  name: string;
  hex: string;
}

/** Shown first in every colour picker: the three primaries plus black & white */
export const PRIMARY_COLORS: Swatch[] = [
  { name: 'Red', hex: '#e53935' },
  { name: 'Yellow', hex: '#fdd835' },
  { name: 'Blue', hex: '#1e5bff' },
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
];

export const EXTRA_COLORS: Swatch[] = [
  { name: 'Orange', hex: '#ff7a1a' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ff3d8b' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Gold', hex: '#d4a72c' },
  { name: 'Cream', hex: '#f6ecd9' },
  { name: 'Slate', hex: '#475569' },
];
