import type { Design } from '../store';
import type { FontDef } from './fonts';
import type { Format } from './formats';

/** A run of text inside a word; `em` runs were wrapped in *asterisks* */
export interface Piece {
  text: string;
  em: boolean;
  w: number;
}
export interface Word {
  pieces: Piece[];
  w: number;
}
export interface Line {
  words: Word[];
  /** Natural width with single spaces */
  w: number;
  /** Last line before a hard break / paragraph end — never justified */
  last: boolean;
}

export interface TextStyle {
  font: string;
  size: number;
  /** Letter spacing in px */
  spacing: number;
  spaceW: number;
}

export interface Layout {
  W: number;
  H: number;
  margin: number;
  contentW: number;
  top: number;
  usableH: number;
  body: TextStyle;
  title: TextStyle;
  lineH: number;
  titleLineH: number;
  paraGap: number;
  divGap: number;
  titleLines: Line[];
  paras: Line[][];
  totalH: number;
  /** Share of the usable height the text occupies, 0–100 */
  fill: number;
}

// ---------- Measuring (cached — layout re-measures the same words many times) ----------
const measureCtx = document.createElement('canvas').getContext('2d')!;
const cache = new Map<string, number>();

export function clearMeasureCache() {
  cache.clear();
}

function measure(text: string, font: string, spacing: number) {
  const key = `${font}|${spacing}|${text}`;
  let w = cache.get(key);
  if (w === undefined) {
    measureCtx.font = font;
    measureCtx.letterSpacing = `${spacing}px`;
    w = measureCtx.measureText(text).width;
    if (cache.size > 50_000) cache.clear();
    cache.set(key, w);
  }
  return w;
}

export const fontString = (weight: number, size: number, family: string) => `${weight} ${size}px ${family}`;

// ---------- Parsing ----------
type RawPiece = { text: string; em: boolean };

/** Markdown-style *text*, **text** or ***text*** — may span line breaks within a paragraph */
const EMPHASIS = /(\*{1,3})(?=[^\s*])([^*]+?)(?<=\S)\1(?!\*)/g;

/** Split a paragraph into plain / emphasised runs, dropping the asterisk markers */
function splitEmphasis(p: string): RawPiece[] {
  const out: RawPiece[] = [];
  let last = 0;
  for (const m of p.matchAll(EMPHASIS)) {
    if (m.index > last) out.push({ text: p.slice(last, m.index), em: false });
    out.push({ text: m[2], em: true });
    last = m.index + m[0].length;
  }
  if (last < p.length) out.push({ text: p.slice(last), em: false });
  return out;
}

/** Counts for the text as it appears in the image (emphasis markers excluded) */
export function textStats(text: string) {
  const visible = splitEmphasis(text.replace(/\r/g, '').trim()).map((s) => s.text).join('');
  const words = visible.match(/\S+/g)?.length ?? 0;
  return {
    words,
    chars: visible.length,
    charsNoSpaces: visible.replace(/\s/g, '').length,
    paragraphs: visible ? visible.split(/\n[ \t]*\n/).filter((p) => p.trim()).length : 0,
  };
}

/** Break a paragraph's runs into hard lines (single newlines) */
function splitLines(segments: RawPiece[]): RawPiece[][] {
  const lines: RawPiece[][] = [[]];
  for (const seg of segments) {
    seg.text.split('\n').forEach((text, i) => {
      if (i > 0) lines.push([]);
      if (text) lines[lines.length - 1].push({ text, em: seg.em });
    });
  }
  return lines;
}

/** Split one hard line into words, each made of plain / emphasised pieces */
function tokenize(segments: RawPiece[]): RawPiece[][] {
  const words: RawPiece[][] = [];
  let cur: RawPiece[] = [];
  for (const seg of segments) {
    for (const part of seg.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (cur.length) words.push(cur);
        cur = [];
      } else {
        cur.push({ text: part, em: seg.em });
      }
    }
  }
  if (cur.length) words.push(cur);
  return words;
}

/** Paragraphs are separated by blank lines; single newlines are hard line breaks */
export function parseParagraphs(text: string, uppercase = false) {
  const src = uppercase ? text.toUpperCase() : text;
  return src
    .replace(/\r/g, '')
    .split(/\n[ \t]*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => splitLines(splitEmphasis(p)).map(tokenize));
}

