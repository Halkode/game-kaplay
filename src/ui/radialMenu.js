export function createRadialMenu(k, clickPos, availableActions, onAction, sourceObj) {
    const RADIUS = 22;
    const ACTIONS = [
        { label: "Examinar", angle: 270 },
        { label: "Pegar", angle: 195 },
        { label: "Usar", angle: 345 },
    ];
    const items = [];
    let ready = false;

    k.wait(0.2, () => { ready = true; });

    const menu = {
        items,
        hoveredCount: 0,
        isHovering() { return this.hoveredCount > 0; },
        destroy() {
            items.forEach(i => k.destroy(i.btn));
        }
    };

    ACTIONS.forEach(action => {
        const available = availableActions.includes(action.label);
        const rad = (action.angle * Math.PI) / 180;

        const targetX = clickPos.x + Math.cos(rad) * RADIUS;
        const targetY = clickPos.y + Math.sin(rad) * RADIUS;

        const btn = k.add([
            k.rect(28, 12, { radius: 2 }),
            k.pos(clickPos.x, clickPos.y),
            k.anchor("center"),
            k.color(available ? k.Color.fromHex("#ffffff") : k.Color.fromHex("#555555")),
            k.area(),
            k.fixed(),
            k.z(10006),
        ]);

        btn.add([
            k.text(action.label, { size: 5 }),
            k.anchor("center"),
            k.color(available ? k.Color.fromHex("#000000") : k.Color.fromHex("#888888")),
        ]);

        k.tween(
            k.vec2(clickPos.x, clickPos.y),
            k.vec2(targetX, targetY),
            0.15,
            (val) => {
                if (btn.exists()) {
                    btn.pos = val;
                }
            },
            k.easings.easeOutBack,
        );

        if (available) {
            btn.onHover(() => {
                k.setCursor("pointer");
                menu.hoveredCount++;
            });
            btn.onHoverEnd(() => {
                k.setCursor("default");
                menu.hoveredCount--;
            });
            btn.onClick(() => {
                if (!ready) return;
                onAction(action.label);
                menu.destroy();
            });
        }

        items.push({ btn });
    });

    return menu;
}