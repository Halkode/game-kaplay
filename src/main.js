import kaplay from "kaplay";
import { loadAllSprites } from "./assets/loader.js";
import { registerScenes } from "./scenes/registerScenes.js";
import { VIEW_WIDTH, VIEW_HEIGHT, SCALE, START_SCENE } from "./config/game.js";
import cursorUrl from "./assets/cursores/cursor.png?url";
import pointerUrl from "./assets/cursores/pointer.png?url";

const k = kaplay({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    letterbox: true,
    crisp: true,
    scale: SCALE,
    debug: import.meta.env.DEV, // F1 abre o inspetor só em desenvolvimento
});

loadAllSprites(k);
registerScenes(k);
if (import.meta.env.DEV) window.__k = k; // console: __k.go("sala")

// Cursores customizados (URLs resolvidas pelo Vite, funcionam em qualquer subpasta)
const CURSORS = {
    default: `url('${cursorUrl}'), auto`,
    pointer: `url('${pointerUrl}'), pointer`,
};
const originalSetCursor = k.setCursor;
k.setCursor = (c) => originalSetCursor(c === "pointer" ? CURSORS.pointer : CURSORS.default);

k.onLoad(() => {
    k.setCursor("default");
    k.go(START_SCENE);
});
