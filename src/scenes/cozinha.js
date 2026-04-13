import { createRoomScene } from "./roomSceneFactory.js";
import { cozinha } from "../data/rooms/cozinha.js";

export function cozinhaScene(k) {
    createRoomScene(k, "cozinha", cozinha);
}
