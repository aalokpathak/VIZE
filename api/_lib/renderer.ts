// Server-side rendering with @napi-rs/canvas, driving the exact same layout & render
// engine as the browser, so shared links preview pixel-for-pixel like the editor.
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, GlobalFonts, type Canvas } from '@napi-rs/canvas';
import type { Design } from '../../src/lib/design.js';
import { getFont, type FontDef } from '../../src/lib/fontList.js';
import { getFormat } from '../../src/lib/formats.js';
import { computeLayout } from '../../src/lib/layout.js';
import { setCanvasFactory, type CanvasLike } from '../../src/lib/platform.js';
import { paintBackground, renderDesign, resolveTheme } from '../../src/lib/render.js';
import { getTheme } from '../../src/lib/themes.js';

setCanvasFactory((w, h) => createCanvas(w, h) as unknown as CanvasLike);

const FONT_DIR = path.join(process.cwd(), 'node_modules', '@fontsource');
const registered = new Set<string>();

function register(file: string, alias: string) {
  const key = `${alias}|${file}`;
  if (registered.has(key)) return;
  registered.add(key);
  if (fs.existsSync(file)) GlobalFonts.registerFromPath(file, alias);
}

const fontFile = (pkg: string, subset: string, weight: number) =>
  path.join(FONT_DIR, pkg, 'files', `${pkg}-${subset}-${weight}-normal.woff2`);

/**
 * Fonts every design can fall back to, glyph by glyph: Devanagari and emoji.
 * One alias per file — a second file registered under the same alias is ignored.
 */
let fallbackStack: string[] | null = null;
function registerFallbacks() {
  if (fallbackStack) return fallbackStack;
  fallbackStack = ["'VIZE Devanagari'"];
  for (const w of [400, 500, 700]) register(fontFile('hind', 'devanagari', w), 'VIZE Devanagari');
  const emojiDir = path.join(FONT_DIR, 'noto-emoji', 'files');
  if (fs.existsSync(emojiDir)) {
    for (const f of fs.readdirSync(emojiDir).filter((f) => /-400-normal\.woff2$/.test(f)).sort()) {
      const alias = `VIZE Emoji ${f.match(/noto-emoji-(\w+)-400/)?.[1] ?? f}`;
      register(path.join(emojiDir, f), alias);
      fallbackStack.push(`'${alias}'`);
    }
  }
  return fallbackStack;
}

/**
 * Register a font's files and return a copy whose family stack the server can resolve.
 * Each Fontsource subset is its own file, so subsets get their own alias and are
 * chained in the stack (the canvas falls back per glyph across the stack).
 */
function prepareFont(font: FontDef): FontDef {
  const fallbacks = registerFallbacks();
  // "System Sans" has no font files — Inter is the closest match on the server
  const base = font.pkg ? font : getFont('inter');
  const pkg = base.pkg!;
  const name = /'([^']+)'/.exec(base.family)?.[1] ?? 'Inter';
  const stack = [`'${name}'`];
  for (const [subset, suffix] of [['latin', ''], ['latin-ext', ' Ext'], ['devanagari', ' Deva']] as const) {
    for (const w of new Set([font.body, font.title])) register(fontFile(pkg, subset, w), name + suffix);
    if (suffix) stack.push(`'${name}${suffix}'`);
  }
  stack.push(...fallbacks, 'sans-serif');
  return { ...font, family: stack.join(', ') };
}

export function renderDesignCanvas(d: Design): Canvas {
  const fmt = getFormat(d.formatId);
  const font = prepareFont(getFont(d.fontId));
  const canvas = createCanvas(fmt.w, fmt.h);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  renderDesign(ctx, d, resolveTheme(d, getTheme(d.themeId)), computeLayout(d, fmt, font));
  return canvas;
}

export async function renderDesignImage(d: Design, type: 'png' | 'jpeg') {
  const canvas = renderDesignCanvas(d);
  return type === 'png' ? canvas.encode('png') : canvas.encode('jpeg', 92);
}

/**
 * 1200×630 link-preview card (the size WhatsApp, X, LinkedIn & co. expect):
 * the design centred like a phone screen on a dimmed, scaled-up copy of its own background.
 */
export async function renderPreviewCard(d: Design) {
  const W = 1200, H = 630, PAD = 40;
  const design = renderDesignCanvas(d);
  const card = createCanvas(W, H);
  const ctx = card.getContext('2d');

  paintBackground(ctx as unknown as CanvasRenderingContext2D, resolveTheme(d, getTheme(d.themeId)), W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 0, W, H);

  const scale = Math.min((W - PAD * 2) / design.width, (H - PAD * 2) / design.height);
  const dw = design.width * scale, dh = design.height * scale;
  const x = (W - dw) / 2, y = (H - dh) / 2;
  const r = 18;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.roundRect(x, y, dw, dh, r);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, dw, dh, r);
  ctx.clip();
  ctx.drawImage(design, x, y, dw, dh);
  ctx.restore();

  // Small brand tag
  registerFallbacks();
  register(fontFile('inter', 'latin', 800), 'Inter');
  ctx.font = "800 22px 'Inter'";
  const label = 'made with VIZE';
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(W - tw - 56, H - 62, tw + 32, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(label, W - tw - 40, H - 34);

  return card.encode('jpeg', 85);
}
