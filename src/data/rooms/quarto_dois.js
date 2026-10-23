// Quarto dois (segundo andar). Onde "F." ficou isolada.
// Puzzle: diário (combinação 374) → quadro esconde o cofre → foto + relatório.
//         cama esconde a fita → rádio toca a gravação (pista da despensa).

export const quartoDois = {
    id: "quarto_dois",
    name: "Quarto Dois",
    wallColor: "#1e2a1e",

    entities: [
        {
            id: "interruptor", label: "Interruptor", sprite: "interruptor",
            x: 70, y: 94, w: 14, h: 14, color: "#555555",
            initial: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },
        {
            id: "porta", label: "Porta", sprite: "porta_madeira",
            x: 150, y: 94, w: 24, h: 52, color: "#8b5e3c",
            initial: "fechada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "corredor",
                text: "Você sai do quarto.",
                arrivalTitle: "Corredor", arrivalText: "O corredor silencioso espera.",
            },
        },
        {
            id: "calendario", label: "Calendário",
            x: 310, y: 58, w: 28, h: 22, color: "#d4c8a0",
            initial: "intacto",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    ctx.setFlag("viu_calendario");
                    return [
                        ["Calendário", "Um calendário do ano passado. A maioria dos dias em branco."],
                        ["Dia 14", "O dia 14 está circulado em vermelho. Dentro do círculo, uma única palavra: \"NUNCA\"."],
                        ["Dia 14", "A tinta vermelha está espessa demais para ser apenas marcador."],
                    ];
                },
            },
        },
        {
            id: "janela_selada", label: "Janela Selada",
            x: 380, y: 64, w: 36, h: 28, color: "#8098a8",
            initial: "selada",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Janela Selada", "Fita adesiva passada às pressas em todas as bordas. Feito por dentro."],
                    ["Janela Selada", "Alguém não queria que vissem para dentro. Ou não queria que algo entrasse."],
                ],
                Usar(ctx) {
                    if (ctx.state === "aberta") return "A fita já foi arrancada. A mensagem está exposta.";
                    ctx.setState("aberta");
                    return [
                        ["Fita", "Você arranca a fita. Ela sai em pedaços, deixando resíduos adesivos."],
                        ["Moldura", "Na moldura da janela, riscado com algo afiado: \"ELES SABEM QUE VOCÊ ESTÁ AQUI\"."],
                        ["Fora", "Do lado de fora, apenas o jardim escuro. Mas você sente que está sendo observado."],
                    ];
                },
            },
        },
        {
            // Fica atrás do quadro; só aparece depois que o quadro é retirado.
            id: "cofre", label: "Cofre",
            x: 500, y: 80, w: 24, h: 20, color: "#3a3a3a",
            initial: "oculto", hiddenWhen: ["oculto"],
            actions: ["Examinar", "Usar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "aberto") return "Já está aberto. O que havia dentro está no seu inventário.";
                    if (ctx.flag("leu_diario_quarto_dois")) return "Três discos. Você se lembra: 3, 7, 4. Os dedos encontram os números no escuro.";
                    return "Três discos giratórios. Você precisa da combinação.";
                },
                Usar(ctx) {
                    if (ctx.state === "aberto") return "Já está aberto.";
                    if (!ctx.flag("leu_diario_quarto_dois")) {
                        return [
                            ["Cofre", "Você gira os discos aleatoriamente. Nenhuma combinação funciona."],
                            ["Cofre", "Você precisa encontrar a combinação antes de tentar abrir."],
                        ];
                    }
                    ctx.setState("aberto");
                    ctx.give("foto_data");
                    ctx.give("relatorio_medico");
                    ctx.setFlag("abriu_cofre");
                    return [
                        ["3, 7, 4", "Um clique seco. O cofre abre."],
                        ["Foto com Data", "Uma fotografia. Duas pessoas em frente à casa. A data no verso: dia 14."],
                        ["Reconhecimento", ctx.flag("viu_calendario")
                            ? "O dia 14. O mesmo do calendário. Não é coincidência."
                            : "Uma data. Quando você entender o que ela significa, será tarde demais para ignorar."],
                        ["Relatório Médico", "Um relatório com carimbo: \"ARQUIVADO — NÃO REABRIR\". O nome foi apagado com tinta."],
                    ];
                },
            },
        },
        {
            id: "quadro", label: "Quadro na Parede",
            x: 500, y: 80, w: 26, h: 22, color: "#b09060", z: 51,
            initial: "pendurado",
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: [
                    ["Quadro", "Uma aquarela desbotada. Uma paisagem que não existe, um lugar inventado."],
                    ["Peso", "O quadro pende levemente torto. Há algo atrás dele."],
                ],
                async Pegar(ctx) {
                    ctx.setState("visivel", "cofre");
                    await ctx.pickUp(null);
                    return [
                        ["Quadro Removido", "Você tira o quadro. Atrás dele: um cofre de combinação embutido na parede."],
                        ["Cofre", "Três discos giratórios. Uma combinação numérica. Onde estaria a resposta?"],
                    ];
                },
            },
        },
        {
            id: "cama", label: "Cama",
            x: 560, y: 110, w: 55, h: 32, color: "#2a2040",
            initial: "bagunçada",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Cama", "Lençóis revirados e rasgados. Alguém dormiu aqui com medo. Dá pra sentir nas marcas."],
                    ["Colchão", "O colchão está cortado em vários lugares. Deliberadamente. Uma faca fez isso."],
                    ["Fenda", "Na fenda maior, você nota algo escuro e rígido. Pode estar enterrado mais fundo."],
                ],
                Usar(ctx) {
                    if (ctx.state === "revirada") return "Você já revirou o colchão. Não tem mais nada escondido.";
                    ctx.setState("revirada");
                    ctx.setState("visivel", "fita_cassete");
                    ctx.advance(5);
                    return [
                        ["Esforço", "Você empurra o colchão. Pesado, encharcado de algo que prefere não identificar."],
                        ["Achado", "Uma fita cassete cai no chão. Preta, sem rótulo. Amassada, mas intacta."],
                    ];
                },
            },
        },
        {
            id: "fita_cassete", label: "Fita Cassete",
            x: 580, y: 140, w: 12, h: 8, color: "#111111", z: 120,
            initial: "oculto", hiddenWhen: ["oculto"],
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: "Uma fita preta sem rótulo. O plástico tem marcas de dedos, como se tivesse sido segurada muitas vezes.",
                Pegar: (ctx) => ctx.pickUp("fita_cassete", "Você guarda a fita cassete. Talvez haja algo para reproduzi-la aqui."),
            },
        },
        {
            id: "manchas_chao", label: "Manchas",
            x: 640, y: 150, w: 30, h: 8, color: "#5a2020",
            initial: "unexplained",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.count() === 1) return "Manchas escuras no assoalho. Velhas. Cobertas de pó.";
                    return [
                        ["Manchas", "Você se aproxima mais. A forma é irregular: arrastada, não espirrada."],
                        ["Direção", "As manchas apontam para a porta. Algo foi arrastado para fora deste quarto."],
                    ];
                },
            },
        },
        {
            id: "espelho_rachado", label: "Espelho Rachado",
            x: 760, y: 66, w: 18, h: 32, color: "#7090a0",
            initial: "rachado",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    const tries = ctx.count();
                    if (tries === 1) return "Um espelho rachado no centro. Seu reflexo se divide em dois.";
                    if (tries === 2) return "Um dos fragmentos reflete o quarto atrás de você... mas com a cama arrumada. Como era antes.";
                    return [
                        ["Espelho", "Você olha por tempo demais. O reflexo não acompanha seus movimentos por uma fração de segundo."],
                        ["Silêncio", "Você desvia o olhar. Alguns espelhos sabem de coisas que é melhor não perguntar."],
                    ];
                },
            },
        },
        {
            id: "mesa_diario", label: "Mesa",
            x: 820, y: 108, w: 32, h: 22, color: "#5a3a1a",
            initial: "intacto",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Mesa", "Uma mesa pequena. Em cima: um copo d'água evaporado, uma lamparina apagada."],
                    ["Diário", "Um diário aberto. A letra é irregular, como escrita às pressas ou sob tremor."],
                    ["Entrada", "\"Dia 12. Eles vêm de madrugada. Troquei a combinação: 374. Só eu sei.\""],
                    ["Entrada", "\"Dia 13. O médico de iniciais D.M. esteve aqui. Não deixei entrar. Amanhã me levam de qualquer forma.\""],
                ],
                Usar(ctx) {
                    if (ctx.flag("leu_diario_quarto_dois")) return ctx.say("Diário", "Você já leu. O número 374 está gravado na memória.");
                    ctx.setFlag("leu_diario_quarto_dois");
                    ctx.advance(10);
                    return [
                        ["Lendo", "Você lê cada página com cuidado. O tempo passa sem que você perceba."],
                        ["Combinação", "\"374\": a combinação do cofre. Você a anota mentalmente."],
                        ["Última Entrada", "\"Se alguém ler isso depois: procure o que está no cofre. Mostre para alguém de fora.\""],
                        ["Peso", "Você fecha o diário. Sente o peso de ser o 'alguém' que ela esperava."],
                    ];
                },
            },
        },
        {
            id: "radio", label: "Rádio",
            x: 880, y: 106, w: 24, h: 18, color: "#4a4030",
            initial: "desligado",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Rádio", "Um rádio de pilha dos anos 80. A entrada de fita ainda parece funcionar."],
                    ["Rádio", "Não há pilhas. Mas há um adaptador atrás, plugado na parede."],
                ],
                Usar(ctx) {
                    if (ctx.flag("ouviu_gravacao")) return "A fita acabou. O silêncio depois dela é pior do que qualquer coisa que você ouviu.";
                    if (!ctx.has("fita_cassete")) {
                        return [
                            ["Rádio", "Você aperta Play. Nada."],
                            ["Rádio", "Não há fita. Há algo para colocar aqui?"],
                        ];
                    }
                    // Momento narrativo central: aponta a saída pela despensa
                    ctx.setFlag("ouviu_gravacao");
                    ctx.take("fita_cassete");
                    ctx.setState("tocando");
                    ctx.advance(8);
                    return [
                        ["Inserindo Fita", "A fita encaixa. Você aperta Play. Um chiado longo."],
                        ["Voz", "\"Se você encontrou isso... você está preso lá também. Eu estava no Quarto 2.\""],
                        ["Voz", "\"Não confie no médico de iniciais D.M. Ele trabalha para eles.\""],
                        ["Voz", "\"A saída real não é pela porta da frente. Tem uma passagem no fundo da despensa da cozinha.\""],
                        ["Voz", "\"Eu não consegui chegar lá. Você consegue. Por favor, consegue.\""],
                        ["Silêncio", "A fita acaba. O rádio clica e para. Você fica imóvel por um momento."],
                        ["Determinação", "A despensa da cozinha. É para lá que você precisa ir."],
                    ];
                },
            },
        },
    ],
};
