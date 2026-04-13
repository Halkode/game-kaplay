import { gameState } from "../state.js";

export function createRadialMenu(k, clickPos, availableActions, onAction, stateRef) {
    // Escala amigável para dedos se for "buttons" (Touch/Mobile mode registrado no settings.js)
    const isMobile = gameState.settings.controlMode !== "mouse";
    const RADIUS = isMobile ? 32 : 24;
    const BTN_WIDTH = isMobile ? 48 : 34;
    const BTN_HEIGHT = isMobile ? 22 : 13;

    const items = [];
    let ready = false;

    // O delay de 0.12s já existia — mantemos ele pois evita
    // que o clique que ABRIU o menu dispare imediatamente num botão
    k.wait(0.12, () => {
        ready = true;
    });

    const menu = {
        items,
        isHovering() {
            // Em dispositivos de toque (mobile), o hover sintético do kaplay às vezes bate falso no frame exato do Tap
            // Usamos a flag nativa do objeto btn.isHovering() que cobre matematicamente
            return items.some((item) => item.btn.isHovering());
        },
        destroy() {
            items.forEach((item) => {
                if (item.btn.exists()) {
                    k.destroy(item.btn);
                }
            });
        },
    };

    const count = Math.max(availableActions.length, 1);
    availableActions.forEach((action, index) => {
        const angleStart = -120;
        const angleEnd = 120;
        const angle =
            count === 1
                ? -90
                : angleStart + (index * (angleEnd - angleStart)) / (count - 1);

        const rad = (angle * Math.PI) / 180;
        const targetX = clickPos.x + Math.cos(rad) * RADIUS;
        const targetY = clickPos.y + Math.sin(rad) * RADIUS;

        const btn = k.add([
            k.rect(BTN_WIDTH, BTN_HEIGHT, { radius: 2 }),
            k.pos(clickPos.x, clickPos.y),
            k.anchor("center"),
            k.color(k.Color.fromHex("#ffffff")),
            k.area(),
            k.fixed(),
            k.z(10006),
        ]);

        btn.add([
            k.text(action, { size: isMobile ? 7 : 5 }),
            k.anchor("center"),
            k.color(k.Color.fromHex("#111111")),
        ]);

        const item = { btn };

        k.tween(
            k.vec2(clickPos.x, clickPos.y),
            k.vec2(targetX, targetY),
            0.14,
            (val) => {
                if (btn.exists()) btn.pos = val;
            },
            k.easings.easeOutBack
        );

        btn.onHover(() => {
            btn.color = k.Color.fromHex("#e2e2ff");
            k.setCursor("pointer");
        });

        btn.onHoverEnd(() => {
            btn.color = k.Color.fromHex("#ffffff");
            k.setCursor("default");
        });

        btn.onClick(() => {
            if (!ready) return;

            // Marca no state que o menu consumiu este clique.
            // O o.onClick do objeto checará esse flag e abortará.
            if (stateRef) {
                stateRef.menuConsumedClick = true;
            }

            onAction(action);
            menu.destroy();
        });

        items.push(item);
    });

    return menu;
}