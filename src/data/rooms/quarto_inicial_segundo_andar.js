export const quarto_inicial_segundo_andar = {
    walls: [
        { x: 0,   color: "#2d4a6e" },  // Norte
        { x: 240, color: "#4e2d2d" },  // Leste
        { x: 480, color: "#2d4e2d" },  // Sul
        { x: 720, color: "#4e4a2d" },  // Oeste
    ],
    objects: [
        // ── PAREDE NORTE ─────────────────────────────────────────────────────
        {
            id: "quarto_um.porta",
            x: 120, y: 96,
            label: "Porta",
            sprite: "porta_quarto",
            width: 25, height: 50,
            type: "door",
            targetRoom: "corridor",
            requires: { item: "Chave Velha" },
            actions: ["Examinar", "Usar"],
        },
        {
            id: "quarto_um.interruptor",
            x: 200, y: 92,
            label: "Interruptor",
            sprite: "interruptor_quarto",
            width: 14, height: 14,
            type: "switch",
            defaultState: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },

        // ── PAREDE LESTE ─────────────────────────────────────────────────────
        {
            id: "quarto_um.janela",
            x: 360, y: 68,
            label: "Janela",
            sprite: "janela_quarto",
            width: 40, height: 34,
            type: "window",
            targetRoom: "cozinha",
            defaultState: "fechada",
            actions: ["Examinar", "Alternar_Janela"],
        },
        {
            id: "quarto_um.escrivaninha",
            x: 430, y: 110,
            label: "Escrivaninha",
            color: "#6b4c2a",
            width: 30, height: 20,
            type: "furniture",
            actions: ["Examinar", "Usar"],
        },

        // ── PAREDE SUL ───────────────────────────────────────────────────────
        {
            id: "quarto_um.quadro_estranho",
            x: 600, y: 59,
            label: "Quadro",
            color: "#e3c87e",
            width: 30, height: 24,
            actions: ["Examinar", "Pegar"],
        },
        {
            id: "quarto_um.cama",
            x: 560, y: 112,
            label: "Cama",
            color: "#3a3060",
            width: 52, height: 30,
            actions: ["Examinar", "Usar"],
        },

        // ── PAREDE OESTE ─────────────────────────────────────────────────────
        {
            id: "quarto_um.estante",
            x: 840, y: 102,
            label: "Estante",
            sprite: "estante_livros",
            width: 40, height: 36,
            actions: ["Examinar", "Usar"],
        },
        {
            id: "quarto_um.espelho",
            x: 780, y: 70,
            label: "Espelho",
            color: "#b0c8d4",
            width: 20, height: 36,
            actions: ["Examinar"],
        }
    ],
};
