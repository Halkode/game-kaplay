// Quintal: tela curta de saída antes dos créditos.
// gameState.ending já foi definido pela saída usada (campo `ending` em data/rooms).

import { fadeOutAndGo, fadeIn } from "../ui/transitions.js";
import { resolveSprite } from "../assets/loader.js";

export function quintalScene(k) {
    k.scene("quintal", () => {
        k.setCursor("default");
        k.setCamPos(k.width() / 2, k.height() / 2);

        const bg = resolveSprite("quintal.fundo");
        if (bg) {
            k.add([k.sprite(bg, { width: k.width(), height: k.height() }), k.pos(0, 0)]);
        } else {
            k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(8, 14, 12)]);
        }
        k.add([
            k.text("Lá fora.", { size: 10 }),
            k.pos(k.center()),
            k.anchor("center"),
            k.color(200, 210, 200),
        ]);
        fadeIn(k, 0.8);
        k.wait(2, () => fadeOutAndGo(k, "credits", 2));
    });
}
