export const corredor = {
    navigation: { wrapAround: true, sceneWidth: 960 },
    initialState: {
        "corredor_segundo_andar.papeis_chao": "unread",
        "corredor_segundo_andar.papeis_chao2": "unread",
        "corredor_segundo_andar.ventilacao": "noisy",
        "corredor_segundo_andar.mancha_parede": "unexplained",
        "corredor_segundo_andar.quadro_caido": "virado",
        "corredor_segundo_andar.porta_esquerda_corredor": "trancada",
        "corredor_segundo_andar.porta_volta_quarto_um": "fechada",
        "corredor_segundo_andar.escada_segundo_andar": "accessible"
    },
    backgrounds: [
        { type: "color", x: 0, width: 240, height: 160, color: "#4a4a4a" },
        { type: "color", x: 240, width: 240, height: 160, color: "#4a4a4a" },
        { type: "color", x: 480, width: 240, height: 160, color: "#4a4a4a" },
        { type: "color", x: 720, width: 240, height: 160, color: "#4a4a4a" },
        { type: "color", x: 238, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "color", x: 478, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "color", x: 718, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "floor", color: "#1c1917" }
    ],
    objects: [
        { id: "vis_papeis", x: 100, y: 130, width: 20, height: 10, colorBase: "#ffffff", linkedState: "corredor_segundo_andar.papeis_chao" },
        { id: "vis_papeis2", x: 300, y: 135, width: 25, height: 12, colorBase: "#f0f0f0", linkedState: "corredor_segundo_andar.papeis_chao2" },
        { id: "vis_ventilacao", x: 830, y: 48, width: 18, height: 18, colorBase: "#888888", linkedState: "corredor_segundo_andar.ventilacao" },
        { id: "vis_mancha", x: 650, y: 42, width: 22, height: 22, colorBase: "#8b4545", linkedState: "corredor_segundo_andar.mancha_parede" },
        { id: "vis_quadro_caido", x: 460, y: 128, width: 26, height: 18, colorBase: "#c8a87a", linkedState: "corredor_segundo_andar.quadro_caido" },
        { id: "vis_porta_esq", x: 580, y: 86, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "corredor_segundo_andar.porta_esquerda_corredor" },
        { id: "vis_porta_dir", x: 700, y: 86, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "corredor_segundo_andar.porta_volta_quarto_um" },
        { id: "vis_escada", x: 480, y: 86, width: 18, height: 55, colorBase: "#6b4c2a", linkedState: "corredor_segundo_andar.escada_segundo_andar" }
    ],
    hotspots: [
        { id: "corredor_segundo_andar.papeis_chao", x: 100, y: 130, width: 25, height: 15, label: "Papéis", actions: ["Examinar"] },
        { id: "corredor_segundo_andar.papeis_chao2", x: 300, y: 135, width: 30, height: 15, label: "Relatórios", actions: ["Examinar"] },
        { id: "corredor_segundo_andar.ventilacao", x: 830, y: 48, width: 20, height: 20, label: "Ventilação", actions: ["Examinar", "Usar"] },
        { id: "corredor_segundo_andar.mancha_parede", x: 650, y: 42, width: 25, height: 25, label: "Mancha", actions: ["Examinar"] },
        { id: "corredor_segundo_andar.quadro_caido", x: 460, y: 128, width: 30, height: 20, label: "Quadro Caído", actions: ["Examinar", "Pegar"], z: 120 },
        {
            id: "corredor_segundo_andar.porta_esquerda_corredor", x: 580, y: 86, width: 18, height: 50,
            label: "Porta Esquerda", type: "door", targetRoom: "quarto_dois",
            requires: { item: "Chave da Ventilação" },
            actions: ["Examinar", "Usar"],
            transitionText: "A chave encaixa. A porta abre com um gemido longo.",
            arrivalTitle: "Outro Quarto", arrivalText: "Alguém já esteve aqui."
        },
        {
            id: "corredor_segundo_andar.porta_volta_quarto_um", x: 700, y: 86, width: 18, height: 50,
            label: "Porta do Quarto", type: "door", targetRoom: "game",
            actions: ["Examinar", "Usar"],
            transitionText: "Você volta para o quarto.",
            arrivalTitle: "Quarto", arrivalText: "O quarto onde tudo começou."
        },
        {
            id: "corredor_segundo_andar.escada_segundo_andar", x: 480, y: 86, width: 25, height: 50,
            label: "Escada", type: "stairs", targetRoom: "sala",
            actions: ["Examinar", "Usar"],
            transitionText: "Você desce devagar. Cada degrau range sob seu peso.",
            arrivalTitle: "Primeiro Andar", arrivalText: "A sala do primeiro andar. Mais fria do que você esperava."
        }
    ]
};
