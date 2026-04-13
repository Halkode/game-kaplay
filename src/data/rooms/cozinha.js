// data/rooms/cozinha.js
// A cozinha tem dois cenários:
//   - "devastada": jogador pulou pela janela (mesa quebrada, destroços no telhado)
//   - "normal":    jogador entrou pela porta da sala
//
// A função getCozinhaData() retorna o objeto correto baseado em gameState.

import { gameState } from "../../state.js";

// ── Objetos compartilhados entre os dois cenários ─────────────────────────────
const _walls = [
    { x: 0,   color: "#3a3028" },
    { x: 240, color: "#3a3028" },
    { x: 480, color: "#3a3028" },
    { x: 720, color: "#3a3028" },
];

// ── Cenário DEVASTADO (pulo pela janela) ──────────────────────────────────────
const cozinha_devastada = {
    walls: _walls,
    objects: [
        // ── PONTO DE ENTRADA: Buraco no telhado onde o jogador caiu ──────────
        {
            id: "cozinha.buraco_telhado",
            x: 200, y: 50,
            label: "Buraco no Teto",
            color: "#1a1208",
            width: 60, height: 20,
            actions: ["Examinar"],
            defaultState: "aberto",
        },
        // Destroços de telha espalhados
        {
            id: "cozinha.destrocos_telha",
            x: 160, y: 140,
            label: "Pedaço de Telha",
            color: "#7a6050",
            width: 35, height: 12,
            actions: ["Examinar", "Pegar"],
            defaultState: "intacto",
        },
        {
            id: "cozinha.destrocos_telha2",
            x: 240, y: 148,
            label: "Pedaço de Telha Pontiagudo",
            color: "#6a5545",
            width: 18, height: 8,
            actions: ["Examinar", "Pegar"],
            defaultState: "intacto",
        },

        // ── MESA QUEBRADA (caiu em cima) ─────────────────────────────────────
        {
            id: "cozinha.mesa_quebrada",
            x: 200, y: 120,
            label: "Mesa Quebrada",
            color: "#5a3a1a",
            width: 55, height: 22,
            actions: ["Examinar"],
            defaultState: "destruida",
        },
        // Perna da mesa no chão — pode usar como alavanca
        {
            id: "cozinha.perna_mesa",
            x: 160, y: 152,
            label: "Perna de Mesa",
            color: "#6b4c2a",
            width: 8, height: 30,
            actions: ["Examinar", "Pegar"],
            defaultState: "intacto",
        },

        // ── GELADEIRA ────────────────────────────────────────────────────────
        {
            id: "cozinha.geladeira",
            x: 400, y: 95,
            label: "Geladeira",
            color: "#7f8c8d",
            width: 38, height: 62,
            actions: ["Examinar", "Abrir"],
            defaultState: "fechada",
        },

        // ── PIA ──────────────────────────────────────────────────────────────
        {
            id: "cozinha.pia",
            x: 520, y: 110,
            label: "Pia",
            color: "#2980b9",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
            defaultState: "seca",
        },

        // ── ARMÁRIO COM FECHADURA ────────────────────────────────────────────
        // Trancado. A faca de cozinha está dentro — necessária para cortar
        // a corda que bloqueia a porta da despensa.
        {
            id: "cozinha.armario_trancado",
            x: 640, y: 92,
            label: "Armário",
            color: "#4a3020",
            width: 38, height: 65,
            actions: ["Examinar", "Abrir"],
            defaultState: "trancado",
        },

        // ── NOTA NO CHÃO (perto dos destroços) ──────────────────────────────
        {
            id: "cozinha.nota_chao",
            x: 300, y: 150,
            label: "Nota",
            color: "#e8dcc8",
            width: 14, height: 10,
            actions: ["Examinar"],
            defaultState: "unread",
        },

        // ── FOGÃO (apagado, botões travados) ─────────────────────────────────
        {
            id: "cozinha.fogao",
            x: 760, y: 110,
            label: "Fogão",
            color: "#555555",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
            defaultState: "apagado",
        },

        // ── PORTA DESPENSA (bloqueada por corda) ─────────────────────────────
        // Puzzle: cortar a corda com a faca → acessar escada para a despensa
        {
            id: "cozinha.porta_despensa",
            x: 880, y: 96,
            label: "Porta da Despensa",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "corridor",
            requires: { item: "Corda Cortada" },
            actions: ["Examinar", "Usar"],
            defaultState: "bloqueada",
            transitionText: "Você empurra a porta da despensa. Ela cede lentamente.",
            arrivalTitle: "Corredor de Serviço",
            arrivalText: "Um corredor estreito com uma escada que desce para o andar de fora.",
        },
    ],
};

