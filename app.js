// --- CONSTANTS & THEMES ---
const IMG_W = 1080;
const IMG_H = 1920;

const THEMES = {
    "Pure White":      { bg: [255,255,255], title: [10,10,10],    text: [28,28,28],    div: [185,185,185] },
    "Midnight Black":  { bg: [10,10,10],    title: [255,255,255],  text: [218,218,218], div: [58,58,58] },
    "Warm Cream":      { bg: [252,246,234], title: [36,20,6],     text: [64,44,28],    div: [198,175,145] },
    "Ink & Paper":     { bg: [237,235,225], title: [10,10,10],    text: [32,32,32],    div: [168,158,138] },
    "Charcoal Smoke":  { bg: [34,34,38],    title: [242,242,246],  text: [202,202,208], div: [60,60,68] },
    "Slate Blue":      { bg: [18,26,46],    title: [226,236,255],  text: [188,200,228], div: [48,66,108] },
    "Royal Navy":      { bg: [8,14,38],     title: [180,210,255],  text: [148,178,220], div: [30,50,110] },
    "Ice Blue":        { bg: [230,242,255], title: [8,40,90],     text: [20,60,120],   div: [170,200,235] },
    "Cerulean":        { bg: [0,119,190],   title: [255,255,255],  text: [220,240,255], div: [0,80,140] },
    "Deep Forest":     { bg: [14,34,24],    title: [210,255,220],  text: [170,220,185], div: [38,76,52] },
    "Sage & Linen":    { bg: [236,240,228], title: [38,50,28],    text: [58,70,44],    div: [172,185,152] },
    "Emerald Dark":    { bg: [4,44,28],     title: [160,255,190],  text: [130,220,160], div: [20,80,50] },
    "Dusty Rose":      { bg: [243,229,229], title: [56,16,30],    text: [74,36,46],    div: [198,162,168] },
    "Crimson Night":   { bg: [28,6,10],     title: [255,190,200],  text: [230,160,170], div: [80,18,28] },
    "Blush Editorial": { bg: [255,238,238], title: [90,20,30],    text: [110,40,50],   div: [220,170,175] },
    "Amber Glow":      { bg: [255,230,170], title: [60,30,0],     text: [80,44,8],     div: [210,165,80] },
    "Burnt Sienna":    { bg: [46,20,8],     title: [255,210,170],  text: [230,180,140], div: [100,50,20] },
    "Terracotta":      { bg: [195,90,50],   title: [255,240,220],  text: [245,220,195], div: [230,110,60] },
    "Deep Violet":     { bg: [18,8,40],     title: [220,200,255],  text: [185,168,235], div: [54,30,100] },
    "Lavender Haze":   { bg: [234,228,248], title: [40,20,80],    text: [58,36,100],   div: [185,168,215] },
    "Neon Night":      { bg: [4,4,12],      title: [0,255,180],    text: [0,210,150],   div: [0,80,55] },
    "Solar Flare":     { bg: [255,100,0],   title: [255,255,220],  text: [255,240,180], div: [220,70,0] },

    // --- Gradient themes ---
    // grad.angle follows CSS linear-gradient degrees (0 = bottom→top, 90 = left→right).
    // grad.glows are soft radial light blobs layered on top (x/y/r relative to canvas width/height).
    "Sunset Reel": {
        bg: [255,70,70], title: [255,255,255], text: [255,255,255], div: [255,235,220],
        grad: { angle: 160, stops: [[0,[255,20,110]], [0.5,[255,80,50]], [1,[255,150,0]]],
                glows: [{ x: 0.9, y: 0.5, r: 0.55, c: [255,225,40], a: 0.75 }] }
    },
    "Aqua Lime": {
        bg: [40,200,160], title: [18,18,18], text: [24,24,24], div: [30,60,50],
        grad: { angle: 220, stops: [[0,[60,170,255]], [0.4,[20,215,200]], [0.75,[30,215,90]], [1,[245,190,20]]] }
    },
    "Insta Glow": {
        bg: [220,60,120], title: [255,255,255], text: [255,245,250], div: [255,210,230],
        grad: { angle: 30, stops: [[0,[254,218,117]], [0.3,[250,126,30]], [0.55,[214,41,118]], [0.8,[150,47,191]], [1,[79,91,213]]] }
    },
    "Purple Haze": {
        bg: [150,50,200], title: [255,255,255], text: [245,235,255], div: [220,190,255],
        grad: { angle: 150, stops: [[0,[100,40,230]], [0.55,[190,50,200]], [1,[255,90,150]]],
                glows: [{ x: 0.15, y: 0.15, r: 0.5, c: [80,160,255], a: 0.45 }] }
    },
    "Ocean Dusk": {
        bg: [40,40,110], title: [255,255,255], text: [225,230,255], div: [150,140,220],
        grad: { angle: 180, stops: [[0,[12,20,70]], [0.55,[80,40,150]], [1,[235,95,125]]] }
    },
    "Aurora": {
        bg: [8,16,34], title: [230,255,245], text: [200,235,225], div: [60,140,120],
        grad: { angle: 180, stops: [[0,[6,12,30]], [1,[14,24,48]]],
                glows: [{ x: 0.2, y: 0.25, r: 0.6, c: [0,230,160], a: 0.45 },
                        { x: 0.85, y: 0.6, r: 0.55, c: [140,60,255], a: 0.45 }] }
    },
    "Mango Tango": {
        bg: [255,160,40], title: [45,20,0], text: [60,28,4], div: [140,70,20],
        grad: { angle: 135, stops: [[0,[255,225,40]], [0.55,[255,150,40]], [1,[255,90,70]]] }
    },
    "Cotton Candy": {
        bg: [210,190,240], title: [50,30,90], text: [66,44,110], div: [160,130,200],
        grad: { angle: 135, stops: [[0,[165,205,255]], [0.5,[215,190,250]], [1,[255,185,215]]] }
    },
    "Mint Breeze": {
        bg: [150,230,220], title: [10,50,60], text: [20,70,80], div: [90,160,160],
        grad: { angle: 160, stops: [[0,[190,255,215]], [1,[120,195,255]]] }
    },
    "Peach Fuzz": {
        bg: [255,190,170], title: [80,30,30], text: [100,45,40], div: [210,130,120],
        grad: { angle: 180, stops: [[0,[255,220,180]], [1,[255,150,165]]],
                glows: [{ x: 0.8, y: 0.2, r: 0.45, c: [255,245,210], a: 0.6 }] }
    },
    "Orange Blaze": {
        bg: [255,120,30], title: [18,10,6], text: [18,10,6], div: [90,30,10],
        grad: { angle: 180, stops: [[0,[250,125,40]], [0.45,[255,125,20]], [0.72,[255,95,45]], [0.9,[255,45,95]], [1,[255,20,115]]],
                glows: [{ x: 0.0, y: 0.08, r: 0.4, c: [220,60,85], a: 0.75 },
                        { x: 1.0, y: 0.5, r: 0.3, c: [255,225,60], a: 0.95 }] }
    },
    "Cyber Grape": {
        bg: [30,10,60], title: [255,255,255], text: [230,220,255], div: [255,60,200],
        grad: { angle: 200, stops: [[0,[20,5,50]], [0.6,[60,15,110]], [1,[180,20,140]]],
                glows: [{ x: 0.1, y: 0.9, r: 0.5, c: [0,220,255], a: 0.35 }] }
    },
};

