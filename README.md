# VIZE · thought → image

VIZE turns text into 1080 × 1920 (9:16) images for Instagram stories, reels and WhatsApp status. Type or paste a thought or quote, pick a theme, and export a high-resolution PNG.

It's a static web app (plain HTML, CSS and JavaScript). There's nothing to build or install.

## Features

- **Smart layout modes**
  - **Auto Fit** picks a font size based on how long the text is.
  - **Fill Space** makes the text as large as possible while still fitting on the page.
  - **Manual** gives you full control of every setting.
- **Title + body.** The title is optional and is drawn in uppercase above the body, with a divider (Line, Dots, Double or None).
- **6 canvas fonts:** Geometric Sans, Playfair Display, Lora, Monospace, Plus Jakarta Sans and Story Bold (extra-bold Figtree with tight line spacing, for the Instagram-story look).
- **Fine-grained spacing:** font size, side margins, vertical padding, content zoom, line height and paragraph gap.
- **Alignment:** left, center or justify.
- **34 themes**
  - 22 solid palettes (Pure White, Midnight Black, Warm Cream, Slate Blue, Neon Night, …)
  - 12 **gradient themes**, including Sunset Reel, Orange Blaze, Aqua Lime, Insta Glow, Purple Haze, Ocean Dusk, Aurora, Mango Tango, Cotton Candy, Mint Breeze, Peach Fuzz and Cyber Grape. Some layer soft radial "glow" blobs over the gradient.
- **Caption Highlight Boxes** put each line on a rounded black box with white text, like reel captions.
- **Effects:** vignette shadow and corner accents.
- **Live preview** with its own preview zoom (this doesn't change the exported image) and a "page filled" meter.
- **Export:** save as PNG (or press `Ctrl/Cmd + S`), or copy the image straight to the clipboard.

## Getting started

Open `index.html` in any modern browser.

Some browsers only allow clipboard copy on `http://`/`https://` pages. If that's the case, serve the folder locally:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>.

## Usage

1. Enter an optional **title** and your **content**. Separate paragraphs with a blank line.
2. Choose a **font**, **layout mode** and **alignment**.
3. Pick a theme from the **Themes** sidebar next to the preview. Gradient themes are listed under **Gradients**.
4. Optionally turn on **Caption Highlight Boxes**, **Vignette** or **Corner Accents**.
5. Click **Save Image** or **Copy Image**.

## Adding your own theme

Themes are defined in the `THEMES` object at the top of [`app.js`](app.js). Colors are `[r, g, b]` arrays.

```js
// Solid theme
"My Theme": { bg: [20,20,20], title: [255,255,255], text: [220,220,220], div: [80,80,80] },

// Gradient theme
"My Gradient": {
    bg: [255,80,80],                    // fallback color
    title: [255,255,255], text: [255,255,255], div: [255,230,220],
    grad: {
        angle: 160,                     // CSS linear-gradient degrees
        stops: [[0,[255,20,110]], [1,[255,150,0]]],
        glows: [{ x: 0.9, y: 0.5, r: 0.55, c: [255,225,40], a: 0.75 }]  // optional
    }
},
```

The swatch button for a new theme is generated automatically.

## Project structure

```
index.html   – UI markup
style.css    – dark glassmorphism UI styling
app.js       – themes, layout engine, canvas renderer, UI bindings
```
