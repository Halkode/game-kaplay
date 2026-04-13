// scenes/bookshelf.js
// Minigame da estante de livros — Scene Kaplay dedicada.
// Física manual: gravidade + bounce na prateleira + separação lateral entre livros.

import { gameState } from "../state.js";
import { showDialog } from "../ui/dialog.js";

// ── Constantes de física ──────────────────────────────────────────────────────
const GRAVITY = 900;   // px/s² (espaço local do painel)
const BOUNCE = 0.22;  // coeficiente de restituição (0 = sem ricochete, 1 = elástico total)
const FRICTION = 0.78;  // amortecimento horizontal ao tocar a prateleira
const SETTLE_SPEED = 8;     // abaixo disso o livro é considerado em repouso (px/s)
const PUSH_FORCE = 180;   // força de separação lateral entre livros sobrepostos

export function bookshelfScene(k) {
    k.scene("bookshelf", () => {
        k.setCursor("default");

        const W = k.width();
        const H = k.height();

        // ── 1. FUNDO ──────────────────────────────────────────────────────────
        const backdrop = k.add([
            k.rect(W, H),
            k.pos(0, 0),
            k.color(0, 0, 0),
            k.z(0),
        ]);
        backdrop.opacity = 0;
        k.tween(0, 0.85, 0.3, (v) => (backdrop.opacity = v), k.easings.easeOutQuad);

        // ── 2. PAINEL ─────────────────────────────────────────────────────────
        const panelW = W - 20;
        const panelH = H - 30;

        const panel = k.add([
            k.rect(panelW, panelH, { radius: 6 }),
            k.pos(k.center()),
            k.anchor("center"),
            k.color(40, 28, 18),
            k.outline(2, k.Color.fromHex("#7a5230")),
            k.z(1),
        ]);
        panel.opacity = 0;
        k.tween(0, 1, 0.3, (v) => (panel.opacity = v), k.easings.easeOutQuad);

        // ── 3. TÍTULO ─────────────────────────────────────────────────────────
        panel.add([
            k.text("ESTANTE DE LIVROS", { size: 8 }),
            k.pos(0, -(panelH / 2) + 10),
            k.anchor("center"),
            k.color(200, 170, 120),
        ]);

        // ── 4. DADOS DOS LIVROS ───────────────────────────────────────────────
        const BOOKS = [
            { id: "livro_vermelho", x: -90, color: "#8b2020", w: 14 },
            { id: "livro_azul", x: -72, color: "#20408b", w: 18 },
            { id: "livro_verde", x: -50, color: "#2d6b30", w: 12 },
            { id: "livro_amarelo", x: -34, color: "#9b8b20", w: 16 },
            { id: "livro_marrom", x: -14, color: "#5a3a1a", w: 20 }, // ← esconde a chave
            { id: "livro_cinza", x: 10, color: "#555555", w: 14 },
            { id: "livro_roxo", x: 28, color: "#5a2080", w: 16 },
            { id: "livro_bege", x: 48, color: "#c8a870", w: 18 },
            { id: "livro_preto", x: 70, color: "#1a1a1a", w: 14 },
        ];

        const bookH = 40;
        const shelfY = 10;  // Y do centro dos livros quando repousados na prateleira

        // Limite inferior dentro do painel (em coordenadas locais, bottom wall)
        const FLOOR_Y = shelfY;                       // Y de repouso na prateleira
        const LEFT_LIM = -panelW / 2 + 8;
        const RIGHT_LIM = panelW / 2 - 8;

        // ── 5. PRATELEIRA (visual) ────────────────────────────────────────────
        panel.add([
            k.rect(panelW - 20, 4),
            k.pos(0, shelfY + bookH / 2 + 2),
            k.anchor("center"),
            k.color(90, 60, 30),
        ]);

        // ── 6. SPAWN E ESTADO DE FÍSICA DOS LIVROS ────────────────────────────
        // Cada entrada em `physics` mantém velocidade e flags
        const physics = [];   // { node, w, vx, vy, dragging, settled, secret }
        let draggedEntry = null;
        let inDialog = false;

        BOOKS.forEach((bookData) => {
            const alreadyMoved = gameState.objectStates[bookData.id] === "movido";

            // Posição inicial: se já foi movido, aparece caído um pouco mais baixo
            const startY = alreadyMoved ? shelfY + 18 : shelfY;

            const node = panel.add([
                k.rect(bookData.w, bookH, { radius: 2 }),
                k.pos(bookData.x, startY),
                k.anchor("center"),
                k.color(k.Color.fromHex(bookData.color)),
                k.outline(1, k.Color.fromHex("#000000")),
                k.area(),
                k.opacity(alreadyMoved ? 0.35 : 1),
            ]);

            // Listra decorativa
            node.add([
                k.rect(bookData.w - 4, 2),
                k.pos(0, -8),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.opacity(0.22),
            ]);

            const entry = {
                node,
                bookId: bookData.id,
                w: bookData.w,
                vx: 0,
                vy: 0,
                dragging: false,
                settled: alreadyMoved,  
                secret: bookData.id === "livro_marrom",
                originalX: bookData.x,
            };
            physics.push(entry);

            if (alreadyMoved) return;

            node.onHover(() => k.setCursor("pointer"));
            node.onHoverEnd(() => k.setCursor("default"));

            node.onClick(() => {
                if (inDialog) return;
                if (!node.isHovering()) return; // ← só draga se o mouse estiver sobre ele
                entry.dragging = true;
                entry.settled = false;
                entry.vx = 0;
                entry.vy = 0;
                draggedEntry = entry;
            });
        });

        // ── 7. LOOP DE FÍSICA + DRAG ──────────────────────────────────────────
        k.onUpdate(() => {
            const dt = k.dt();

            for (const e of physics) {
                if (e.settled) continue;

                // ── DRAG: segue o mouse ───────────────────────────────────
                if (e.dragging) {
                    const mPos = k.mousePos();
                    const localPos = mPos.sub(panel.pos);
                    e.node.pos = k.vec2(
                        k.clamp(localPos.x, LEFT_LIM + e.w / 2, RIGHT_LIM - e.w / 2),
                        k.clamp(localPos.y, -panelH / 2 + 20, panelH / 2 - 20),
                    );
                    continue;
                }

                // ── GRAVIDADE ─────────────────────────────────────────────
                e.vy += GRAVITY * dt;

                // ── MOVE ──────────────────────────────────────────────────
                e.node.pos.x += e.vx * dt;
                e.node.pos.y += e.vy * dt;

                // ── COLISÃO COM PRATELEIRA (floor) ────────────────────────
                if (e.node.pos.y >= FLOOR_Y) {
                    e.node.pos.y = FLOOR_Y;

                    if (Math.abs(e.vy) > SETTLE_SPEED) {
                        e.vy = -e.vy * BOUNCE;   // ricochete
                        e.vx *= FRICTION;
                    } else {
                        e.vy = 0;
                        e.vx *= 0.85;            // desliza até parar
                        if (Math.abs(e.vx) < 1) {
                            e.vx = 0;
                            e.settled = true;
                        }
                    }
                }

                // ── PAREDES LATERAIS DO PAINEL ────────────────────────────
                const halfW = e.w / 2;
                if (e.node.pos.x - halfW < LEFT_LIM) {
                    e.node.pos.x = LEFT_LIM + halfW;
                    e.vx = Math.abs(e.vx) * 0.4;
                }
                if (e.node.pos.x + halfW > RIGHT_LIM) {
                    e.node.pos.x = RIGHT_LIM - halfW;
                    e.vx = -Math.abs(e.vx) * 0.4;
                }
            }

            // ── SEPARAÇÃO LATERAL ENTRE LIVROS (na prateleira) ────────────
            // Passa apenas nos livros que estão em repouso ou quase
            for (let i = 0; i < physics.length; i++) {
                for (let j = i + 1; j < physics.length; j++) {
                    const a = physics[i];
                    const b = physics[j];
                    if (a.dragging || b.dragging) continue;

                    const minDist = (a.w + b.w) / 2;
                    const dx = b.node.pos.x - a.node.pos.x;
                    const overlap = minDist - Math.abs(dx);

                    if (overlap > 0) {
                        const dir = dx < 0 ? -1 : 1;
                        const push = (PUSH_FORCE * overlap / minDist) * dt;

                        // Distribui o empurrão — livros mais pesados (largos) cedem menos
                        const totalW = a.w + b.w;
                        const ratioA = b.w / totalW;
                        const ratioB = a.w / totalW;

                        if (!a.settled) { a.vx -= dir * push * ratioA; a.settled = false; }
                        if (!b.settled) { b.vx += dir * push * ratioB; b.settled = false; }
                    }
                }
            }
        });

        // ── 8. MOUSE RELEASE → solta o livro com a velocidade atual ──────────
        k.onMouseRelease(() => {
            if (!draggedEntry) return;
            const e = draggedEntry;
            draggedEntry = null;
            e.dragging = false;

            // Distância horizontal da posição original
            const dxFromOrigin = Math.abs(e.node.pos.x - e.originalX);

            // Dá uma pequena velocidade inicial para parecer que foi jogado
            e.vy = 20;   // empurra um tiquinho pra baixo para a gravidade agir

            // Se moveu o suficiente, marca como "explorado"
            if (dxFromOrigin > 10) {
                gameState.objectStates[e.bookId] = "movido";
                e.node.opacity = 0.45;

                // Livro marrom → revela a chave SE ainda não foi pega
                if (e.secret && !gameState.inventory.includes("Chave Velha")) {
                    // Espera o livro pousar antes de spawnar
                    k.wait(0.35, () => {
                        _spawnKey(k, panel, e.node.pos.x, FLOOR_Y, closeScene);
                    });
                }
            }
        });

        // ── 9. BOTÃO FECHAR ───────────────────────────────────────────────────
        const closeBtn = panel.add([
            k.rect(50, 14, { radius: 2 }),
            k.pos(0, panelH / 2 - 14),
            k.anchor("center"),
            k.color(k.Color.fromHex("#553322")),
            k.area(),
        ]);
        closeBtn.add([
            k.text("Fechar", { size: 6 }),
            k.anchor("center"),
            k.color(200, 170, 120),
        ]);
        closeBtn.onHover(() => { k.setCursor("pointer"); closeBtn.color = k.Color.fromHex("#7a4433"); });
        closeBtn.onHoverEnd(() => { k.setCursor("default"); closeBtn.color = k.Color.fromHex("#553322"); });
        closeBtn.onClick(() => closeScene());
        k.onKeyPress("escape", () => closeScene());

        // ── 10. FADE OUT → volta ao jogo ─────────────────────────────────────
        function closeScene() {
            k.tween(1, 0, 0.22, (v) => {
                backdrop.opacity = v;
                panel.opacity = v;
            }, k.easings.easeInQuad).then(() => {
                k.setCursor("default");
                k.go("game");
            });
        }
    });
}

