// Text-box formatting commands (lists & separators). Each returns an Edit — "replace
// this range with this text, then select that" — so the editor can apply it in a way
// that keeps the browser's own undo history.
import type { Divider } from './design';
import { listMarkerOf, separatorOf } from './layout';

export interface Edit {
  start: number;
  end: number;
  text: string;
  /** Selection to restore afterwards (positions in the edited text) */
  select: [number, number];
}

export const BULLET_STYLES = [
  { token: '•', label: 'Dot' },
  { token: '◦', label: 'Ring' },
  { token: '▪', label: 'Square' },
  { token: '–', label: 'Dash' },
  { token: '✓', label: 'Check' },
  { token: '★', label: 'Star' },
  { token: '➤', label: 'Arrow' },
] as const;

export type NumberStyle = '1.' | '1)' | '(1)' | 'a.' | 'A.' | 'i.';

export const NUMBER_STYLES: { style: NumberStyle; label: string }[] = [
  { style: '1.', label: '1. 2. 3.' },
  { style: '1)', label: '1) 2) 3)' },
  { style: '(1)', label: '(1) (2) (3)' },
  { style: 'a.', label: 'a. b. c.' },
  { style: 'A.', label: 'A. B. C.' },
  { style: 'i.', label: 'i. ii. iii.' },
];

export const SEPARATOR_STYLES: { token: string; style: Exclude<Divider, 'none'>; label: string }[] = [
  { token: '---', style: 'line', label: 'Line' },
  { token: '===', style: 'double', label: 'Double' },
  { token: '• • •', style: 'dots', label: 'Dots' },
  { token: '-◆-', style: 'diamond', label: 'Diamond' },
  { token: '~~~', style: 'wave', label: 'Wave' },
  { token: '✦ ✦ ✦', style: 'stars', label: 'Stars' },
];

const ROMAN: [number, string][] = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
function roman(n: number) {
  let out = '';
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}

export function numberToken(style: NumberStyle, n: number): string {
  switch (style) {
    case '1.': return `${n}.`;
    case '1)': return `${n})`;
    case '(1)': return `(${n})`;
    case 'a.': return n <= 26 ? `${String.fromCharCode(96 + n)}.` : `${n}.`;
    case 'A.': return n <= 26 ? `${String.fromCharCode(64 + n)}.` : `${n}.`;
    case 'i.': return n <= 39 ? `${roman(n)}.` : `${n}.`;
  }
}

/** Which numbering family a marker belongs to (letters and roman numerals share one) */
function numberFamily(token: string) {
  if (/^\(\d+\)$/.test(token)) return '(1)';
  if (/^\d+\)$/.test(token)) return '1)';
  if (/^\d+\.$/.test(token)) return '1.';
  if (/^[a-z]+[.)]$/.test(token)) return 'a.';
  if (/^[A-Z]+[.)]$/.test(token)) return 'A.';
  return token;
}

/**
 * The marker after this one: "3." → "4.", "c)" → "d)", "iv." → "v.". A lone "i"/"v"/"x"
 * is ambiguous (roman numeral or letter), so the previous item's marker decides.
 */
function nextNumber(token: string, prev?: string): string {
  const m = /^(\(?)(\d+|[a-zA-Z]+)([.)])$/.exec(token);
  if (!m) return token;
  const [, open, core, close] = m;
  const lower = core.toLowerCase();
  let next: string;
  if (/^\d+$/.test(core)) {
    next = String(Number(core) + 1);
  } else {
    const prevCore = prev ? /^\(?([a-zA-Z]+)[.)]$/.exec(prev)?.[1]?.toLowerCase() : undefined;
    const isRoman =
      /^[ivx]+$/.test(lower) && (lower.length > 1 || (prevCore ? /^[ivx]{2,}$/.test(prevCore) : lower === 'i'));
    if (isRoman) next = roman(romanValue(lower) + 1);
    else if (lower.length === 1 && lower !== 'z') next = String.fromCharCode(lower.charCodeAt(0) + 1);
    else next = lower;
    if (core !== lower) next = next.toUpperCase();
  }
  return `${open}${next}${close}`;
}