// Caption-style highlight box colours (black pill with white text, like Instagram reels)
const HIGHLIGHT_BG = 'rgba(0,0,0,0.92)';
const HIGHLIGHT_TEXT = 'rgb(255,255,255)';

// Fill the whole canvas with a theme's background (solid or gradient + glows)
function paintBackground(ctx, theme, w, h) {
    ctx.fillStyle = `rgb(${theme.bg.join(',')})`;
    ctx.fillRect(0, 0, w, h);
    if (!theme.grad) return;

    // CSS-style angle → gradient line through the centre that spans the whole box
    const rad = theme.grad.angle * Math.PI / 180;
    const dx = Math.sin(rad), dy = -Math.cos(rad);
    const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
    const lg = ctx.createLinearGradient(w/2 - dx*half, h/2 - dy*half, w/2 + dx*half, h/2 + dy*half);
    theme.grad.stops.forEach(([pos, c]) => lg.addColorStop(pos, `rgb(${c.join(',')})`));
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    (theme.grad.glows || []).forEach(g => {
        const r = g.r * Math.max(w, h);
        const rg = ctx.createRadialGradient(g.x * w, g.y * h, 0, g.x * w, g.y * h, r);
        rg.addColorStop(0, `rgba(${g.c.join(',')},${g.a})`);
        rg.addColorStop(1, `rgba(${g.c.join(',')},0)`);
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, w, h);
    });
}

