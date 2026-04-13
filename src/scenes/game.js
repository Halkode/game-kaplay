import { createRoomScene } from "./roomSceneFactory.js";
import { quarto_inicial_segundo_andar } from "../data/rooms/quarto_inicial_segundo_andar.js";

export function gameScene(k) {
    createRoomScene(k, "game", quarto_inicial_segundo_andar);
}
