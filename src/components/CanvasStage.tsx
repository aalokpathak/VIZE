import { useEffect, useRef, useState } from 'react';
import { registerCanvas, setPendingRender } from '../lib/actions';
import { getFont, loadFont } from '../lib/fonts';
import { getFormat } from '../lib/formats';
import { clearMeasureCache, computeLayout } from '../lib/layout';
import { renderDesign, resolveTheme } from '../lib/render';
import { getTheme } from '../lib/themes';
import { useDesign, useStats } from '../store';

export function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const d = useDesign();
  const stats = useStats();
  // Bumped whenever web fonts finish loading, so text is re-measured with real metrics
  const [fontEpoch, setFontEpoch] = useState(0);
  const fmt = getFormat(d.formatId);
  const font = getFont(d.fontId);

  useEffect(() => {
    registerCanvas(canvasRef.current);
    return () => registerCanvas(null);
  }, []);

  useEffect(() => {
    const bump = () => {
      clearMeasureCache();
      setFontEpoch((n) => n + 1);
    };
    document.fonts.addEventListener('loadingdone', bump);
    return () => document.fonts.removeEventListener('loadingdone', bump);
  }, []);

  useEffect(() => {
    let alive = true;
    loadFont(font).then(() => {
      if (!alive) return;
      clearMeasureCache();
      setFontEpoch((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [font]);

  // Render on the next animation frame — collapses bursts of slider input into one draw
  useEffect(() => {
    const draw = () => {
      setPendingRender(null);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const layout = computeLayout(d, fmt, font);
      renderDesign(ctx, d, resolveTheme(d, getTheme(d.themeId)), layout);
      useStats.getState().setStats({ bodySize: layout.body.size, fill: Math.min(100, layout.fill) });
    };
    setPendingRender(draw);
    const frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      setPendingRender(null);
    };
  }, [d, fmt, font, fontEpoch]);

  const fillTone = stats.fill >= 98 ? 'full' : stats.fill >= 70 ? 'good' : stats.fill >= 35 ? 'ok' : 'low';

  return (
    <div className="stage">
      <div className="stage-canvas">
        <canvas
          ref={canvasRef}
          width={fmt.w}
          height={fmt.h}
          aria-label="Image preview"
          role="img"
        />
      </div>
      <div className="stage-meta">
        <span>
          {fmt.name} · {fmt.w} × {fmt.h}
        </span>
        <span className="dot" />
        <span>
          {d.mode === 'manual' ? 'Manual' : d.mode === 'fill' ? 'Fill' : 'Auto'} · {stats.bodySize}px
        </span>
        <span className="dot" />
        <span className={`fill fill-${fillTone}`}>
          <span className="fill-bar">
            <span style={{ width: `${stats.fill}%` }} />
          </span>
          {stats.fill}% filled
        </span>
      </div>
    </div>
  );
}
