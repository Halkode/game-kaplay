import { gameState } from "../state.js";

export function showInventoryPanel(k) {
    // Painel de fundo
    const panel = k.add([
        k.rect(200, 130, { radius: 4 }),
        k.pos(k.center().x, k.center().y),
        k.anchor("center"),
        k.color(20, 20, 40),
        k.outline(2, k.Color.fromHex("#ffffff")),
        k.fixed(),
        k.z(10000),
        k.area(),
        "inventoryPanel"
    ]);

    // Título
    panel.add([
        k.sprite("bag", { width: 20, height: 20 }), // Força tamanho exato de UI
        k.pos(-60, -50),
        k.anchor("center")
    ]);

    panel.add([
        k.text("INVENTÁRIO", { size: 10 }),
        k.pos(0, -50),
        k.anchor("center"),
        k.color(255, 255, 100),
    ]);

    // Grid de no máximo 6 itens (limite pedido)
    const MAX_ITEMS = 6;
    const cols = 2; // 2 colunas
    const startX = -50;
    const startY = -20;
    const gapX = 100;
    const gapY = 30;

    for (let i = 0; i < MAX_ITEMS; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const px = startX + (col * gapX);
        const py = startY + (row * gapY);

        // Fundo do slot individual
        panel.add([
            k.rect(80, 20, { radius: 2 }),
            k.pos(px, py),
            k.anchor("center"),
            k.color(40, 40, 60),
            k.outline(1, k.Color.fromHex("#888888"))
        ]);

        // Checa se existe item para esse slot
        if (i < gameState.inventory.length) {
            const item = gameState.inventory[i];
            panel.add([
                k.text(item, { size: 6 }),
                k.pos(px, py),
                k.anchor("center"),
                k.color(255, 255, 255),
            ]);
        } else {
            // Slot vazio
            panel.add([
                k.text("Vazio", { size: 5 }),
                k.pos(px, py),
                k.anchor("center"),
                k.color(100, 100, 100),
            ]);
        }
    }

    // Botão Fechar
    const closeBtn = panel.add([
        k.rect(50, 14, { radius: 2 }),
        k.pos(0, 50),
        k.anchor("center"),
        k.color(200, 50, 50),
        k.area()
    ]);

    closeBtn.add([
        k.text("Fechar", { size: 6 }),
        k.anchor("center"),
        k.color(255, 255, 255)
    ]);

    closeBtn.onHover(() => {
        k.setCursor("pointer");
        closeBtn.color = k.Color.fromHex("#ff5555");
    });

    closeBtn.onHoverEnd(() => {
        k.setCursor("default");
        closeBtn.color = k.Color.fromHex("#c83232");
    });

    closeBtn.onClick(() => {
        k.destroy(panel);
    });

    return panel;
}
