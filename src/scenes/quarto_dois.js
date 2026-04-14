import { createRoomScene } from "./roomSceneFactory.js";
import { quarto_dois_segundo_andar } from "../data/rooms/quarto_dois_segundo_andar.js";

export function quartoDoisScene(k) {
    createRoomScene(k, "quarto_dois", quarto_dois_segundo_andar);
}
