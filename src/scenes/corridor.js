import { createRoomScene } from "./roomSceneFactory.js";
import { corredor } from "../data/rooms/corredor_segundo_andar.js";

export function corridorScene(k) {
    createRoomScene(k, "corridor", corredor);
}
