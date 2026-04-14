import { gameState } from "../../state.js";

const baseNavigation = { wrapAround: true, sceneWidth: 960 };

const baseBackgrounds = [
    { type: "color", x: 0, width: 240, height: 160, color: "#3a3028" },
    { type: "color", x: 240, width: 240, height: 160, color: "#3a3028" },
    { type: "color", x: 480, width: 240, height: 160, color: "#3a3028" },
    { type: "color", x: 720, width: 240, height: 160, color: "#3a3028" },
    // Faixas de separação e rodape para simular o pseudo-3d legado:
    { type: "color", x: 238, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    { type: "color", x: 478, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    { type: "color", x: 718, width: 2, height: 160, color: "#0a0a0f", z: 1 },
    { type: "floor", color: "#1c1917" }
];

// O estado das portas que ditam o ambiente
const cozinhaInitialState = {
    "cozinha.porta_sala": "fechada",
    "cozinha.geladeira": "fechada",
    "cozinha.fogao": "apagado",
    "cozinha.armario_trancado": "trancado",
    "cozinha.porta_despensa": "fechada",
    "cozinha.janela_cozinha": "fechada",
    "cozinha.mesa": "parada",
    "cozinha.alcapao": "escondido",
};

// ── Cenário DEVASTADO (pulo pela janela) ──────────────────────────────────────
const cozinha_devastada = {
    navigation: baseNavigation,
    initialState: {
        ...cozinhaInitialState,
        "cozinha.buraco_telhado": "aberto",
        "cozinha.mesa_quebrada": "destruida"
    },
    backgrounds: baseBackgrounds,

    objects: [
        { id: "vis_buraco", x: 200, y: 50, width: 60, height: 20, colorBase: "#1a1208", z: 50 },
        { id: "vis_mesa_quebrada", x: 200, y: 120, width: 55, height: 22, colorBase: "#5a3a1a", z: 50 },
        { id: "vis_geladeira", x: 400, y: 95, width: 38, height: 62, colorBase: "#7f8c8d", linkedState: "cozinha.geladeira" },
        { id: "vis_pia", x: 520, y: 110, width: 40, height: 30, colorBase: "#2980b9" },
        { id: "vis_armario", x: 640, y: 92, width: 38, height: 65, colorBase: "#4a3020", linkedState: "cozinha.armario_trancado" },
        { id: "vis_fogao", x: 760, y: 110, width: 40, height: 30, colorBase: "#555555", linkedState: "cozinha.fogao" },
        { id: "vis_porta_despensa", x: 880, y: 96, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "cozinha.porta_despensa" },
        { id: "vis_porta_sala", x: 900, y: 96, width: 18, height: 55, colorBase: "#5a3a1a", linkedState: "cozinha.porta_sala" },
    ],

    hotspots: [
        { id: "cozinha.buraco_telhado", x: 200, y: 50, width: 25, height: 10, label: "Buraco no Teto", actions: ["Examinar"] },
        { id: "cozinha.destrocos_telha", x: 160, y: 140, width: 35, height: 12, label: "Pedaço de Telha", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "cozinha.destrocos_telha2", x: 240, y: 148, width: 18, height: 8, label: "Telha Pontiaguda", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "cozinha.mesa_quebrada", x: 200, y: 120, width: 30, height: 15, label: "Mesa Quebrada", actions: ["Examinar"] },
        
        { id: "cozinha.perna_mesa", x: 160, y: 152, width: 12, height: 30, label: "Perna de Mesa", actions: ["Examinar", "Pegar"], z: 120 },
        { id: "cozinha.geladeira", x: 400, y: 95, width: 20, height: 60, label: "Geladeira", actions: ["Examinar", "Abrir"] },
        { id: "cozinha.pia", x: 520, y: 110, width: 20, height: 15, label: "Pia", actions: ["Examinar", "Usar"] },
        { id: "cozinha.armario_trancado", x: 640, y: 92, width: 20, height: 40, label: "Armário", actions: ["Examinar", "Abrir"] },
        { id: "cozinha.nota_chao", x: 300, y: 150, width: 14, height: 10, label: "Nota", actions: ["Examinar"], z: 150 },
        { id: "cozinha.fogao", x: 760, y: 110, width: 20, height: 10, label: "Fogão", actions: ["Examinar", "Usar"] },

        // A porta da despensa não leva mais para final/corredor!
        {
            id: "cozinha.porta_despensa", x: 880, y: 96, width: 18, height: 50,
            label: "Porta da Despensa", type: "door",
            requires: { item: "Faca de Cozinha" }, // Corta a corda ao interagir, em vez de exigir chave! (Usar interações/dialogo depois)
            actions: ["Examinar", "Usar"]
        },

        // Porta para sala agora exige uma alavanca para desentulhar
        {
            id: "cozinha.porta_sala",
            x: 900, y: 96, width: 18, height: 50,
            label: "Porta da Sala", type: "door", targetRoom: "sala",
            requires: { item: "Perna de Mesa" }, // Perna da mesa quebrada é a alavanca
            actions: ["Examinar", "Usar"],
            transitionText: "Você força a porta emperrada com a perna da mesa. A madeira estala, mas cede. A passagem para a sala está livre.",
            arrivalTitle: "Sala",
            arrivalText: "O silêncio do primeiro andar. Tudo parece diferente."
        }
    ],
};

// ── Cenário NORMAL (entrou pela porta na sala) ────────────────────────────────
const cozinha_normal = {
    navigation: baseNavigation,
    initialState: cozinhaInitialState,
    backgrounds: baseBackgrounds,

    objects: [
        { id: "vis_geladeira", x: 100, y: 95, width: 38, height: 62, colorBase: "#7f8c8d", linkedState: "cozinha.geladeira" },
        { id: "vis_fogao", x: 220, y: 110, width: 40, height: 30, colorBase: "#c0392b", linkedState: "cozinha.fogao" },
        { id: "vis_pia", x: 340, y: 110, width: 40, height: 30, colorBase: "#2980b9" },
        { id: "vis_armario", x: 480, y: 92, width: 38, height: 65, colorBase: "#4a3020", linkedState: "cozinha.armario_trancado" },
        { id: "vis_mesa", x: 620, y: 108, width: 60, height: 40, colorBase: "#d35400", linkedState: "cozinha.mesa" },
        { id: "vis_alcapao", x: 620, y: 148, width: 30, height: 16, colorBase: "#2a1a0a", linkedState: "cozinha.alcapao" },
        { id: "vis_janela", x: 800, y: 72, width: 36, height: 28, colorBase: "#a0bfcf", linkedState: "cozinha.janela_cozinha" },
        { id: "vis_porta_sala", x: 900, y: 96, width: 18, height: 55, colorBase: "#8b5e3c", linkedState: "cozinha.porta_sala" },
    ],

    hotspots: [
        { id: "cozinha.geladeira", x: 100, y: 95, width: 25, height: 50, label: "Geladeira", actions: ["Examinar", "Abrir"] },
        { id: "cozinha.fogao", x: 220, y: 110, width: 20, height: 15, label: "Fogão", actions: ["Examinar", "Usar"] },
        { id: "cozinha.pia", x: 340, y: 110, width: 20, height: 15, label: "Pia", actions: ["Examinar", "Usar"] },
        { id: "cozinha.armario_trancado", x: 480, y: 92, width: 20, height: 40, label: "Armário", actions: ["Examinar", "Abrir"] },
        { id: "cozinha.mesa", x: 620, y: 108, width: 40, height: 20, label: "Mesa", actions: ["Examinar", "Usar"] },
        { 
            id: "cozinha.alcapao", x: 620, y: 148, width: 25, height: 10, 
            label: "Alçapão", type: "door", targetRoom: "corridor", // Ou porão especificamente
            actions: ["Examinar", "Usar"],
            transitionText: "Você abre o alçapão. Uma escada de madeira desce para a escuridão.",
            arrivalTitle: "Porão", arrivalText: "Cheiro de terra úmida. Algo se moveu no escuro."
        },
        { id: "cozinha.nota_geladeira", x: 100, y: 85, width: 12, height: 8, label: "Bilhete", actions: ["Examinar"], z: 120 },
        { id: "cozinha.janela_cozinha", x: 800, y: 72, width: 25, height: 20, label: "Janela", actions: ["Examinar"] },
        {
            id: "cozinha.porta_sala", x: 900, y: 96, width: 18, height: 50,
            label: "Porta da Sala", type: "door", targetRoom: "sala",
            actions: ["Examinar", "Usar"],
            transitionText: "Você empurra a porta e volta para a sala.",
            arrivalTitle: "Sala", arrivalText: "A sala principal da casa."
        }
    ]
};

export function getCozinhaData() {
    const jumpedFromWindow = gameState.pathChoices && gameState.pathChoices.includes("window");
    return jumpedFromWindow ? cozinha_devastada : cozinha_normal;
}

export { cozinha_devastada, cozinha_normal };