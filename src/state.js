// src/state.js

import { initializeInjurySystem } from "./systems/injuries.js";

export const gameState = {
    inventory: [],
    pickedUpItems: [],
    objectStates: {},
    time: 1350,
    actionCounters: {},
    flags: {},
    pathChoices: [],
    pendingDialog: null,
    savedCamX: null,
    ending: null,
    currentRoom: null,
    roomLights: {},
    settings: {
        controlMode: navigator.maxTouchPoints > 0 ? "buttons" : "mouse",
        sound: true,
    },

    injuries: {},
    bloodLoss: 0,
    totalPain: 0,
    consciousness: 100,
    injuryHistory: [],

    // ── Methods ──
    setRoomLight(roomName, isOn) {
        this.roomLights[roomName] = isOn;
    },

    getRoomLight(roomName) {
        return this.roomLights[roomName] ?? false;
    },

    recordPathChoice(choice) {
        if (!this.pathChoices.includes(choice)) {
            this.pathChoices.push(choice);
        }
    },

    initializeGame() {
        initializeInjurySystem();
    }
};