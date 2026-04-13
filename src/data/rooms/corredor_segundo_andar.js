// data/rooms/corredor_segundo_andar.js
//
// PUZZLES DO CORREDOR:
//   1. Papéis no chão — revelam que houve uma "paciente" antes do jogador
//   2. Ventilação — esconde uma chave que abre o quarto_dois
//   3. Mancha na parede — pista de violência; examinar 3x desbloqueia mensagem oculta
//   4. Porta Esquerda (quarto_dois) — trancada, requer "Chave da Ventilação"
//   5. Escada — só acessível se o jogador leu pelo menos um dos relatórios

export const corredor = {
    walls: [
        { x: 0, color: "#4a4a4a" },  // Parede esquerda
        { x: 240, color: "#4a4a4a" },  // Parede direita
        { x: 480, color: "#4a4a4a" },  // Continuação
        { x: 720, color: "#4a4a4a" },  // Continuação
    ],
    objects: [
        // ── PAPÉIS NO CHÃO ────────────────────────────────────────────────────
        // Puzzle narrativo: lendo os 2 conjuntos de papéis o jogador descobre
        // que havia outra pessoa aqui. Isso desbloqueia linha de diálogo especial
        // ao chegar no quarto_dois.
        {
            id: "corredor_segundo_andar.papeis_chao",
            x: 100, y: 130,
            label: "Papéis",
            color: "#ffffff",
            width: 20, height: 10,
            actions: ["Examinar"],
            defaultState: "unread",
        },
        {
            id: "corredor_segundo_andar.papeis_chao2",
            x: 300, y: 135,
            label: "Relatórios",
            color: "#f0f0f0",
            width: 25, height: 12,
            actions: ["Examinar"],
            defaultState: "unread",
        },

        // ── VENTILAÇÃO ────────────────────────────────────────────────────────
        // Examinar 2x → mensagem "tem algo lá dentro".
        // Usar → o jogador enfia o braço e retira a "Chave da Ventilação".
        // Custo: injurePart("rightArm", 8, "laceration") — arranhão de metal.
        {
            id: "corredor_segundo_andar.ventilacao",
            x: 830, y: 48,
            label: "Ventilação",
            color: "#888888",
            width: 18, height: 18,
            actions: ["Examinar", "Usar"],
            defaultState: "noisy",
        },

        // ── MANCHA NA PAREDE ─────────────────────────────────────────────────
        // Examinar 1x: "marrom, seca"
        // Examinar 2x: "cheiro de enxofre"
        // Examinar 3x: descobre escrita riscada embaixo — coordena com quarto_dois
        {
            id: "corredor_segundo_andar.mancha_parede",
            x: 650, y: 42,
            label: "Mancha",
            color: "#8b4545",
            width: 22, height: 22,
            actions: ["Examinar"],
            defaultState: "unexplained",
        },

        // ── QUADRO CAÍDO ──────────────────────────────────────────────────────
        // Novo objeto. Encostado na parede, o verso tem um fragmento de mapa
        // da planta baixa da casa desenhado à mão.
        {
            id: "corredor_segundo_andar.quadro_caido",
            x: 460, y: 128,
            label: "Quadro Caído",
            color: "#c8a87a",
            width: 26, height: 18,
            actions: ["Examinar", "Pegar"],
            defaultState: "virado",
        },

        // ── PORTA ESQUERDA → quarto_dois ─────────────────────────────────────
        // Trancada. Precisa da "Chave da Ventilação".
        {
            id: "corredor_segundo_andar.porta_esquerda_corredor",
            x: 580, y: 86,
            label: "Porta Esquerda",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "quarto_dois",
            requires: { item: "Chave da Ventilação" },
            actions: ["Examinar", "Usar"],
            defaultState: "trancada",
            transitionText: "A chave encaixa. A porta abre com um gemido longo.",
            arrivalTitle: "Outro Quarto",
            arrivalText: "Alguém já esteve aqui.",
        },

        // ── PORTA DE VOLTA AO QUARTO_UM ──────────────────────────────────────
        {
            id: "corredor_segundo_andar.porta_volta_quarto_um",
            x: 700, y: 86,
            label: "Porta do Quarto",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "game",
            actions: ["Examinar", "Usar"],
            defaultState: "fechada",
            transitionText: "Você volta para o quarto.",
            arrivalTitle: "Quarto",
            arrivalText: "O quarto onde tudo começou.",
        },

        // ── ESCADA PARA O PRIMEIRO ANDAR ─────────────────────────────────────
        // Bloqueada por padrão. Libera após o jogador ler pelo menos
        // um conjunto de papéis (gameState flag: "leu_relatorio_corredor").
        // Sem isso, o personagem recusa: "eu deveria investigar mais esse andar antes de descer".
        {
            id: "corredor_segundo_andar.escada_segundo_andar",
            x: 480, y: 86,
            label: "Escada",
            color: "#6b4c2a",
            width: 18, height: 55,
            type: "stairs",
            targetRoom: "sala",
            actions: ["Examinar", "Usar"],
            defaultState: "accessible",
            transitionText: "Você desce devagar. Cada degrau range sob seu peso.",
            arrivalTitle: "Primeiro Andar",
            arrivalText: "A sala do primeiro andar. Mais fria do que você esperava.",
        },
    ],
};
