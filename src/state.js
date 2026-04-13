export const gameState = {
    inventory: [],
    pickedUpItems: [],
    objectStates: {}, // Guarda o status interno de objetos vivos. Ex: { "janela_inicial": "aberta" }
    time: 1350, // Minutos totais (1350 = 22:30 — noite fechada)
    actionCounters: {}, // Guarda quantas vezes o jogador insistiu em algo
    pendingDialog: null, // Diálogo a exibir ao retornar de outra cena
    savedCamX: null,     // Posição da câmera salva ao entrar em sub-cenas
    ending: null,        // Final alcançado: null | "X" | "Y"
    currentRoom: null,   // Room sendo renderizada atualmente
    roomLights: {},      // Estado de luz por room. Ex: { "quarto_um": true, "cozinha": false }
    settings: {
        controlMode: navigator.maxTouchPoints > 0 ? "buttons" : "mouse",
        sound: true,
    },

    /**
     * Define o estado da luz para uma room específica.
     * @param {string} roomName — nome da room
     * @param {boolean} isOn — true para luz ligada, false para desligada
     */
    setRoomLight(roomName, isOn) {
        this.roomLights[roomName] = isOn;
    },

    /**
     * Obtém o estado da luz para uma room específica.
     * @param {string} roomName — nome da room
     * @returns {boolean} true se a luz está ligada, false caso contrário
     */
    getRoomLight(roomName) {
        return this.roomLights[roomName] ?? false;
    },
};
