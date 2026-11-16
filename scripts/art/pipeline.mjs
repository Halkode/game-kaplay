// Processamento e verificação dos sprites conforme art/spec.mjs.

import fs from "node:fs";
import { LIMITS } from "../../art/spec.mjs";
import { adjustTone, analyze, fitInto, quantize, resizeMode, trim, readPng, spriteFile, listSprites } from "./lib.mjs";

/** Tipos que ocupam a tela inteira e não têm transparência. */
export const OPAQUE_KINDS = new Set(["parede", "cena"]);

export function isOpaque(asset) {
    return OPAQUE_KINDS.has(asset.kind);
}

/**
 * Transforma uma imagem gerada (qualquer tamanho) no sprite final:
 * paleta mestre, alfa binário e tamanho exato da especificação.
 */
export function processImage(asset, raw, palette) {
    if (asset.adjust) raw = adjustTone(raw, asset.adjust);
    if (isOpaque(asset)) {
        const dither = asset.dither ?? 18;
        if (raw.width === asset.w && raw.height === asset.h) return quantize(raw, palette, { opaque: true, dither });
        return resizeMode(quantize(raw, palette, { opaque: true, dither }), asset.w, asset.h);
    }
    // Já no tamanho certo: só converte a paleta (reprocessar é idempotente).
    if (raw.width === asset.w && raw.height === asset.h) return quantize(raw, palette);
    let img = trim(quantize(raw, palette));
    if (asset.cheio) img = resizeMode(img, asset.w, asset.h);
    else img = fitInto(img, asset.w, asset.h, { align: asset.view === "chao" || asset.kind === "item" ? "center" : "bottom" });
    return img;
}

/** Verifica um sprite já processado. Retorna { errors, warnings, stats }. */
export function checkImage(asset, img, palette) {
    const s = analyze(img, palette);
    const errors = [], warnings = [];
    if (s.width !== asset.w || s.height !== asset.h) {
        errors.push(`tamanho ${s.width}x${s.height}, esperado ${asset.w}x${asset.h}`);
    }
    if (s.semi > 0) errors.push(`${s.semi} pixels semitransparentes (borrado por interpolação)`);
    if (s.offPalette > 0) errors.push(`${s.offPalette} pixels fora da paleta (rode art:build)`);
    if (isOpaque(asset)) {
        if (s.transparent > 0) errors.push(`${s.transparent} pixels transparentes numa imagem que deve ser opaca`);
    } else if (!asset.cheio) {
        if (s.transparent === 0) errors.push("sem fundo transparente");
        else if (!hasTransparentBorder(img)) warnings.push("nenhum pixel transparente na borda (fundo pode não ter sido removido)");
    }
    const maxL = LIMITS.meanLightness[asset.kind === "estado" ? "objeto" : asset.kind];
    if (maxL && !asset.destaque && s.meanLightness > maxL) {
        warnings.push(`claro demais para o ambiente (brilho médio ${s.meanLightness.toFixed(2)} > ${maxL})`);
    }
    return { errors, warnings, stats: s };
}

function hasTransparentBorder(img) {
    const { width: w, height: h, data } = img;
    for (let x = 0; x < w; x++) if (data[x * 4 + 3] === 0 || data[((h - 1) * w + x) * 4 + 3] === 0) return true;
    for (let y = 0; y < h; y++) if (data[y * w * 4 + 3] === 0 || data[(y * w + w - 1) * 4 + 3] === 0) return true;
    return false;
}

/**
 * Verifica todos os sprites. Retorna uma lista de resultados por asset e os
 * arquivos que existem em src/assets/sprites mas não estão na especificação.
 */
export function checkAll(assets, palette) {
    const files = listSprites();
    const results = [];
    for (const asset of assets) {
        const file = files.get(asset.name);
        if (!file) {
            results.push({ asset, missing: true, errors: [], warnings: [] });
            continue;
        }
        const expected = spriteFile(asset);
        const r = checkImage(asset, readPng(file), palette);
        if (file !== expected) r.warnings.push(`está em ${file.split("sprites/")[1]}, esperado ${asset.folder}/`);
        results.push({ asset, file, ...r });
    }
    const known = new Set(assets.map((a) => a.name));
    const unknown = [...files.keys()].filter((n) => !known.has(n));
    return { results, unknown };
}

export function fileSize(file) {
    return fs.statSync(file).size;
}
