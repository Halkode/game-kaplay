// Cozinha (primeiro andar). Tem duas variantes:
//   - devastada: o jogador pulou pela janela e caiu pelo telhado
//   - normal:    o jogador desceu pela escada e entrou pela sala
// A variante é escolhida toda vez que o jogador entra (resolve()).

import { CUTTING_ITEMS } from "../items.js";

// ── Objetos que existem nas duas variantes (mudam só de posição) ─────────────

const geladeira = {
    id: "geladeira", label: "Geladeira",
    w: 38, h: 62, color: "#7f8c8d",
    initial: "fechada",
    actions: ["Examinar", "Abrir"],
    on: {
        Examinar: [
            ["Geladeira", "Um modelo antigo, ronco constante. A borracha da porta está ressecada."],
            ["Geladeira", "Há algo colado na lateral. Uma nota? Ou só gordura acumulada?"],
        ],
        Abrir(ctx) {
            if (ctx.state === "aberta") return "Já está aberta. Só comida velha dentro.";
            ctx.setState("aberta");
            ctx.give("faca_cozinha");
            return [
                ["Geladeira", "A porta cede com um ruído de vedação quebrando."],
                ["Conteúdo", "Comida deteriorada. Um vidro de maionese. E, na gaveta de legumes, uma faca enrolada em pano."],
                ["Faca", "Alguém a escondeu aqui. Intencionalmente."],
            ];
        },
    },
};

const pia = {
    id: "pia", label: "Pia",
    w: 40, h: 30, color: "#2980b9",
    initial: "seca",
    actions: ["Examinar", "Usar"],
    on: {
        Examinar: "Inox enferrujado. A torneira pinga em ritmo irregular. Gotas que soam muito altas no silêncio.",
        Usar(ctx) {
            ctx.advance(3);
            return [
                ["Torneira", "Você abre a torneira. A água sai marrom por alguns segundos. Depois, limpa."],
                ["Torneira", "Você bebe. O gosto é metálico, mas alivia a secura na garganta."],
            ];
        },
    },
};

const fogao = {
    id: "fogao", label: "Fogão",
    w: 40, h: 30, color: "#555555",
    initial: "apagado",
    actions: ["Examinar", "Usar"],
    on: {
        Examinar: [
            ["Fogão", "As bocas estão apagadas. Uma delas tem a grelha virada ao contrário."],
            ["Fogão", "Cheiro leve de gás. Residual, ou há um vazamento pequeno em algum lugar."],
        ],
        Usar: [
            ["Fogão", "Você gira o botão. Um clique. Outro. Nada acende."],
            ["Fogão", "O gás sai. Você o ouve, levemente. Melhor não insistir."],
        ],
    },
};

const armario = {
    id: "armario", label: "Armário",
    w: 38, h: 65, color: "#4a3020",
    initial: "trancado",
    actions: ["Examinar", "Abrir"],
    on: {
        Examinar(ctx) {
            if (ctx.state === "aberto") return "Já está aberto. Só panos velhos agora.";
            return [
                ["Armário", "Madeira escura, trancada. O trinco não é original. Foi adicionado depois."],
                ["Trinco", "O parafuso está frouxo. Com uma alavanca, a dobradiça cederia."],
            ];
        },
        Abrir(ctx) {
            if (ctx.state === "aberto") return "Já aberto.";
            if (!ctx.hasAny(["perna_mesa", "fragmento_telha"])) {
                return [
                    ["Armário Trancado", "Você puxa a maçaneta. Não cede."],
                    ["Dobradiça", "A dobradiça está fraca. Uma alavanca resolveria, mas você não tem nada para isso agora."],
                ];
            }
            ctx.setState("aberto");
            ctx.give("faca_cozinha");
            return [
                ["Alavanca", "Você encaixa a alavanca na dobradiça. Um esforço longo. A madeira geme."],
                ["Armário", "O trinco salta. O armário abre."],
                ["Faca", "Dentro, entre panos velhos: uma faca de cozinha. Escondida aqui com propósito."],
            ];
        },
    },
};

const portaSala = {
    id: "porta_sala", label: "Porta da Sala", sprite: "porta_madeira",
    w: 24, h: 52, color: "#8b5e3c",
    initial: "fechada",
    actions: ["Examinar", "Usar"],
};

const at = (entity, x, y, extra = {}) => ({ ...entity, x, y, ...extra });

// ── Variante DEVASTADA (pulou pela janela) ───────────────────────────────────

