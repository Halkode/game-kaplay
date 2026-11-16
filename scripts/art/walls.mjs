// Monta as paredes das salas a partir de texturas, todas com a mesma estrutura:
//
//   y 0–3     sombra do teto (comum)
//   y 4–111   papel de parede da sala   art/textures/<sala>.papel.png (240x108)
//   y 112–159 rodapé + piso (comum)     art/textures/base_piso.png   (240x48)
//   + sobreposição opcional             art/textures/<sala>.sobreposicao.png (240x160)
//
// Assim todas as salas têm a linha do chão em y = 120, a mesma madeira no piso
// e a mesma iluminação de teto; só o papel de parede muda. O resultado vai
// para art/raw/<sala>.parede.png e segue o pipeline normal (paleta, verificação).

import fs from "node:fs";
import path from "node:path";
import { ART_DIR, RAW_DIR, createImage, readPng, writePng, adjustTone, crop } from "./lib.mjs";

const TEX = path.join(ART_DIR, "textures");

// Sala → textura do papel de parede e ajustes de tom.
export const WALLS = {
    quarto_um: { papel: "quarto_um.papel" },
    corredor: { papel: "corredor.papel" },
    quarto_dois: { papel: "quarto_dois.papel" },
    sala: { papel: "sala.papel" },
    cozinha: { papel: "cozinha.papel", tomPapel: { lightness: 0.5, chroma: 0.45, hue: 150, hueMix: 0.5 } },
    cozinha_devastada: { papel: "cozinha.papel", tomPapel: { lightness: 0.46, chroma: 0.45, hue: 150, hueMix: 0.5 }, sobreposicao: "cozinha_devastada.sobreposicao", tomSobreposicao: { lightness: 0.55, chroma: 0.55 } },
};

function blit(dst, src, ox, oy) {
    for (let y = 0; y < src.height; y++)
        for (let x = 0; x < src.width; x++) {
            const si = (y * src.width + x) * 4;
            if (src.data[si + 3] < 128) continue;
            const dx = ox + x, dy = oy + y;
            if (dx < 0 || dy < 0 || dx >= dst.width || dy >= dst.height) continue;
            const di = (dy * dst.width + dx) * 4;
            for (let c = 0; c < 3; c++) dst.data[di + c] = src.data[si + c];
            dst.data[di + 3] = 255;
        }
}

/** Repete a textura para cobrir w×h (texturas menores que a área). */
function tile(tex, w, h) {
    const out = createImage(w, h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const si = ((y % tex.height) * tex.width + (x % tex.width)) * 4, di = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) out.data[di + c] = tex.data[si + c];
            out.data[di + 3] = 255;
        }
    return out;
}

/** Escurece faixas horizontais: sombra do teto e do rodapé (em degraus, sem gradiente). */
function shadeBands(img, bands) {
    for (const [y0, y1, k] of bands) {
        const band = crop(img, 0, y0, img.width, y1 - y0);
        blit(img, adjustTone(band, { lightness: k }), 0, y0);
    }
}

export function composeWall(room) {
    const cfg = WALLS[room];
    const out = createImage(240, 160);
    // teto
    for (let i = 0; i < out.data.length; i += 4) { out.data[i] = 8; out.data[i + 1] = 9; out.data[i + 2] = 14; out.data[i + 3] = 255; }
    let papel = readPng(path.join(TEX, `${cfg.papel}.png`));
    if (papel.width !== 240 || papel.height !== 108) papel = tile(papel, 240, 108);
    if (cfg.tomPapel) papel = adjustTone(papel, cfg.tomPapel);
    blit(out, papel, 0, 4);
    blit(out, adjustTone(readPng(path.join(TEX, "base_piso.png")), { lightness: 0.8, chroma: 0.65 }), 0, 112);
    // Luz vem de cima: o alto da parede fica um pouco mais escuro, e os cantos também.
    shadeBands(out, [[4, 10, 0.72], [10, 18, 0.84], [18, 28, 0.93]]);
    for (const [x0, x1, k] of [[0, 3, 0.7], [237, 240, 0.7]]) {
        const band = crop(out, x0, 0, x1 - x0, 160);
        blit(out, adjustTone(band, { lightness: k }), x0, 0);
    }
    if (cfg.sobreposicao) {
        const over = readPng(path.join(TEX, `${cfg.sobreposicao}.png`));
        blit(out, cfg.tomSobreposicao ? adjustTone(over, cfg.tomSobreposicao) : over, 0, 0);
    }
    return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const rooms = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(WALLS);
    for (const room of rooms) {
        const file = path.join(RAW_DIR, `${room}.parede.png`);
        writePng(file, composeWall(room), { opaque: true });
        console.log(`art/raw/${room}.parede.png`);
    }
    if (!fs.existsSync(RAW_DIR)) process.exitCode = 1;
}
