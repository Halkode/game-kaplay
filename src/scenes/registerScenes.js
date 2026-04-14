import { menuScene } from "./menu.js";
import { gameScene } from "./game.js";
import { bookshelfScene } from "./bookshelf.js";
import { corridorScene } from "./corridor.js";
import { quartoDoisScene } from "./quarto_dois.js";
import { cozinhaScene } from "./cozinha.js";
import { salaScene } from "./sala.js";
import { quintalScene } from "./quintal.js";
import { creditsScene } from "./credits.js";

export function registerScenes(k) {
    menuScene(k);
    gameScene(k);
    bookshelfScene(k);
    corridorScene(k);
    quartoDoisScene(k);
    cozinhaScene(k);
    salaScene(k);
    quintalScene(k);
    creditsScene(k);
}