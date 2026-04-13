export const corredor = {
    walls: [
        { x: 0,   color: "#4a4a4a" },  // Parede esquerda
        { x: 240, color: "#4a4a4a" },  // Parede direita
        { x: 480, color: "#4a4a4a" },  // Continuação
        { x: 720, color: "#4a4a4a" },  // Continuação
    ],
    objects: [
        // Papéis no chão
        {
            id: "corredor.papeis_chao",
            x: 100, y: 130,
            label: "Papéis",
            color: "#ffffff",
            width: 20, height: 10,
            actions: ["Examinar"],
        },
        {
            id: "corredor.papeis_chao2",
            x: 300, y: 135,
            label: "Relatórios",
            color: "#f0f0f0",
            width: 25, height: 12,
            actions: ["Examinar"],
        },
        {
            id: "corredor.porta_esquerda_corredor",
            x: 600, y: 100,
            label: "Porta Esquerda",
            color: "#8b5e3c",
            width: 18, height: 42,
            type: "door",
            targetRoom: "sala",
            actions: ["Examinar", "Usar"],
        },
        {
            id: "corredor.porta_volta_quarto_um",
            x: 700, y: 100,
            label: "Porta Quarto",
            color: "#8b5e3c",
            width: 18, height: 42,
            type: "door",
            targetRoom: "game",
            actions: ["Examinar", "Usar"],
        },
        {
            id: "corredor.escada_segundo_andar",
            x: 500, y: 100,
            label: "Escada",
            color: "#8b5e3c",
            width: 18, height: 42,
            type: "stairs",
            targetRoom: "sala",
            actions: ["Examinar", "Usar"],
        }
    ],
};
