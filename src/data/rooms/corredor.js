// Corredor do segundo andar. Liga o quarto inicial, o quarto dois e a escada.

export const corredor = {
    id: "corredor",
    name: "Corredor",
    wallColor: "#4a4a4a",

    entities: [
        {
            id: "papeis_chao", label: "Papéis",
            x: 100, y: 130, w: 20, h: 10, color: "#ffffff",
            initial: "unread",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "read") return "Você já leu. As palavras ainda ecoam.";
                    ctx.setState("read");
                    ctx.setFlag("leu_relatorio_corredor");
                    return [
                        ["Papéis", "Relatórios médicos. O papel está manchado nas bordas. Umidade ou algo pior."],
                        ["Relatório", "\"Paciente F. Histórico de alucinações visuais. Transferida sem consentimento familiar.\""],
                        ["Relatório", "\"Última anotação, dia 14: paciente não responde. Quarto 2 isolado até nova ordem.\""],
                        ["Realização", "Havia outra pessoa aqui. E alguém decidiu que ninguém precisava saber."],
                    ];
                },
            },
        },
        {
            id: "papeis_chao2", label: "Relatórios",
            x: 300, y: 135, w: 25, h: 12, color: "#f0f0f0",
            initial: "unread",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "read") return "Já leu. Nada mudou desde a última vez.";
                    ctx.setState("read");
                    ctx.setFlag("leu_relatorio_corredor");
                    return [
                        ["Relatórios", "Esses são diferentes. Mais antigos. Anotações à mão nas margens."],
                        ["Anotação", "\"Ela sabia do protocolo. Era um risco.\" Assinado com iniciais: D.M."],
                        ["Anotação", "\"Tudo foi movido antes da chegada da família. Quarto limpo. Registro apagado.\""],
                        ["Peso", "Você está segurando provas de algo que nunca deveria ter acontecido."],
                    ];
                },
            },
        },
        {
            id: "escada", label: "Escada",
            x: 480, y: 88, w: 30, h: 64, color: "#6b4c2a",
            initial: "accessible",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "sala",
                text: "Você desce devagar. Cada degrau range sob seu peso.",
                arrivalTitle: "Primeiro Andar", arrivalText: "A sala do primeiro andar. Mais fria do que você esperava.",
            },
            on: {
                Examinar: "Uma escada de madeira. Desce para o primeiro andar. Os degraus parecem frágeis.",
                Usar(ctx) {
                    if (!ctx.flag("leu_relatorio_corredor")) {
                        return [
                            ["Hesitação", "Você põe o pé no primeiro degrau. Paralisa."],
                            ["Hesitação", "Não consigo descer ainda. Há algo neste andar que ainda não entendi."],
                        ];
                    }
                    return ctx.exit();
                },
            },
        },
        {
            id: "quadro_caido", label: "Quadro Caído",
            x: 460, y: 128, w: 26, h: 18, color: "#c8a87a", z: 120,
            initial: "virado",
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: [
                    ["Quadro Caído", "Encostado na parede como se tivesse sido derrubado e nunca recolocado."],
                    ["Verso", "No verso, desenhado à caneta: uma planta baixa da casa. Quatro cômodos marcados com X."],
                    ["Detalhe", "Um dos X está no andar de baixo, num cômodo que não aparece em nenhuma planta normal."],
                ],
                Pegar: (ctx) => ctx.pickUp("mapa_casa", "Você pega o quadro. O mapa no verso pode ser útil."),
            },
        },
        {
            id: "porta_esquerda", label: "Porta Esquerda",
            x: 580, y: 94, w: 24, h: 52, color: "#5e3e26",
            initial: "trancada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "quarto_dois", requires: "chave_ventilacao",
                lockedText: "Trancada. O cadeado embutido pede uma chave pequena.",
                text: "A chave encaixa. A porta abre com um gemido longo.",
                arrivalTitle: "Outro Quarto", arrivalText: "Alguém já esteve aqui.",
            },
            on: {
                Examinar: [
                    ["Porta Esquerda", "Madeira mais escura que as outras. A maçaneta foi trocada por um cadeado embutido."],
                    ["Fechadura", "Requer uma chave pequena. Onde estaria?"],
                ],
            },
        },
        {
            id: "mancha_parede", label: "Mancha",
            x: 650, y: 42, w: 22, h: 22, color: "#8b4545",
            initial: "unexplained",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    const tries = ctx.count();
                    if (tries === 1) return "Uma mancha marrom. Seca há muito tempo. Pintura? Você prefere que seja pintura.";
                    if (tries === 2) return "Você a toca. Cheiro de enxofre e ferrugem. Definitivamente não é tinta.";
                    ctx.setFlag("viu_escrita_parede");
                    return [
                        ["Escrita", "Embaixo da mancha, riscado na massa corrida, letras irregulares:"],
                        ["Escrita", "\"ELA AINDA ESTÁ AQUI\""],
                        ["Silêncio", "Você olha para o corredor dos dois lados. Ninguém. Só o barulho da ventilação."],
                    ];
                },
            },
        },
        {
            id: "porta_quarto", label: "Porta do Quarto", sprite: "porta_madeira",
            x: 700, y: 94, w: 24, h: 52, color: "#8b5e3c",
            initial: "fechada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "quarto_um",
                text: "Você volta para o quarto.",
                arrivalTitle: "Quarto", arrivalText: "O quarto onde tudo começou.",
            },
        },
        {
            id: "ventilacao", label: "Ventilação",
            x: 830, y: 48, w: 18, h: 18, color: "#888888",
            initial: "noisy",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar(ctx) {
                    if (ctx.count() === 1) return "Um barulho baixo, constante. Ar morno sai pela grelha. Ou é alguém respirando?";
                    return [
                        ["Ventilação", "Você cola o ouvido. Silêncio. Mas tem algo dentro: um brilho metálico atrás da grelha."],
                        ["Ventilação", "Se você conseguir retirar a grelha, talvez alcance o que está lá dentro."],
                    ];
                },
                async Usar(ctx) {
                    if (ctx.has("chave_ventilacao")) return "A grelha está aberta. Você já pegou o que havia dentro.";
                    const choice = await ctx.choose("Ventilação",
                        "Você afasta a grelha com esforço. Lá dentro, algo metálico reflete a escuridão. Enfiar o braço vai doer.",
                        { reach: "Enfiar o braço", leave: "Deixar pra lá" });
                    if (choice === "leave") return ctx.say("Cautela", "Você recua. Não agora.");

                    ctx.injure("rightArm", 8, "laceration"); // metal enferrujado
                    ctx.give("chave_ventilacao");
                    ctx.setState("aberta");
                    ctx.advance(5);
                    return [
                        ["Dor", "A borda enferrujada corta seu antebraço. Você morde o lábio."],
                        ["Achado", "Mas seus dedos alcançam algo frio. Uma chave pequena, amarrada a um barbante."],
                        ["Chave Pequena", "Não era para qualquer um encontrar isso aqui. Alguém a escondeu com cuidado."],
                    ];
                },
            },
        },
    ],
};
