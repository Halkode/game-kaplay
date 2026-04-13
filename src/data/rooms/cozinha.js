export const cozinha = {
    walls: [
        { x: 0,   color: "#4a4a4a" },  // Parede esquerda
        { x: 240, color: "#4a4a4a" },  // Parede direita
        { x: 480, color: "#4a4a4a" },  // Continuação
        { x: 720, color: "#4a4a4a" },  // Continuação
    ],
    objects: [
        // Geladeira
        {
            id: "cozinha.geladeira",
            x: 100, y: 100,
            label: "Geladeira",
            color: "#7f8c8d",
            width: 40, height: 60,
            actions: ["Examinar", "Abrir"],
        },
        // Fogão
        {
            id: "cozinha.fogao",
            x: 200, y: 100,
            label: "Fogão",
            color: "#c0392b",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
        },
        // Pia  
        {
            id: "cozinha.pia",
            x: 300, y: 100,
            label: "Pia",
            color: "#2980b9",
            width: 40, height: 30,
            actions: ["Examinar", "Usar"],
        },
        // Armário
        {
            id: "cozinha.armario",
            x: 400, y: 100,
            label: "Armário",
            color: "#27ae60",
            width: 40, height: 60,
            actions: ["Examinar", "Abrir"],
        },
        // Mesa
        {
            id: "cozinha.mesa",
            x: 500, y: 100,
            label: "Mesa",
            color: "#d35400",
            width: 60, height: 40,
            actions: ["Examinar", "Usar"],
        },
        {
            id: "cozinha.porta_sala",
            x: 640, y: 100,
            label: "Porta Sala",
            color: "#8b5e3c",
            width: 18, height: 42,
            type: "door",
            targetRoom: "sala",
            actions: ["Examinar", "Usar"],
        },
    ],
};