// CSS equivalent of a theme background, used for swatch buttons
function themeCss(theme) {
    if (!theme.grad) return `rgb(${theme.bg.join(',')})`;
    const layers = (theme.grad.glows || []).map(g =>
        `radial-gradient(circle at ${g.x*100}% ${g.y*100}%, rgba(${g.c.join(',')},${g.a}), transparent 60%)`);
    const stops = theme.grad.stops.map(([p, c]) => `rgb(${c.join(',')}) ${p*100}%`).join(', ');
    layers.push(`linear-gradient(${theme.grad.angle}deg, ${stops})`);
    return layers.join(', ');
}

// Rounded caption box behind a line of text drawn at baseline `y`
function drawHighlightBox(ctx, x, y, w, size) {
    const padX = size * 0.35, top = y - size * 0.95, bottom = y + size * 0.3;
    const bx = x - padX, bw = w + padX * 2, bh = bottom - top, r = size * 0.18;
    ctx.save();
    ctx.fillStyle = HIGHLIGHT_BG;
    ctx.beginPath();
    ctx.moveTo(bx + r, top);
    ctx.arcTo(bx + bw, top, bx + bw, top + bh, r);
    ctx.arcTo(bx + bw, top + bh, bx, top + bh, r);
    ctx.arcTo(bx, top + bh, bx, top, r);
    ctx.arcTo(bx, top, bx + bw, top, r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// --- CORE LAYOUT & DRAWING ALGORITHMS ---
const dummyCanvas = document.createElement('canvas');
const dummyCtx = dummyCanvas.getContext('2d');

// Load custom google fonts for different canvas designs
const FONTS = {
    "Sans-Serif": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    "Serif Elegant": "'Playfair Display', Georgia, Cambria, 'Times New Roman', Times, serif",
    "Modern Serif": "'Lora', serif",
    "Monospace Minimal": "'Courier New', Courier, monospace",
    "Geometric Clean": "'Plus Jakarta Sans', sans-serif",
    "Story Bold": "'Figtree', 'Plus Jakarta Sans', system-ui, sans-serif"
};

// Per-font weight overrides: [body weight, title weight]. Fonts not listed use normal / bold.
const FONT_WEIGHTS = {
    "Story Bold": [800, 900]
};

// Line height (%) a font is designed to be set at; applied when the font is picked
const FONT_LINE_HEIGHTS = {
    "Story Bold": 124
};
const DEFAULT_LINE_HEIGHT = 158;

function fontWeight(styleName, isBold) {
    const w = FONT_WEIGHTS[styleName];
    return w ? w[isBold ? 1 : 0] : (isBold ? 'bold' : 'normal');
}

function getCanvasFont(styleName) {
    return FONTS[styleName] || FONTS["Sans-Serif"];
}

function textPx(text, fontSize, isBold, fontStyleName) {
    const font = getCanvasFont(fontStyleName);
    dummyCtx.font = `${fontWeight(fontStyleName, isBold)} ${fontSize}px ${font}`;
    return dummyCtx.measureText(text).width;
}

function wrapPixels(text, fontSize, isBold, maxPx, fontStyleName) {
    let words = text.replace(/\n/g, ' ').split(' ').filter(w => w !== '');
    if (!words.length) return [""];
    let lines = [], cur = words[0];
    for (let i = 1; i < words.length; i++) {
        let cand = cur + " " + words[i];
        if (textPx(cand, fontSize, isBold, fontStyleName) <= maxPx) {
            cur = cand;
        } else {
            lines.push(cur);
            cur = words[i];
        }
    }
    lines.push(cur);
    return lines;
}

function computeLayout(title, content, params) {
    let margin = parseInt(params.margin || 52);
    let safePad = parseInt(params.safePad || 120);
    let fontStyle = params.fontStyle || "Sans-Serif";
    let contentW = IMG_W - margin * 2;
    let safeTop = safePad;
    let safeBot = IMG_H - safePad;
    let usableH = safeBot - safeTop;

    let lhPct = parseFloat(params.lineH || 158) / 100;
    let pgPct = parseFloat(params.paraGap || 115) / 100;
    let mode = params.mode || "auto";

    let bodySz, titleSz;
    let paras = content.split('\n\n').filter(x => x.trim().length > 0);

    let est = (bs, ts) => {
        let lh = Math.floor(bs * lhPct), pg = Math.floor(bs * pgPct), th = Math.floor(ts * 1.45);
        let h = 0;
        if (title) {
            let tl = wrapPixels(title, ts, true, contentW, fontStyle);
            h += tl.length * th + Math.floor(bs * 2.0); // Divider gap
        }
        for (let i = 0; i < paras.length; i++) {
            let bl = wrapPixels(paras[i], bs, false, contentW, fontStyle);
            h += bl.length * lh;
            if (i < paras.length - 1) h += pg;
        }
        return h;
    };

    if (mode === "manual") {
        bodySz = parseInt(params.bodySz || 42);
        titleSz = parseInt(params.titleSz || Math.floor(bodySz * 1.2));
    } else if (mode === "fill") {
        bodySz = 110;
        titleSz = Math.floor(bodySz * 1.2);
        while (bodySz > 18 && est(bodySz, titleSz) > usableH) {
            bodySz -= 1;
            titleSz = Math.max(18, Math.floor(bodySz * 1.2));
        }
    } else { // auto layout based on text content length
        let n = content.length;
        if (n <= 150) bodySz = 66;
        else if (n <= 320) bodySz = 56;
        else if (n <= 550) bodySz = 48;
        else if (n <= 850) bodySz = 42;
        else if (n <= 1200) bodySz = 36;
        else if (n <= 1700) bodySz = 31;
        else bodySz = 26;

        titleSz = Math.min(bodySz + 8, Math.floor(bodySz * 1.2));
        for (let i = 0; i < 20; i++) {
            if (est(bodySz, titleSz) <= usableH) break;
            bodySz = Math.max(bodySz - 2, 18);
            titleSz = Math.max(titleSz - 2, 22);
        }
    }

    return {
        bodySz, titleSz,
        lineH: Math.floor(bodySz * lhPct),
        paraGap: Math.floor(bodySz * pgPct),
        titleLh: Math.floor(titleSz * 1.45),
        divGap: Math.floor(bodySz * 2.0),
        margin, contentW, safeTop, usableH
    };
}

function estimateFillPct(lp, title, content, fontStyle) {
    let total = 0;
    if (title) {
        let tl = wrapPixels(title, lp.titleSz, true, lp.contentW, fontStyle);
        total += tl.length * lp.titleLh + lp.divGap;
    }
    let paras = content.split('\n\n').filter(p => p.trim());
    for (let i = 0; i < paras.length; i++) {
        let bl = wrapPixels(paras[i], lp.bodySz, false, lp.contentW, fontStyle);
        total += bl.length * lp.lineH;
        if (i < paras.length - 1) total += lp.paraGap;
    }
    return Math.min(100, Math.floor((total / lp.usableH) * 100));
}

// --- RENDER ENGINE ---
function renderImage(title, content, themeName, dividerStyle, align, vignette, cornerAccents, highlight, params) {
    const canvas = document.getElementById('renderCanvas');
    const ctx = canvas.getContext('2d');
    const theme = THEMES[themeName] || THEMES["Pure White"];
    const lp = computeLayout(title, content, params);
    const font = getCanvasFont(params.fontStyle);

    // Reset Canvas State & Fill Solid Background
    ctx.restore();
    ctx.save();

    // Clear canvas & fill background (before zoom, so zooming out never leaves empty edges)
    ctx.clearRect(0, 0, IMG_W, IMG_H);
    paintBackground(ctx, theme, IMG_W, IMG_H);

    // Apply entire content zoom
    const zoom = parseFloat(params.zoom || 1.0);
    if (zoom !== 1.0) {
        ctx.translate(IMG_W / 2, IMG_H / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-IMG_W / 2, -IMG_H / 2);
    }

    // Layout Text calculations
    let tLines = title ? wrapPixels(title, lp.titleSz, true, lp.contentW, params.fontStyle) : [];
    let paras = content.split('\n\n').filter(p => p.trim());
    let bodyLines = paras.map(p => wrapPixels(p, lp.bodySz, false, lp.contentW, params.fontStyle));

    let totalH = 0;
    if (tLines.length) totalH += tLines.length * lp.titleLh + lp.divGap;
    bodyLines.forEach((lines, i) => {
        totalH += lines.length * lp.lineH;
        if (i < bodyLines.length - 1) totalH += lp.paraGap;
    });

    let cy = (params.mode === "fill") 
        ? lp.safeTop 
        : lp.safeTop + Math.max(0, Math.floor((lp.usableH - totalH) / 2));

    // Draw Title
    if (tLines.length) {
        ctx.fillStyle = `rgb(${theme.title.join(',')})`;
        ctx.font = `${fontWeight(params.fontStyle, true)} ${lp.titleSz}px ${font}`;
        tLines.forEach(line => {
            let str = line.toUpperCase();
            let w = textPx(str, lp.titleSz, true, params.fontStyle);
            let x = (align === "center") ? (IMG_W - w) / 2 : (align === "left" ? lp.margin : IMG_W - lp.margin - w);
            if (highlight) {
                drawHighlightBox(ctx, x, cy + lp.titleSz, w, lp.titleSz);
                ctx.fillStyle = HIGHLIGHT_TEXT;
            }
            ctx.fillText(str, x, cy + lp.titleSz);
            cy += lp.titleLh;
        });

        // Divider (Sleek minimalist style)
        if (dividerStyle !== "none") {
            let divY = cy + Math.floor(lp.divGap / 3);
            let cx = IMG_W / 2;
            ctx.fillStyle = `rgb(${theme.div.join(',')})`;
            ctx.strokeStyle = `rgb(${theme.div.join(',')})`;

            if (dividerStyle === "dots") {
                let r = Math.max(4, Math.floor(lp.bodySz * 0.08));
                let gap = r * 5;
                [-gap, 0, gap].forEach(dx => {
                    ctx.beginPath();
                    ctx.arc(cx + dx, divY, r, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (dividerStyle === "double") {
                let dlen = Math.min(180, Math.floor(lp.contentW * 0.22));
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx - dlen/2, divY); ctx.lineTo(cx + dlen/2, divY); ctx.stroke();
                ctx.lineWidth = 1.0;
                ctx.beginPath(); ctx.moveTo(cx - dlen/2, divY + 6); ctx.lineTo(cx + dlen/2, divY + 6); ctx.stroke();
            } else { // line (thinner, more minimalist default)
                let dlen = Math.min(160, Math.floor(lp.contentW * 0.18));
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx - dlen/2, divY); ctx.lineTo(cx + dlen/2, divY); ctx.stroke();
            }
        }
        cy += lp.divGap;
    }

    // Draw Body
    ctx.fillStyle = highlight ? HIGHLIGHT_TEXT : `rgb(${theme.text.join(',')})`;
    ctx.font = `${fontWeight(params.fontStyle, false)} ${lp.bodySz}px ${font}`;

    bodyLines.forEach((lines, pi) => {
        lines.forEach((line, li) => {
            let words = line.split(' ');
            let isLast = li === lines.length - 1;
            
            if (align === "justify" && !isLast && words.length > 1) {
                let totalW = words.reduce((acc, w) => acc + textPx(w, lp.bodySz, false, params.fontStyle), 0);
                let gap = (lp.contentW - totalW) / (words.length - 1);
                let x = lp.margin;
                if (highlight) drawHighlightBox(ctx, x, cy + lp.bodySz, lp.contentW, lp.bodySz);
                words.forEach(word => {
                    ctx.fillText(word, x, cy + lp.bodySz);
                    x += textPx(word, lp.bodySz, false, params.fontStyle) + gap;
                });
            } else {
                let w = textPx(line, lp.bodySz, false, params.fontStyle);
                let x = (align === "center") ? (IMG_W - w) / 2 : (align === "left" ? lp.margin : IMG_W - lp.margin - w);
                if (highlight) drawHighlightBox(ctx, x, cy + lp.bodySz, w, lp.bodySz);
                ctx.fillText(line, x, cy + lp.bodySz);
            }
            cy += lp.lineH;
        });
        if (pi < bodyLines.length - 1) cy += lp.paraGap;
    });

    // Draw Corner Accents (only if checked)
    if (cornerAccents) {
        ctx.strokeStyle = `rgb(${theme.div.join(',')})`;
        ctx.lineWidth = 1.5;
        let sz = 20, pad = 36;
        let corners = [
            [[pad, pad+sz], [pad, pad], [pad+sz, pad]],
            [[IMG_W-pad-sz, pad], [IMG_W-pad, pad], [IMG_W-pad, pad+sz]],
            [[pad, IMG_H-pad-sz], [pad, IMG_H-pad], [pad+sz, IMG_H-pad]],
            [[IMG_W-pad-sz, IMG_H-pad], [IMG_W-pad, IMG_H-pad], [IMG_W-pad, IMG_H-pad-sz]]
        ];
        corners.forEach(seg => {
            ctx.beginPath();
            ctx.moveTo(seg[0][0], seg[0][1]);
            ctx.lineTo(seg[1][0], seg[1][1]);
            ctx.lineTo(seg[2][0], seg[2][1]);
            ctx.stroke();
        });
    }

    // Vignette Effect
    if (vignette) {
        let grad = ctx.createRadialGradient(IMG_W/2, IMG_H/2, IMG_W*0.3, IMG_W/2, IMG_H/2, IMG_H*0.75);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, IMG_W, IMG_H);
    }

    return lp;
}

// --- UI CONTROLLER & EVENT LISTENERS ---
let debounceTimer;

function getParams() {
    return {
        mode: document.querySelector('input[name="mode"]:checked').value,
        bodySz: document.getElementById('fontScaleSlider').value, // fontScaleSlider directly represents bodySz
        titleSz: Math.round(document.getElementById('fontScaleSlider').value * 1.2),
        margin: document.getElementById('marginSlider').value,
        safePad: document.getElementById('safePadSlider').value,
        zoom: document.getElementById('zoomSlider').value / 100, // percentage to factor
        fontStyle: document.getElementById('fontStyleSelect').value,
        lineH: document.getElementById('lineH').value,
        paraGap: document.getElementById('paraGap').value,
    };
}

function updatePreview() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        let title = document.getElementById('titleInput').value.trim();
        let content = document.getElementById('contentInput').value.trim();
        let themeName = document.getElementById('themeSelect').value;
        let align = document.querySelector('input[name="align"]:checked').value;
        let divider = document.querySelector('input[name="divider"]:checked').value;
        let vignette = document.getElementById('vignetteCheck').checked;
        let cornerAccents = document.getElementById('cornerAccentsCheck').checked;
        let highlight = document.getElementById('highlightCheck').checked;
        let params = getParams();

        // Character Counter with color thresholds
        let charLen = content.length;
        let charCounter = document.getElementById('charCounter');
        charCounter.innerText = `${charLen} chars`;
        charCounter.style.color = charLen > 1500 ? "#ff6b6b" : charLen > 800 ? "#eed0a2" : "var(--text-muted)";

        let fullContent = content || "Your quote goes here…";
        let lp = renderImage(title, fullContent, themeName, divider, align, vignette, cornerAccents, highlight, params);

        // Update readouts if auto/fill modes are selected
        if (params.mode !== "manual") {
            document.getElementById('fontScaleSlider').value = lp.bodySz;
            document.getElementById('fontScaleVal').innerText = `${lp.bodySz}pt`;
            document.getElementById('marginSlider').value = lp.margin;
            document.getElementById('marginVal').innerText = `${lp.margin}px`;
            document.getElementById('safePadSlider').value = lp.safeTop;
            document.getElementById('safePadVal').innerText = `${lp.safeTop}px`;
        }

        let fillPct = estimateFillPct(lp, title, fullContent, params.fontStyle);
        
        // Update Status & Progress Bar
        document.getElementById('statusLbl').innerText = 
            `${params.mode.toUpperCase()} · ${lp.bodySz}pt · fill ${fillPct}%`;
        
        let color = fillPct >= 95 ? "#e05252" : fillPct >= 80 ? "#6aaa6a" : fillPct >= 40 ? "#5a9aaa" : "#eed0a2";
        let fitLbl = document.getElementById('fitLbl');
        fitLbl.innerText = `↑ ${fillPct}% page filled`;
        fitLbl.style.color = color;

        let fillBar = document.getElementById('fillBar');
        fillBar.style.width = `${fillPct}%`;
        fillBar.style.backgroundColor = color;

        // Render Downscaled Live Preview Canvas (High DPI crisp rendering)
        const prevCanvas = document.getElementById('previewCanvas');
        const prevCtx = prevCanvas.getContext('2d');
        const mainCanvas = document.getElementById('renderCanvas');
        prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
        prevCtx.drawImage(mainCanvas, 0, 0, prevCanvas.width, prevCanvas.height);
    }, 50);
}

