// scenes/cozinha.js
// Usa getCozinhaData() para escolher entre cenário devastado (pulo) e normal.
import { createRoomScene } from "./roomSceneFactory.js";
import { getCozinhaData } from "../data/rooms/cozinha.js";

export function cozinhaScene(k) {
    // getCozinhaData() lê gameState.pathChoices em tempo de execução,
    // então sempre reflete o caminho que o jogador tomou.
    const roomData = getCozinhaData();
    createRoomScene(k, "cozinha", roomData);
}