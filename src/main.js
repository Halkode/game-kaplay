import kaplay from "kaplay";
import { menuScene } from "./scenes/menu.js";
import { gameScene } from "./scenes/game.js";

const k = kaplay({
    width: 240,
    height: 160,
    letterbox: true,
    crisp: true,
    scale: 3,
    debug: true,
});

k.loadSprite("cursor", "/sprites/cursor.png");
k.loadSprite("pointer", "/sprites/pointer.png");
k.loadSprite("bag", "/sprites/bag.png");
k.loadSprite("parede_quarto", "/sprites/textura_parede_quarto.png");
k.loadSprite("interruptor_quarto", "/sprites/interruptor_quarto.png");
k.loadSprite("estante_livros", "/sprites/estante_livros.png");
k.loadSprite("porta_quarto", "/sprites/porta_quarto.png");

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
});

menuScene(k);
gameScene(k);

k.go("menu");