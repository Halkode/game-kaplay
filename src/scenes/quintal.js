import { gameState } from "../state.js";
import { fadeOutAndGo } from "../ui/transitions.js";

export function quintalScene(k) {
    k.scene("quintal", () => {
        k.setCursor("default");
        k.wait(1, () => {
            // O jogador escapou. O quintal encerra a demontração por enquanto.
            gameState.ending = "Sobrevivente";
            fadeOutAndGo(k, "credits", 2);
        });
    });
}
