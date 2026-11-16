// Testes do pipeline de arte: node --test tests/
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { ASSETS, ASSET_BY_NAME } from "../art/spec.mjs";
import { createImage, loadPalette, quantize, resizeMode, fitInto, trim, ROOT } from "../scripts/art/lib.mjs";
import { checkImage, checkAll, processImage } from "../scripts/art/pipeline.mjs";

const palette = loadPalette();

function solid(w, h, rgba) {
    const img = createImage(w, h);
    for (let i = 0; i < img.data.length; i += 4) img.data.set(rgba, i);
    return img;
}

function colorsOf(img) {
    const s = new Set();
    for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3]) s.add(img.data.slice(i, i + 3).join(","));
    return s;
}

// ── Transformações ───────────────────────────────────────────────────────────

test("resizeMode reduz sem inventar cores (sem interpolação)", () => {
    const img = createImage(8, 8);
    for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) img.data.set((x + y) % 2 ? [255, 0, 0, 255] : [0, 0, 255, 255], (y * 8 + x) * 4);
    const out = resizeMode(img, 3, 3);
    for (const c of colorsOf(out)) assert.ok(["255,0,0", "0,0,255"].includes(c), `cor nova ${c}`);
});

test("quantize deixa só cores da paleta e alfa binário", () => {
    const img = solid(4, 4, [200, 30, 180, 140]);
    const out = quantize(img, palette);
    for (let i = 0; i < out.data.length; i += 4) {
        assert.equal(out.data[i + 3], 255);
        assert.ok(palette.has(out.data[i], out.data[i + 1], out.data[i + 2]));
    }
    const faint = quantize(solid(2, 2, [200, 30, 180, 60]), palette);
    assert.equal(faint.data[3], 0, "alfa < 128 vira transparente");
});

test("fitInto mantém proporção e encosta na base", () => {
    const img = solid(10, 5, [255, 255, 255, 255]);
    const out = fitInto(img, 20, 20);
    assert.equal(out.width, 20);
    assert.equal(out.height, 20);
    assert.equal(out.data[(19 * 20 + 10) * 4 + 3], 255, "base preenchida");
    assert.equal(out.data[(0 * 20 + 10) * 4 + 3], 0, "topo vazio");
});

test("trim remove borda transparente", () => {
    const img = createImage(10, 10);
    img.data.set([1, 2, 3, 255], (5 * 10 + 4) * 4);
    const t = trim(img);
    assert.deepEqual([t.width, t.height], [1, 1]);
});

// ── Verificação ──────────────────────────────────────────────────────────────

const objeto = { name: "teste", kind: "objeto", w: 8, h: 8 };
const parede = { name: "teste.parede", kind: "parede", w: 8, h: 8 };
const [pr, pg, pb] = palette.rgb[3];

test("checkImage aprova objeto correto", () => {
    const img = createImage(8, 8);
    img.data.set([pr, pg, pb, 255], (4 * 8 + 4) * 4);
    assert.deepEqual(checkImage(objeto, img, palette).errors, []);
});

test("checkImage reprova tamanho, alfa parcial, cor fora da paleta e falta de transparência", () => {
    assert.match(checkImage(objeto, solid(9, 8, [pr, pg, pb, 255]), palette).errors.join(), /tamanho/);
    const semi = createImage(8, 8);
    semi.data.set([pr, pg, pb, 100], 0);
    assert.match(checkImage(objeto, semi, palette).errors.join(), /semitransparentes/);
    assert.match(checkImage(objeto, solid(8, 8, [1, 2, 3, 255]), palette).errors.join(), /fora da paleta/);
    assert.match(checkImage(objeto, solid(8, 8, [pr, pg, pb, 255]), palette).errors.join(), /sem fundo transparente/);
});

test("checkImage reprova parede com transparência", () => {
    const img = solid(8, 8, [pr, pg, pb, 255]);
    img.data[3] = 0;
    assert.match(checkImage(parede, img, palette).errors.join(), /opaca/);
});

test("processImage leva qualquer imagem gerada ao formato final", () => {
    const raw = createImage(64, 40);
    for (let y = 10; y < 40; y++) for (let x = 8; x < 56; x++) raw.data.set([180, 120, 60, 255], (y * 64 + x) * 4);
    const asset = { name: "x", kind: "objeto", w: 24, h: 16 };
    const out = processImage(asset, raw, palette);
    assert.deepEqual(checkImage(asset, out, palette).errors, []);
});

// ── Especificação x jogo ─────────────────────────────────────────────────────

let server, ROOMS, ITEMS;
before(async () => {
    server = await createServer({ root: ROOT, logLevel: "error", server: { middlewareMode: true, hmr: false }, appType: "custom" });
    ({ ROOMS } = await server.ssrLoadModule("/src/data/rooms/index.js"));
    ({ ITEMS } = await server.ssrLoadModule("/src/data/items.js"));
});
after(() => server?.close());

test("todo objeto das salas está na especificação com o mesmo tamanho", () => {
    const variants = ROOMS.flatMap((r) => (r.resolve ? [r.resolve({ pathChoices: ["window"] }), r.resolve({ pathChoices: [] })] : [r]));
    const problems = [];
    for (const room of variants)
        for (const e of room.entities) {
            if (e.sprite === null) continue;
            const name = e.sprite ?? `${room.id}.${e.id}`;
            const a = ASSET_BY_NAME.get(name);
            if (!a) problems.push(`${name} não está em art/spec.mjs`);
            else if (a.w !== e.w || a.h !== e.h) problems.push(`${name}: spec ${a.w}x${a.h}, sala ${e.w}x${e.h}`);
        }
    assert.deepEqual(problems, []);
});

test("todo item tem ícone especificado", () => {
    const missing = Object.keys(ITEMS).filter((id) => !ASSET_BY_NAME.has(`item.${id}`));
    assert.deepEqual(missing, []);
});

test("estados apontam para um objeto existente", () => {
    for (const a of ASSETS.filter((x) => x.kind === "estado")) assert.ok(ASSET_BY_NAME.has(a.base), a.name);
});

// ── Arquivos reais ───────────────────────────────────────────────────────────

test("todos os sprites do jogo passam na verificação", () => {
    const { results, unknown } = checkAll(ASSETS, palette);
    const errors = results.flatMap((r) => r.errors.map((e) => `${r.asset.name}: ${e}`));
    assert.deepEqual(errors, []);
    assert.deepEqual(unknown, [], "PNG sem entrada em art/spec.mjs");
});
