import { menuScene } from "./menu.js";
import { bookshelfScene } from "./bookshelf.js";
import { quintalScene } from "./quintal.js";
import { creditsScene } from "./credits.js";
import { registerRoomScene } from "./roomScene.js";
import { ROOMS } from "../data/rooms/index.js";

export function registerScenes(k) {
    menuScene(k);
    bookshelfScene(k);
    quintalScene(k);
    creditsScene(k);
    ROOMS.forEach((room) => registerRoomScene(k, room));
}
