// Funções compartilhadas do pipeline de arte (Node, sem navegador).
//
// Tudo aqui trabalha com imagens RGBA cruas: { width, height, data: Uint8Array }.
// Nenhuma operação interpola cores: redimensionar escolhe a cor mais frequente
// de cada bloco, então os pixels nunca ficam borrados.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const ART_DIR = path.join(ROOT, "art");
export const RAW_DIR = path.join(ART_DIR, "raw");
export const SPRITES_DIR = path.join(ROOT, "src/assets/sprites");
export const PALETTE_FILE = path.join(ART_DIR, "palette.hex");

// ── PNG ──────────────────────────────────────────────────────────────────────

export function readPng(file) {
    const png = PNG.sync.read(fs.readFileSync(file));
    return { width: png.width, height: png.height, data: new Uint8Array(png.data) };
}

export function writePng(file, img, { opaque = false } = {}) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const png = new PNG({ width: img.width, height: img.height, colorType: opaque ? 2 : 6 });
    png.data = Buffer.from(img.data);
    fs.writeFileSync(file, PNG.sync.write(png, { colorType: opaque ? 2 : 6, deflateLevel: 9 }));
}

export function createImage(width, height) {
    return { width, height, data: new Uint8Array(width * height * 4) };
}

// ── Cor ──────────────────────────────────────────────────────────────────────

export function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbToHex([r, g, b]) {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** sRGB → OKLab (espaço perceptual: distância ≈ diferença que o olho vê). */
export function oklab([r8, g8, b8]) {
    const r = lin(r8), g = lin(g8), b = lin(b8);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
}

const unlin = (c) => {
    c = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
};

/** OKLab → sRGB (inverso de oklab()). */
export function fromOklab([L, A, B]) {
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [
        unlin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        unlin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        unlin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
}

/**
 * Ajuste de tom antes da paleta: multiplica brilho e saturação (OKLab).
 * Usado para trazer uma imagem gerada clara/saturada demais para o
 * ambiente escuro do jogo sem gerar de novo.
 */
export function adjustTone(img, { lightness = 1, chroma = 1, hue = null, hueMix = 0 } = {}) {
    const out = createImage(img.width, img.height);
    out.data.set(img.data);
    const target = hue == null ? null : [Math.cos((hue * Math.PI) / 180), Math.sin((hue * Math.PI) / 180)];
    for (let i = 0; i < out.data.length; i += 4) {
        if (out.data[i + 3] === 0) continue;
        let [L, A, B] = oklab([out.data[i], out.data[i + 1], out.data[i + 2]]);
        L *= lightness;
        A *= chroma;
        B *= chroma;
        if (target && hueMix) {
            const c = Math.hypot(A, B);
            A = A * (1 - hueMix) + target[0] * c * hueMix;
            B = B * (1 - hueMix) + target[1] * c * hueMix;
        }
        const [r, g, b] = fromOklab([L, A, B]);
        out.data[i] = r; out.data[i + 1] = g; out.data[i + 2] = b;
    }
    return out;
}

export function loadPalette(file = PALETTE_FILE) {
    const hexes = fs
        .readFileSync(file, "utf8")
        .split("\n")
        .map((l) => l.replace(/;.*/, "").trim())
        .filter(Boolean);
    const rgb = hexes.map(hexToRgb);
    const lab = rgb.map(oklab);
    const keys = new Set(rgb.map(([r, g, b]) => (r << 16) | (g << 8) | b));
    const cache = new Map();
    return {
        hexes,
        rgb,
        has: (r, g, b) => keys.has((r << 16) | (g << 8) | b),
        /** Cor da paleta mais próxima (OKLab). */
        nearest(r, g, b) {
            const key = (r << 16) | (g << 8) | b;
            let hit = cache.get(key);
            if (hit) return hit;
            const [L, A, B] = oklab([r, g, b]);
            let best = 0, bestD = Infinity;
            for (let i = 0; i < lab.length; i++) {
                const d = (lab[i][0] - L) ** 2 + (lab[i][1] - A) ** 2 + (lab[i][2] - B) ** 2;
                if (d < bestD) { bestD = d; best = i; }
            }
            hit = rgb[best];
            cache.set(key, hit);
            return hit;
        },
    };
}

// ── Análise ──────────────────────────────────────────────────────────────────

/** Estatísticas usadas pela verificação. */
export function analyze(img, palette) {
    const { data } = img;
    let transparent = 0, semi = 0, opaque = 0, offPalette = 0, sumL = 0, maxC = 0;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) { transparent++; continue; }
        if (a < 255) semi++;
        else opaque++;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colors.add((r << 16) | (g << 8) | b);
        if (palette && !palette.has(r, g, b)) offPalette++;
        const [L, A, B] = oklab([r, g, b]);
        sumL += L;
        maxC = Math.max(maxC, Math.hypot(A, B));
    }
    const visible = semi + opaque;
    return {
        width: img.width,
        height: img.height,
        transparent,
        semi,
        opaque,
        colors: colors.size,
        offPalette,
        meanLightness: visible ? sumL / visible : 0,
        maxChroma: maxC,
    };
}

