export const room1 = {
    walls: [
        { x: 0, color: "#2d4a6e" },  // Norte
        { x: 240, color: "#4e2d2d" },  // Leste
        { x: 480, color: "#2d4e2d" },  // Sul
        { x: 720, color: "#4e4a2d" },  // Oeste
    ],
    objects: [
        { id: "porta_quarto_escuro", x: 120, y: 100, label: "Porta", color: "#8b5e3c", actions: ["Examinar", "Usar"] },
        { id: "interruptor_quarto", x: 200, y: 92, label: "Luz", sprite: "interruptor_quarto", actions: ["Examinar", "Alternar_Luz"] },
        { id: "janela_quarto_escuro", x: 360, y: 68, label: "Janela", color: "#7ec8e3", actions: ["Examinar", "Alternar_Janela"] },
        { id: "quadro_estranho_quarto_escuro", x: 600, y: 59, label: "Quadro", color: "#e3c87e", actions: ["Examinar", "Pegar"] },
        { id: "estante_quarto_escuro", x: 840, y: 101, label: "Estante", sprite: "estante_livros", actions: ["Examinar", "Usar"] },
    ]
};