// ── Cenário NORMAL (entrou pela porta) ────────────────────────────────────────
const cozinha_normal = {
    walls: _walls,
    objects: [
        // ── GELADEIRA ────────────────────────────────────────────────────────
        {
            id: "cozinha.geladeira",
            x: 100, y: 95,
            label: "Geladeira",
            color: "#7f8c8d",
            width: 38, height: 62,
            actions: ["Examinar", "Abrir"],
            defaultState: "fechada",
        },

        // ── FOGÃO ────────────────────────────────────────────────────────────
        {
            id: "cozinha.fogao",
            x: 220, y: 110,
            label: "Fogão",
            color: "#c0392b",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
            defaultState: "apagado",
        },

        // ── PIA ──────────────────────────────────────────────────────────────
        {
            id: "cozinha.pia",
            x: 340, y: 110,
            label: "Pia",
            color: "#2980b9",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
            defaultState: "seca",
        },

        // ── ARMÁRIO COM FECHADURA ────────────────────────────────────────────
        {
            id: "cozinha.armario_trancado",
            x: 480, y: 92,
            label: "Armário",
            color: "#4a3020",
            width: 38, height: 65,
            actions: ["Examinar", "Abrir"],
            defaultState: "trancado",
        },

        // ── MESA (intacta, com diário por baixo) ─────────────────────────────
        // Puzzle: mover a mesa revela o alçapão para o porão.
        {
            id: "cozinha.mesa",
            x: 620, y: 108,
            label: "Mesa",
            color: "#d35400",
            width: 60, height: 40,
            actions: ["Examinar", "Usar"],
            defaultState: "parada",
        },
        {
            id: "cozinha.alcapao",
            x: 620, y: 148,
            label: "Alçapão",
            color: "#2a1a0a",
            width: 30, height: 16,
            type: "door",
            targetRoom: "corridor",
            actions: ["Examinar", "Usar"],
            defaultState: "escondido",   // visível só após mover a mesa
            transitionText: "Você abre o alçapão. Uma escada de madeira desce para a escuridão.",
            arrivalTitle: "Porão",
            arrivalText: "Cheiro de terra úmida. Algo se moveu no escuro.",
        },

        // ── NOTA PRESA NA GELADEIRA ──────────────────────────────────────────
        {
            id: "cozinha.nota_geladeira",
            x: 100, y: 85,
            label: "Bilhete",
            color: "#f5f0e0",
            width: 12, height: 8,
            actions: ["Examinar"],
            defaultState: "unread",
        },

        // ── JANELA DA COZINHA (visão para o exterior) ─────────────────────────
        {
            id: "cozinha.janela_cozinha",
            x: 800, y: 72,
            label: "Janela",
            color: "#a0bfcf",
            width: 36, height: 28,
            type: "window",
            actions: ["Examinar"],
            defaultState: "fechada",
        },

        // ── PORTA PARA SALA ──────────────────────────────────────────────────
        {
            id: "cozinha.porta_sala",
            x: 900, y: 96,
            label: "Porta da Sala",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "sala",
            actions: ["Examinar", "Usar"],
            defaultState: "fechada",
            transitionText: "Você volta para a sala.",
            arrivalTitle: "Sala",
            arrivalText: "A sala do primeiro andar. As paredes guardam silêncio.",
        },
    ],
};

// ── Factory: retorna o cenário correto ───────────────────────────────────────
export function getCozinhaData() {
    const jumpedFromWindow = gameState.pathChoices &&
        gameState.pathChoices.includes("window");
    return jumpedFromWindow ? cozinha_devastada : cozinha_normal;
}

// Export estático para o scene loader (que chama getCozinhaData no momento certo)
export { cozinha_devastada, cozinha_normal };