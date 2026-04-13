// scenes/cozinha.js
// Usa getCozinhaData() para escolher entre cenário devastado (pulo) e normal.
import { createRoomScene } from "./roomSceneFactory.js";
import { getCozinhaData } from "../data/rooms/cozinha.js";

export function cozinhaScene(k) {
    // Passamos a REFERÊNCIA da função getCozinhaData.
    // Assim o roomSceneFactory avaliará o cenário dinamicamente
    // sempre que o jogador entrar na cena da cozinha, lendo o gameState atualizado.
    createRoomScene(k, "cozinha", getCozinhaData);
}