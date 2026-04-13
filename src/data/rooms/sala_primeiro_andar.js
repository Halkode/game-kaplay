export const salaPrimeiroAndar = {
    walls: [
        { x: 0,   color: "#2d4a6e" },  // Norte
        { x: 240, color: "#4e2d2d" },  // Leste
        { x: 480, color: "#2d4e2d" },  // Sul
        { x: 720, color: "#4e4a2d" },  // Oeste
    ],
    objects: [
        // ── PAREDE NORTE ─────────────────────────────────────────────────────    
        {
            id: "porta_cozinha",
            x: 120, y: 100,
            label: "Porta Cozinha",
            color: "#8b5e3c",
            width: 18, height: 42,
            type: "door",
            targetRoom: "cozinha",
            actions: ["Usar"],
        },
    ],
};