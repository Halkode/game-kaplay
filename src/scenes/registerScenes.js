import { menuScene } from "./menu.js";
import { gameScene } from "./game.js";
import { bookshelfScene } from "./bookshelf.js";
import { corridorScene } from "./corridor.js";
import { cozinhaScene } from "./cozinha.js";
import { salaScene } from "./sala.js";
import { creditsScene } from "./credits.js";

export function registerScenes(k) {
    menuScene(k);
    gameScene(k);
    bookshelfScene(k);
    corridorScene(k);
    cozinhaScene(k);
    salaScene(k);
    creditsScene(k);
}