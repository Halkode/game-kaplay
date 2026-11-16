#!/usr/bin/env node
// Pipeline de arte. Uso: node scripts/art/cli.mjs <comando> [args]
//
//   prompt <nome>           prompt, tamanho e paleta para gerar o asset
//   import <png> <nome>     guarda o original em art/raw/ e gera o sprite final
//   build [nome...]         reprocessa art/raw/ → src/assets/sprites/
//   check                   verifica todos os sprites (sai com erro se falhar)
//   status                  resumo do que falta, por prioridade
//   docs                    atualiza a tabela de status no ASSETS.md

import fs from "node:fs";
import path from "node:path";
import { ASSETS, ASSET_BY_NAME, promptFor } from "../../art/spec.mjs";
import { loadPalette, readPng, writePng, spriteFile, rawFile, listSprites, ROOT, RAW_DIR } from "./lib.mjs";
import { processImage, checkAll, isOpaque } from "./pipeline.mjs";

const [cmd, ...args] = process.argv.slice(2);
const palette = loadPalette();

function getAsset(name) {
    const a = ASSET_BY_NAME.get(name);
    if (!a) {
        console.error(`"${name}" não está em art/spec.mjs`);
        process.exit(1);
    }
    return a;
}

function build(asset) {
    const raw = readPng(rawFile(asset));
    const out = processImage(asset, raw, palette);
    // Remove cópias antigas em outra pasta (o loader avisaria nome duplicado).
    const existing = listSprites().get(asset.name);
    const target = spriteFile(asset);
    if (existing && existing !== target) fs.rmSync(existing);
    writePng(target, out, { opaque: isOpaque(asset) });
    return target;
}

const commands = {
    prompt([name]) {
        const a = getAsset(name);
        console.log(`Asset:    ${a.name} (${a.kind}, prioridade ${a.prio})`);
        console.log(`Tamanho:  ${a.w}x${a.h}  (gere em 2x: ${a.w * 2}x${a.h * 2})`);
        console.log(`Fundo:    ${isOpaque(a) ? "opaco" : "transparente"}`);
        console.log(`Prompt:   ${promptFor(a)}`);
        console.log(`Paleta:   ${palette.hexes.join(" ")}`);
    },

    import([file, name]) {
        if (!file || !name) throw new Error("uso: import <arquivo.png> <nome>");
        const a = getAsset(name);
        fs.mkdirSync(RAW_DIR, { recursive: true });
        if (path.resolve(file) !== rawFile(a)) fs.copyFileSync(file, rawFile(a));
        const target = build(a);
        console.log(`${a.name} → ${path.relative(ROOT, target)}`);
    },

    build(names) {
        const list = names.length ? names.map(getAsset) : ASSETS.filter((a) => fs.existsSync(rawFile(a)));
        for (const a of list) build(a);
        console.log(`${list.length} sprites processados.`);
    },

    check() {
        const { results, unknown } = checkAll(ASSETS, palette);
        let errors = 0, warnings = 0;
        for (const r of results) {
            for (const e of r.errors) { console.log(`✗ ${r.asset.name}: ${e}`); errors++; }
            for (const w of r.warnings) { console.log(`! ${r.asset.name}: ${w}`); warnings++; }
        }
        for (const n of unknown) { console.log(`✗ ${n}: arquivo não está em art/spec.mjs`); errors++; }
        const missing = results.filter((r) => r.missing);
        const missingA = missing.filter((r) => r.asset.prio === "A");
        console.log(`\n${results.length - missing.length}/${results.length} sprites presentes, ${missingA.length} de prioridade A faltando.`);
        console.log(`${errors} erros, ${warnings} avisos.`);
        if (missingA.length) console.log("Faltando (A):", missingA.map((r) => r.asset.name).join(", "));
        process.exitCode = errors ? 1 : 0;
    },

    status() {
        const files = listSprites();
        for (const prio of ["A", "B", "C"]) {
            const all = ASSETS.filter((a) => a.prio === prio);
            const missing = all.filter((a) => !files.has(a.name));
            console.log(`Prioridade ${prio}: ${all.length - missing.length}/${all.length}` + (missing.length ? `  faltam: ${missing.map((a) => a.name).join(", ")}` : ""));
        }
    },

    docs() {
        const file = path.join(ROOT, "ASSETS.md");
        const md = fs.readFileSync(file, "utf8");
        const start = "<!-- art:docs:start -->", end = "<!-- art:docs:end -->";
        const files = listSprites();
        const groups = new Map();
        for (const a of ASSETS) {
            const g = a.kind === "item" ? "Itens do inventário" : a.kind === "ui" ? "Interface" : a.kind === "minigame" ? "Minigame da estante" : a.kind === "cena" ? "Telas cheias" : a.room === "*" ? "Compartilhados" : a.room;
            if (!groups.has(g)) groups.set(g, []);
            groups.get(g).push(a);
        }
        let out = `${start}\n<!-- Gerado por \`npm run art:docs\` a partir de art/spec.mjs. Não edite à mão. -->\n`;
        for (const [g, list] of groups) {
            out += `\n### ${g}\n\n| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |\n|---|---|---|---|---|---|\n`;
            for (const a of list) {
                const has = files.has(a.name) ? "ok" : "falta";
                out += `| \`${a.name}.png\` | ${a.w}x${a.h} | ${a.kind} | ${a.prio} | ${has} | ${a.desc} |\n`;
            }
        }
        const total = ASSETS.length, present = ASSETS.filter((a) => files.has(a.name)).length;
        out += `\n**Total:** ${present}/${total} presentes.\n${end}`;
        const i = md.indexOf(start), j = md.indexOf(end);
        const next = i >= 0 && j > i ? md.slice(0, i) + out + md.slice(j + end.length) : md.trimEnd() + "\n\n" + out + "\n";
        fs.writeFileSync(file, next);
        console.log(`ASSETS.md atualizado (${present}/${total}).`);
    },
};

if (!commands[cmd]) {
    console.log("Comandos: " + Object.keys(commands).join(", "));
    process.exit(cmd ? 1 : 0);
}
commands[cmd](args);
