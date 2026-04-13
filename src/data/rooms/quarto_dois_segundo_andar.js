// data/rooms/quarto_dois_segundo_andar.js
//
// O quarto da "outra pessoa" — quem desapareceu antes do jogador.
//
// PUZZLES:
//   1. Cama com colchão rasgado → esconde Fita Cassete
//   2. Mesa com diário → revela código de 3 dígitos para o cofre
//   3. Cofre embutido na parede → combinação lida no diário → contém "Foto com Data"
//   4. Janela selada com fita → arrancar revela mensagem escrita na moldura
//   5. Calendário na parede → marca o dia do desaparecimento; liga com foto do cofre
//   6. Rádio quebrado → com Fita Cassete → toca gravação da vítima (narrativa)

export const quarto_dois_segundo_andar = {
    walls: [
        { x: 0,   color: "#1e2a1e" },  // verde musgo escuro — quarto degradado
        { x: 240, color: "#1e2a1e" },
        { x: 480, color: "#1e2a1e" },
        { x: 720, color: "#1e2a1e" },
    ],
    objects: [
        // ── PAREDE NORTE ──────────────────────────────────────────────────────

        // Interruptor (luz apagada ao chegar)
        {
            id: "quarto_dois.interruptor",
            x: 70, y: 94,
            label: "Interruptor",
            width: 14, height: 14,
            color: "#555",
            type: "switch",
            defaultState: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },

        // Porta de saída (volta ao corredor)
        {
            id: "quarto_dois.porta",
            x: 150, y: 88,
            label: "Porta",
            color: "#8b5e3c",
            width: 18, height: 55,
            type: "door",
            targetRoom: "corridor",
            actions: ["Examinar", "Usar"],
            defaultState: "fechada",
            transitionText: "Você sai do quarto.",
            arrivalTitle: "Corredor",
            arrivalText: "O corredor silencioso espera.",
        },

        // Calendário na parede — dia 14 circulado com marcador vermelho
        // Puzzle: liga com a Foto do cofre (mesma data → confirma o desaparecimento)
        {
            id: "quarto_dois.calendario",
            x: 310, y: 58,
            label: "Calendário",
            color: "#d4c8a0",
            width: 28, height: 22,
            actions: ["Examinar"],
            defaultState: "intacto",
        },

        // ── PAREDE LESTE ──────────────────────────────────────────────────────

        // Janela selada com fita adesiva
        // Examinar → "selada por dentro, com pressa"
        // Usar → arrancar fita → revela escrita na moldura: "ELES SABEM"
        {
            id: "quarto_dois.janela_selada",
            x: 380, y: 64,
            label: "Janela Selada",
            color: "#8098a8",
            width: 36, height: 28,
            actions: ["Examinar", "Usar"],
            defaultState: "selada",
        },

        // Cofre embutido na parede (escondido atrás de quadro — ver abaixo)
        // Bloqueado até o quadro ser removido.
        // Combinação: 3 dígitos lidos no diário (ex: "374")
        // Contém: "Foto com Data" + "Relatório Médico"
        {
            id: "quarto_dois.cofre",
            x: 500, y: 80,
            label: "Cofre",
            color: "#3a3a3a",
            width: 24, height: 20,
            actions: ["Examinar", "Usar"],
            defaultState: "oculto",   // muda para "visivel" após remover quadro
        },

        // Quadro cobrindo o cofre — deve ser examinado/pego primeiro
        {
            id: "quarto_dois.quadro_cobrindo_cofre",
            x: 500, y: 80,
            label: "Quadro na Parede",
            color: "#b09060",
            width: 26, height: 22,
            actions: ["Examinar", "Pegar"],
            defaultState: "pendurado",
        },

        // ── PAREDE SUL ────────────────────────────────────────────────────────

        // Cama com colchão rasgado
        // Examinar → lençóis revirados, cheiro de medo
        // Usar → revira o colchão → encontra Fita Cassete escondida na fenda
        {
            id: "quarto_dois.cama",
            x: 560, y: 110,
            label: "Cama",
            color: "#2a2040",
            width: 55, height: 32,
            actions: ["Examinar", "Usar"],
            defaultState: "bagunçada",
        },
        {
            id: "quarto_dois.fita_cassete",
            x: 580, y: 140,
            label: "Fita Cassete",
            color: "#111",
            width: 12, height: 8,
            actions: ["Examinar", "Pegar"],
            defaultState: "oculto",   // visível só após revirar a cama
        },

        // Manchas no chão perto da cama
        {
            id: "quarto_dois.manchas_chao",
            x: 640, y: 150,
            label: "Manchas",
            color: "#5a2020",
            width: 30, height: 8,
            actions: ["Examinar"],
            defaultState: "unexplained",
        },

        // ── PAREDE OESTE ─────────────────────────────────────────────────────

        // Mesa com diário aberto
        // Examinar → descrição do diário (tom paranóico, menciona "o 374")
        // Usar → ler entrada completa → desbloqueia combinação do cofre no gameState
        {
            id: "quarto_dois.mesa_diario",
            x: 820, y: 108,
            label: "Mesa",
            color: "#5a3a1a",
            width: 32, height: 22,
            actions: ["Examinar", "Usar"],
            defaultState: "intacto",
        },

        // Rádio com entrada de fita cassete
        // Examinar → "Um rádio velho. A entrada de fita parece funcionar."
        // Usar sem fita → "Não há nada para tocar."
        // Usar COM "Fita Cassete" no inventário → toca a gravação (diálogo em cadeia)
        {
            id: "quarto_dois.radio",
            x: 880, y: 106,
            label: "Rádio",
            color: "#4a4030",
            width: 24, height: 18,
            actions: ["Examinar", "Usar"],
            defaultState: "desligado",
        },

        // Espelho rachado no canto
        {
            id: "quarto_dois.espelho_rachado",
            x: 760, y: 66,
            label: "Espelho Rachado",
            color: "#7090a0",
            width: 18, height: 32,
            actions: ["Examinar"],
            defaultState: "rachado",
        },
    ],
};