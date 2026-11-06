// Font registry (pure data, shared by the browser app and the server renderer)

export type FontCategory = 'sans' | 'display' | 'serif' | 'mono' | 'script';

export interface FontDef {
  id: string;
  name: string;
  /** CSS font-family stack */
  family: string;
  category: FontCategory;
  /** Body weight */
  body: number;
  /** Title weight */
  title: number;
  /** Line height (%) this font looks best at — applied when the font is picked */
  lineHeight: number;
  note?: string;
  /** Fontsource package (self-hosted files) — used by the server renderer */
  pkg?: string;
}

const f = (
  id: string, name: string, family: string, category: FontCategory,
  body: number, title: number, lineHeight = 150, note?: string,
): FontDef => ({ id, name, family, category, body, title, lineHeight, note });

export const FONTS: FontDef[] = [
  f('story-bold', 'Story Bold', "'Figtree', system-ui, sans-serif", 'sans', 800, 900, 124, 'Instagram-story look'),
  f('inter', 'Inter', "'Inter', system-ui, sans-serif", 'sans', 400, 800, 150),
  f('poppins', 'Poppins', "'Poppins', system-ui, sans-serif", 'sans', 500, 700, 150),
  f('montserrat', 'Montserrat', "'Montserrat', system-ui, sans-serif", 'sans', 500, 800, 150),
  f('jakarta', 'Plus Jakarta Sans', "'Plus Jakarta Sans', system-ui, sans-serif", 'sans', 500, 800, 150),
  f('dm-sans', 'DM Sans', "'DM Sans', system-ui, sans-serif", 'sans', 400, 700, 150),
  f('outfit', 'Outfit', "'Outfit', system-ui, sans-serif", 'sans', 400, 700, 145),
  f('space-grotesk', 'Space Grotesk', "'Space Grotesk', system-ui, sans-serif", 'sans', 500, 700, 145),
  f('hind', 'Hind (हिन्दी)', "'Hind', system-ui, sans-serif", 'sans', 500, 700, 155, 'Supports Devanagari'),
  f('system', 'System Sans', "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 'sans', 400, 700, 158),

  f('bebas', 'Bebas Neue', "'Bebas Neue', Impact, sans-serif", 'display', 400, 400, 112),
  f('anton', 'Anton', "'Anton', Impact, sans-serif", 'display', 400, 400, 122),
  f('archivo-black', 'Archivo Black', "'Archivo Black', system-ui, sans-serif", 'display', 400, 400, 128),
  f('oswald', 'Oswald', "'Oswald', system-ui, sans-serif", 'display', 500, 700, 132),
  f('righteous', 'Righteous', "'Righteous', system-ui, sans-serif", 'display', 400, 400, 140),
  f('abril', 'Abril Fatface', "'Abril Fatface', Georgia, serif", 'display', 400, 400, 135),

  f('playfair', 'Playfair Display', "'Playfair Display', Georgia, serif", 'serif', 400, 800, 150),
  f('lora', 'Lora', "'Lora', Georgia, serif", 'serif', 400, 700, 155),
  f('dm-serif', 'DM Serif Display', "'DM Serif Display', Georgia, serif", 'serif', 400, 400, 135),
  f('merriweather', 'Merriweather', "'Merriweather', Georgia, serif", 'serif', 400, 900, 160),
  f('cormorant', 'Cormorant Garamond', "'Cormorant Garamond', Georgia, serif", 'serif', 500, 700, 140),
  f('baskerville', 'Libre Baskerville', "'Libre Baskerville', Georgia, serif", 'serif', 400, 700, 160),

  f('jetbrains', 'JetBrains Mono', "'JetBrains Mono', ui-monospace, monospace", 'mono', 400, 700, 150),
  f('space-mono', 'Space Mono', "'Space Mono', ui-monospace, monospace", 'mono', 400, 700, 150),
  f('courier', 'Courier Prime', "'Courier Prime', 'Courier New', monospace", 'mono', 400, 700, 150),

  f('caveat', 'Caveat', "'Caveat', cursive", 'script', 500, 700, 120),
  f('dancing', 'Dancing Script', "'Dancing Script', cursive", 'script', 500, 700, 130),
  f('pacifico', 'Pacifico', "'Pacifico', cursive", 'script', 400, 400, 150),
  f('marker', 'Permanent Marker', "'Permanent Marker', cursive", 'script', 400, 400, 135),
  f('kalam', 'Kalam (हिन्दी)', "'Kalam', cursive", 'script', 400, 700, 140, 'Handwritten, supports Devanagari'),
];

// Fontsource package for each font id (ids that match their package are omitted)
const PKG: Record<string, string | undefined> = {
  'story-bold': 'figtree', jakarta: 'plus-jakarta-sans', bebas: 'bebas-neue', abril: 'abril-fatface',
  playfair: 'playfair-display', 'dm-serif': 'dm-serif-display', cormorant: 'cormorant-garamond',
  baskerville: 'libre-baskerville', jetbrains: 'jetbrains-mono', courier: 'courier-prime',
  dancing: 'dancing-script', marker: 'permanent-marker', system: undefined,
};
for (const font of FONTS) font.pkg = font.id in PKG ? PKG[font.id] : font.id;

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'sans', label: 'Sans' },
  { id: 'display', label: 'Display' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
  { id: 'script', label: 'Script' },
];

export const getFont = (id: string) => FONTS.find((x) => x.id === id) ?? FONTS[1];
