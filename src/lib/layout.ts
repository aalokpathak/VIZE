import type { Design, Divider } from './design.js';
import type { FontDef } from './fontList.js';
import type { Format } from './formats.js';
import { createCanvas } from './platform.js';

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
  /** Extra space above this line (between list items) */
  gapBefore?: number;
  /** Set on list-item lines */
  list?: {
    /** Marker to draw — only on an item's first line */
    marker: string | null;
    markerW: number;
    /** Hanging indent: where the text starts, relative to the list block */
    indent: number;
    /** Width of the whole run of list items, used to align it as one block */
    blockW: number;
  };
}

export type LayoutBlock = { kind: 'text'; lines: Line[] } | { kind: 'sep'; style: Exclude<Divider, 'none'>; h: number };

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
  blocks: LayoutBlock[];
  totalH: number;
  /** Share of the usable height the text occupies, 0–100 */
  fill: number;
}

// ---------- Measuring (cached — layout re-measures the same words many times) ----------
let measureCtx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export function clearMeasureCache() {
  cache.clear();
}

function measure(text: string, font: string, spacing: number) {
  const key = `${font}|${spacing}|${text}`;
  let w = cache.get(key);
  if (w === undefined) {
    measureCtx ??= createCanvas(1, 1).getContext('2d')!;
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

/** The text as it appears in the image — emphasis markers removed */
export const plainText = (text: string) =>
  splitEmphasis(text.replace(/\r/g, '')).map((s) => s.text).join('');

// ---------- Lists & separators ----------
// Plain-text syntax, so formatting survives copy/paste, share links, the server
// renderer and AI edits. The editor toolbar writes exactly these forms.

/** A line containing only one of these becomes a separator of that style */
export const SEPARATOR_TOKENS: Record<string, Exclude<Divider, 'none'>> = {
  '---': 'line', '***': 'line', '___': 'line',
  '===': 'double',
  '• • •': 'dots', '* * *': 'dots', '···': 'dots',
  '-◆-': 'diamond',
  '~~~': 'wave',
  '✦ ✦ ✦': 'stars',
};

export const separatorOf = (line: string) => SEPARATOR_TOKENS[line.trim()];

/** Bullet characters understood at the start of a line (- * + are drawn as •) */
const BULLET = /^([•◦▪‣●○■□◆◇♦★☆✓✔✗✘→➜➤▸►–\-*+])[ \t]+(?=\S)/;
/** 1. 1) (1)  a. A)  i. iv. XII) */
const NUMBER = /^(\(\d{1,3}\)|\d{1,3}[.)]|[a-zA-Z][.)]|(?=[ivxIVX]{2})x{0,2}(?:ix|iv|v?i{0,3})[.)]|(?=[ivxIVX]{2})X{0,2}(?:IX|IV|V?I{0,3})[.)])[ \t]+(?=\S)/;

export interface ListMarker {
  kind: 'bullet' | 'number';
  /** Marker exactly as typed, e.g. "✓" or "3." */
  token: string;
  /** Length of marker + following whitespace in the source line */
  length: number;
}

export function listMarkerOf(line: string): ListMarker | null {
  const b = BULLET.exec(line);
  if (b) return { kind: 'bullet', token: b[1], length: b[0].length };
  const n = NUMBER.exec(line);
  if (n) return { kind: 'number', token: n[1], length: n[0].length };
  return null;
}

/** What a marker looks like in the image */
const displayMarker = (m: ListMarker) => (m.kind === 'bullet' && /^[-*+]$/.test(m.token) ? '•' : m.token);

/** The text with formatting syntax removed — what the reader actually sees */
function visibleText(text: string) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => !separatorOf(l));
  const body = lines.map((l) => {
    const m = listMarkerOf(l);
    return m ? l.slice(m.length) : l;
  });
  return splitEmphasis(body.join('\n')).map((s) => s.text).join('');
}

