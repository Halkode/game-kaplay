export const quarto_inicial_segundo_andar = {
    navigation: { wrapAround: true, sceneWidth: 960 },
    initialState: {
        "quarto_um.porta": "fechada",
        "quarto_um.interruptor": "off",
        "quarto_um.janela": "fechada",
        "quarto_um.escrivaninha": "intacto",
        "quarto_um.quadro_estranho": "pendurado",
        "quarto_um.cama": "arrumada",
        "quarto_um.estante": "intacto",
        "quarto_um.espelho": "intacto"
    },
    backgrounds: [
        {
            type: "sprite",
            spriteId: "teste",
            x: 0,
            y: 0,
            width: 960,
            height: 160
        }
    ],
    objects: [
        { id: "vis_porta", x: 120, y: 96, width: 25, height: 50, sprite: "porta_quarto", colorBase: "#8b5e3c", linkedState: "quarto_um.porta" },
        { id: "vis_interruptor", x: 200, y: 92, width: 14, height: 14, sprite: "interruptor_quarto", colorBase: "#555555", linkedState: "quarto_um.interruptor" },
        { id: "vis_janela", x: 360, y: 68, width: 40, height: 34, sprite: "janela_quarto", colorBase: "#a0bfcf", linkedState: "quarto_um.janela" },
        { id: "vis_escrivaninha", x: 430, y: 110, width: 30, height: 20, colorBase: "#6b4c2a", linkedState: "quarto_um.escrivaninha" },
        { id: "vis_quadro", x: 600, y: 59, width: 30, height: 24, colorBase: "#e3c87e", linkedState: "quarto_um.quadro_estranho" },
        { id: "vis_cama", x: 560, y: 112, width: 52, height: 30, colorBase: "#3a3060", linkedState: "quarto_um.cama" },
        { id: "vis_estante", x: 840, y: 102, width: 40, height: 36, sprite: "estante_livros", colorBase: "#4a3018", linkedState: "quarto_um.estante" },
        { id: "vis_espelho", x: 780, y: 70, width: 20, height: 36, colorBase: "#b0c8d4", linkedState: "quarto_um.espelho" }
    ],
    hotspots: [
        {
            id: "quarto_um.porta", x: 120, y: 96, width: 25, height: 50,
            label: "Porta", type: "door", targetRoom: "corridor",
            requires: { item: "Chave Velha" },
            actions: ["Examinar", "Usar"]
        },
        { id: "quarto_um.interruptor", type: "switch", x: 200, y: 92, width: 14, height: 14, label: "Interruptor", actions: ["Examinar", "Alternar_Luz"] },
        { id: "quarto_um.janela", x: 360, y: 68, width: 30, height: 25, label: "Janela", actions: ["Examinar", "Abrir"], type: "window", targetRoom: "cozinha" },
        { id: "quarto_um.escrivaninha", x: 430, y: 110, width: 30, height: 20, label: "Escrivaninha", actions: ["Examinar", "Usar"] },
        { id: "quarto_um.quadro_estranho", x: 600, y: 59, width: 25, height: 20, label: "Quadro", actions: ["Examinar", "Pegar"] },
        { id: "quarto_um.cama", x: 560, y: 112, width: 50, height: 25, label: "Cama", actions: ["Examinar", "Usar"] },
        { id: "quarto_um.estante", x: 840, y: 102, width: 35, height: 30, label: "Estante", actions: ["Examinar", "Usar"] },
        { id: "quarto_um.espelho", x: 780, y: 70, width: 20, height: 30, label: "Espelho", actions: ["Examinar"] }
    ]
};