// Custom Toast Message Function
function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `show ${type}`;
    setTimeout(() => {
        toast.className = "";
    }, 3000);
}

// Adjust value helper for spinner buttons
function adjustSpinner(id, step) {
    let input = document.getElementById(id);
    let val = parseInt(input.value) || 0;
    input.value = Math.max(1, val + step);
    
    // Switch to manual mode on direct spinner tweak
    document.querySelector('input[name="mode"][value="manual"]').checked = true;
    updatePreview();
}

// Populate UI Elements and Bind Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    const themeSelect = document.getElementById('themeSelect');
    const swatchGrid = document.getElementById('swatchGrid');

    // Populate theme lists and active visual swatch buttons
    let gradientLabelAdded = false;
    Object.keys(THEMES).forEach(name => {
        let opt = document.createElement('option');
        opt.value = name; opt.innerText = name;
        themeSelect.appendChild(opt);

        let t = THEMES[name];
        if (t.grad && !gradientLabelAdded) {
            let lbl = document.createElement('div');
            lbl.className = 'swatch-group-lbl';
            lbl.innerText = 'Gradients';
            swatchGrid.appendChild(lbl);
            gradientLabelAdded = true;
        }
        let btn = document.createElement('button');
        btn.className = 'swatch-btn';
        btn.style.background = themeCss(t);
        btn.style.color = `rgb(${t.title.join(',')})`;
        btn.title = name;
        btn.onclick = (e) => {
            e.preventDefault();
            themeSelect.value = name;
            document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('activeThemeLbl').innerText = name;
            updatePreview();
            showToast(`Theme applied: ${name}`, "success");
        };
        swatchGrid.appendChild(btn);
    });

    // Mark default theme active in grid
    const defaultSwatch = Array.from(swatchGrid.children).find(btn => btn.title === "Pure White");
    if (defaultSwatch) defaultSwatch.classList.add('active');

    // Link Slider values to labels dynamically
    const fontScaleSlider = document.getElementById('fontScaleSlider');
    const fontScaleVal = document.getElementById('fontScaleVal');
    fontScaleSlider.addEventListener('input', (e) => {
        fontScaleVal.innerText = `${e.target.value}pt`;
        document.querySelector('input[name="mode"][value="manual"]').checked = true;
        updatePreview();
    });

    const marginSlider = document.getElementById('marginSlider');
    const marginVal = document.getElementById('marginVal');
    marginSlider.addEventListener('input', (e) => {
        marginVal.innerText = `${e.target.value}px`;
        document.querySelector('input[name="mode"][value="manual"]').checked = true;
        updatePreview();
    });

    const safePadSlider = document.getElementById('safePadSlider');
    const safePadVal = document.getElementById('safePadVal');
    safePadSlider.addEventListener('input', (e) => {
        safePadVal.innerText = `${e.target.value}px`;
        document.querySelector('input[name="mode"][value="manual"]').checked = true;
        updatePreview();
    });

    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    zoomSlider.addEventListener('input', (e) => {
        zoomVal.innerText = `${e.target.value}%`;
        updatePreview();
    });

    // Preview Zoom: purely visual scale of the live-preview canvas element
    // (CSS transform), independent of Content Zoom which re-renders the
    // actual exported image. Cheap — no re-render needed.
    const previewZoomSlider = document.getElementById('previewZoomSlider');
    const previewZoomVal = document.getElementById('previewZoomVal');
    const previewCanvasEl = document.getElementById('previewCanvas');
    const applyPreviewZoom = (pct) => {
        previewZoomSlider.value = pct;
        previewZoomVal.innerText = `${pct}%`;
        previewCanvasEl.style.transform = pct == 100 ? '' : `scale(${pct / 100})`;
    };
    previewZoomSlider.addEventListener('input', (e) => applyPreviewZoom(e.target.value));
    previewZoomVal.addEventListener('click', () => applyPreviewZoom(100));

    // Dynamic fonts trigger pre-rendering load
    const fontStyleSelect = document.getElementById('fontStyleSelect');
    fontStyleSelect.addEventListener('change', () => {
        const style = fontStyleSelect.value;
        // Snap line height to the font's own default, unless the user has tuned it themselves
        const lineH = document.getElementById('lineH');
        const presets = [DEFAULT_LINE_HEIGHT, ...Object.values(FONT_LINE_HEIGHTS)];
        if (presets.includes(parseInt(lineH.value))) {
            lineH.value = FONT_LINE_HEIGHTS[style] || DEFAULT_LINE_HEIGHT;
        }
        // Wait for the web font (both weights) before drawing, so the canvas never falls back
        const family = getCanvasFont(style);
        Promise.all([false, true].map(b => document.fonts.load(`${fontWeight(style, b)} 40px ${family}`)))
            .then(updatePreview, updatePreview);
    });

    // Standard input bindings
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (!['fontScaleSlider', 'marginSlider', 'safePadSlider', 'zoomSlider', 'previewZoomSlider'].includes(el.id)) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    // Spinners bind adjustSpinner action
    document.querySelectorAll('.spinner-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            const targetId = btn.getAttribute('data-target');
            const step = parseInt(btn.getAttribute('data-step') || "1");
            adjustSpinner(targetId, action === "up" ? step : -step);
        });
    });

    // Reset controls
    document.getElementById('resetBtn').onclick = (e) => {
        e.preventDefault();
        fontScaleSlider.value = 42;
        fontScaleVal.innerText = "42pt";
        marginSlider.value = 52;
        marginVal.innerText = "52px";
        safePadSlider.value = 120;
        safePadVal.innerText = "120px";
        zoomSlider.value = 100;
        zoomVal.innerText = "100%";
        document.getElementById('lineH').value = 158;
        document.getElementById('paraGap').value = 115;
        document.getElementById('fontStyleSelect').value = "Sans-Serif";
        document.getElementById('cornerAccentsCheck').checked = false;
        document.getElementById('vignetteCheck').checked = false;
        document.getElementById('highlightCheck').checked = false;
        document.querySelector('input[name="mode"][value="auto"]').checked = true;
        
        // reset theme to Pure White
        themeSelect.value = "Pure White";
        document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
        if (defaultSwatch) defaultSwatch.classList.add('active');
        document.getElementById('activeThemeLbl').innerText = "Pure White";

        updatePreview();
        showToast("Settings reset to default", "success");
    };

    // Clear controls
    document.getElementById('clearBtn').onclick = (e) => {
        e.preventDefault();
        document.getElementById('titleInput').value = "";
        document.getElementById('contentInput').value = "";
        updatePreview();
        showToast("Content cleared", "success");
    };

    // Copy Canvas Image to Clipboard
    document.getElementById('copyBtn').onclick = (e) => {
        e.preventDefault();
        const canvas = document.getElementById('renderCanvas');
        
        try {
            canvas.toBlob(blob => {
                if (!blob) {
                    showToast("Error creating image data", "error");
                    return;
                }
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => {
                    showToast("✓ Image copied to clipboard!", "success");
                }).catch(err => {
                    showToast("Failed to copy image. Browser permission issue.", "error");
                    console.error(err);
                });
            }, "image/png");
        } catch (err) {
            showToast("Clipboard not supported or blocked", "error");
            console.error(err);
        }
    };

    // Download High-Res Image
    function saveImage() {
        const canvas = document.getElementById('renderCanvas');
        let link = document.createElement('a');
        let ts = new Date().toISOString().replace(/[-:T.]/g, "").substring(0, 14);
        let mode = getParams().mode;
        link.download = `Vize_${mode}_${ts}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast("↓ Image download started!", "success");
    }

    document.getElementById('saveBtn').onclick = (e) => {
        e.preventDefault();
        saveImage();
    };

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveImage();
        }
    });

    // Initial Trigger
    updatePreview();
});