// ── Transformações (todas sem interpolação) ──────────────────────────────────

/** Recorta a borda totalmente transparente. */
export function trim(img) {
    let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
    for (let y = 0; y < img.height; y++)
        for (let x = 0; x < img.width; x++)
            if (img.data[(y * img.width + x) * 4 + 3] >= 128) {
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
            }
    if (x1 < 0) return img;
    return crop(img, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

export function crop(img, x0, y0, w, h) {
    const out = createImage(w, h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const si = ((y0 + y) * img.width + (x0 + x)) * 4, di = (y * w + x) * 4;
            for (let c = 0; c < 4; c++) out.data[di + c] = img.data[si + c];
        }
    return out;
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * Converte para a paleta e deixa o alfa binário (0 ou 255).
 * `dither` (0–32) aplica pontilhado ordenado 4x4 para não formar faixas em
 * degradês grandes (paredes). Pontilhado é padrão em pixel art, não borra.
 */
export function quantize(img, palette, { opaque = false, dither = 0 } = {}) {
    const out = createImage(img.width, img.height);
    const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
    for (let i = 0; i < img.data.length; i += 4) {
        const a = img.data[i + 3];
        if (!opaque && a < 128) continue;
        let r0 = img.data[i], g0 = img.data[i + 1], b0 = img.data[i + 2];
        if (dither) {
            const p = i / 4, x = p % img.width, y = (p / img.width) | 0;
            const d = (BAYER4[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * dither;
            r0 = clamp(Math.round(r0 + d)); g0 = clamp(Math.round(g0 + d)); b0 = clamp(Math.round(b0 + d));
        }
        const [r, g, b] = palette.nearest(r0, g0, b0);
        out.data[i] = r; out.data[i + 1] = g; out.data[i + 2] = b; out.data[i + 3] = 255;
    }
    return out;
}

/**
 * Redimensiona escolhendo, para cada pixel de destino, a cor mais frequente
 * na área correspondente da origem (moda). Funciona para reduções de 2x, 4x
 * ou fracionárias sem misturar cores. Pixel transparente se a maior parte da
 * área for transparente.
 */
export function resizeMode(img, w, h) {
    if (img.width === w && img.height === h) return img;
    const out = createImage(w, h);
    const sx = img.width / w, sy = img.height / h;
    for (let y = 0; y < h; y++) {
        const ya = Math.floor(y * sy), yb = Math.max(ya + 1, Math.floor((y + 1) * sy));
        for (let x = 0; x < w; x++) {
            const xa = Math.floor(x * sx), xb = Math.max(xa + 1, Math.floor((x + 1) * sx));
            const counts = new Map();
            let transparent = 0, total = 0;
            for (let yy = ya; yy < yb; yy++)
                for (let xx = xa; xx < xb; xx++) {
                    const i = (yy * img.width + xx) * 4;
                    total++;
                    if (img.data[i + 3] < 128) { transparent++; continue; }
                    const key = (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2];
                    counts.set(key, (counts.get(key) || 0) + 1);
                }
            const di = (y * w + x) * 4;
            if (transparent * 2 > total || counts.size === 0) continue;
            let best = 0, bestN = -1;
            for (const [key, n] of counts) if (n > bestN) { bestN = n; best = key; }
            out.data[di] = best >> 16; out.data[di + 1] = (best >> 8) & 255; out.data[di + 2] = best & 255; out.data[di + 3] = 255;
        }
    }
    return out;
}

/**
 * Encaixa a imagem numa caixa w×h mantendo a proporção ("contain"), alinhada
 * embaixo e no centro (objetos de chão encostam na base).
 */
export function fitInto(img, w, h, { align = "bottom" } = {}) {
    const scale = Math.min(w / img.width, h / img.height);
    const tw = Math.max(1, Math.round(img.width * scale)), th = Math.max(1, Math.round(img.height * scale));
    const scaled = resizeMode(img, tw, th);
    const out = createImage(w, h);
    const ox = Math.floor((w - tw) / 2);
    const oy = align === "center" ? Math.floor((h - th) / 2) : h - th;
    for (let y = 0; y < th; y++)
        for (let x = 0; x < tw; x++) {
            const si = (y * tw + x) * 4, di = ((oy + y) * w + (ox + x)) * 4;
            for (let c = 0; c < 4; c++) out.data[di + c] = scaled.data[si + c];
        }
    return out;
}

/** Caminho final do sprite dentro de src/assets/sprites. */
export function spriteFile(asset) {
    return path.join(SPRITES_DIR, asset.folder, `${asset.name}.png`);
}

export function rawFile(asset) {
    return path.join(RAW_DIR, `${asset.name}.png`);
}

/** Lista todos os PNG em src/assets/sprites (nome → caminho). */
export function listSprites(dir = SPRITES_DIR) {
    const out = new Map();
    const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith(".png")) out.set(e.name.slice(0, -4), p);
        }
    };
    if (fs.existsSync(dir)) walk(dir);
    return out;
}
