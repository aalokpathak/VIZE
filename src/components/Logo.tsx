import { useId } from 'react';

interface LogoProps {
  /** Show the VIZE wordmark next to the mark */
  wordmark?: boolean;
  height?: number;
}

/** VIZE brand mark: a gradient tile with a "V" and a spark of thought, plus a stroked wordmark. */
export function Logo({ wordmark = true, height = 32 }: LogoProps) {
  const id = useId().replace(/:/g, '');
  const width = wordmark ? (height * 196) / 64 : height;
  return (
    <svg
      viewBox={wordmark ? '0 0 196 64' : '0 0 64 64'}
      width={width}
      height={height}
      role="img"
      aria-label="VIZE"
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7C5CFF" />
          <stop offset="0.55" stopColor="#FF3D8B" />
          <stop offset="1" stopColor="#FFA53C" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}g)`} />
      <path d="M14 22 L28 48 L42 22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M51 7 Q52.2 12.8 58 14 Q52.2 15.2 51 21 Q49.8 15.2 44 14 Q49.8 12.8 51 7Z" fill="#fff" />
      {wordmark && (
        <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M82 19 L94 45 L106 19" />
          <path d="M118 19 V45" />
          <path d="M130 19 H152 L130 45 H152" />
          <path d="M186 19 H166 V45 H186 M166 32 H181" />
        </g>
      )}
    </svg>
  );
}