function romanValue(s: string) {
  const v: Record<string, number> = { i: 1, v: 5, x: 10 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = v[s[i]], nxt = v[s[i + 1]] ?? 0;
    total += cur < nxt ? -cur : cur;
  }
  return total;
}

/** Start/end of the full lines touched by a selection */
export function lineRange(value: string, selStart: number, selEnd: number): [number, number] {
  const start = value.lastIndexOf('\n', selStart - 1) + 1;
  // A selection ending right after a newline shouldn't pull in the next line
  const endAt = selEnd > selStart && value[selEnd - 1] === '\n' ? selEnd - 1 : selEnd;
  const nl = value.indexOf('\n', endAt);
  return [start, nl === -1 ? value.length : nl];
}

const stripMarker = (line: string) => {
  const m = listMarkerOf(line);
  return m ? line.slice(m.length) : line;
};

/**
 * Turn the selected lines (or the line with the cursor) into a list. Applying the
 * style they already have removes it again, like a toggle.
 */
export function applyList(
  value: string, selStart: number, selEnd: number,
  kind: 'bullet' | 'number', style: string,
): Edit {
  const [start, end] = lineRange(value, selStart, selEnd);
  const lines = value.slice(start, end).split('\n');
  const eligible = (l: string) => l.trim() !== '' && !separatorOf(l);
  const targets = lines.filter(eligible);

  const alreadyThis = targets.length > 0 && targets.every((l) => {
    const m = listMarkerOf(l);
    if (!m || m.kind !== kind) return false;
    return kind === 'bullet' ? m.token === style : numberFamily(m.token) === numberFamily(style);
  });

  let n = 0;
  const out = lines.map((l) => {
    if (!eligible(l)) return l;
    const body = stripMarker(l).trimStart();
    if (alreadyThis) return body;
    n += 1;
    const marker = kind === 'bullet' ? style : numberToken(style as NumberStyle, n);
    return `${marker} ${body}`;
  });
  const text = out.join('\n');
  return { start, end, text, select: [start, start + text.length] };
}

/** Remove list markers from the selected lines */
export function clearList(value: string, selStart: number, selEnd: number): Edit {
  const [start, end] = lineRange(value, selStart, selEnd);
  const text = value.slice(start, end).split('\n').map((l) => stripMarker(l)).join('\n');
  return { start, end, text, select: [start, start + text.length] };
}

/**
 * Put a separator after the paragraph the cursor is in. If the cursor is already on a
 * separator line, switch that separator to the new style instead.
 */
export function insertSeparator(value: string, cursor: number, token: string): Edit {
  const [ls, le] = lineRange(value, cursor, cursor);
  if (separatorOf(value.slice(ls, le))) {
    return { start: ls, end: le, text: token, select: [ls + token.length, ls + token.length] };
  }
  if (!value.trim()) {
    const text = `${token}\n\n`;
    return { start: 0, end: value.length, text, select: [text.length, text.length] };
  }
  const idx = value.slice(cursor).search(/\n[ \t]*\n/);
  const end = idx === -1 ? value.length : cursor + idx;
  const atEnd = end === value.length;
  const text = `\n\n${token}${atEnd ? '\n\n' : ''}`;
  const caret = end + text.length;
  return { start: end, end, text, select: [caret, caret] };
}

/**
 * Enter inside a list item: start the next item with the next marker. Enter on an
 * empty item ends the list. Returns null when Enter should behave normally.
 */
export function continueList(value: string, cursor: number): Edit | null {
  const [ls, le] = lineRange(value, cursor, cursor);
  const line = value.slice(ls, le);
  // Second try recognises an item with nothing typed after the marker yet ("2. ")
  const m = listMarkerOf(line) ?? listMarkerOf(`${line.trimEnd()} x`);
  if (!m || cursor - ls < m.token.length) return null;
  const body = line.slice(m.length).trim();
  if (!body && cursor === le) {
    return { start: ls, end: le, text: '', select: [ls, ls] };
  }
  const prevLine = ls > 0 ? value.slice(value.lastIndexOf('\n', ls - 2) + 1, ls - 1) : '';
  const next = m.kind === 'bullet' ? m.token : nextNumber(m.token, listMarkerOf(prevLine)?.token);
  const text = `\n${next} `;
  return { start: cursor, end: cursor, text, select: [cursor + text.length, cursor + text.length] };
}
