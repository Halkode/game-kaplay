// Finais do jogo. A porta/passagem que leva ao final define gameState.ending
// (campo `ending` na saída da entidade, em data/rooms/*.js).

export const ENDINGS = {
    porta_frente: {
        tag: "FINAL",
        name: "A Porta da Frente",
        color: "#c8a860",
        summary: [
            "Você destrancou a porta da sala e saiu para o quintal.",
            "O vento frio parecia liberdade.",
            "",
            "Mas a nota avisava: a porta principal tinha câmera.",
            "Alguém sabe que você saiu.",
        ],
        hint: "Dica: a voz na fita falava de outra saída.",
    },
    despensa: {
        tag: "FINAL",
        name: "A Passagem",
        color: "#80c0e8",
        summary: [
            "Você cortou a corda e entrou na despensa.",
            "A parede do fundo cedeu, como prometido.",
            "",
            "Ferido, você rasteja para fora sem ser visto.",
            "Ela não conseguiu. Você conseguiu.",
        ],
        hint: "Dica: e se você tivesse saído pela porta do quarto?",
    },
    alcapao: {
        tag: "FINAL",
        name: "Debaixo da Mesa",
        color: "#90b080",
        summary: [
            "Você moveu a mesa e desceu pelo alçapão.",
            "O túnel úmido terminava no jardim dos fundos.",
            "",
            "\"Eles nunca encontraram\", dizia o bilhete.",
            "Agora você sabe por quê.",
        ],
        hint: "Dica: o que mais havia no primeiro andar?",
    },
};

export const DEFAULT_ENDING = "porta_frente";
