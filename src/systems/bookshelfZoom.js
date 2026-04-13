// systems/bookshelfZoom.js

import { gameState } from "../state.js";
import { showDialog } from "../ui/dialog.js";

/**
 * Abre o zoom da estante como overlay.
 * Chame assim em interactions.js:
 * 
 *   import { openBookshelfZoom } from "./bookshelfZoom.js";
 * 
 *   if (objData.id === "estante_quarto_escuro" && action === "Usar") {
 *       openBookshelfZoom(k, stateContext);
 *       return;
 *   }
 */
export function openBookshelfZoom(k, stateContext) {
    if (stateContext.inDialog || stateContext.inSettings) return;
    stateContext.inDialog = true;

    // ── 1. FUNDO ESCURO ──────────────────────────────────────────────
    const backdrop = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(0, 0, 0),
        k.opacity(0),
        k.z(9500),
    ]);

    k.tween(0, 0.8, 0.35, (v) => backdrop.opacity = v, k.easings.easeOutQuad);

    // ── 2. PAINEL DA ESTANTE ─────────────────────────────────────────
    const panelW = k.width() - 20;
    const panelH = k.height() - 30;

    const panel = k.add([
        k.rect(panelW, panelH, { radius: 6 }),
        k.pos(k.center()),
        k.anchor("center"),
        k.fixed(),
        k.color(40, 28, 18),        // tom de madeira escura
        k.outline(2, k.Color.fromHex("#7a5230")),
        k.opacity(0),
        k.z(9600),
    ]);

    k.tween(0, 1, 0.35, (v) => panel.opacity = v, k.easings.easeOutQuad);

    // ── 3. TÍTULO ────────────────────────────────────────────────────
    panel.add([
        k.text("ESTANTE DE LIVROS", { size: 8 }),
        k.pos(0, -(panelH / 2) + 10),
        k.anchor("center"),
        k.color(200, 170, 120),
    ]);

    // ── 4. DEFINIÇÃO DOS LIVROS ──────────────────────────────────────
    // Cada livro tem posição, cor, largura e se esconde algo
    const BOOKS = [
        { id: "livro_vermelho", x: -90, color: "#8b2020", w: 14, label: "Vermelho" },
        { id: "livro_azul", x: -72, color: "#20408b", w: 18, label: "Azul" },
        { id: "livro_verde", x: -50, color: "#2d6b30", w: 12, label: "Verde" },
        { id: "livro_amarelo", x: -34, color: "#9b8b20", w: 16, label: "Amarelo" },
        { id: "livro_marrom", x: -14, color: "#5a3a1a", w: 20, label: "Marrom" }, // ← esconde a chave
        { id: "livro_cinza", x: 10, color: "#555555", w: 14, label: "Cinza" },
        { id: "livro_roxo", x: 28, color: "#5a2080", w: 16, label: "Roxo" },
        { id: "livro_bege", x: 48, color: "#c8a870", w: 18, label: "Bege" },
        { id: "livro_preto", x: 70, color: "#1a1a1a", w: 14, label: "Preto" },
    ];

    const bookH = 40;
    const shelfY = 10; // centro vertical do painel

    // ── 5. PRATELEIRA (linha visual) ─────────────────────────────────
    panel.add([
        k.rect(panelW - 20, 3),
        k.pos(0, shelfY + bookH / 2 + 2),
        k.anchor("center"),
        k.color(100, 70, 40),
    ]);

    // ── 6. SPAWN DOS LIVROS ──────────────────────────────────────────
    let draggedBook = null;

    BOOKS.forEach((bookData) => {
        const alreadyMoved = gameState.objectStates[bookData.id] === "movido";

        const book = panel.add([
            k.rect(bookData.w, bookH, { radius: 2 }),
            k.pos(bookData.x, shelfY),
            k.anchor("center"),
            k.color(k.Color.fromHex(bookData.color)),
            k.outline(1, k.Color.fromHex("#000000")),
            k.area(),
            k.opacity(alreadyMoved ? 0.3 : 1),
            alreadyMoved ? "" : "draggable_book",
            { originalPos: k.vec2(bookData.x, shelfY), id: bookData.id }
        ]);

        book.add([
            k.rect(bookData.w - 4, 2),
            k.pos(0, -8),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(0.2),
        ]);

        if (alreadyMoved) {
            book.pos.y = shelfY + 15;
            return;
        }

        book.onHover(() => k.setCursor("pointer"));
        book.onHoverEnd(() => k.setCursor("default"));

        book.onMouseDown(() => {
            if (stateContext.inDialog) return;
            draggedBook = book;
        });
    });

    // Lógica global de arrastar e soltar — handle salvo para cancelar ao fechar
    const updateHandle = k.onUpdate(() => {
        if (draggedBook) {
            const mPos = k.mousePos();
            const localPos = mPos.sub(panel.pos);
            draggedBook.pos = k.vec2(
                k.clamp(localPos.x, -panelW/2 + 10, panelW/2 - 10),
                k.clamp(localPos.y, -panelH/2 + 20, panelH/2 - 20)
            );
        }
    });

    const mouseReleaseHandle = k.onMouseRelease(() => {
        if (draggedBook) {
            const book = draggedBook;
            draggedBook = null;

            const dist = book.pos.dist(book.originalPos);
            if (dist > 12) {
                gameState.objectStates[book.id] = "movido";
                book.opacity = 0.3;
                if (book.id === "livro_marrom") {
                    _spawnKey(k, panel, book.pos.x, book.pos.y, stateContext, closeZoom);
                }
            } else {
                k.tween(
                    book.pos,
                    book.originalPos,
                    0.2,
                    (v) => book.pos = v,
                    k.easings.easeOutQuad
                );
            }
        }
    });

    const escHandle = k.onKeyPress("escape", () => closeZoom());

    // ── 7. BOTÃO FECHAR ──────────────────────────────────────────────
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
    closeBtn.onClick(() => closeZoom());

    // ── 8. FECHAR OVERLAY ────────────────────────────────────────────
    function closeZoom() {
        // Cancela listeners globais para não vazarem para a cena
        updateHandle.cancel();
        mouseReleaseHandle.cancel();
        escHandle.cancel();
        draggedBook = null;

        k.tween(1, 0, 0.25, (v) => {
            if (backdrop.exists()) backdrop.opacity = v;
            if (panel.exists()) panel.opacity = v;
        }, k.easings.easeInQuad).then(() => {
            if (backdrop.exists()) k.destroy(backdrop);
            if (panel.exists()) k.destroy(panel);
            k.setCursor("default");
            stateContext.inDialog = false;
        });
    }
}

