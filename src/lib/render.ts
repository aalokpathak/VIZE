import type { Design, Pattern } from '../store';
import { hexToRgb, isDark, luminance, mix, rgbToHex, type RGB } from './colors';
import type { Layout, Line, TextStyle } from './layout';
import type { Theme } from './themes';

// ---------- Theme resolution ----------

/** The active theme, or one built from the custom background colours */
export function resolveTheme(d: Design, theme: Theme): Theme {
  if (!d.useCustomBg) return theme;
  const from = hexToRgb(d.customFrom);
  const to = d.customSolid ? from : hexToRgb(d.customTo);
  const avg = mix(from, to, 0.5);
  const dark = isDark(avg);
  const ink: RGB = dark ? [255, 255, 255] : [18, 18, 18];
  return {
    id: 'custom', name: 'Custom', category: 'gradient',
    bg: from,
    title: ink,
    text: dark ? [235, 235, 235] : [34, 34, 34],
    // A vivid accent for dividers & *emphasis*: gold on dark backgrounds, raspberry on light ones
    accent: dark ? [255, 210, 63] : [226, 40, 104],
    grad: d.customSolid ? undefined : { angle: d.customAngle, stops: [[0, from], [1, to]] },
  };
}

const contrast = (a: RGB, b: RGB) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

export interface Palette {
  title: string;
  text: string;
  emphasis: string;
  accent: string;
}

export function resolvePalette(d: Design, theme: Theme): Palette {
  const boxed = d.effect === 'highlight';
  const boxBg = hexToRgb(d.highlightColor);
  // On highlight boxes, default text is whichever of black/white reads best on the box
  const boxInk = isDark(boxBg) ? '#ffffff' : '#111111';
  // Emphasis defaults to the theme accent, unless that's too faint against the background
  const emBg = boxed ? boxBg : theme.bg;
  const emDefault: RGB =
    contrast(theme.accent, emBg) >= 2.6 ? theme.accent : isDark(emBg) ? [255, 210, 63] : [226, 40, 104];
  return {
    title: d.titleColor ?? (boxed ? boxInk : rgbToHex(theme.title)),
    text: d.textColor ?? (boxed ? boxInk : rgbToHex(theme.text)),
    emphasis: d.emphasisColor ?? rgbToHex(emDefault),
    accent: rgbToHex(theme.accent),
  };
}

// ---------- Background ----------

