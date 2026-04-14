import kaplay from "kaplay";
import { loadSprites } from "./assets/sprites.js";
import { registerScenes } from "./scenes/registerScenes.js";
import { gameState } from "./state.js";

// Inicializa variáveis do estado (como sistema de injuries)
gameState.initializeGame();

const k = kaplay({
    width: 240,
    height: 160,
    letterbox: true,
    crisp: true,
    scale: 3,
    debug: true,
});


loadSprites(k);
registerScenes(k);

const originalSetCursor = k.setCursor;

k.setCursor = (c) => {
    if (c === "pointer") {
        originalSetCursor("url('/sprites/pointer.png'), pointer");
    } else {
        originalSetCursor("url('/sprites/cursor.png'), auto");
    }
};

k.onLoad(() => {
    k.setCursor("default");
    k.go("menu");
});