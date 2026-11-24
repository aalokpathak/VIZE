import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import {
  applyList, BULLET_STYLES, clearList, continueList, insertSeparator, NUMBER_STYLES, SEPARATOR_STYLES,
  type Edit,
} from '../lib/formatting';
import { IconChevron } from './icons';

/**
 * Apply an edit to the text box through the browser's own text insertion, so Ctrl+Z
 * undoes it like typing. Falls back to setRangeText where execCommand isn't available.
 */
export function applyEdit(ta: HTMLTextAreaElement, edit: Edit) {
  ta.focus();
  ta.setSelectionRange(edit.start, edit.end);
  let ok = false;
  try {
    ok = edit.text === ''
      ? document.execCommand('delete')
      : document.execCommand('insertText', false, edit.text);
  } catch {
    ok = false;
  }
  if (!ok) {
    ta.setRangeText(edit.text, edit.start, edit.end, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  ta.setSelectionRange(edit.select[0], edit.select[1]);
}

/** Keyboard behaviour for the text box: list continuation and list shortcuts */
export function handleFormatKeys(e: KeyboardEvent<HTMLTextAreaElement>) {
  const ta = e.currentTarget;
  const mod = e.ctrlKey || e.metaKey;
  if (e.key === 'Enter' && !e.shiftKey && !mod && !e.altKey && ta.selectionStart === ta.selectionEnd) {
    const edit = continueList(ta.value, ta.selectionStart);
    if (edit) {
      e.preventDefault();
      applyEdit(ta, edit);
    }
  } else if (mod && e.shiftKey && (e.code === 'Digit8' || e.code === 'Digit7')) {
    // Same shortcuts as Google Docs: Ctrl+Shift+8 bullets, Ctrl+Shift+7 numbers
    e.preventDefault();
    const edit = e.code === 'Digit8'
      ? applyList(ta.value, ta.selectionStart, ta.selectionEnd, 'bullet', '•')
      : applyList(ta.value, ta.selectionStart, ta.selectionEnd, 'number', '1.');
    applyEdit(ta, edit);
  }
}

type Menu = 'bullet' | 'number' | 'separator';

export function FormatToolbar({ textarea }: { textarea: RefObject<HTMLTextAreaElement | null> }) {
  const [open, setOpen] = useState<Menu | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const run = (make: (value: string, start: number, end: number) => Edit) => {
    const ta = textarea.current;
    if (!ta) return;
    applyEdit(ta, make(ta.value, ta.selectionStart, ta.selectionEnd));
    setOpen(null);
  };

  // Keep the text box's selection while clicking toolbar buttons
  const keepSelection = (e: ReactMouseEvent) => e.preventDefault();

  const toggle = (menu: Menu) => setOpen((m) => (m === menu ? null : menu));

  return (
    <div className="format-bar" ref={bar} role="toolbar" aria-label="Text formatting">
      <div className="format-item">
        <button
          type="button"
          className={`format-btn${open === 'bullet' ? ' open' : ''}`}
          onMouseDown={keepSelection}
          onClick={() => toggle('bullet')}
          title="Bulleted list (Ctrl+Shift+8)"
          aria-haspopup="menu"
          aria-expanded={open === 'bullet'}
        >
          <span className="format-glyph">•≡</span>
          Bullets
          <IconChevron width={13} height={13} />
        </button>
        {open === 'bullet' && (
          <div className="format-menu" role="menu">
            {BULLET_STYLES.map((b) => (
              <button
                key={b.token}
                type="button"
                role="menuitem"
                className="format-option"
                onMouseDown={keepSelection}
                onClick={() => run((v, s, e) => applyList(v, s, e, 'bullet', b.token))}
              >
                <span className="format-option-glyph">{b.token}</span>
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="format-item">
        <button
          type="button"
          className={`format-btn${open === 'number' ? ' open' : ''}`}
          onMouseDown={keepSelection}
          onClick={() => toggle('number')}
          title="Numbered list (Ctrl+Shift+7)"
          aria-haspopup="menu"
          aria-expanded={open === 'number'}
        >
          <span className="format-glyph">1.</span>
          Numbers
          <IconChevron width={13} height={13} />
        </button>
        {open === 'number' && (
          <div className="format-menu" role="menu">
            {NUMBER_STYLES.map((n) => (
              <button
                key={n.style}
                type="button"
                role="menuitem"
                className="format-option"
                onMouseDown={keepSelection}
                onClick={() => run((v, s, e) => applyList(v, s, e, 'number', n.style))}
              >
                <span className="format-option-glyph wide">{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="format-item">
        <button
          type="button"
          className={`format-btn${open === 'separator' ? ' open' : ''}`}
          onMouseDown={keepSelection}
          onClick={() => toggle('separator')}
          title="Add a separator after the paragraph your cursor is in"
          aria-haspopup="menu"
          aria-expanded={open === 'separator'}
        >
          <span className="format-glyph">◆</span>
          Separator
          <IconChevron width={13} height={13} />
        </button>
        {open === 'separator' && (
          <div className="format-menu" role="menu">
            {SEPARATOR_STYLES.map((sep) => (
              <button
                key={sep.token}
                type="button"
                role="menuitem"
                className="format-option"
                onMouseDown={keepSelection}
                onClick={() => run((v, _s, e) => insertSeparator(v, e, sep.token))}
              >
                <SeparatorPreview style={sep.style} />
                {sep.label}
              </button>
            ))}
            <p className="format-menu-hint">Goes after the paragraph your cursor is in</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="format-btn plain"
        onMouseDown={keepSelection}
        onClick={() => run(clearList)}
        title="Clear list: remove bullets / numbers from the selected lines"
        aria-label="Clear list"
      >
        ✕
      </button>
    </div>
  );
}

/** Small inline drawing of each separator style for the menu */
function SeparatorPreview({ style }: { style: string }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <svg className="format-option-glyph" width="40" height="14" viewBox="0 0 40 14" aria-hidden>
      {style === 'line' && <path d="M6 7h28" {...common} />}
      {style === 'double' && <path d="M6 5h28M6 9h28" {...common} />}
      {style === 'dots' && [12, 20, 28].map((x) => <circle key={x} cx={x} cy={7} r={1.8} fill="currentColor" />)}
      {style === 'diamond' && (
        <>
          <path d="M5 7h10M25 7h10" {...common} />
          <path d="M20 3l4 4-4 4-4-4z" fill="currentColor" />
        </>
      )}
      {style === 'wave' && <path d="M5 7c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 7.5 0 5 4 7.5 0" {...common} />}
      {style === 'stars' &&
        [[11, 0.7], [20, 1], [29, 0.7]].map(([x, k]) => (
          <path
            key={x}
            d={`M${x} ${7 - 5 * k}Q${x} 7 ${x + 5 * k} 7Q${x} 7 ${x} ${7 + 5 * k}Q${x} 7 ${x - 5 * k} 7Q${x} 7 ${x} ${7 - 5 * k}z`}
            fill="currentColor"
          />
        ))}
    </svg>
  );
}
