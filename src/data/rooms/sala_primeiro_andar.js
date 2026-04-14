import { gameState } from "../../state.js";

const baseNavigation = { wrapAround: true, sceneWidth: 960 };

const baseBackgrounds = [
    { type: "color", x: 0, width: 240, height: 160, color: "#2a2218" },
    { type: "color", x: 240, width: 240, height: 160, color: "#2a2218" },
    { type: "color", x: 480, width: 240, height: 160, color: "#2a2218" },
    { type: "color", x: 720, width: 240, height: 160, color: "#2a2218" },
    { type: "color", x: 238, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    { type: "color", x: 478, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    { type: "color", x: 718, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    // O piso da Sala pode ser diferente (Madeira ou Tapete) mas usaremos Floor padrão:
    { type: "floor", color: "#1c1917" }
];

const salaInitialState = {
    "sala.porta_cozinha": "fechada",
    "sala.interruptor": "off",
    "sala.telefone": "mudo",
    "sala.televisao": "estatica",
    "sala.quadro_fotos": "intacto",
    "sala.sofa": "intacto",
    "sala.cartao_visita": "oculto",
    "sala.estante": "intacto",
    "sala.porta_exterior": "trancada",
};

export const salaPrimeiroAndar = {
    navigation: baseNavigation,
    initialState: salaInitialState,
    backgrounds: baseBackgrounds,

    objects: [
        { id: "vis_porta_cozinha", x: 120, y: 88, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "sala.porta_cozinha" },
        { id: "vis_interruptor", x: 220, y: 94, width: 14, height: 14, colorBase: "#555555", linkedState: "sala.interruptor" },
        { id: "vis_telefone", x: 340, y: 96, width: 18, height: 16, colorBase: "#3a3020", linkedState: "sala.telefone" },
        { id: "vis_televisao", x: 460, y: 92, width: 44, height: 32, colorBase: "#cccccc", linkedState: "sala.televisao" },
        { id: "vis_quadro_fotos", x: 600, y: 60, width: 30, height: 24, colorBase: "#b09060", linkedState: "sala.quadro_fotos" },
        { id: "vis_sofa", x: 720, y: 118, width: 65, height: 30, colorBase: "#5a4030", linkedState: "sala.sofa" },
        { id: "vis_cartao", x: 750, y: 148, width: 12, height: 8, colorBase: "#f0ece0", linkedState: "sala.cartao_visita" },
        { id: "vis_estante", x: 860, y: 96, width: 38, height: 62, colorBase: "#4a3018", linkedState: "sala.estante" },
        { id: "vis_porta_exterior", x: 920, y: 88, width: 20, height: 60, colorBase: "#6b4020", linkedState: "sala.porta_exterior" },
    ],

    hotspots: [
        {
            id: "sala.porta_cozinha", x: 120, y: 88, width: 18, height: 50,
            label: "Porta Cozinha", type: "door", targetRoom: "cozinha",
            actions: ["Examinar", "Usar"],
            transitionText: "Você abre a porta e entra na cozinha.",
            arrivalTitle: "Cozinha", arrivalText: "O cheiro de comida velha paira no ar."
        },
        { id: "sala.interruptor", x: 220, y: 94, width: 14, height: 14, label: "Gaveteiro/Interruptor", actions: ["Examinar", "Alternar_Luz"] },
        { id: "sala.telefone", x: 340, y: 96, width: 18, height: 16, label: "Telefone", actions: ["Examinar", "Usar"] },
        { id: "sala.televisao", x: 460, y: 92, width: 30, height: 20, label: "Televisão", actions: ["Examinar", "Usar"] },
        { id: "sala.quadro_fotos", x: 600, y: 60, width: 25, height: 20, label: "Quadro de Fotos", actions: ["Examinar"] },
        { id: "sala.sofa", x: 720, y: 118, width: 50, height: 20, label: "Sofá", actions: ["Examinar", "Usar"] },
        { id: "sala.cartao_visita", x: 750, y: 148, width: 12, height: 8, label: "Cartão de Visita", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "sala.estante", x: 860, y: 96, width: 25, height: 40, label: "Estante", actions: ["Examinar", "Usar"] },
        {
            id: "sala.porta_exterior", x: 920, y: 88, width: 20, height: 55,
            label: "Porta para o Quintal", type: "door", targetRoom: "quintal", // <-- Ajuste de level design como pedido pelo usuário
            requires: { item: "Chave da Despensa" },
            actions: ["Examinar", "Usar"],
            transitionText: "A chave gira. A porta destranca com um clique pesado.",
            arrivalTitle: "Quintal Frio", arrivalText: "O mato alto lá fora roça em suas pernas. O vento uiva entre as cercas velhas."
        }
    ]
};