import { createRoomScene } from "./roomSceneFactory.js";
import { salaPrimeiroAndar } from "../data/rooms/sala_primeiro_andar.js";

export function salaScene(k) {
    createRoomScene(k, "sala", salaPrimeiroAndar);
}