// ── FUNÇÃO INTERNA: spawna a chave quando o livro marrom é movido ─────────────
function _spawnKey(k, panel, keyX, keyY, closeScene) {
    if (gameState.inventory.includes("Chave Velha")) return;

    const key = panel.add([
        k.rect(12, 6, { radius: 2 }),
        k.pos(keyX, keyY + 14),   // aparece logo abaixo do livro marrom
        k.anchor("center"),
        k.color(k.Color.fromHex("#d4a837")),
        k.outline(1, k.Color.fromHex("#a07820")),
        k.area(),
        k.opacity(0),
    ]);

    // Surge com fade + pequeno bounce
    k.tween(0, 1, 0.35, (v) => (key.opacity = v), k.easings.easeOutQuad);
    k.tween(key.pos.y, keyY + 8, 0.3, (v) => (key.pos.y = v), k.easings.easeOutBack);

    key.onHover(() => { k.setCursor("pointer"); key.color = k.Color.fromHex("#f0c040"); });
    key.onHoverEnd(() => { k.setCursor("default"); key.color = k.Color.fromHex("#d4a837"); });

    key.onClick(() => {
        gameState.inventory.push("Chave Velha");
        gameState.pickedUpItems.push("chave_estante");
        k.destroy(key);

        // Fecha a cena e sinaliza diálogo pendente para a cena "game"
        gameState.pendingDialog = {
            title: "ITEM ENCONTRADO",
            text: "Estava escondida atrás do livro marrom. Uma chave velha, enferrujada.",
        };
        closeScene();
    });
}
