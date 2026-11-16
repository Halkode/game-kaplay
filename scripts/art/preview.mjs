#!/usr/bin/env node
// Conferência visual dentro do jogo.
//
// Sobe o servidor de desenvolvimento, abre o jogo num Chromium sem janela e
// fotografa cada parede de cada sala duas vezes: no estado inicial e com
// todas as variantes de estado aplicadas. Monta tudo numa folha de contato
// em art/preview/index.html (+ preview.png) para comparar o conjunto.
//
// Uso: npm run art:preview [-- --claro]   (--claro: sem a escuridão noturna)
// Requer Playwright: npm i -D playwright && npx playwright install chromium

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import { ASSETS } from "../../art/spec.mjs";
import { ROOT, listSprites } from "./lib.mjs";

const OUT = path.join(ROOT, "art/preview");
const CLARO = process.argv.includes("--claro");

async function loadPlaywright() {
    try {
        return await import("playwright");
    } catch {
        // Instalação global (ambientes com Playwright pré-instalado)
        const req = createRequire(import.meta.url);
        for (const p of [process.env.PLAYWRIGHT_PATH, "/opt/node-tools/node_modules/playwright"].filter(Boolean)) {
            try { return req(p); } catch {}
        }
        console.error("Playwright não encontrado. Rode: npm i -D playwright && npx playwright install chromium");
        process.exit(1);
    }
}

// Variantes de estado agrupadas por sala: { sala: [[entidade, estado], ...] }
function stateOverrides(rooms) {
    const byRoom = {};
    for (const a of ASSETS.filter((x) => x.kind === "estado")) {
        const [roomId, entityId] = a.base.includes(".") ? a.base.split(".") : [null, a.base];
        for (const room of rooms) {
            for (const e of room.entities) {
                const sprite = e.sprite === undefined ? `${room.id}.${e.id}` : e.sprite;
                if (sprite === a.base && (!roomId || roomId === room.id || roomId === "cozinha_devastada")) {
                    (byRoom[room.key] ||= []).push([e.id, a.state]);
                }
            }
        }
    }
    // Objetos escondidos aparecem na foto de estados.
    for (const room of rooms)
        for (const e of room.entities)
            if (e.hiddenWhen?.includes(e.initial)) (byRoom[room.key] ||= []).push([e.id, "visivel"]);
    return byRoom;
}

async function main() {
    const { chromium } = await loadPlaywright();
    fs.mkdirSync(OUT, { recursive: true });

    const server = await createServer({ root: ROOT, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
    await server.listen();
    const url = server.resolvedUrls.local[0];

    // Lê as salas pelo próprio Vite (resolve import.meta.glob etc.)
    const { ROOMS } = await server.ssrLoadModule("/src/data/rooms/index.js");
    const rooms = [];
    for (const r of ROOMS) {
        if (r.resolve) {
            const dev = r.resolve({ pathChoices: ["window"] });
            const nor = r.resolve({ pathChoices: [] });
            rooms.push({ ...nor, key: r.id, path: [] });
            if (dev !== nor) rooms.push({ ...dev, key: `${r.id}_devastada`, path: ["window"] });
        } else rooms.push({ ...r, key: r.id, path: [] });
    }
    const overrides = stateOverrides(rooms);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 720, height: 480 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    await page.waitForFunction(() => window.__k && window.__state);

    const shots = [];
    for (const room of rooms) {
        const walls = Math.ceil((room.width || 960) / 240);
        for (const mode of ["inicial", "estados"]) {
            if (mode === "estados" && !overrides[room.key]) continue;
            for (let i = 0; i < walls; i++) {
                await page.evaluate(
                    ({ room, i, mode, ov, path, claro }) => {
                        const s = window.__state;
                        s.objectStates = {};
                        s.pathChoices = [...path];
                        s.time = claro ? 720 : 22 * 60 + 30;
                        s.roomLights = { [room]: true };
                        s.pendingDialog = null;
                        if (mode === "estados") for (const [id, st] of ov) s.objectStates[`${room}.${id}`] = st;
                        // Luz ligada: interruptores no estado "on"
                        s.objectStates[`${room}.interruptor`] = mode === "estados" ? "on" : "off";
                        s.savedCamX = 120 + 240 * i;
                        window.__k.go(room);
                    },
                    { room: room.id, i, mode, ov: overrides[room.key] || [], path: room.path, claro: CLARO }
                );
                await page.waitForTimeout(1200);
                const file = `${room.key}.${mode}.${i + 1}.png`;
                await page.locator("canvas").screenshot({ path: path.join(OUT, file) });
                shots.push({ room: room.key, mode, wall: i + 1, file });
            }
        }
    }

    // Folha de ícones e telas: imagens cruas do jogo (sem sala) em escala 4x.
    const files = listSprites();
    const rel = (p) => path.relative(OUT, p).split(path.sep).join("/");
    const icons = ASSETS.filter((a) => ["item", "ui"].includes(a.kind) && files.has(a.name));
    const scenes = ASSETS.filter((a) => a.kind === "cena" && files.has(a.name));

    const html = `<!doctype html><meta charset="utf-8"><title>Prévia de arte</title>
<style>
body{background:#0d0f14;color:#c9ccd3;font:12px system-ui;margin:16px}
h2{font-size:14px;margin:20px 0 6px;color:#e6d9a8}
.row{display:flex;gap:4px;flex-wrap:wrap}
figure{margin:0}figcaption{font-size:10px;opacity:.6}
img{image-rendering:pixelated;display:block}
.sala img{width:360px}
.icon{background:#1d222a;padding:6px}.icon img{width:64px;height:64px}
</style>
<h1 style="font-size:16px">Prévia de arte ${CLARO ? "(sem escuridão)" : "(22:30, luz ligada onde há interruptor)"}</h1>
${[...new Set(shots.map((s) => s.room))]
    .map((r) =>
        ["inicial", "estados"]
            .map((m) => {
                const list = shots.filter((s) => s.room === r && s.mode === m);
                if (!list.length) return "";
                return `<h2>${r} · ${m}</h2><div class="row sala">${list.map((s) => `<figure><img src="${s.file}"><figcaption>parede ${s.wall}</figcaption></figure>`).join("")}</div>`;
            })
            .join("")
    )
    .join("")}
<h2>Itens e interface</h2><div class="row">${icons.map((a) => `<figure class="icon"><img src="${rel(files.get(a.name))}"><figcaption>${a.name}</figcaption></figure>`).join("")}</div>
<h2>Telas</h2><div class="row sala">${scenes.map((a) => `<figure><img src="${rel(files.get(a.name))}"><figcaption>${a.name}</figcaption></figure>`).join("")}</div>`;
    fs.writeFileSync(path.join(OUT, "index.html"), html);

    const sheet = await browser.newPage({ viewport: { width: 1500, height: 800 } });
    await sheet.goto("file://" + path.join(OUT, "index.html"));
    await sheet.screenshot({ path: path.join(OUT, "preview.png"), fullPage: true });

    await browser.close();
    await server.close();
    if (errors.length) {
        console.error("Erros no jogo durante a prévia:\n" + errors.join("\n"));
        process.exitCode = 1;
    }
    console.log(`${shots.length} capturas em art/preview/ (abra index.html ou preview.png).`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
