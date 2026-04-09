import { gameState } from "../state.js";

// Avança o tempo do jogo
export function advanceTime(minutes) {
    gameState.time += minutes;
}

// Formata o número inteiro em formato de relógio HH:MM
export function getFormattedTime() {
    const totalMinutes = gameState.time;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm}`;
}

/**
 * Calcula a opacidade da escuridão do cenário.
 * Leva em consideração a hora do dia e as luzes ligadas no ambiente.
 */
export function getLightingOpacity() {
    // 1050 (17:30) -> 0.0 (Claro)
    // 1200 (20:00) -> 0.85 (Muito escuro)
    const baseLightTime = 1050; 
    const maxDarkTime = 1200;
    
    let darkness = 0;
    if (gameState.time >= maxDarkTime) {
        darkness = 0.85; // Escuridão máxima padrão
    } else if (gameState.time > baseLightTime) {
        // Interpolação suave de 0 até 0.85 baseado no horário
        const progress = (gameState.time - baseLightTime) / (maxDarkTime - baseLightTime);
        darkness = progress * 0.85;
    }

    // Abatimento de Luzes do Cenário!
    // Se o jogador ligar uma lâmpada ou possuir uma lanterna, reduzimos a escuridão ambiente.
    // Ex: "luz_teto" ou ter "Lanterna" no inventario
    if (gameState.inventory.includes("Lanterna")) {
        darkness -= 0.3; 
    }
    
    // Varre os estados dos objetos para ver se alguma lâmpada está "on"
    let hasRoomLight = false;
    for (const key in gameState.objectStates) {
        if (key.includes("luz") || key.includes("interruptor")) {
            if (gameState.objectStates[key] === "on") {
                hasRoomLight = true;
            }
        }
    }

    if (hasRoomLight) {
        // Se tem luz no quarto, a escuridão geral é quebrada bruscamente!
        darkness -= 0.6;
    }

    // Trava para não ficar com opacidade negativa nem totalmente preto absoluto
    return Math.max(0, Math.min(darkness, 0.95));
}

export function setupLighting(k) {
    const darkScreen = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(10, 10, 25), // Escuridão puxada pro azul noturno
        k.opacity(0), // Começa clara, ajustada dinamicamente
        k.z(900), // Camada alta, fica por cima dos móveis, MAS abaixo das UIs (Inventário, HUD, Diálogos) que são > 1000
    ]);

    // O Update fará a película ficar escura caso advanceTime mude e as luzes se apagam.
    k.onUpdate(() => {
        darkScreen.opacity = getLightingOpacity();
    });
}
