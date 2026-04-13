// Tela de créditos exibida ao alcançar um final.
// Mostra qual final foi alcançado, um resumo narrativo e botão para recomeçar.

import { gameState } from "../state.js";

// Dados de cada final
const ENDING_DATA = {
    X: {
        tag: "FINAL X",
        name: "A Verdade da Porta",
        color: "#c8a860",   // dourado — recompensa
        summary: [
            "Você encontrou a chave e saiu pela porta.",
            "No corredor, papéis com seu nome revelaram o que você era:",
            "não um prisioneiro, mas um participante.",
            "",
            "A liberdade tem um preço. Você vai pagá-lo.",
        ],
        hint: "Dica: e se você tivesse pulado pela janela?",
    },
    Y: {
        tag: "FINAL Y",
        name: "O Pulo",
        color: "#80c0e8",   // azul — fuga incerta
        summary: [
            "Você abriu a janela e saltou para o desconhecido.",
            "O telhado sustentou seu peso. A noite, suas dúvidas.",
            "",
            "A porta continua trancada lá em cima.",
            "Você nunca saberá o que havia do outro lado.",
        ],
        hint: "Dica: e se você tivesse encontrado a chave?",
    },
};

export function creditsScene(k) {
    k.scene("credits", () => {
        k.setCursor("default");

        const W = k.width();
        const H = k.height();
        const ending = ENDING_DATA[gameState.ending] ?? ENDING_DATA["X"];

        // ── Fundo ─────────────────────────────────────────────────────────────
        k.add([
            k.rect(W, H),
            k.pos(0, 0),
            k.color(4, 4, 8),
        ]);

        // Gradiente simulado: retângulo translúcido superior
        k.add([
            k.rect(W, H / 2),
            k.pos(0, 0),
            k.color(k.Color.fromHex(ending.color)),
            k.opacity(0.06),
        ]);

        // ── Linha decorativa superior ─────────────────────────────────────────
        k.add([
            k.rect(W - 20, 1),
            k.pos(10, 20),
            k.color(k.Color.fromHex(ending.color)),
            k.opacity(0.5),
        ]);

        // ── TAG do final ──────────────────────────────────────────────────────
        const tagObj = k.add([
            k.text(ending.tag, { size: 7 }),
            k.pos(W / 2, 28),
            k.anchor("center"),
            k.color(k.Color.fromHex(ending.color)),
            k.opacity(0),
        ]);

        // ── Nome do final ─────────────────────────────────────────────────────
        const nameObj = k.add([
            k.text(`"${ending.name}"`, { size: 11 }),
            k.pos(W / 2, 46),
            k.anchor("center"),
            k.color(230, 225, 215),
            k.opacity(0),
        ]);

        // ── Linha separadora ──────────────────────────────────────────────────
        const divObj = k.add([
            k.rect(80, 1),
            k.pos(W / 2, 60),
            k.anchor("center"),
            k.color(k.Color.fromHex(ending.color)),
            k.opacity(0),
        ]);

        // ── Resumo narrativo (cada linha separada) ────────────────────────────
        const summaryObjs = ending.summary.map((line, i) =>
            k.add([
                k.text(line, { size: 6, width: W - 30 }),
                k.pos(W / 2, 72 + i * 12),
                k.anchor("center"),
                k.color(180, 175, 165),
                k.opacity(0),
            ])
        );

        // ── Dica de outro final ───────────────────────────────────────────────
        const hintObj = k.add([
            k.text(ending.hint, { size: 5 }),
            k.pos(W / 2, H - 42),
            k.anchor("center"),
            k.color(100, 95, 85),
            k.opacity(0),
        ]);

        // ── Linha decorativa inferior ─────────────────────────────────────────
        k.add([
            k.rect(W - 20, 1),
            k.pos(10, H - 28),
            k.color(k.Color.fromHex(ending.color)),
            k.opacity(0.5),
        ]);

        // ── Botão Recomeçar ───────────────────────────────────────────────────
        const restartBtn = k.add([
            k.rect(80, 14, { radius: 3 }),
            k.pos(W / 2, H - 16),
            k.anchor("center"),
            k.color(k.Color.fromHex("#1e1a2e")),
            k.outline(1, k.Color.fromHex(ending.color)),
            k.area(),
            k.opacity(0),
        ]);
        restartBtn.add([
            k.text("Recomeçar", { size: 6 }),
            k.anchor("center"),
            k.color(k.Color.fromHex(ending.color)),
        ]);
        restartBtn.onHover(() => {
            k.setCursor("pointer");
            restartBtn.color = k.Color.fromHex("#2e2848");
        });
        restartBtn.onHoverEnd(() => {
            k.setCursor("default");
            restartBtn.color = k.Color.fromHex("#1e1a2e");
        });
        restartBtn.onClick(() => {
            // Reset completo do gameState preservando apenas settings
            const savedSettings = { ...gameState.settings };
            Object.assign(gameState, {
                inventory: [],
                pickedUpItems: [],
                objectStates: {},
                time: 1050,
                actionCounters: {},
                pendingDialog: null,
                savedCamX: null,
                ending: null,
                settings: savedSettings,
            });
            k.go("menu");
        });

        // ── Animação de entrada em cascata ────────────────────────────────────
        const allObjs = [tagObj, nameObj, divObj, ...summaryObjs, hintObj, restartBtn];

        allObjs.forEach((obj, i) => {
            k.wait(0.2 + i * 0.12, () => {
                if (obj.exists()) {
                    k.tween(0, 1, 0.4, (v) => (obj.opacity = v), k.easings.easeOutQuad);
                }
            });
        });
    });
}