const cozinhaDevastada = {
    id: "cozinha",
    name: "Cozinha (devastada)",
    wallColor: "#3a3028",
    wallSprite: "cozinha_devastada.parede",

    entities: [
        {
            id: "buraco_telhado", label: "Buraco no Teto", sprite: "cozinha_devastada.buraco_telhado",
            x: 200, y: 50, w: 60, h: 20, color: "#1a1208",
            initial: "aberto",
            actions: ["Examinar"],
            on: {
                Examinar: [
                    ["Buraco no Teto", "A abertura por onde você caiu. Lá em cima, a janela do quarto, inacessível agora."],
                    ["Buraco no Teto", "A luz da lua entra pelo buraco. E frio. Muito frio."],
                ],
            },
        },
        {
            id: "mesa_quebrada", label: "Mesa Quebrada", sprite: "cozinha_devastada.mesa_quebrada",
            x: 200, y: 120, w: 55, h: 22, color: "#5a3a1a",
            initial: "destruida",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar: [
                    ["Mesa Quebrada", "A mesa amorteceu parte da sua queda. A madeira está estilhaçada em arco perfeito."],
                    ["Mesa Quebrada", "Sem ela, os ferimentos seriam muito piores. Ou você não estaria aqui para pensar nisso."],
                ],
                Usar: "Você tenta apoiar o peso. A madeira range e cede. Não vai aguentar.",
            },
        },
        {
            id: "perna_mesa", label: "Perna de Mesa", sprite: "cozinha_devastada.perna_mesa",
            x: 170, y: 148, w: 30, h: 8, color: "#6b4a2a", z: 120,
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: "Uma perna de madeira maciça. Pesada. Poderia ser usada como alavanca.",
                Pegar: (ctx) => ctx.pickUp("perna_mesa", "Você pega a perna da mesa. Sólida e pesada: serve como alavanca."),
            },
        },
        {
            id: "destrocos_telha", label: "Pedaço de Telha", sprite: "cozinha_devastada.destrocos_telha",
            x: 140, y: 140, w: 20, h: 10, color: "#9a4a30", z: 121,
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: "Fragmentos de telha antiga. Cerâmica vermelha. Alguns afiados nas bordas.",
                Pegar: (ctx) => ctx.pickUp("fragmento_telha", "Você pega um fragmento afiado. Pode ser útil."),
            },
        },
        {
            id: "destrocos_telha2", label: "Telha Pontiaguda", sprite: "cozinha_devastada.destrocos_telha2",
            x: 240, y: 148, w: 18, h: 8, color: "#a85a38", z: 120,
            actions: ["Examinar", "Pegar"],
            on: {
                Examinar: "Um caco comprido e pontudo. Cuidado com os dedos.",
                Pegar: (ctx) => ctx.pickUp("telha_pontiaguda", "Você guarda a telha pontiaguda, enrolada na manga."),
            },
        },
        {
            id: "nota_chao", label: "Nota", sprite: "cozinha_devastada.nota_chao",
            x: 300, y: 150, w: 14, h: 10, color: "#e8e0c8", z: 150,
            initial: "unread",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "read") return "Você já leu. As palavras ficaram.";
                    ctx.setState("read");
                    return [
                        ["Nota", "Amassada e com marca d'água. A letra é familiar. A mesma do diário do outro quarto?"],
                        ["Nota", "\"Não use a porta principal. Câmera. Use a despensa: a parede do fundo cede.\""],
                        ["Instrução", "A parede do fundo da despensa. Você precisa chegar lá."],
                    ];
                },
            },
        },
        at(geladeira, 400, 95),
        at(pia, 520, 110),
        at(armario, 640, 92),
        at(fogao, 760, 110),
        {
            id: "porta_despensa", label: "Porta da Despensa", sprite: "cozinha.porta_despensa",
            x: 860, y: 94, w: 24, h: 52, color: "#8b5e3c",
            initial: "amarrada",
            actions: ["Examinar", "Usar"],
            exit: {
                to: "quintal", ending: "despensa",
                text: "Você entra na despensa e empurra a parede do fundo. Ela cede, como a nota prometia.",
            },
            on: {
                Examinar(ctx) {
                    if (ctx.state === "aberta") return "A corda está cortada. A saída está lá dentro.";
                    return [
                        ["Porta da Despensa", "Uma porta simples, mas amarrada com corda grossa."],
                        ["Corda", "Não há como abrir sem cortar a corda. Você precisa de algo afiado."],
                    ];
                },
                Usar(ctx) {
                    if (ctx.state === "aberta") return ctx.exit();
                    const tool = ctx.hasAny(CUTTING_ITEMS);
                    if (!tool) {
                        return [
                            ["Corda", "A corda está bem amarrada. Você puxa, mas não cede."],
                            ["Corda", "Precisa de algo afiado para cortar. Os cacos de telha no chão talvez funcionem."],
                        ];
                    }
                    ctx.setState("aberta");
                    ctx.advance(5);
                    return [
                        [`Usando ${ctx.itemName(tool)}`, "Você corta a corda. As fibras cedem uma a uma."],
                        ["Porta Livre", "A porta da despensa está desbloqueada."],
                    ];
                },
            },
        },
        at(portaSala, 920, 94, {
            exit: {
                to: "sala", requires: "perna_mesa",
                lockedText: "A porta está emperrada pelos escombros. Você precisa de algo para usar como alavanca.",
                text: "Você força a porta emperrada com a perna da mesa. A madeira estala, mas cede.",
                arrivalTitle: "Sala", arrivalText: "O silêncio do primeiro andar. Tudo parece diferente.",
            },
        }),
    ],
};

