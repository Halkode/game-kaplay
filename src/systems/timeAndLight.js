// Controla o horário interno e a iluminação dinâmica do cenário.
// Horário inicial: 22:30 (noite fechada desde o início).
// A escuridão é modulada pela hora e pelo estado das luzes do quarto.

import { gameState } from "../state.js";

// ── Constantes ────────────────────────────────────────────────────────────────
const DARK_START = 1140; // 19:00 — começa a escurecer
const DARK_FULL = 1260; // 21:00 — escuridão máxima já atingida
const MAX_DARKNESS = 0.82; // opacidade máxima da película escura (0–1)

// ─────────────────────────────────────────────────────────────────────────────

/** Avança o tempo do jogo. */
export function advanceTime(minutes) {
    gameState.time += minutes;
}

/** Retorna o horário formatado HH:MM. */
export function getFormattedTime() {
    const h = Math.floor(gameState.time / 60) % 24;
    const m = gameState.time % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Calcula a opacidade da película escura para uma room específica.
 * Leva em consideração:
 *  – a hora do dia (noite = mais escuro)
 *  – se o interruptor da room ATUAL está ligado
 *  – se o jogador tem uma lanterna
 * 
 * @param {string} roomName — nome da room para consultar estado de luz
 */
export function getLightingOpacity(roomName = null) {
    const time = gameState.time;
    const targetRoom = roomName || gameState.currentRoom;

    // ── Curva base de escuridão ───────────────────────────────────────────────
    let darkness;
    if (time >= DARK_FULL) {
        darkness = MAX_DARKNESS;                                          // noite total
    } else if (time > DARK_START) {
        const t = (time - DARK_START) / (DARK_FULL - DARK_START);        // 0→1
        darkness = t * MAX_DARKNESS;                                      // rampa linear
    } else {
        // Dia (não deveria ocorrer com o horário padrão 22:30)
        darkness = 0;
    }

    // ── Abatimento pela luz da room ATUAL ─────────────────────────────────────
    // Apenas a luz da room sendo renderizada afeta a iluminação.
    // Usa gameState.getRoomLight(roomName) para verificar o estado.
    if (targetRoom && gameState.getRoomLight(targetRoom)) {
        // A luz do quarto corta a escuridão mas mantém uma escuridão residual
        // para preservar a atmosfera. Usar luz não deixa "claro como dia".
        darkness -= 0.45;
    }

    // ── Abatimento por lanterna no inventário ─────────────────────────────────
    if (gameState.inventory.includes("Lanterna")) {
        darkness -= 0.25;
    }

    // Clamp: nunca negativo, nunca opaco absoluto (para sprites sempre visíveis)
    return Math.max(0, Math.min(darkness, 0.92));
}

/**
 * Configura a película de iluminação dinâmica na cena.
 * Atualiza opacidade a cada frame baseado no estado de luz da room atual.
 * Inclui leve pulso de ruído para dar tensão na escuridão.
 * 
 * @param {object} k — instância Kaplay
 * @param {string} roomName — nome da room sendo renderizada
 */
export function setupLighting(k, roomName = null) {
    const darkScreen = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(6, 6, 18),       // azul-marinho escuro, não preto puro — mais atmosférico
        k.opacity(0),
        k.z(900),                // acima dos objetos de cena, abaixo das UIs (z > 1000)
    ]);

    // Flickering sutil: pequena variação randômica de ±0.015 na opacidade
    // Simula uma lâmpada instável ou a luz da rua piscando pela janela
    let flickerOffset = 0;
    let flickerTimer = 0;

    k.onUpdate(() => {
        flickerTimer += k.dt();

        // A cada ~0.12s sorteia um novo offset pequeno
        if (flickerTimer >= 0.12) {
            flickerTimer = 0;
            // Só faz tremer quando está bem escuro (à noite e sem luz total)
            const base = getLightingOpacity(roomName);
            if (base > 0.3) {
                flickerOffset = (Math.random() - 0.5) * 0.03;
            } else {
                flickerOffset = 0;
            }
        }

        const target = Math.max(0, Math.min(getLightingOpacity(roomName) + flickerOffset, 0.95));

        // Suaviza a transição para que o flicker não seja brusco
        darkScreen.opacity += (target - darkScreen.opacity) * 0.12;
    });
}