function paintBackground(ctx: CanvasRenderingContext2D, theme: Theme, w: number, h: number) {
  ctx.fillStyle = rgbToHex(theme.bg);
  ctx.fillRect(0, 0, w, h);
  if (!theme.grad) return;

  // CSS-style angle → gradient line through the centre that spans the whole box
  const rad = (theme.grad.angle * Math.PI) / 180;
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const lg = ctx.createLinearGradient(w / 2 - dx * half, h / 2 - dy * half, w / 2 + dx * half, h / 2 + dy * half);
  theme.grad.stops.forEach(([pos, c]) => lg.addColorStop(pos, rgbToHex(c)));
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, w, h);

  for (const g of theme.grad.glows ?? []) {
    const r = g.r * Math.max(w, h);
    const rg = ctx.createRadialGradient(g.x * w, g.y * h, 0, g.x * w, g.y * h, r);
    rg.addColorStop(0, `rgba(${g.c.join(',')},${g.a})`);
    rg.addColorStop(1, `rgba(${g.c.join(',')},0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }
}

// ---------- Patterns (tiles are generated once and cached) ----------

const tileCache = new Map<string, HTMLCanvasElement>();

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function patternTile(type: Exclude<Pattern, 'none'>, ink: string, scale: number) {
  const key = `${type}|${ink}|${scale}`;
  const hit = tileCache.get(key);
  if (hit) return hit;

  const sizes = { grain: 256, dots: 36, grid: 54, diagonal: 28, lines: 64 };
  const s = type === 'grain' ? 256 : Math.round(sizes[type] * scale);
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d')!;
  x.fillStyle = x.strokeStyle = ink;
  x.lineWidth = Math.max(1, 1.5 * scale);

  if (type === 'grain') {
    const img = x.createImageData(s, s);
    const rand = mulberry32(1080);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand() > 0.5 ? 255 : 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = rand() * 110;
    }
    x.putImageData(img, 0, 0);
  } else if (type === 'dots') {
    x.beginPath();
    x.arc(s / 2, s / 2, 2.4 * scale, 0, Math.PI * 2);
    x.fill();
  } else if (type === 'grid') {
    x.beginPath();
    x.moveTo(0, 0.5); x.lineTo(s, 0.5);
    x.moveTo(0.5, 0); x.lineTo(0.5, s);
    x.stroke();
  } else if (type === 'diagonal') {
    x.beginPath();
    x.moveTo(-1, s + 1); x.lineTo(s + 1, -1);
    x.moveTo(-1, 1); x.lineTo(1, -1);
    x.moveTo(s - 1, s + 1); x.lineTo(s + 1, s - 1);
    x.stroke();
  } else if (type === 'lines') {
    x.beginPath();
    x.moveTo(0, s - 0.5); x.lineTo(s, s - 0.5);
    x.stroke();
  }
  tileCache.set(key, c);
  return c;
}

// ---------- Text ----------

interface LineOpts {
  style: TextStyle;
  color: string;
  emColor: string;
  d: Design;
  L: Layout;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawLine(ctx: CanvasRenderingContext2D, line: Line, baseline: number, o: LineOpts) {
  const { style, d, L } = o;
  if (!line.words.length) return;
  const size = style.size;
  const justify = d.align === 'justify' && !line.last && line.words.length > 1;
  const wordsW = line.words.reduce((a, w) => a + w.w, 0);
  const gap = justify ? (L.contentW - wordsW) / (line.words.length - 1) : style.spaceW;
  const lineW = justify ? L.contentW : line.w;
  let x =
    d.align === 'right' ? L.W - L.margin - lineW
    : d.align === 'center' ? (L.W - lineW) / 2
    : L.margin;

  if (d.effect === 'highlight') {
    const padX = size * 0.32;
    const top = baseline - size * 0.92;
    const h = size * 1.24;
    ctx.fillStyle = d.highlightColor;
    roundRect(ctx, x - padX, top, lineW + padX * 2, h, size * 0.16);
    ctx.fill();
  }

  ctx.font = style.font;
  ctx.letterSpacing = `${style.spacing}px`;
  const ink = (em: boolean) => (em ? o.emColor : o.color);

  ctx.save();
  if (d.effect === 'shadow') {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = size * 0.2;
    ctx.shadowOffsetY = size * 0.07;
  }
  for (const word of line.words) {
    let px = x;
    for (const p of word.pieces) {
      const c = ink(p.em);
      if (d.effect === 'outline') {
        ctx.strokeStyle = isDark(hexToRgb(c)) ? '#ffffff' : '#111111';
        ctx.lineWidth = size * 0.12;
        ctx.lineJoin = 'round';
        ctx.strokeText(p.text, px, baseline);
      }
      if (d.effect === 'glow') {
        ctx.shadowColor = c;
        ctx.shadowBlur = size * 0.5;
        ctx.fillStyle = c;
        ctx.fillText(p.text, px, baseline);
      }
      ctx.fillStyle = c;
      ctx.fillText(p.text, px, baseline);
      px += p.w;
    }
    x += word.w + gap;
  }
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, d: Design, L: Layout, y: number, color: string) {
  const bs = L.body.size;
  const len = Math.min(180, L.contentW * 0.2);
  const cx = d.align === 'left' ? L.margin + len / 2 : d.align === 'right' ? L.W - L.margin - len / 2 : L.W / 2;
  const lw = Math.max(2.5, bs * 0.06);
  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  const hline = (x1: number, x2: number, yy: number) => {
    ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke();
  };
  if (d.divider === 'line') {
    hline(cx - len / 2, cx + len / 2, y);
  } else if (d.divider === 'double') {
    hline(cx - len / 2, cx + len / 2, y - lw * 1.6);
    ctx.lineWidth = lw * 0.6;
    hline(cx - len / 2, cx + len / 2, y + lw * 1.6);
  } else if (d.divider === 'dots') {
    const r = Math.max(4, bs * 0.085);
    for (const dx of [-r * 5, 0, r * 5]) {
      ctx.beginPath(); ctx.arc(cx + dx, y, r, 0, Math.PI * 2); ctx.fill();
    }
  } else if (d.divider === 'diamond') {
    const r = Math.max(6, bs * 0.14);
    hline(cx - len / 2, cx - r * 2, y);
    hline(cx + r * 2, cx + len / 2, y);
    ctx.beginPath();
    ctx.moveTo(cx, y - r); ctx.lineTo(cx + r, y); ctx.lineTo(cx, y + r); ctx.lineTo(cx - r, y);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------- Main entry ----------

export function renderDesign(ctx: CanvasRenderingContext2D, d: Design, theme: Theme, L: Layout) {
  const { W, H } = L;
  const pal = resolvePalette(d, theme);
  const k = Math.min(W, H) / 1080; // scale for decorative elements

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  paintBackground(ctx, theme, W, H);

  if (d.pattern !== 'none') {
    const ink = d.pattern === 'grain' ? '#000' : rgbToHex(theme.text);
    const pat = ctx.createPattern(patternTile(d.pattern, ink, k), 'repeat');
    if (pat) {
      ctx.save();
      ctx.globalAlpha = d.pattern === 'grain' ? d.patternOpacity / 50 : d.patternOpacity / 100;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // ----- Content (zoomable) -----
  ctx.save();
  const zoom = d.zoom / 100;
  if (zoom !== 1) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
  }

  const free = L.usableH - L.totalH;
  let y = L.top + (d.vAlign === 'top' ? 0 : d.vAlign === 'bottom' ? Math.max(0, free) : Math.max(0, free / 2));
  // Baseline sits so the cap-height is centred within each line box
  const baselineIn = (lineH: number, size: number) => lineH / 2 + size * 0.34;

  if (L.titleLines.length) {
    for (const line of L.titleLines) {
      drawLine(ctx, line, y + baselineIn(L.titleLineH, L.title.size), {
        style: L.title, color: pal.title, emColor: pal.emphasis, d, L,
      });
      y += L.titleLineH;
    }
    if (d.divider !== 'none') drawDivider(ctx, d, L, y + L.divGap * 0.45, pal.accent);
    y += L.divGap;
  }

  L.paras.forEach((lines, i) => {
    for (const line of lines) {
      drawLine(ctx, line, y + baselineIn(L.lineH, L.body.size), {
        style: L.body, color: pal.text, emColor: pal.emphasis, d, L,
      });
      y += L.lineH;
    }
    if (i < L.paras.length - 1) y += L.paraGap;
  });
  ctx.restore();

  // ----- Signature / handle -----
  const sig = d.signature.trim();
  if (sig) {
    const sz = Math.round(34 * k);
    const family = L.body.font.replace(/^\d+ \d+px /, '');
    ctx.save();
    ctx.font = `600 ${sz}px ${family}`;
    ctx.letterSpacing = `${sz * 0.04}px`;
    ctx.fillStyle = pal.text;
    ctx.globalAlpha = 0.75;
    ctx.textAlign = d.align === 'left' ? 'left' : d.align === 'right' ? 'right' : 'center';
    const sx = d.align === 'left' ? L.margin : d.align === 'right' ? W - L.margin : W / 2;
    const sy = H - Math.max(sz * 2.2, Math.min(L.top * 0.45, 120 * k));
    ctx.fillText(sig, sx, sy);
    ctx.restore();
  }

  // ----- Decorations -----
  if (d.frame) {
    const inset = 34 * k;
    ctx.save();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3 * k;
    roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 18 * k);
    ctx.stroke();
    ctx.restore();
  }

  if (d.corners) {
    const sz = 40 * k, pad = (d.frame ? 60 : 40) * k;
    ctx.save();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 3 * k;
    ctx.lineCap = 'round';
    const corners: [number, number, number, number][] = [
      [pad, pad, 1, 1], [W - pad, pad, -1, 1], [pad, H - pad, 1, -1], [W - pad, H - pad, -1, -1],
    ];
    for (const [cx, cy, sx, sy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + sy * sz);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + sx * sz, cy);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (d.vignette) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}
