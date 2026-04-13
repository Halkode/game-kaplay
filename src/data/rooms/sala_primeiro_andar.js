// data/rooms/sala_primeiro_andar.js
//
// PUZZLES DA SALA:
//   1. Televisão ligada em estática → olhar 3x → aparece figura por 1 frame (horror)
//   2. Sofá com almofada rasgada → esconde "Cartão de Visita" com endereço
//   3. Estante de livros → um livro falso (caixa) → contém "Chave da Despensa"
//   4. Quadro de fotos na parede → reconhece rosto da outra vítima (liga quarto_dois)
//   5. Porta para cozinha → livre; Porta para exterior → trancada, precisa "Chave da Despensa"
//   6. Telefone na parede → sem sinal; Examinar 2x → ouve respiração na linha

export const salaPrimeiroAndar = {
    walls: [
        { x: 0,   color: "#2a2218" },
        { x: 240, color: "#2a2218" },
        { x: 480, color: "#2a2218" },
        { x: 720, color: "#2a2218" },
    ],
    objects: [
        // ── PAREDE NORTE ──────────────────────────────────────────────────────

        // Porta para a cozinha (livre)
        {
            id: "sala.porta_cozinha",
            x: 120, y: 88,
            label: "Porta Cozinha",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "cozinha",
            actions: ["Examinar", "Usar"],
            defaultState: "fechada",
            transitionText: "Você abre a porta e entra na cozinha.",
            arrivalTitle: "Cozinha",
            arrivalText: "O cheiro de comida velha paira no ar.",
        },

        // Interruptor da sala
        {
            id: "sala.interruptor",
            x: 220, y: 94,
            label: "Interruptor",
            color: "#555",
            width: 14, height: 14,
            type: "switch",
            defaultState: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },

        // Telefone de parede
        // Examinar 1x: "fio cortado na metade"
        // Usar 1x: "silêncio total na linha"
        // Usar 2x: "uma respiração. Alguém está ouvindo."
        {
            id: "sala.telefone",
            x: 340, y: 96,
            label: "Telefone",
            color: "#3a3020",
            width: 18, height: 16,
            actions: ["Examinar", "Usar"],
            defaultState: "mudo",
        },

        // ── PAREDE LESTE ──────────────────────────────────────────────────────

        // Televisão ligada em estática
        // Examinar 1x: estática normal
        // Examinar 2x: "a forma humana aparece por um segundo"
        // Examinar 3x: desliga sozinha; uma palavra aparece: "AJUDA"
        // Usar: ligar/desligar (se desligada, não volta mais a ter o efeito)
        {
            id: "sala.televisao",
            x: 460, y: 92,
            label: "Televisão",
            color: "#ccc",
            width: 44, height: 32,
            actions: ["Examinar", "Usar"],
            defaultState: "estatica",
        },

        // Quadro de fotos na parede
        // Puzzle: reconhecer uma das pessoas nas fotos como a vítima do quarto_dois
        // Se o jogador já leu o diário do quarto_dois, o diálogo muda
        {
            id: "sala.quadro_fotos",
            x: 600, y: 60,
            label: "Quadro de Fotos",
            color: "#b09060",
            width: 30, height: 24,
            actions: ["Examinar"],
            defaultState: "intacto",
        },

        // ── PAREDE SUL ────────────────────────────────────────────────────────

        // Sofá (almofada rasgada esconde o Cartão de Visita)
        // Examinar → descrição
        // Usar → revirar almofadas → "algo caiu"
        // Depois: objeto "cartao_visita" se torna visível (defaultState "oculto" → "visivel")
        {
            id: "sala.sofa",
            x: 720, y: 118,
            label: "Sofá",
            color: "#5a4030",
            width: 65, height: 30,
            actions: ["Examinar", "Usar"],
            defaultState: "intacto",
        },
        {
            id: "sala.cartao_visita",
            x: 750, y: 148,
            label: "Cartão de Visita",
            color: "#f0ece0",
            width: 12, height: 8,
            actions: ["Examinar", "Pegar"],
            defaultState: "oculto",
        },

        // ── PAREDE OESTE ─────────────────────────────────────────────────────

        // Estante de livros
        // Examinar → "fileiras de livros empoeirados. Um deles parece diferente."
        // Usar → interação de selecionar livro (livro falso, caixa)
        //        → contém "Chave da Despensa"
        {
            id: "sala.estante",
            x: 860, y: 96,
            label: "Estante",
            color: "#4a3018",
            width: 38, height: 62,
            actions: ["Examinar", "Usar"],
            defaultState: "intacto",
        },

        // Porta exterior (saída da casa) — objetivo final deste ato
        // Trancada. Requer "Chave da Despensa" (encontrada na estante).
        {
            id: "sala.porta_exterior",
            x: 920, y: 88,
            label: "Porta de Saída",
            color: "#6b4020",
            width: 20, height: 60,
            type: "door",
            targetRoom: "exterior",
            requires: { item: "Chave da Despensa" },
            actions: ["Examinar", "Usar"],
            defaultState: "trancada",
            transitionText: "A chave gira. A porta se abre para a noite fria.",
            arrivalTitle: "Fora",
            arrivalText: "Você conseguiu sair. O ar frio da madrugada bate no seu rosto.",
        },
    ],
};