/** Counts for the text as it appears in the image (formatting markers excluded) */
export function textStats(text: string) {
  const visible = visibleText(text).trim();
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

interface RawLine {
  words: RawPiece[][];
  /** Set when the line is a list item */
  marker?: string;
}

export type RawBlock = { kind: 'text'; lines: RawLine[] } | { kind: 'sep'; style: Exclude<Divider, 'none'> };

/** Turn one paragraph's source text into hard lines, pulling list markers off */
function parseParagraph(p: string): RawLine[] {
  return splitLines(splitEmphasis(p)).map((pieces) => {
    const first = pieces[0];
    const m = first && !first.em ? listMarkerOf(first.text) : null;
    if (!m) return { words: tokenize(pieces) };
    const rest = [{ ...first, text: first.text.slice(m.length) }, ...pieces.slice(1)];
    return { words: tokenize(rest), marker: displayMarker(m) };
  });
}

/**
 * Blocks of the text: paragraphs (separated by blank lines; single newlines are hard
 * line breaks) and separators (a line of `---`, `===`, `• • •`, …).
 */
export function parseBlocks(text: string, uppercase = false): RawBlock[] {
  const src = (uppercase ? text.toUpperCase() : text).replace(/\r/g, '');
  const blocks: RawBlock[] = [];
  let para: string[] = [];
  const flush = () => {
    const p = para.join('\n').trim();
    if (p) blocks.push({ kind: 'text', lines: parseParagraph(p) });
    para = [];
  };
  for (const line of src.split('\n')) {
    const sep = separatorOf(line);
    if (sep) {
      flush();
      blocks.push({ kind: 'sep', style: sep });
    } else if (!line.trim()) {
      flush();
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/**
 * Wrap one paragraph. List items get a hanging indent and are laid out as a block,
 * wrapped at `listW` (narrower than the text in centred designs, so the list reads as
 * an inset block instead of a flush-left slab between centred paragraphs).
 */
function wrapParagraph(raw: RawLine[], style: TextStyle, maxW: number, itemGap: number, listW = maxW): Line[] {
  const out: Line[] = [];
  const toWords = (rawWords: RawPiece[][]): Word[] =>
    rawWords.map((pieces) => {
      const ps = pieces.map((p) => ({ ...p, w: measure(p.text, style.font, style.spacing) }));
      return { pieces: ps, w: ps.reduce((a, p) => a + p.w, 0) };
    });

  const wrap = (words: Word[], width: number): Line[] => {
    if (!words.length) return [{ words: [], w: 0, last: true }];
    const lines: Line[] = [];
    let line: Word[] = [words[0]];
    let w = words[0].w;
    for (let i = 1; i < words.length; i++) {
      const next = w + style.spaceW + words[i].w;
      if (next <= width) {
        line.push(words[i]);
        w = next;
      } else {
        lines.push({ words: line, w, last: false });
        line = [words[i]];
        w = words[i].w;
      }
    }
    lines.push({ words: line, w, last: true });
    return lines;
  };

  for (let i = 0; i < raw.length; ) {
    if (!raw[i].marker) {
      out.push(...wrap(toWords(raw[i].words), maxW));
      i++;
      continue;
    }
    // A run of consecutive list items shares one marker column and one block width
    let j = i;
    while (j < raw.length && raw[j].marker) j++;
    const items = raw.slice(i, j);
    const markerWs = items.map((it) => measure(it.marker!, style.font, style.spacing));
    const indent = Math.max(...markerWs) + style.size * 0.45;
    const group: Line[] = [];
    items.forEach((it, k) => {
      wrap(toWords(it.words), listW - indent).forEach((line, n) => {
        group.push({
          ...line,
          gapBefore: k > 0 && n === 0 ? itemGap : 0,
          list: { marker: n === 0 ? it.marker! : null, markerW: markerWs[k], indent, blockW: 0 },
        });
      });
    });
    const blockW = Math.max(...group.map((l) => l.list!.indent + l.w));
    for (const l of group) l.list!.blockW = blockW;
    out.push(...group);
    i = j;
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
  // Titles are plain text — lists and separators are a body feature
  const titleParsed = d.title.trim()
    ? parseBlocks(d.title, d.titleUppercase).flatMap((b) => (b.kind === 'text' ? b.lines : []))
    : [];
  const bodyParsed = parseBlocks(content);
  const hasTitle = titleParsed.length > 0;

  const build = (bs: number): Layout => {
    const ts = Math.round((bs * d.titleScale) / 100);
    const body = makeStyle(font.body, bs, font.family, d.letterSpacing);
    const title = makeStyle(font.title, ts, font.family, d.letterSpacing);
    const lineH = Math.round((bs * d.lineHeight) / 100);
    const titleLineH = Math.round(ts * Math.min(1.3, d.lineHeight / 100));
    const paraGap = Math.round((bs * d.paraGap) / 100);
    const divGap = hasTitle ? Math.round(bs * (d.divider === 'none' ? 0.9 : 1.8)) : 0;

    const itemGap = Math.round(bs * 0.3);
    const sepH = Math.round(bs * 1.1);

    const titleLines = wrapParagraph(
      titleParsed.map((l) => ({ words: l.words })), title, contentW, 0,
    );
    const listW = d.align === 'center' ? Math.round(contentW * 0.86) : contentW;
    const blocks: LayoutBlock[] = bodyParsed.map((b) =>
      b.kind === 'sep'
        ? { ...b, h: sepH }
        : { kind: 'text', lines: wrapParagraph(b.lines, body, contentW, itemGap, listW) },
    );

    let totalH = titleLines.length * titleLineH + divGap;
    blocks.forEach((b, i) => {
      totalH += b.kind === 'sep' ? b.h : b.lines.reduce((h, l) => h + lineH + (l.gapBefore ?? 0), 0);
      if (i < blocks.length - 1) totalH += paraGap;
    });
    const bodyLines = blocks.flatMap((b) => (b.kind === 'text' ? b.lines : []));
    const tooWide = [...titleLines, ...bodyLines].some((l) => (l.list?.indent ?? 0) + l.w > contentW + 1);

    return {
      W, H, margin, contentW, top, usableH, body, title, lineH, titleLineH, paraGap, divGap,
      titleLines, blocks, totalH,
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