// ── Variante NORMAL (entrou pela sala) ───────────────────────────────────────

const cozinhaNormal = {
    id: "cozinha",
    name: "Cozinha",
    wallColor: "#3a3028",

    entities: [
        at(geladeira, 100, 95),
        {
            id: "nota_geladeira", label: "Bilhete",
            x: 100, y: 80, w: 12, h: 8, color: "#f0e8a0", z: 120,
            initial: "unread",
            actions: ["Examinar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "read") return "Você já leu.";
                    ctx.setState("read");
                    return [
                        ["Bilhete", "Um bilhete preso com ímã. Letra apressada."],
                        ["Bilhete", "\"Se você está lendo isso, ainda há tempo. Não use as portas que eles trancaram.\""],
                        ["Bilhete", "\"Embaixo da mesa tem uma saída. Eles nunca encontraram.\""],
                    ];
                },
            },
        },
        at(fogao, 220, 110, { color: "#c0392b" }),
        at(pia, 340, 110),
        at(armario, 480, 92),
        {
            id: "mesa", label: "Mesa",
            x: 620, y: 108, w: 60, h: 40, color: "#8a5a2a",
            initial: "parada",
            actions: ["Examinar", "Usar"],
            on: {
                Examinar(ctx) {
                    if (ctx.state === "movida") return "Você já moveu a mesa. O alçapão está exposto no chão.";
                    return [
                        ["Mesa", "Uma mesa de madeira pesada. As patas deixaram marcas circulares no chão. Foi movida antes."],
                        ["Chão", "As marcas no assoalho formam um círculo em torno de... algo. Uma junta no piso?"],
                    ];
                },
                Usar(ctx) {
                    if (ctx.state === "movida") return "A mesa já está de lado. O alçapão está visível.";
                    ctx.setState("movida");
                    ctx.setState("visivel", "alcapao");
                    ctx.advance(5);
                    return [
                        ["Esforço", "Você empurra a mesa com o ombro. Ela range e cede. Cada centímetro custa."],
                        ["Alçapão", "No chão: um alçapão de madeira com uma argola de ferro. Escondido debaixo da mesa."],
                        ["Alçapão", "O frio sobe pela fenda. Há um espaço embaixo desta casa."],
                    ];
                },
            },
        },
        {
            id: "alcapao", label: "Alçapão",
            x: 620, y: 148, w: 30, h: 12, color: "#2a1a0a",
            initial: "escondido", hiddenWhen: ["escondido"],
            actions: ["Examinar", "Usar"],
            // TODO: quando existir a cena do porão, trocar `to` para ela.
            exit: {
                to: "quintal", ending: "alcapao",
                text: "Você abre o alçapão. Uma escada de madeira desce para a escuridão. Lá embaixo, um túnel.",
            },
            on: {
                Examinar: [
                    ["Alçapão", "Uma tampa de madeira grossa com argola de ferro. Bem vedada, mas não trancada."],
                    ["Frio", "O frio que sobe pela fenda. Lá embaixo há espaço suficiente para uma pessoa."],
                ],
            },
        },
        {
            id: "janela", label: "Janela",
            x: 800, y: 72, w: 36, h: 28, color: "#a0bfcf",
            initial: "fechada",
            actions: ["Examinar"],
            on: {
                Examinar: [
                    ["Janela", "Uma janela pequena voltada para o jardim. Grade de ferro por fora."],
                    ["Jardim", "O jardim está escuro. Uma das grades parece dobrada, como se alguém tivesse tentado forçar de fora."],
                ],
            },
        },
        at(portaSala, 900, 94, {
            exit: {
                to: "sala",
                text: "Você empurra a porta e volta para a sala.",
                arrivalTitle: "Sala", arrivalText: "A sala principal da casa.",
            },
        }),
    ],
};

export const cozinha = {
    id: "cozinha",
    resolve: (state) => (state.pathChoices.includes("window") ? cozinhaDevastada : cozinhaNormal),
};
