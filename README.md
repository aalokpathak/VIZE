<p align="center">
  <img src="public/logo.svg" alt="VIZE" height="80" />
</p>

<p align="center"><strong>thought → image</strong></p>

VIZE turns your thoughts and quotes into images ready to post on Instagram stories and posts, reels, WhatsApp status, Pinterest and more. Type, pick a look, and export a high-resolution PNG or JPG.

Designing happens entirely in your browser, and your current design is saved locally so it's still there when you come back. A small serverless backend on Vercel adds share links with rich previews, server-side rendering and an optional AI writing assistant.

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
- **Emphasis:** wrap words in `*asterisks*` (or Markdown `**double**`) to colour them. The asterisks themselves never appear in the image.
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

### AI assist (optional)
Shown in the Text tab once an `ANTHROPIC_API_KEY` is configured:
- **Polish** fixes grammar, spelling and flow.
- **Shorten** cuts the text by about 40% so it fits one image.
- **Auto-highlight** marks the key phrases with `**`.
- **Title ideas** suggests headlines you can click to use.
- **Post caption** writes a caption with hashtags to post alongside the image.

Every change can be undone, and your language (English, Hindi, Hinglish…) and voice are kept.

### Export & workflow
- **Save** as PNG or JPG (`Ctrl/Cmd + S`), **Copy** to the clipboard (`Ctrl/Cmd + Shift + C`), or **Share** straight to apps on phones.
- **Link** copies a share link that opens your exact design. When posted on WhatsApp, X, LinkedIn, Slack and similar apps, it shows a preview of the image.
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
| Backend | [Vercel Functions](https://vercel.com/docs/functions) (Node.js) in `api/` |
| Server rendering | [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas), running the **same** layout & render code as the browser |
| AI | [Claude](https://www.anthropic.com/claude) via the Anthropic SDK (optional) |
| Storage | [Upstash Redis](https://upstash.com) via its REST API (optional, free tier) |

The editor is a fast static site (Vite). The backend is a handful of serverless functions that fit comfortably within Vercel's free Hobby plan. The design engine in `src/lib` is plain TypeScript with no DOM or React dependencies, so the browser and the server render designs identically.

## Backend

| Route | What it does |
|---|---|
| `GET /s/<link>` | A share link. Serves Open Graph / Twitter tags for link previews, then opens the design in the editor. |
| `GET /api/og?d=…` | The 1200 × 630 link-preview image: the design on a blurred copy of its own background. |
| `GET /api/render?d=…&type=png` | The full-resolution image of any design, as a URL. Use `type=jpeg` for JPG, and add `&download=1` to download it. |
| `POST /api/links` | Creates a short link like `/s/a8Kd2xQ`. The same design always gets the same id. *Needs Redis.* |
| `POST /api/ai` | AI writing assist. *Needs `ANTHROPIC_API_KEY`.* |
| `GET /api/config` | Tells the editor which optional features are switched on. |

`d` is a share payload: the settings that differ from the defaults, compressed and base64url-encoded. You can use `?id=<short id>` in its place.

### How it stays fast and free
- **Cached at the edge:** a design's image depends only on its URL, so `/api/og` and `/api/render` responses are cached by Vercel's CDN. Each design is rendered once, then served from cache.
- **No database needed:** share links carry the design inside the URL, so links and previews work with zero setup. Redis only adds *short* links.
- **Asset caching:** hashed JS, CSS and font files are cached for a year (`immutable`).
- **Lazy fonts:** fonts load only when used, in the browser and on the server.
- **Hardened:**
  - Every design from a URL is validated (unknown fields are dropped, numbers clamped, text length-limited).
  - The API is rate-limited per IP: 20 AI requests and 30 short links per 10 minutes.
  - The site sends security headers, including a strict Content-Security-Policy.
- **Graceful degradation:** if the API is unreachable, the editor still works fully and server features are simply hidden.

### Optional features

Both are off until you add the variables. See [`.env.example`](.env.example).

| Feature | How to turn it on |
|---|---|
| **AI assist** | Add `ANTHROPIC_API_KEY` (from [console.anthropic.com](https://console.anthropic.com)). Usage is billed to your Anthropic account. |
| **Short links** + shared rate limits | In Vercel, open **Storage → Upstash for Redis** and connect a free database. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you. |

Add the variables in **Vercel → Project → Settings → Environment Variables**, then redeploy. For local development, put them in `.env.local`.

## Getting started

You'll need [Node.js](https://nodejs.org) 20.19+ or 22.12+.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. The dev server also runs the `api/` functions, including the `/s/` rewrite, exactly as Vercel does. You don't need the Vercel CLI.

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

The functions in `api/` and the settings in [`vercel.json`](vercel.json) (rewrites, caching, security headers, function limits) are picked up automatically. No environment variables are required. Add them later to switch on [the optional features](#optional-features).

## Project structure

```
api/                   serverless functions (Vercel)
  share.ts             /s/<link>: link-preview tags, then opens the editor
  og.ts                link-preview image
  render.ts            full-resolution image by URL
  links.ts             short links (Redis)
  ai.ts                AI writing assist (Claude)
  config.ts            which optional features are on
  _lib/                server renderer, Redis client, rate limiter, AI prompts
dev/
  vercelApi.ts         runs api/ inside `npm run dev`
public/
  favicon.svg          app icon
  logo.svg             full logo with wordmark
src/
  main.tsx             entry point, global font & style imports
  App.tsx              app shell, tabs, keyboard shortcuts
  store.ts             design state (persisted) + render stats
  styles.css           UI styles
  components/
    Header.tsx         logo (click = reset), Reset / Copy / Link / Share / Save
    AiAssist.tsx       AI writing assist panel
    CanvasStage.tsx    live canvas preview + size / fill readout
    panels.tsx         Text, Style, Layout and Effects tabs
    ColorPicker.tsx    primary colours, presets, custom picker
    FontPicker.tsx     font list grouped by category
    ThemePicker.tsx    theme gallery by category
    Logo.tsx           SVG logo component
    Toast.tsx, ui.tsx, icons.tsx
  lib/                 shared by the browser and the server
    design.ts          design model, defaults & validation
    layout.ts          text parsing, wrapping & auto-sizing engine
    render.ts          canvas renderer (backgrounds, text, effects)
    share.ts           share-link encoding
    themes.ts          theme definitions
    fontList.ts        font registry
    formats.ts         canvas sizes
    colors.ts          colour helpers & presets
    platform.ts        canvas factory (browser or server)
    fonts.ts           font loading (browser only)
    api.ts             API client (browser only)
    actions.ts         export, share links, reset/undo, toasts (browser only)
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
3. Add an `f(...)` entry to `FONTS` in [`src/lib/fontList.ts`](src/lib/fontList.ts). If the font's id differs from its Fontsource package name, also add it to `PKG` in the same file, so the server renderer can find the files.

> Files in `src/lib` that the server uses import each other with `.js` extensions (e.g. `'./colors.js'`). Keep that when adding imports there: Vercel runs those files as plain Node.js ES modules.
