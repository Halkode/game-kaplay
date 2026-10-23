// Quarto inicial (segundo andar). Onde o jogo começa.
//
// Cada entidade junta em um lugar só: posição/tamanho, visual (sprite ou cor de
// placeholder), estado inicial, ações do menu e a lógica (`on`).
// Sprite automático: src/assets/sprites/**/quarto_um.<id>.png (ver ASSETS.md).

import { playWindowJumpSequence } from "../../systems/cutscenes.js";

export const quartoUm = {
    id: "quarto_um",
    name: "Quarto",
    wallColor: "#2e3040",

    entities: [
        {
            id: "porta", label: "Porta", sprite: "porta_madeira",
            x: 120, y: 94, w: 24, h: 52, color: "#8b5e3c",
            initial: "fechada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "corredor", requires: "chave_velha",
                text: "Você gira a maçaneta devagar e sai para o corredor.",
                arrivalTitle: "Corredor", arrivalText: "O corredor está em silêncio. Cheiro de papel úmido.",
            },
            on: {
                Examinar: [
                    ["Porta", "Uma porta de madeira. A tinta está descascando nas bordas."],
                    ["Porta", "Há arranhões na madeira, como se alguém já tivesse tentado forçá-la por dentro."],
                    ["Fechadura", "É uma fechadura antiga. Não consigo ver o outro lado pelo buraco da chave, está muito escuro."],
                ],
                async Usar(ctx) {
                    if (ctx.state === "destrancada") return ctx.exit();

                    if (ctx.has("chave_velha")) {
                        ctx.setState("destrancada");
                        return [
                            ["Chave Velha", "Nem acredito que vou conseguir. Estou tremendo?"],
                            ["Chave Velha", "Um clique seco. A fechadura cede."],
                            ["Porta", "A porta está destrancada. Você pode sair agora."],
                        ];
                    }

                    const msgs = [
                        "Hum, a maçaneta não gira.",
                        "*Você empurra com o ombro* A porta não cede. Isso doeu.",
                        "Ainda trancada...",
                        "Parece que isso não vai funcionar.",
                    ];
                    const tries = ctx.count();
                    const msg = msgs[Math.min(tries - 1, msgs.length - 1)];

                    if (tries === 2) {
                        ctx.advance(10);
                        const choice = await ctx.choose("Porta Trancada",
                            "Você está cansado. Continuar forçando a porta só vai piorar as coisas.",
                            { keep: "Continuar", give_up: "Desistir por enquanto" });
                        if (choice === "keep") {
                            ctx.advance(10);
                            ctx.injure("rightArm", 5, "bruise");
                            return ctx.say("Determinação", msg);
                        }
                        ctx.resetCount();
                        return ctx.say("Sabedoria", "Você respira fundo e se afasta da porta. Talvez haja outro caminho.");
                    }
                    if (tries >= 3) {
                        ctx.advance(15);
                        ctx.resetCount();
                    }
                    return ctx.say("Trancada", msg);
                },
            },
        },
        {
            id: "interruptor", label: "Interruptor", sprite: "interruptor",
            x: 200, y: 92, w: 14, h: 14, color: "#555555",
            initial: "off",
            actions: ["Examinar", "Alternar_Luz"],
        },
        {
            id: "janela", label: "Janela",
            x: 360, y: 68, w: 40, h: 34, color: "#a0bfcf",
            initial: "fechada",
            actions: ["Examinar", "Abrir"],
            on: {
                Examinar: [
                    ["Janela", "Uma janela de guilhotina. O vidro embaçado mostra uma noite sem lua."],
                    ["Janela", "Do lado de fora, o telhado do andar inferior. Parece sólido, mas arriscado."],
                ],
                async Abrir(ctx) {
                    ctx.setState("aberta");
                    await ctx.say("Você empurra a janela. Ela range, mas abre. Uma brisa fria corta o quarto.");
                    const choice = await ctx.choose("Decisão",
                        "O telhado está ali, a três metros abaixo. Parece perigoso, mas é uma saída...",
                        { jump: "Pular", close: "Desistir" });
                    if (choice === "jump") {
                        ctx.leave();
                        playWindowJumpSequence(ctx.k, {});
                        return;
                    }
                    ctx.setState("fechada");
                    return ctx.say("Recuo", "Você recua. É melhor deixar essa saída para depois.");
                },
            },
        },
        {
            id: "escrivaninha", label: "Escrivaninha",
            x: 430, y: 110, w: 30, h: 20, color: "#6b4c2a",
            initial: "intacto",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Escrivaninha", "Uma escrivaninha de carvalho. Gavetas sem maçaneta."],
                    ["Escrivaninha", "Sobre a superfície: uma xícara de café gelado, um caderno aberto."],
                    ["Caderno", "\"Dia 3. Eles continuam do lado de fora. Não vou abrir. A chave está na estante, atrás do marrom.\""],
                    ["Caderno", "\"Dia 7. Se eu não sair antes do amanhecer, a janela é a única saída. Mas o telhado...\""],
                ],
                async Usar(ctx) {
                    const choice = await ctx.choose("Gavetas",
                        "As gavetas estão presas, sem maçaneta. Você pode tentar forçar ou deixar quieto.",
                        { force: "Forçar", leave: "Deixar" });
                    if (choice === "force") {
                        ctx.advance(15);
                        return ctx.say("Esforço", "Você tenta forçar. Lascas de madeira entram nas suas mãos. As gavetas não cedem.");
                    }
                    return ctx.say("Prudência", "Você deixa a escrivaninha em paz. Já há segredos suficientes para descobrir.");
                },
            },
        },
        {
            id: "quadro", label: "Quadro",
            x: 600, y: 59, w: 30, h: 24, color: "#e3c87e",
            initial: "pendurado",
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: [
                    ["Quadro", "Uma pintura a óleo. Um quarto escuro, este quarto, visto de fora da janela."],
                    ["Quadro", "A data no canto inferior: 1987. Alguém conhecia este lugar antes de você."],
                    ["Detalhe", "No verso, colado ao quadro, um bilhete: \"Quando a porta não abre, a janela canta.\""],
                ],
                Pegar: (ctx) => ctx.pickUp("quadro_quarto", "Você retira o quadro da parede e guarda. Pesado para ser apenas uma lembrança."),
            },
        },
        {
            id: "cama", label: "Cama",
            x: 560, y: 112, w: 52, h: 30, color: "#3a3060",
            initial: "arrumada",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Cama", "Uma cama de solteiro. Os lençóis estão revirados. Alguém dormiu aqui recentemente."],
                    ["Cama", "Sob o travesseiro, você encontra uma fotografia."],
                    ["Foto", "Duas pessoas em frente a este mesmo prédio. No verso: \"Eles saberão o que fazer.\""],
                ],
                Usar(ctx) {
                    ctx.advance(30);
                    return "Você deita por um momento. O cansaço pesa. Trinta minutos se passam antes de você perceber.";
                },
            },
        },
        {
            id: "espelho", label: "Espelho",
            x: 780, y: 70, w: 20, h: 36, color: "#b0c8d4",
            initial: "intacto",
            actions: ["Examinar"],
            on: {
                async Examinar(ctx) {
                    const tries = ctx.count();
                    if (tries === 1) return "Você se olha. O rosto que devolve o olhar parece mais velho do que lembra.";
                    if (tries === 2) return "Você olha de novo. Dessa vez, por uma fração de segundo, outra figura aparece atrás de você.";

                    const choice = await ctx.choose("Reflexo",
                        "A figura no espelho não é você. Ela é... mais velha. Mais cansada.",
                        { face: "Encarar", ignore: "Olhar para outro lugar" });
                    if (choice === "face") {
                        ctx.advance(20);
                        return ctx.say("Verdade", "Você encarou. Por um momento, o reflexo sorriu. Era seu sorriso? Você não tinha certeza.");
                    }
                    return ctx.say("Negação", "Você desvia o olhar. Às vezes, ignorância é mais segura que verdade.");
                },
            },
        },
        {
            id: "estante", label: "Estante",
            x: 840, y: 102, w: 40, h: 36, color: "#4a3018",
            initial: "intacto",
            actions: ["Examinar", "Usar"],
            on: {
                // Abre o minigame da estante (scenes/bookshelf.js)
                Examinar: (ctx) => ctx.goTo("bookshelf"),
                async Usar(ctx) {
                    const choice = await ctx.choose("Estante",
                        "Os livros parecem antigos. Você quer examinar cada um deles ou prefere deixar em paz?",
                        { examine: "Examinar", leave: "Deixar" });
                    if (choice === "examine") return ctx.goTo("bookshelf");
                    return "Você deixa os livros em paz. Alguns segredos são melhores intocados.";
                },
            },
        },
    ],
};
