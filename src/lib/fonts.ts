// Self-hosted web fonts (Fontsource). Each CSS file only declares @font-face rules —
// the actual font files are downloaded lazily by the browser the first time they're used.
import '@fontsource/inter/400.css';
import '@fontsource/inter/800.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/figtree/800.css';
import '@fontsource/figtree/900.css';
import '@fontsource/hind/500.css';
import '@fontsource/hind/700.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/anton/400.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/700.css';
import '@fontsource/righteous/400.css';
import '@fontsource/abril-fatface/400.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/800.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/merriweather/400.css';
import '@fontsource/merriweather/900.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/700.css';
import '@fontsource/dancing-script/500.css';
import '@fontsource/dancing-script/700.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';

import type { FontDef } from './fontList.js';

export * from './fontList.js';

/** Resolves once both weights of a font are ready for canvas drawing */
export function loadFont(font: FontDef) {
  const sample = 'VIZE अ';
  return Promise.all(
    [font.body, font.title].map((w) => document.fonts.load(`${w} 40px ${font.family}`, sample)),
  ).catch(() => undefined);
}
