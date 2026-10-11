import { create } from 'zustand';
import { useDesign, useStats, type ExportType } from '../store';
import { getFormat } from './formats';

// ---------- Toasts ----------

interface ToastState {
  id: number;
  message: string;
  kind: 'success' | 'error';
  action?: { label: string; run: () => void };
  show: (message: string, opts?: { kind?: 'success' | 'error'; action?: ToastState['action'] }) => void;
  hide: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>()((set) => ({
  id: 0,
  message: '',
  kind: 'success',
  show: (message, opts = {}) => {
    clearTimeout(toastTimer);
    set((s) => ({ id: s.id + 1, message, kind: opts.kind ?? 'success', action: opts.action }));
    toastTimer = setTimeout(() => set({ message: '' }), opts.action ? 6000 : 2800);
  },
  hide: () => set({ message: '' }),
}));

export const toast = (...args: Parameters<ToastState['show']>) => useToast.getState().show(...args);

// ---------- App session (bumping `epoch` remounts the UI, like a page reload) ----------

export const useSession = create<{ epoch: number }>()(() => ({ epoch: 0 }));

/** Reset every setting and text box to defaults, as if the page were freshly loaded — with undo */
export function resetEverything() {
  const prev = useDesign.getState().reset();
  useStats.setState({ fill: 0 });
  useSession.setState((s) => ({ epoch: s.epoch + 1 }));
  window.scrollTo({ top: 0 });
  toast('Everything reset', {
    action: {
      label: 'Undo',
      run: () => {
        useDesign.getState().restore(prev);
        useSession.setState((s) => ({ epoch: s.epoch + 1 }));
        toast('Restored your previous design');
      },
    },
  });
}

// ---------- Export ----------

let canvasEl: HTMLCanvasElement | null = null;
export const registerCanvas = (c: HTMLCanvasElement | null) => {
  canvasEl = c;
};

/** A render scheduled for the next frame but not drawn yet */
let pendingRender: (() => void) | null = null;
export const setPendingRender = (fn: (() => void) | null) => {
  pendingRender = fn;
};

/** Draw any change that's still waiting for the next animation frame */
export const flushRender = () => pendingRender?.();

function toBlob(type: ExportType): Promise<Blob> {
  // Never export a stale frame
  flushRender();
  return new Promise((resolve, reject) => {
    if (!canvasEl) return reject(new Error('Canvas not ready'));
    canvasEl.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), `image/${type}`, 0.95);
  });
}

function fileName(type: ExportType) {
  const { formatId } = useDesign.getState();
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `vize-${getFormat(formatId).id}-${ts}.${type === 'jpeg' ? 'jpg' : 'png'}`;
}

export async function downloadImage() {
  const { exportType } = useDesign.getState();
  try {
    const blob = await toBlob(exportType);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(exportType);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`Saved ${exportType === 'jpeg' ? 'JPG' : 'PNG'}`);
  } catch {
    toast('Could not save the image', { kind: 'error' });
  }
}

export async function copyImage() {
  try {
    // Pass a promise so Safari keeps the user-gesture context
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': toBlob('png') })]);
    toast('Image copied to clipboard');
  } catch {
    toast('Copy is blocked by this browser — use Save instead', { kind: 'error' });
  }
}

export const canShareFiles = () =>
  typeof navigator !== 'undefined' &&
  'canShare' in navigator &&
  navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] });

export async function shareImage() {
  const { exportType } = useDesign.getState();
  try {
    const blob = await toBlob(exportType);
    await navigator.share({ files: [new File([blob], fileName(exportType), { type: blob.type })], title: 'VIZE' });
  } catch (e) {
    if ((e as Error).name !== 'AbortError') toast('Sharing failed', { kind: 'error' });
  }
}
