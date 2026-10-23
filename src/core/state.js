// Estado global do jogo (uma única fonte de verdade).
// Tudo que precisa ser zerado ao recomeçar fica em createInitialState().

import { createInjuryState } from "../systems/injuries.js";

export const START_TIME = 22 * 60 + 30; // 22:30

function createInitialState() {
    return {
        inventory: [],          // ids de itens (ver data/items.js)
        pickedUpItems: [],      // chaves "sala.objeto" já removidas do cenário
        objectStates: {},       // "sala.objeto" → estado ("fechada", "aberta", ...)
        actionCounters: {},     // contadores de "examinou N vezes"
        flags: {},              // marcos de narrativa
        pathChoices: [],        // escolhas de rota ("window", ...)
        roomLights: {},         // sala → luz ligada?
        time: START_TIME,       // minutos desde 00:00
        pendingDialog: null,    // diálogo mostrado ao entrar na próxima sala
        savedCamX: null,        // posição de câmera ao voltar de um minigame
        ending: null,           // id do final (ver data/endings.js)
        currentRoom: null,
        ...createInjuryState(),
    };
}

export const gameState = {
    ...createInitialState(),

    settings: {
        controlMode: navigator.maxTouchPoints > 0 ? "buttons" : "mouse",
        sound: true,
    },

    // ── Inventário ──
    hasItem(id) {
        return this.inventory.includes(id);
    },
    addItem(id) {
        if (!this.inventory.includes(id)) this.inventory.push(id);
    },
    removeItem(id) {
        this.inventory = this.inventory.filter((i) => i !== id);
    },

    // ── Luz ──
    setRoomLight(roomName, isOn) {
        this.roomLights[roomName] = isOn;
    },
    getRoomLight(roomName) {
        return this.roomLights[roomName] ?? false;
    },

    recordPathChoice(choice) {
        if (!this.pathChoices.includes(choice)) this.pathChoices.push(choice);
    },
};

/** Zera a partida mantendo as configurações do jogador. */
export function resetGameState() {
    Object.assign(gameState, createInitialState());
}
