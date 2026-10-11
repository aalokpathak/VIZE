<p align="center">
  <img src="public/logo.svg" alt="VIZE" height="80" />
</p>

<p align="center"><strong>thought → image</strong></p>

VIZE turns your thoughts and quotes into images ready to post on Instagram stories and posts, reels, WhatsApp status, Pinterest and more. Type, pick a look, and export a high-resolution PNG or JPG.

It runs entirely in the browser. Nothing is uploaded anywhere, and your current design is saved locally so it's still there when you come back.

## Features

### Canvas
- **5 sizes:** Story / Reel 9:16 (1080 × 1920), Portrait Post 4:5 (1080 × 1350), Square 1:1 (1080 × 1080), Pinterest Pin 2:3 (1000 × 1500) and Landscape 16:9 (1920 × 1080).
- **48 themes** in three groups:
  - **Solid:** 26 palettes, such as Pure White, Midnight Black, Warm Cream and Electric Blue.
  - **Gradient:** 16 themes, such as Sunset Reel, Orange Blaze, Aqua Lime and Insta Glow.
  - **Mesh:** 6 themes made of soft blurred colour blobs, such as Aurora, Midnight Mesh and Lava Lamp.
- **Custom background:** pick your own solid colour, or a two-colour gradient at any angle.
- **Textures:** film grain, dots, grid, diagonal lines or ruled paper, with adjustable intensity.

### Typography
- **30 self-hosted fonts** in five groups: Sans, Display, Serif, Mono and Script. This includes **Story Bold** for the Instagram-story look, and two fonts that support Hindi (Devanagari): **Hind** and **Kalam**.
- Each font comes with its own body and title weights, and an ideal line height that is applied automatically when you pick it.
- **Font colour** for the body, the title and *emphasis* separately. The primary colours (red, yellow, blue, black, white) come first, followed by more presets, a full colour picker and a hex input. **Auto** follows the theme.
- **Emphasis:** wrap words in `*asterisks*` to colour them.
- **Line breaks:** a single new line breaks the line; a blank line starts a new paragraph.
- **Signature:** an optional handle such as `@yourname`, shown at the bottom.

### Layout
- **Auto fit** picks the size from how long your text is. **Fill space** makes the text as large as possible while still fitting. **Manual** lets you set the size yourself.
- **Alignment:** left, centre, right or justify, plus top, middle or bottom.
- **Spacing:** title size, line height, paragraph gap, letter spacing, margins, padding and content zoom.

### Effects
- **Text effects:** plain, **caption boxes** (the black-pill reel captions, in any box colour), shadow, outline and glow.
- **Title dividers:** line, double, dots or diamond.
- **Decorations:** vignette, corner accents and a border frame.

### Export & workflow
- **Save** as PNG or JPG (`Ctrl/Cmd + S`), **Copy** to the clipboard (`Ctrl/Cmd + Shift + C`), or **Share** straight to apps on phones.
- **Reset**, or clicking the **VIZE logo**, clears every setting and text box, like reloading a fresh page. An **Undo** button appears in case you didn't mean it.
- **Responsive:** works on phones as well as desktops.

## Tech stack

| | |
|---|---|
| UI | [React 19](https://react.dev) + TypeScript |
| Build tool | [Vite](https://vite.dev) |
| State | [Zustand](https://zustand.docs.pmnd.rs) (with localStorage persistence) |
| Fonts | [Fontsource](https://fontsource.org): self-hosted, loaded only when used |
| Rendering | HTML5 Canvas 2D, drawn at full export resolution |

VIZE is purely client-side, so it builds to a small static site and doesn't need a server. That's why it uses Vite rather than a server framework like Next.js.

## Getting started

You'll need [Node.js](https://nodejs.org) 20.19+ or 22.12+.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |

## Deploying to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Vercel detects **Vite** automatically: the build command is `npm run build` and the output directory is `dist`.
3. Click **Deploy**.

No environment variables or extra config are needed.

## Project structure

```
public/
  favicon.svg          app icon
  logo.svg             full logo with wordmark
src/
  main.tsx             entry point, global font & style imports
  App.tsx              app shell, tabs, keyboard shortcuts
  store.ts             design state (persisted) + render stats
  styles.css           UI styles
  components/
    Header.tsx         logo (click = reset), Reset / Copy / Share / Save
    CanvasStage.tsx    live canvas preview + size / fill readout
    panels.tsx         Text, Style, Layout and Effects tabs
    ColorPicker.tsx    primary colours, presets, custom picker
    FontPicker.tsx     font list grouped by category
    ThemePicker.tsx    theme gallery by category
    Logo.tsx           SVG logo component
    Toast.tsx, ui.tsx, icons.tsx
  lib/
    layout.ts          text parsing, wrapping & auto-sizing engine
    render.ts          canvas renderer (backgrounds, text, effects)
    themes.ts          theme definitions
    fonts.ts           font registry
    formats.ts         canvas sizes
    colors.ts          colour helpers & presets
    actions.ts         export, reset/undo, toasts
```

## Customising

### Adding a theme

Add an entry to `THEMES` in [`src/lib/themes.ts`](src/lib/themes.ts). Its swatch appears automatically.

```ts
gradient('My Theme', 'gradient', [255, 80, 80], /* title */ [255, 255, 255], /* text */ [255, 255, 255], /* accent */ [255, 220, 120], {
  angle: 160,                                   // CSS linear-gradient degrees
  stops: [[0, [255, 20, 110]], [1, [255, 150, 0]]],
  glows: [{ x: 0.9, y: 0.5, r: 0.55, c: [255, 225, 40], a: 0.75 }], // optional soft light blobs
}),
```

### Adding a font

1. Install it:

   ```bash
   npm i @fontsource/<font-name>
   ```

2. Import the weights you need at the top of [`src/lib/fonts.ts`](src/lib/fonts.ts).
3. Add an `f(...)` entry to `FONTS`.
