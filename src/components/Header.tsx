import { useEffect, useState } from 'react';
import { canShareFiles, copyImage, downloadImage, resetEverything, shareImage } from '../lib/actions';
import { useDesign } from '../store';
import { IconCopy, IconDownload, IconReset, IconShare } from './icons';
import { Logo } from './Logo';

export function Header() {
  const exportType = useDesign((s) => s.exportType);
  const set = useDesign((s) => s.set);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(!!canShareFiles()), []);

  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={resetEverything} title="Start fresh (resets everything)">
        <Logo height={30} />
        <span className="tagline">thought → image</span>
      </button>

      <div className="topbar-actions">
        <button type="button" className="btn ghost" onClick={resetEverything} title="Reset all settings and text">
          <IconReset />
          <span>Reset</span>
        </button>
        <button type="button" className="btn ghost hide-sm" onClick={copyImage} title="Copy PNG to clipboard">
          <IconCopy />
          <span>Copy</span>
        </button>
        {canShare && (
          <button type="button" className="btn ghost" onClick={shareImage} title="Share image">
            <IconShare />
            <span>Share</span>
          </button>
        )}
        <div className="save-group">
          <select
            aria-label="File type"
            value={exportType}
            onChange={(e) => set({ exportType: e.target.value as typeof exportType })}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </select>
          <button type="button" className="btn primary" onClick={downloadImage} title="Download (Ctrl/Cmd + S)">
            <IconDownload />
            <span>Save</span>
          </button>
        </div>
      </div>
    </header>
  );
}