// ── FUNÇÃO INTERNA: spawna a chave atrás do livro ───────────────────
function _spawnKey(k, panel, bookX, shelfY, stateContext, closeZoom) {
    // Não spawna se chave já foi pega
    if (gameState.inventory.includes("Chave Velha")) return;

    const key = panel.add([
        k.rect(10, 6, { radius: 2 }),
        k.pos(bookX, shelfY + 10),
        k.anchor("center"),
        k.color(k.Color.fromHex("#d4a837")),
        k.outline(1, k.Color.fromHex("#a07820")),
        k.area(),
        k.opacity(0),
    ]);

    // Surge com fade
    k.tween(0, 1, 0.3, (v) => key.opacity = v, k.easings.easeOutQuad);

    key.onHover(() => { k.setCursor("pointer"); key.color = k.Color.fromHex("#f0c040"); });
    key.onHoverEnd(() => { k.setCursor("default"); key.color = k.Color.fromHex("#d4a837"); });

    key.onClick(() => {
        gameState.inventory.push("Chave Velha");
        gameState.pickedUpItems.push("chave_estante");
        k.destroy(key);

        // Fecha o zoom e abre o diálogo de item encontrado
        closeZoom();

        // Pequeno delay para o overlay fechar antes do diálogo abrir
        k.wait(0.3, () => {
            stateContext.inDialog = true;
            showDialog(
                k,
                "ITEM ENCONTRADO",
                "Estava escondida atrás do livro marrom. Uma chave velha, enferrujada.",
                () => { stateContext.inDialog = false; }
            );
        });
    });
}