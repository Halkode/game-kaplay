import { gameState } from "../core/state.js";
import { ITEMS, itemName } from "../data/items.js";
import { resolveSprite } from "../assets/loader.js";
import { skin } from "./skin.js";

// Painel de inventário: 2 colunas x 5 linhas. Clique num item para ler a descrição.
// Ícone do item: sprite "item.<id>" (16x16); sem arquivo → quadradinho cinza.

const COLS = 2;
const ROWS = 5;

export function showInventoryPanel(k) {
    const panel = k.add([
        k.rect(210, 140, { radius: 4 }),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(20, 20, 40),
        k.outline(2, k.Color.fromHex("#ffffff")),
        k.fixed(),
        k.z(10000),
        k.area(),
        "inventoryPanel",
    ]);
    skin(k, panel, 210, 140);

    panel.add([k.sprite("ui_mochila", { width: 14, height: 14 }), k.pos(-50, -58), k.anchor("center")]);
    panel.add([k.text("INVENTÁRIO", { size: 10 }), k.pos(4, -58), k.anchor("center"), k.color(255, 255, 100)]);

    const description = panel.add([
        k.text("", { size: 5, width: 190 }),
        k.pos(0, 38),
        k.anchor("center"),
        k.color(200, 200, 220),
    ]);

    const SLOT_W = 96;
    const SLOT_H = 14;
    for (let i = 0; i < COLS * ROWS; i++) {
        const px = -49 + (i % COLS) * (SLOT_W + 2);
        const py = -40 + Math.floor(i / COLS) * (SLOT_H + 2);
        const itemId = gameState.inventory[i];

        const slot = panel.add([
            k.rect(SLOT_W, SLOT_H, { radius: 2 }),
            k.pos(px, py),
            k.anchor("center"),
            k.color(40, 40, 60),
            k.outline(1, k.Color.fromHex("#888888")),
            k.area(),
        ]);

        if (!itemId) {
            slot.add([k.text("Vazio", { size: 5 }), k.anchor("center"), k.color(100, 100, 100)]);
            continue;
        }

        const icon = resolveSprite(`item.${itemId}`);
        slot.add(icon
            ? [k.sprite(icon, { width: 10, height: 10 }), k.pos(-SLOT_W / 2 + 8, 0), k.anchor("center")]
            : [k.rect(8, 8), k.pos(-SLOT_W / 2 + 8, 0), k.anchor("center"), k.color(120, 120, 140)]);
        slot.add([k.text(itemName(itemId), { size: 6 }), k.pos(-SLOT_W / 2 + 16, 0), k.anchor("left"), k.color(255, 255, 255)]);

        slot.onHover(() => k.setCursor("pointer"));
        slot.onHoverEnd(() => k.setCursor("default"));
        slot.onClick(() => { description.text = ITEMS[itemId]?.description ?? ""; });
    }

    if (gameState.inventory.length > COLS * ROWS) {
        description.text = `+${gameState.inventory.length - COLS * ROWS} itens não exibidos`;
    }

    const closeBtn = panel.add([
        k.rect(50, 14, { radius: 2 }),
        k.pos(0, 56),
        k.anchor("center"),
        k.color(200, 50, 50),
        k.area(),
    ]);
    closeBtn.add([k.text("Fechar", { size: 6 }), k.anchor("center"), k.color(255, 255, 255)]);
    closeBtn.onHover(() => { k.setCursor("pointer"); closeBtn.color = k.Color.fromHex("#ff5555"); });
    closeBtn.onHoverEnd(() => { k.setCursor("default"); closeBtn.color = k.Color.fromHex("#c83232"); });
    closeBtn.onClick(() => k.destroy(panel));

    return panel;
}
