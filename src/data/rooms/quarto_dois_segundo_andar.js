export const quarto_dois_segundo_andar = {
    navigation: { wrapAround: true, sceneWidth: 960 },
    initialState: {
        "quarto_dois.interruptor": "off",
        "quarto_dois.porta": "fechada",
        "quarto_dois.calendario": "intacto",
        "quarto_dois.janela_selada": "selada",
        "quarto_dois.cofre": "oculto",
        "quarto_dois.quadro_cobrindo_cofre": "pendurado",
        "quarto_dois.cama": "bagunçada",
        "quarto_dois.fita_cassete": "oculto",
        "quarto_dois.manchas_chao": "unexplained",
        "quarto_dois.mesa_diario": "intacto",
        "quarto_dois.radio": "desligado",
        "quarto_dois.espelho_rachado": "rachado"
    },
    backgrounds: [
        { type: "color", x: 0, width: 240, height: 160, color: "#1e2a1e" },
        { type: "color", x: 240, width: 240, height: 160, color: "#1e2a1e" },
        { type: "color", x: 480, width: 240, height: 160, color: "#1e2a1e" },
        { type: "color", x: 720, width: 240, height: 160, color: "#1e2a1e" },
        { type: "color", x: 238, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "color", x: 478, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "color", x: 718, width: 2, height: 160, color: "#0a0a0f", z: 1 },
        { type: "floor", color: "#1c1917" }
    ],
    objects: [
        { id: "vis_interruptor", x: 70, y: 94, width: 14, height: 14, colorBase: "#555555", linkedState: "quarto_dois.interruptor" },
        { id: "vis_porta", x: 150, y: 88, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "quarto_dois.porta" },
        { id: "vis_calendario", x: 310, y: 58, width: 28, height: 22, colorBase: "#d4c8a0", linkedState: "quarto_dois.calendario" },
        { id: "vis_janela", x: 380, y: 64, width: 36, height: 28, colorBase: "#8098a8", linkedState: "quarto_dois.janela_selada" },
        { id: "vis_cofre", x: 500, y: 80, width: 24, height: 20, colorBase: "#3a3a3a", linkedState: "quarto_dois.cofre" },
        { id: "vis_quadro", x: 500, y: 80, width: 26, height: 22, colorBase: "#b09060", linkedState: "quarto_dois.quadro_cobrindo_cofre", z: 51 },
        { id: "vis_cama", x: 560, y: 110, width: 55, height: 32, colorBase: "#2a2040", linkedState: "quarto_dois.cama" },
        { id: "vis_fita", x: 580, y: 140, width: 12, height: 8, colorBase: "#111111", linkedState: "quarto_dois.fita_cassete" },
        { id: "vis_mancha", x: 640, y: 150, width: 30, height: 8, colorBase: "#5a2020", linkedState: "quarto_dois.manchas_chao" },
        { id: "vis_mesa", x: 820, y: 108, width: 32, height: 22, colorBase: "#5a3a1a", linkedState: "quarto_dois.mesa_diario" },
        { id: "vis_radio", x: 880, y: 106, width: 24, height: 18, colorBase: "#4a4030", linkedState: "quarto_dois.radio" },
        { id: "vis_espelho", x: 760, y: 66, width: 18, height: 32, colorBase: "#7090a0", linkedState: "quarto_dois.espelho_rachado" }
    ],
    hotspots: [
        { id: "quarto_dois.interruptor", x: 70, y: 94, width: 14, height: 14, label: "Interruptor", actions: ["Examinar", "Alternar_Luz"] },
        {
            id: "quarto_dois.porta", x: 150, y: 88, width: 18, height: 50,
            label: "Porta", type: "door", targetRoom: "corridor",
            actions: ["Examinar", "Usar"],
            transitionText: "Você sai do quarto.",
            arrivalTitle: "Corredor", arrivalText: "O corredor silencioso espera."
        },
        { id: "quarto_dois.calendario", x: 310, y: 58, width: 30, height: 25, label: "Calendário", actions: ["Examinar"] },
        { id: "quarto_dois.janela_selada", x: 380, y: 64, width: 35, height: 25, label: "Janela Selada", actions: ["Examinar", "Usar"] },
        { id: "quarto_dois.cofre", x: 500, y: 80, width: 25, height: 20, label: "Cofre", actions: ["Examinar", "Usar"] },
        { id: "quarto_dois.quadro_cobrindo_cofre", x: 500, y: 80, width: 30, height: 25, label: "Quadro na Parede", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "quarto_dois.cama", x: 560, y: 110, width: 55, height: 30, label: "Cama", actions: ["Examinar", "Usar"] },
        { id: "quarto_dois.fita_cassete", x: 580, y: 140, width: 15, height: 10, label: "Fita Cassete", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "quarto_dois.manchas_chao", x: 640, y: 150, width: 35, height: 15, label: "Manchas", actions: ["Examinar"] },
        { id: "quarto_dois.mesa_diario", x: 820, y: 108, width: 35, height: 20, label: "Mesa", actions: ["Examinar", "Usar"] },
        { id: "quarto_dois.radio", x: 880, y: 106, width: 25, height: 20, label: "Rádio", actions: ["Examinar", "Usar"] },
        { id: "quarto_dois.espelho_rachado", x: 760, y: 66, width: 20, height: 30, label: "Espelho Rachado", actions: ["Examinar"] }
    ]
};