export const gameState = {
    inventory: [],
    pickedUpItems: [],
    objectStates: {}, // Guarda o status interno de objetos vivos. Ex: { "janela_inicial": "aberta" }
    time: 1050, // Minutos totais (1050 = 17:30)
    actionCounters: {}, // Guarda quantas vezes o jogador insistiu em algo
    settings: {
        controlMode: navigator.maxTouchPoints > 0 ? "buttons" : "mouse", // "mouse" ou "buttons"
        sound: true
    }
};
