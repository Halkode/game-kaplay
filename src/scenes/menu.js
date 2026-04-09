export function menuScene(k) {
    k.scene("menu", () => {

        k.setBackground(k.Color.fromHex("#1a1a2e"));

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
                btn.color = k.Color.fromHex("#a0a0ff");
                k.setCursor("pointer");
            });

            btn.onHoverEnd(() => {
                btn.color = k.Color.fromHex("#ffffff");
                k.setCursor("default");
            });

            btn.onClick(() => {
                k.setCursor("default");
                f();
            });
            return btn;
        }

        k.add([
            k.text("Meu Jogo", { size: 16 }),
            k.pos(k.center().x, k.center().y - 30),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        addButton("Jogar", k.vec2(k.center().x, k.center().y + 10), () => k.go("game"));
    });
}