type Parsed = ReturnType<typeof parseParagraphs>;

function wrapParagraph(hardLines: RawPiece[][][], style: TextStyle, maxW: number): Line[] {
  const out: Line[] = [];
  for (const rawWords of hardLines) {
    const words: Word[] = rawWords.map((pieces) => {
      const ps = pieces.map((p) => ({ ...p, w: measure(p.text, style.font, style.spacing) }));
      return { pieces: ps, w: ps.reduce((a, p) => a + p.w, 0) };
    });
    if (!words.length) {
      out.push({ words: [], w: 0, last: true });
      continue;
    }
    let line: Word[] = [words[0]];
    let w = words[0].w;
    for (let i = 1; i < words.length; i++) {
      const next = w + style.spaceW + words[i].w;
      if (next <= maxW) {
        line.push(words[i]);
        w = next;
      } else {
        out.push({ words: line, w, last: false });
        line = [words[i]];
        w = words[i].w;
      }
    }
    out.push({ words: line, w, last: true });
  }
  return out;
}

function makeStyle(weight: number, size: number, family: string, letterSpacing: number): TextStyle {
  const font = fontString(weight, size, family);
  const spacing = (size * letterSpacing) / 100;
  return { font, size, spacing, spaceW: measure(' ', font, spacing) };
}

const AUTO_SIZES: [number, number][] = [
  [80, 84], [150, 68], [320, 56], [550, 48], [850, 42], [1200, 36], [1700, 31], [Infinity, 26],
];

export function computeLayout(d: Design, fmt: Format, font: FontDef): Layout {
  const { w: W, h: H } = fmt;
  const margin = Math.min(d.margin, W / 2 - 60);
  const padding = Math.min(d.padding, H / 2 - 60);
  const contentW = W - margin * 2;
  const top = padding;
  const usableH = H - padding * 2;

  const content = d.content.trim() || 'Your thoughts go here…';
  const titleParsed: Parsed = d.title.trim() ? parseParagraphs(d.title, d.titleUppercase) : [];
  const bodyParsed = parseParagraphs(content);
  const hasTitle = titleParsed.length > 0;

  const build = (bs: number): Layout => {
    const ts = Math.round((bs * d.titleScale) / 100);
    const body = makeStyle(font.body, bs, font.family, d.letterSpacing);
    const title = makeStyle(font.title, ts, font.family, d.letterSpacing);
    const lineH = Math.round((bs * d.lineHeight) / 100);
    const titleLineH = Math.round(ts * Math.min(1.3, d.lineHeight / 100));
    const paraGap = Math.round((bs * d.paraGap) / 100);
    const divGap = hasTitle ? Math.round(bs * (d.divider === 'none' ? 0.9 : 1.8)) : 0;

    const titleLines = titleParsed.flatMap((p) => wrapParagraph(p, title, contentW));
    const paras = bodyParsed.map((p) => wrapParagraph(p, body, contentW));

    let totalH = titleLines.length * titleLineH + divGap;
    paras.forEach((lines, i) => {
      totalH += lines.length * lineH;
      if (i < paras.length - 1) totalH += paraGap;
    });
    const tooWide = [...titleLines, ...paras.flat()].some((l) => l.w > contentW + 1);

    return {
      W, H, margin, contentW, top, usableH, body, title, lineH, titleLineH, paraGap, divGap,
      titleLines, paras, totalH,
      fill: tooWide ? 101 : Math.round((totalH / usableH) * 100),
    };
  };

  const fits = (l: Layout) => l.fill <= 100;
  const MIN = 12;

  if (d.mode === 'manual') return build(Math.max(MIN, d.fontSize));

  if (d.mode === 'fill') {
    // Largest size that fits — binary search
    let lo = MIN, hi = Math.round(Math.min(W, H) * 0.3);
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (fits(build(mid))) lo = mid;
      else hi = mid - 1;
    }
    return build(lo);
  }

  // Auto: size from text length, scaled to the format, then shrink until it fits
  const n = content.length + d.title.length;
  let bs = Math.round(AUTO_SIZES.find(([max]) => n <= max)![1] * Math.min(1.4, W / 1080));
  let l = build(bs);
  while (!fits(l) && bs > MIN) {
    bs -= 2;
    l = build(bs);
  }
  return l;
}
