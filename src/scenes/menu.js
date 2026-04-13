import { fadeOut } from "../ui/transitions.js";

export function menuScene(k) {
    k.scene("menu", () => {

        k.setBackground(k.Color.fromHex("#1a1a2e"));

        let isStarting = false;

        function addButton(txt, p, f) {
            const btn = k.add([
                k.rect(80, 20, { radius: 2 }),
                k.pos(p),
                k.area(),
                k.anchor("center"),
                k.color(255, 255, 255),
            ]);

            btn.add([
                k.text(txt, { size: 8 }),
                k.anchor("center"),
                k.color(0, 0, 0),
            ]);

            btn.onHover(() => {
                if (isStarting) return;
                btn.color = k.Color.fromHex("#a0a0ff");
                k.setCursor("pointer");
            });

            btn.onHoverEnd(() => {
                btn.color = k.Color.fromHex("#ffffff");
                k.setCursor("default");
            });

            btn.onClick(async () => {
                if (isStarting) return;
                isStarting = true;
                k.setCursor("default");
                await f();
            });
            return btn;
        }

        k.add([
            k.text("Meu Jogo", { size: 16 }),
            k.pos(k.center().x, k.center().y - 30),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        const loading = k.add([
            k.text("", { size: 6 }),
            k.pos(k.center().x, k.center().y + 34),
            k.anchor("center"),
            k.color(180, 180, 220),
            k.opacity(0),
        ]);

        let dots = 0;
        k.loop(0.18, () => {
            if (!isStarting) return;
            dots = (dots + 1) % 4;
            loading.text = `Carregando${".".repeat(dots)}`;
            loading.opacity = 1;
        });

        addButton("Jogar", k.vec2(k.center().x, k.center().y + 10), async () => {
            await fadeOut(k, 0.45);
            k.go("game");
        });
    });
}