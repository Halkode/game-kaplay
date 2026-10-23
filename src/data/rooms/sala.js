// Sala (primeiro andar). Saída para o quintal e porta da cozinha.

export const sala = {
    id: "sala",
    name: "Sala",
    wallColor: "#2a2218",

    entities: [
        {
            id: "porta_cozinha", label: "Porta da Cozinha", sprite: "porta_madeira",
            x: 120, y: 94, w: 24, h: 52, color: "#8b5e3c",
            initial: "fechada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "cozinha",
                text: "Você abre a porta e entra na cozinha.",
                arrivalTitle: "Cozinha", arrivalText: "O cheiro de comida velha paira no ar.",
            },
        },
        {
            id: "interruptor", label: "Interruptor", sprite: "interruptor",
            x: 220, y: 94, w: 14, h: 14, color: "#555555",
            initial: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },
        {
            id: "telefone", label: "Telefone",
            x: 340, y: 96, w: 18, h: 16, color: "#3a3020",
            initial: "mudo",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Telefone", "Um telefone de parede. O fio foi cortado. Não à tesoura: arrancado."],
                    ["Telefone", "A carcaça tem arranhões, como se alguém tivesse tentado usar mesmo depois de cortado."],
                ],
                Usar(ctx) {
                    const tries = ctx.count();
                    if (tries === 1) return "Silêncio total. O fio está cortado. Claro.";
                    if (tries === 2) {
                        return [
                            ["Telefone", "Você leva o aparelho ao ouvido uma segunda vez, sem razão lógica."],
                            ["Linha", "Respiração. Pausada, regular. Alguém está ouvindo."],
                            ["Linha", "Antes que você diga algo, a linha clica. Silêncio de novo."],
                        ];
                    }
                    return "Desta vez: absolutamente nada. Nem o ruído de antes.";
                },
            },
        },
        {
            id: "televisao", label: "Televisão",
            x: 460, y: 92, w: 44, h: 32, color: "#cccccc",
            initial: "estatica",
            colors: { desligada: "#202020" },
            actions: ["Examinar", "Usar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "desligada") return "Tela preta. Desligada. Sua própria imagem se reflete nela.";
                    const tries = ctx.count();
                    if (tries === 1) return ctx.say("Estática", "A tela pulsa com estática branca. Nenhum canal. Só ruído.");
                    if (tries === 2) {
                        return [
                            ["Estática", "Você olha de novo. A estática... pulsa. Como respiração."],
                            ["Figura", "Por uma fração de segundo: uma silhueta humana. Então, estática."],
                            ["Figura", "Você pisca. Nada. Só você, refletido parcialmente no canto da tela."],
                        ];
                    }
                    ctx.setState("desligada");
                    return [
                        ["Estática", "A estática aumenta de volume por um segundo. Quase insuportável."],
                        ["SAIA", "A tela pisca em preto e branco: uma palavra. \"SAIA\"."],
                        ["Escuridão", "A televisão se apaga. A sala fica mais silenciosa do que deveria."],
                    ];
                },
                Usar(ctx) {
                    if (ctx.state === "desligada") return "Você aperta o botão. Nada. A TV não liga mais.";
                    ctx.setState("desligada");
                    return "Você desliga a televisão. O silêncio que sobra parece mais denso.";
                },
            },
        },
        {
            id: "quadro_fotos", label: "Quadro de Fotos",
            x: 600, y: 60, w: 30, h: 24, color: "#b09060",
            initial: "intacto",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.flag("abriu_cofre") || ctx.flag("leu_diario_quarto_dois")) {
                        return [
                            ["Quadro de Fotos", "Várias fotos emolduradas. Rostos que você não reconhece... até uma."],
                            ["Reconhecimento", "A mulher da última foto. Você a viu na fotografia do cofre. Era ela."],
                            ["Nome", "Embaixo da foto, um nome escrito à mão: \"F., antes de tudo\"."],
                            ["Peso", "Ela estava aqui. Ela viveu aqui. E depois alguém quis apagar todo o rastro."],
                        ];
                    }
                    return [
                        ["Quadro de Fotos", "Várias fotografias emolduradas. Rostos que você não reconhece."],
                        ["Detalhe", "Uma mulher aparece em três fotos diferentes. Ela sorri nas primeiras. Não sorri na última."],
                    ];
                },
            },
        },
        {
            id: "sofa", label: "Sofá",
            x: 720, y: 118, w: 65, h: 30, color: "#5a4030",
            initial: "intacto",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Sofá", "Um sofá de couro gasto. As almofadas estão com os zíperes abertos."],
                    ["Sofá", "Cheiro de cigarro velho e algo adocicado. Alguém passou muito tempo aqui."],
                ],
                Usar(ctx) {
                    if (ctx.state === "revirado") return "Você já revirou as almofadas.";
                    ctx.setState("revirado");
                    ctx.setState("visivel", "cartao_visita");
                    return [
                        ["Almofadas", "Você levanta cada almofada. A última esconde algo preso no forro rasgado."],
                        ["Cartão", "Um cartão de visita cai no chão. Endereço legível: \"Rua das Acácias, 7, Subsolo\"."],
                        ["Cartão", "No verso, carimbo: \"CLÍNICA D.M. — AVALIAÇÃO PSIQUIÁTRICA PARTICULAR\"."],
                    ];
                },
            },
        },
        {
            id: "cartao_visita", label: "Cartão de Visita",
            x: 750, y: 148, w: 12, h: 8, color: "#f0ece0", z: 120,
            initial: "oculto", hiddenWhen: ["oculto"],
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: "\"Rua das Acácias, 7, Subsolo. Clínica D.M.\" As iniciais de novo. Este lugar existe.",
                Pegar: (ctx) => ctx.pickUp("cartao_dm", "Você guarda o cartão. Uma pista de onde tudo começou."),
            },
        },
        {
            id: "estante", label: "Estante",
            x: 860, y: 96, w: 38, h: 62, color: "#4a3018",
            initial: "intacto",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Estante", "Fileiras de livros empoeirados. A maioria sem título legível na lombada."],
                    ["Detalhe", "Um deles se destaca: lombada sem texto e uma leve borda metálica. Não é um livro."],
                ],
                Usar(ctx) {
                    if (ctx.state === "aberta") return "O livro-caixa já está aberto. Vazio agora.";
                    ctx.setState("aberta");
                    ctx.give("chave_despensa");
                    return [
                        ["Livro Falso", "Você puxa o livro sem título. É oco, uma caixa disfarçada."],
                        ["Chave da Despensa", "Dentro: uma chave com uma etiqueta de papel. \"DESPENSA\". A letra é de criança."],
                        ["Chave da Despensa", "Alguém a escondeu aqui. Esperando que a pessoa certa encontrasse."],
                    ];
                },
            },
        },
        {
            id: "porta_exterior", label: "Porta para o Quintal",
            x: 920, y: 92, w: 26, h: 56, color: "#6b4020",
            initial: "trancada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "quintal", requires: "chave_despensa", ending: "porta_frente",
                lockedText: "Trancada. Você vai precisar encontrar a chave para sair por aqui.",
                text: "A chave gira. A porta destranca com um clique pesado.",
            },
            on: {
                Examinar(ctx) {
                    if (ctx.flag("ouviu_gravacao")) {
                        return [
                            ["Porta de Saída", "A saída. Ela falou de uma passagem na despensa da cozinha, mas esta porta também pode funcionar."],
                            ["Fechadura", "Trancada. Com a chave certa..."],
                        ];
                    }
                    return [
                        ["Porta de Saída", "A saída para o exterior. Trancada com chave."],
                        ["Fechadura", "Você vai precisar encontrar a chave para sair por aqui."],
                    ];
                },
            },
        },
    ],
};
