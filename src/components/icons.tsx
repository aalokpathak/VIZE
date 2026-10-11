import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

type P = SVGProps<SVGSVGElement>;

export const IconReset = (p: P) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
);
export const IconCopy = (p: P) => (
  <svg {...base(p)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
);
export const IconShare = (p: P) => (
  <svg {...base(p)}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4" /><path d="m15.4 6.5-6.8 4" /></svg>
);
export const IconText = (p: P) => (
  <svg {...base(p)}><path d="M4 7V5h16v2" /><path d="M12 5v14" /><path d="M9 19h6" /></svg>
);
export const IconPalette = (p: P) => (
  <svg {...base(p)}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 21 9.7C21 5.9 17 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></svg>
);
export const IconLayout = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3c.7 4.2 2.8 6.3 7 7-4.2.7-6.3 2.8-7 7-.7-4.2-2.8-6.3-7-7 4.2-.7 6.3-2.8 7-7Z" /><path d="M19 3v4M21 5h-4" /></svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconAlign = ({ kind, ...p }: P & { kind: 'left' | 'center' | 'right' | 'justify' }) => {
  const rows: Record<string, [number, number][]> = {
    left: [[4, 20], [4, 14], [4, 18], [4, 12]],
    center: [[4, 20], [7, 17], [5, 19], [8, 16]],
    right: [[4, 20], [10, 20], [6, 20], [12, 20]],
    justify: [[4, 20], [4, 20], [4, 20], [4, 14]],
  };
  return (
    <svg {...base(p)}>
      {rows[kind].map(([a, b], i) => <path key={i} d={`M${a} ${5 + i * 4.6}H${b}`} />)}
    </svg>
  );
};
export const IconVAlign = ({ kind, ...p }: P & { kind: 'top' | 'center' | 'bottom' }) => {
  const y = kind === 'top' ? 6 : kind === 'center' ? 10 : 14;
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="2" opacity=".45" />
      <path d={`M7 ${y}h10M7 ${y + 4}h10`} />
    </svg>
  );
};
