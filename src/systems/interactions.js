// Central de interacoes e dialogos do jogo.
// As transicoes agora acontecem entre rooms em vez de finalizar direto.

import { gameState } from "../state.js";
import { showDialog, showDialogChain, showChoiceDialog } from "../ui/dialog.js";
import { advanceTime } from "./timeAndLight.js";
import { playWindowJumpSequence } from "./cutscenes.js";
import { flickerLight } from "./animations.js";
import { injurePart } from "./injuries.js";

export function getAvailableActions(objData) {
    const st = gameState.objectStates[objData.id];
    return objData.actions.map((action) => {
        if (action === "Alternar_Janela") return st === "aberta" ? "Fechar" : "Abrir";
        if (action === "Alternar_Luz") return st === "on" ? "Desligar Luz" : "Ligar Luz";
        return action;
    });
}

export function handleInteraction(k, stateContext, action, objData, gameObject) {
    const st = gameState.objectStates[objData.id];

    if (objData.id === "quarto_um.estante") {
        if (action === "Examinar") {
            gameState.savedCamX = k.camPos().x;
            k.go("bookshelf");
            return;
        }
        if (action === "Usar") {
            stateContext.inDialog = true;
            showChoiceDialog(
                k,
                "Estante",
                "Os livros parecem antigos e valiosos. Voce quer examinar cada um deles ou prefere deixar em paz?",
                [
                    { label: "Examinar", value: "examine" },
                    { label: "Deixar", value: "leave" },
                ],
                (choice) => {
                    if (choice === "examine") {
                        gameState.savedCamX = k.camPos().x;
                        stateContext.inDialog = false;
                        k.go("bookshelf");
                    } else {
                        _dialog(k, stateContext, "Estante", "Voce deixa os livros em paz. Alguns segredos sao melhores deixados intocaveis.");
                    }
                }
            );
            return;
        }
    }

    if (objData.id === "quarto_um.porta") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Porta", content: "Uma porta de madeira. A tinta esta descascando nas bordas." },
                { title: "Porta", content: "Há arranhões na madeira, como se alguem ja tivesse tentado forca-la por dentro." },
                { title: "Fechadura", content: "É uma fechadura antiga. Não consigo ver o outro lado pelo buraco da chave, esta muito escurdo." },
            ]);
            return;
        }

        if (action === "Usar") {
            const hasKey = gameState.inventory.includes("Chave Velha");
            const unlocked = st === "destrancada";
            stateContext.inDialog = true;

            if (unlocked) {
                _transitionRoom(k, stateContext, objData);
                return;
            }

            if (hasKey) {
                gameState.objectStates[objData.id] = "destrancada";
                applyVisualState(k, objData, gameObject);
                showDialogChain(k, [
                    { title: "Chave Velha", content: "Nem acredito que vou conseguir, Estou tremendo?" },
                    { title: "Chave Velha", content: "Um clique seco. A fechadura cede." },
                    { title: "Porta", content: "A porta esta destrancada. Você pode sair agora." },
                ], () => {
                    stateContext.inDialog = false;
                });
                return;
            }

            const key = `${objData.id}_usar_locked`;
            const tries = (gameState.actionCounters[key] || 0) + 1;
            gameState.actionCounters[key] = tries;

            const msgs = [
                "Hum, a macaneta nao gira.",
                "*Você empurra com o ombro* A porta nao cede. Isso doeu.",
                "Ainda trancada...",
                "Parece que isso não vai funcionar.",
            ];
            const idx = Math.min(tries - 1, msgs.length - 1);

            // Após 2 tentativas, oferecer escolha
            if (tries === 2) {
                advanceTime(10);
                showChoiceDialog(
                    k,
                    "Porta Trancada",
                    "Voce esta machucado e cansado. Continuar forcando a porta so vai piorar as coisas.",
                    [
                        { label: "Continuar", value: "keep_trying" },
                        { label: "Desistir por enquanto", value: "give_up" },
                    ],
                    (choice) => {
                        if (choice === "keep_trying") {
                            advanceTime(10);
                            showDialog(k, "Determinação", msgs[idx], () => { stateContext.inDialog = false; });
                        } else {
                            showDialog(k, "Sabedoria", "Voce respira fundo e se afasta da porta. Talvez haja outro caminho.", () => {
                                stateContext.inDialog = false;
                                gameState.actionCounters[key] = 0; // Reset attempts
                            });
                        }
                    }
                );
                return;
            }

            if (tries >= 3) {
                advanceTime(15);
                gameState.actionCounters[key] = 0;
            }

            showDialog(k, "Trancada", msgs[idx], () => { stateContext.inDialog = false; });
            return;
        }
    }

    if (objData.id === "quarto_um.janela") {
        if (action === "Examinar") {
            const aberta = st === "aberta";
            _chainDialog(k, stateContext, aberta ? [
                { title: "Janela", content: "A janela esta aberta. Uma brisa fria varre o quarto." },
                { title: "Janela", content: "La fora: o telhado do andar inferior, a tres metros. Daria para descer..." },
            ] : [
                { title: "Janela", content: "Uma janela de guilhotina. O vidro embaçado mostra uma noite sem lua." },
                { title: "Janela", content: "Do lado de fora, o telhado do andar inferior. Parece solido - mas arriscado." },
            ]);
            return;
        }

        if (action === "Abrir") {
            gameState.objectStates[objData.id] = "aberta";
            applyVisualState(k, objData, gameObject);
            stateContext.inDialog = true;
            showDialog(k, "Janela", "Voce empurra a janela. Ela range mas abre. Uma brisa fria corta o quarto.", () => {
                stateContext.inDialog = false;
                showChoiceDialog(
                    k,
                    "Decisão",
                    "O telhado esta ali, a tres metros abaixo. Parece perigoso, mas e uma saida...",
                    [
                        { label: "Pular", value: "jump" },
                        { label: "Desistir", value: "close" },
                    ],
                    (choice) => {
                        if (choice === "jump") {
                            // Inicia a cutscene de pulo animada
                            playWindowJumpSequence(k, stateContext);
                        } else {
                            // Desistir: fecha a janela
                            gameState.objectStates[objData.id] = "fechada";
                            applyVisualState(k, objData, gameObject);
                            showDialog(k, "Recuo", "Voce recua. E melhor deixar essa saida para depois.", () => {
                                stateContext.inDialog = false;
                            });
                        }
                    }
                );
            });
            return;
        }

        if (action === "Fechar") {
            gameState.objectStates[objData.id] = "fechada";
            applyVisualState(k, objData, gameObject);
            _dialog(k, stateContext, "Janela", "Voce fecha a janela. O silencio volta a dominar o quarto.");
            return;
        }
    }

    if (objData.id === "quarto_um.quadro_estranho") {
        if (action === "Examinar") {
            const pegou = gameState.pickedUpItems.includes(objData.id);
            if (pegou) {
                _dialog(k, stateContext, "Quadro", "O espaco vazio na parede revela um retangulo mais limpo - anos de protecao.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Quadro", content: "Uma pintura a oleo. Um quarto escuro - este quarto - visto de fora da janela." },
                { title: "Quadro", content: "A data no canto inferior: 1987. Alguem conhecia este lugar antes de voce." },
                { title: "Detalhe", content: "No verso, colado ao quadro, um bilhete: \"Quando a porta nao abre, a janela canta.\"" },
            ]);
            return;
        }
        if (action === "Pegar") {
            if (!gameState.inventory.includes(objData.label)) gameState.inventory.push(objData.label);
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTARIO", "Voce retira o quadro da parede e guarda. Pesado para ser apenas uma lembranca.");
            return;
        }
    }

    if (objData.id === "quarto_um.escrivaninha") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Escrivaninha", content: "Uma escrivaninha de carvalho. Gavetas sem macaneta." },
                { title: "Escrivaninha", content: "Sobre a superficie: uma xicara de cafe gelado, um caderno aberto." },
                { title: "Caderno", content: "\"Dia 3. Eles continuam do lado de fora. Nao vou abrir. A chave esta na estante, atras do marrom.\"" },
                { title: "Caderno", content: "\"Dia 7. Se eu nao sair antes do amanhecer, a janela e a unica saida. Mas o telhado...\"" },
            ]);
            return;
        }
        if (action === "Usar") {
            stateContext.inDialog = true;
            showChoiceDialog(
                k,
                "Gavetas",
                "As gavetas estao presas sem macaneta. Voce pode tentar forcar ou deixar quieto.",
                [
                    { label: "Forçar", value: "force" },
                    { label: "Deixar", value: "leave" },
                ],
                (choice) => {
                    if (choice === "force") {
                        advanceTime(15);
                        showDialog(k, "Esforço", "Voce tenta forcar. Splinters de madeira saem pelas suas maos. As gavetas nao cedem. Talvez nao haja nada importante dentro mesmo.", () => {
                            stateContext.inDialog = false;
                        });
                    } else {
                        showDialog(k, "Prudência", "Voce deixa a escrivaninha em paz. Ja ha segredos suficientes para descobrir.", () => {
                            stateContext.inDialog = false;
                        });
                    }
                }
            );
            return;
        }
    }

    if (objData.id === "quarto_um.cama") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Cama", content: "Uma cama de solteiro. Os lencois estao revirados - alguem dormiu aqui recentemente." },
                { title: "Cama", content: "Sob o travesseiro, voce encontra uma fotografia." },
                { title: "Foto", content: "Duas pessoas em frente a este mesmo predio. No verso: \"Eles saberao o que fazer.\"" },
            ]);
            return;
        }
        if (action === "Usar") {
            advanceTime(30);
            _dialog(k, stateContext, "Cama",
                "Voce deita por um momento. O cansaco pesa. Trinta minutos se passam antes de voce perceber.");
            return;
        }
    }

    if (objData.id === "quarto_um.espelho") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["espelho_visto"] || 0) + 1;
            gameState.actionCounters["espelho_visto"] = tries;

            if (tries === 1) {
                _dialog(k, stateContext, "Espelho", "Voce se olha. O rosto que devolve o olhar parece mais velho do que lembra.");
                return;
            }
            if (tries === 2) {
                _dialog(k, stateContext, "Espelho", "Voce olha de novo. Dessa vez, por uma fracao de segundo, outra figura aparece atras de voce.");
                return;
            }

            // Terceira olhada: oferece escolha
            stateContext.inDialog = true;
            showChoiceDialog(
                k,
                "Reflexo",
                "A figura no espelho nao e voce. Ela e... mais velha. Mais cansada. Pode enfrenta-la ou fingir que nao viu nada.",
                [
                    { label: "Encarar", value: "face" },
                    { label: "Olhar para outro lugar", value: "ignore" },
                ],
                (choice) => {
                    if (choice === "face") {
                        showDialog(k, "Verdade", "Voce encarou. Por um momento, o reflexo sorriu. Era seu sorriso? Voce nao tinha certeza.", () => {
                            stateContext.inDialog = false;
                            advanceTime(20);
                        });
                    } else {
                        showDialog(k, "Negação", "Voce desvia o olhar. As vezes, ignorancia e mais segura que verdade.", () => {
                            stateContext.inDialog = false;
                        });
                    }
                }
            );
            return;
        }
    }

    if (objData.id === "corredor.papeis_chao") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Papeis", content: "Relatorios espalhados pelo chao. Seu nome neles - em todos." },
                { title: "Relatorio", content: "\"Paciente mostra sinais de paranoia aguda. Recomenda-se isolamento continuo.\"" },
                { title: "Relatorio", content: "\"Dia 14: Paciente insiste em 'chave escondida'. Possivel delirio.\"" },
            ]);
            return;
        }
    }

    if (objData.id === "corredor.papeis_chao2") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Relatorios", content: "Mais papeis. Datas antigas, mas o nome e o mesmo." },
                { title: "Relatorio", content: "\"Voce nao estava preso aqui. Voce foi colocado aqui.\"" },
                { title: "Relatorio", content: "\"As perguntas continuam.\"" },
            ]);
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // CORREDOR — SEGUNDO ANDAR
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "corredor_segundo_andar.papeis_chao") {
        if (action === "Examinar") {
            const lido = gameState.objectStates[objData.id] === "read";
            if (lido) {
                _dialog(k, stateContext, "Papéis", "Você já leu. As palavras ainda ecoam.");
                return;
            }
            gameState.objectStates[objData.id] = "read";
            gameState.flags = gameState.flags || {};
            gameState.flags.leu_relatorio_corredor = true;
            _chainDialog(k, stateContext, [
                { title: "Papéis", content: "Relatórios médicos. O papel está manchado nas bordas — umidade ou algo pior." },
                { title: "Relatório", content: "\"Paciente F. Histórico de alucinações visuais. Transferida sem consentimento familiar.\"" },
                { title: "Relatório", content: "\"Última anotação, dia 14: paciente não responde. Quarto 2 isolado até nova ordem.\"" },
                { title: "Realização", content: "Havia outra pessoa aqui. E alguém decidiu que ninguém precisava saber." },
            ]);
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.papeis_chao2") {
        if (action === "Examinar") {
            const lido = gameState.objectStates[objData.id] === "read";
            if (lido) {
                _dialog(k, stateContext, "Relatórios", "Já leu. Nada mudou desde a última vez.");
                return;
            }
            gameState.objectStates[objData.id] = "read";
            gameState.flags = gameState.flags || {};
            gameState.flags.leu_relatorio_corredor = true;
            _chainDialog(k, stateContext, [
                { title: "Relatórios", content: "Esses são diferentes. Mais antigos. Marginais anotados à mão." },
                { title: "Anotação", content: "\"Ela sabia do protocolo. Era um risco.\" — assinado com iniciais: D.M." },
                { title: "Anotação", content: "\"Tudo foi movido antes da chegada da família. Quarto limpo. Registro apagado.\"" },
                { title: "Peso", content: "Você está segurando provas de algo que nunca deveria ter acontecido." },
            ]);
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.ventilacao") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["ventilacao_vista"] || 0) + 1;
            gameState.actionCounters["ventilacao_vista"] = tries;
            if (tries === 1) {
                _dialog(k, stateContext, "Ventilação",
                    "Um barulho baixo, constante. Ar morno sai pela grelha. Ou é alguém respirando?");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Ventilação", content: "Você cola o ouvido. Silêncio. Mas tem algo dentro — um brilho metálico atrás da grelha." },
                { title: "Ventilação", content: "Se você conseguir retirar a grelha, talvez alcance o que está lá dentro." },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaPegou = gameState.inventory.includes("Chave da Ventilação");
            if (jaPegou) {
                _dialog(k, stateContext, "Ventilação", "A grelha está aberta. Você já pegou o que havia dentro.");
                return;
            }
            stateContext.inDialog = true;
            showChoiceDialog(
                k,
                "Ventilação",
                "Você afasta a grelha com esforço. Lá dentro, algo metálico reflete a escuridão. Enfiar o braço vai doer.",
                [
                    { label: "Enfiar o braço", value: "reach" },
                    { label: "Deixar pra lá", value: "leave" },
                ],
                (choice) => {
                    if (choice === "leave") {
                        showDialog(k, "Cautela", "Você recua. Não agora.", () => { stateContext.inDialog = false; });
                        return;
                    }
                    // Pequeno dano — metal enferrujado
                    injurePart("rightArm", 8, "laceration", { force: true, showDialog: false });
                    gameState.inventory.push("Chave da Ventilação");
                    advanceTime(5);
                    showDialogChain(k, [
                        { title: "Dor", content: "A borda enferrujada corta seu antebraço. Você morde o lábio." },
                        { title: "Achado", content: "Mas seus dedos alcançam algo frio. Uma chave pequena, amarrada a um barbante." },
                        { title: "Chave Velha", content: "Não era para qualquer um encontrar isso aqui. Alguém a escondeu com cuidado." },
                    ], () => { stateContext.inDialog = false; });
                }
            );
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.mancha_parede") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["mancha_vista"] || 0) + 1;
            gameState.actionCounters["mancha_vista"] = tries;
            if (tries === 1) {
                _dialog(k, stateContext, "Mancha", "Uma mancha marrom. Seca há muito tempo. Pintura? Você prefere que seja pintura.");
                return;
            }
            if (tries === 2) {
                _dialog(k, stateContext, "Mancha", "Você a toca. Cheiro de enxofre e ferrugem. Definitivamente não é tinta.");
                return;
            }
            // 3ª vez: revela escrita embaixo
            gameState.flags = gameState.flags || {};
            gameState.flags.viu_escrita_parede = true;
            _chainDialog(k, stateContext, [
                { title: "Escrita", content: "Embaixo da mancha, riscado na massa corrida, letras irregulares:" },
                { title: "Escrita", content: "\"ELA AINDA ESTÁ AQUI\"" },
                { title: "Silêncio", content: "Você olha para o corredor dos dois lados. Ninguém. Só o barulho da ventilação." },
            ]);
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.quadro_caido") {
        if (action === "Examinar") {
            const pegou = gameState.pickedUpItems.includes(objData.id);
            if (pegou) {
                _dialog(k, stateContext, "Quadro", "O espaço vazio onde o quadro estava. A parede atrás é mais clara.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Quadro Caído", content: "Encostado na parede como se tivesse sido derrubado e nunca recolocado." },
                { title: "Verso", content: "No verso, desenhado à caneta: uma planta baixa da casa. Quatro cômodos marcados com X." },
                { title: "Detalhe", content: "Um dos X está no andar de baixo, num cômodo que não aparece em nenhum mapa normal da planta." },
            ]);
            return;
        }
        if (action === "Pegar") {
            if (!gameState.inventory.includes("Mapa da Casa")) gameState.inventory.push("Mapa da Casa");
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTÁRIO", "Você pega o quadro. O mapa no verso pode ser útil.");
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.escada_segundo_andar") {
        if (action === "Examinar") {
            _dialog(k, stateContext, "Escada", "Uma escada de madeira. Desce para o primeiro andar. Os degraus parecem frágeis.");
            return;
        }
        if (action === "Usar") {
            const flags = gameState.flags || {};
            if (!flags.leu_relatorio_corredor) {
                _chainDialog(k, stateContext, [
                    { title: "Hesitação", content: "Você põe o pé no primeiro degrau. Paralisa." },
                    { title: "Hesitação", content: "Não consigo descer ainda. Há algo neste andar que ainda não entendi." },
                ]);
                return;
            }
            // Deixa a _transitionRoom padrão tratar o resto
        }
    }

    if (objData.id === "corredor_segundo_andar.porta_esquerda_corredor") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Porta Esquerda", content: "Madeira mais escura que as outras. A maçaneta foi trocada — cadeado embutido." },
                { title: "Fechadura", content: "Requer uma chave pequena. Onde estaria?" },
            ]);
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // QUARTO DOIS — SEGUNDO ANDAR
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "quarto_dois.calendario") {
        if (action === "Examinar") {
            gameState.flags = gameState.flags || {};
            gameState.flags.viu_calendario = true;
            _chainDialog(k, stateContext, [
                { title: "Calendário", content: "Um calendário do ano passado. Maioria dos dias em branco." },
                { title: "Dia 14", content: "O dia 14 está circulado em vermelho. Dentro do círculo, uma única palavra: \"NUNCA\"." },
                { title: "Dia 14", content: "A tinta vermelha está espessa demais para ser apenas marcador." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.janela_selada") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Janela Selada", content: "Fita adesiva passada às pressas em todas as bordas. Feito por dentro." },
                { title: "Janela Selada", content: "Alguém não queria que vissem para dentro. Ou não queria que algo entrasse." },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaArrancoU = gameState.objectStates[objData.id] === "aberta";
            if (jaArrancoU) {
                _dialog(k, stateContext, "Janela", "A fita já foi arrancada. A mensagem está exposta.");
                return;
            }
            gameState.objectStates[objData.id] = "aberta";
            applyVisualState(k, objData, gameObject);
            _chainDialog(k, stateContext, [
                { title: "Fita", content: "Você arranca a fita. Ela sai em pedaços, deixando resíduos adesivos." },
                { title: "Moldura", content: "Na moldura da janela, riscado com algo afiado: \"ELES SABEM QUE VOCÊ ESTÁ AQUI\"." },
                { title: "Fora", content: "Do lado de fora, apenas o jardim escuro. Mas você sente que está sendo observado." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.quadro_cobrindo_cofre") {
        if (action === "Examinar") {
            const pegou = gameState.pickedUpItems.includes(objData.id);
            if (pegou) {
                _dialog(k, stateContext, "Cofre", "O cofre está exposto na parede.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Quadro", content: "Uma aquarela desbotada. Paisagem que não existe — um lugar inventado." },
                { title: "Peso", content: "O quadro pende levemente torto. Há algo atrás dele." },
            ]);
            return;
        }
        if (action === "Pegar") {
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            // Revelar o cofre
            gameState.objectStates["quarto_dois.cofre"] = "visivel";
            _chainDialog(k, stateContext, [
                { title: "Quadro Removido", content: "Você tira o quadro. Atrás dele: um cofre de combinação embutido na parede." },
                { title: "Cofre", content: "Três discos giratórios. Uma combinação numérica. Onde estaria a resposta?" },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.cofre") {
        if (action === "Examinar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "oculto") {
                _dialog(k, stateContext, "Parede", "Uma parede comum. Nada de especial aqui.");
                return;
            }
            if (estado === "aberto") {
                _dialog(k, stateContext, "Cofre", "Já está aberto. O que havia dentro está no seu inventário.");
                return;
            }
            const temCodigo = gameState.flags && gameState.flags.leu_diario_quarto_dois;
            if (temCodigo) {
                _dialog(k, stateContext, "Cofre", "Três discos. Você se lembra: 3 — 7 — 4. Os dedos encontram os números no escuro.");
                return;
            }
            _dialog(k, stateContext, "Cofre", "Três discos giratórios. Você precisa da combinação.");
            return;
        }
        if (action === "Usar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "oculto") {
                _dialog(k, stateContext, "Parede", "Nada para usar aqui.");
                return;
            }
            if (estado === "aberto") {
                _dialog(k, stateContext, "Cofre", "Já está aberto.");
                return;
            }
            const temCodigo = gameState.flags && gameState.flags.leu_diario_quarto_dois;
            if (!temCodigo) {
                _chainDialog(k, stateContext, [
                    { title: "Cofre", content: "Você gira os discos aleatoriamente. Nenhuma combinação funciona." },
                    { title: "Cofre", content: "Você precisa encontrar a combinação antes de tentar abrir." },
                ]);
                return;
            }
            // Abrir o cofre
            gameState.objectStates[objData.id] = "aberto";
            applyVisualState(k, objData, gameObject);
            if (!gameState.inventory.includes("Foto com Data")) gameState.inventory.push("Foto com Data");
            if (!gameState.inventory.includes("Relatório Médico")) gameState.inventory.push("Relatório Médico");
            gameState.flags.abriu_cofre = true;

            const jaViuCalendario = gameState.flags.viu_calendario;
            _chainDialog(k, stateContext, [
                { title: "3 — 7 — 4", content: "Um clique seco. O cofre abre." },
                { title: "Foto com Data", content: "Uma fotografia. Duas pessoas em frente à casa. A data no verso: dia 14." },
                {
                    title: "Reconhecimento",
                    content: jaViuCalendario
                        ? "O dia 14. O mesmo do calendário. Não é coincidência."
                        : "Uma data. Quando você entender o que ela significa, será tarde demais para ignorar."
                },
                { title: "Relatório Médico", content: "Um relatório com carimbo: \"ARQUIVADO — NÃO REABRIR\". O nome é ilegível, apagado com tinta." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.cama") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Cama", content: "Lençóis revirados e rasgados. Alguém dormiu aqui com medo — dá pra sentir isso nas marcas." },
                { title: "Colchão", content: "O colchão está cortado em vários lugares. Deliberadamente. Uma faca fez isso." },
                { title: "Fenda", content: "Na fenda maior, você nota algo escuro e rígido. Pode estar enterrado mais fundo." },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaReviroU = gameState.objectStates[objData.id] === "revirada";
            if (jaReviroU) {
                _dialog(k, stateContext, "Cama", "Você já revirou o colchão. Não tem mais nada escondido.");
                return;
            }
            gameState.objectStates[objData.id] = "revirada";
            // Revelar fita cassete
            gameState.objectStates["quarto_dois.fita_cassete"] = "visivel";
            advanceTime(5);
            _chainDialog(k, stateContext, [
                { title: "Esforço", content: "Você empurra o colchão. Pesado, encharcado de algo que preferiu não identificar." },
                { title: "Achado", content: "Uma fita cassete cai no chão. Preta, sem rótulo. Amassada mas intacta." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.fita_cassete") {
        if (action === "Examinar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "oculto") {
                _dialog(k, stateContext, "Cama", "Nada visível. Talvez haja algo escondido no colchão.");
                return;
            }
            _dialog(k, stateContext, "Fita Cassete", "Uma fita preta sem rótulo. O plástico tem marcas de dedos, como se tivesse sido segurada muitas vezes.");
            return;
        }
        if (action === "Pegar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "oculto") return;
            if (!gameState.inventory.includes("Fita Cassete")) gameState.inventory.push("Fita Cassete");
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTÁRIO", "Você guarda a fita cassete. Talvez haja algo para reproduzi-la aqui.");
            return;
        }
    }

    if (objData.id === "quarto_dois.manchas_chao") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["manchas_chao_vistas"] || 0) + 1;
            gameState.actionCounters["manchas_chao_vistas"] = tries;
            if (tries === 1) {
                _dialog(k, stateContext, "Manchas", "Manchas escuras no assoalho. Velhas. Cobertas de pó por cima.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Manchas", content: "Você se aproxima mais. A forma é irregular — arrastada, não espirrada." },
                { title: "Direção", content: "As manchas apontam para a porta. Algo foi arrastado para fora deste quarto." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.mesa_diario") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Mesa", content: "Uma mesa pequena. Em cima: um copo d'água evaporado, uma lamparina apagada." },
                { title: "Diário", content: "Um diário aberto. A letra é irregular, como escrita às pressas ou sob tremor." },
                { title: "Entrada", content: "\"Dia 12 — Eles vêm de madrugada. Troquei a combinação: 374. Só eu sei.\"" },
                { title: "Entrada", content: "\"Dia 13 — O médico de iniciais D.M. esteve aqui. Não deixei entrar. Amanhã me levam de qualquer forma.\"" },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaLeu = gameState.flags && gameState.flags.leu_diario_quarto_dois;
            if (jaLeu) {
                _dialog(k, stateContext, "Diário", "Você já leu. O número 374 está gravado na memória.");
                return;
            }
            gameState.flags = gameState.flags || {};
            gameState.flags.leu_diario_quarto_dois = true;
            advanceTime(10);
            _chainDialog(k, stateContext, [
                { title: "Lendo", content: "Você lê cada página com cuidado. O tempo passa sem que você perceba." },
                { title: "Combinação", content: "\"374\" — a combinação do cofre. Você a anota mentalmente." },
                { title: "Última Entrada", content: "\"Se alguém ler isso depois: procure o que está no cofre. Mostre para alguém de fora.\"" },
                { title: "Peso", content: "Você fecha o diário. Sente o peso de ser o 'alguém' que ela esperava." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.radio") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Rádio", content: "Um rádio de pilha dos anos 80. A entrada de fita ainda parece funcionar." },
                { title: "Rádio", content: "Não há pilhas. Mas há um adaptador de tomada atrás — plugado na parede." },
            ]);
            return;
        }
        if (action === "Usar") {
            const temFita = gameState.inventory.includes("Fita Cassete");
            const jaOuviu = gameState.flags && gameState.flags.ouviu_gravacao;
            if (jaOuviu) {
                _dialog(k, stateContext, "Rádio", "A fita acabou. O silêncio depois dela é pior do que qualquer coisa que você ouviu.");
                return;
            }
            if (!temFita) {
                _chainDialog(k, stateContext, [
                    { title: "Rádio", content: "Você aperta Play. Nada." },
                    { title: "Rádio", content: "Não há fita. Há algo para colocar aqui?" },
                ]);
                return;
            }
            // Tocar a gravação — momento narrativo central
            gameState.flags = gameState.flags || {};
            gameState.flags.ouviu_gravacao = true;
            gameState.inventory = gameState.inventory.filter(i => i !== "Fita Cassete");
            advanceTime(8);
            _chainDialog(k, stateContext, [
                { title: "Inserindo Fita", content: "A fita encaixa. Você aperta Play. Um chiado longo." },
                { title: "Voz", content: "\"Se você encontrou isso... você está preso lá também. Eu estava no Quarto 2.\"" },
                { title: "Voz", content: "\"Não confie no médico de iniciais D.M. Ele trabalha para eles.\"" },
                { title: "Voz", content: "\"A saída real não é pela porta da frente. Tem uma passagem no fundo da despensa da cozinha.\"" },
                { title: "Voz", content: "\"Eu não consegui chegar lá. Você consegue. Por favor, consegue.\"" },
                { title: "Silêncio", content: "A fita acaba. O rádio clica e para. Você fica imóvel por um momento." },
                { title: "Determinação", content: "A despensa da cozinha. É para lá que você precisa ir." },
            ]);
            return;
        }
    }

    if (objData.id === "quarto_dois.espelho_rachado") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["espelho_dois_visto"] || 0) + 1;
            gameState.actionCounters["espelho_dois_visto"] = tries;
            if (tries === 1) {
                _dialog(k, stateContext, "Espelho Rachado", "Um espelho rachado do centro. Seu reflexo se divide em dois.");
                return;
            }
            if (tries === 2) {
                _dialog(k, stateContext, "Espelho Rachado", "Um dos fragmentos reflete o quarto atrás de você... mas com a cama arrumada. Como era antes.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Espelho", content: "Você olha por tempo demais. O reflexo não acompanha seus movimentos por uma fração de segundo." },
                { title: "Silêncio", content: "Você desvia o olhar. Alguns espelhos sabem de coisas que é melhor não perguntar." },
            ]);
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // SALA — PRIMEIRO ANDAR
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "sala.telefone") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Telefone", content: "Um telefone de parede. O fio foi cortado — não à tesoura. Arrancado." },
                { title: "Telefone", content: "A carcaça tem arranhões como se alguém tivesse tentado usar mesmo depois de cortado." },
            ]);
            return;
        }
        if (action === "Usar") {
            const tries = (gameState.actionCounters["telefone_usado"] || 0) + 1;
            gameState.actionCounters["telefone_usado"] = tries;
            if (tries === 1) {
                _dialog(k, stateContext, "Telefone", "Silêncio total. O fio está cortado. Claro.");
                return;
            }
            if (tries === 2) {
                _chainDialog(k, stateContext, [
                    { title: "Telefone", content: "Você leva o aparelho ao ouvido uma segunda vez, sem razão lógica." },
                    { title: "Linha", content: "Respiração. Pausada, regular. Alguém está ouvindo." },
                    { title: "Linha", content: "Antes que você diga algo, a linha clica. Silêncio de novo." },
                ]);
                return;
            }
            _dialog(k, stateContext, "Telefone", "Desta vez: absolutamente nada. Nem o ruído de antes.");
            return;
        }
    }

    if (objData.id === "sala.televisao") {
        if (action === "Examinar") {
            const tries = (gameState.actionCounters["tv_vista"] || 0) + 1;
            gameState.actionCounters["tv_vista"] = tries;
            if (gameState.objectStates[objData.id] === "desligada") {
                _dialog(k, stateContext, "Televisão", "Tela preta. Desligada. Sua própria imagem se reflete nela.");
                return;
            }
            if (tries === 1) {
                _dialog(k, stateContext, "Estática", "A tela pulsa com estática branca. Nenhum canal. Só ruído.");
                return;
            }
            if (tries === 2) {
                _chainDialog(k, stateContext, [
                    { title: "Estática", content: "Você olha de novo. A estática... pulsa. Como respiração." },
                    { title: "Figura", content: "Por uma fração de segundo: uma silhueta humana. Então, estática." },
                    { title: "Figura", content: "Você pisca. Nada. Só você, refletido parcialmente no canto da tela." },
                ]);
                return;
            }
            // 3ª vez: TV desliga e mostra palavra
            gameState.objectStates[objData.id] = "desligada";
            applyVisualState(k, objData, gameObject);
            _chainDialog(k, stateContext, [
                { title: "Estática", content: "A estática aumenta de volume por um segundo — quase insuportável." },
                { title: "SAIA", content: "A tela pisca em preto e branco: uma palavra. \"SAIA\"." },
                { title: "Escuridão", content: "A televisão se apaga. A sala fica mais silenciosa do que deveria." },
            ]);
            return;
        }
        if (action === "Usar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "desligada") {
                _dialog(k, stateContext, "Televisão", "Você aperta o botão. Nada. A TV não liga mais.");
                return;
            }
            gameState.objectStates[objData.id] = "desligada";
            applyVisualState(k, objData, gameObject);
            _dialog(k, stateContext, "Televisão", "Você desliga a televisão. O silêncio que sobra parece mais denso.");
            return;
        }
    }

    if (objData.id === "sala.quadro_fotos") {
        if (action === "Examinar") {
            const jaViuDiario = gameState.flags && gameState.flags.leu_diario_quarto_dois;
            const jaAbriuCofre = gameState.flags && gameState.flags.abriu_cofre;
            if (jaAbriuCofre || jaViuDiario) {
                _chainDialog(k, stateContext, [
                    { title: "Quadro de Fotos", content: "Várias fotos emolduradas. Rostos que não reconhece... até uma." },
                    { title: "Reconhecimento", content: "A mulher da última foto. Você a viu na fotografia do cofre. Era ela." },
                    { title: "Nome", content: "Embaixo da foto, um nome escrito à mão: \"F. — antes de tudo\"." },
                    { title: "Peso", content: "Ela estava aqui. Ela viveu aqui. E depois alguém quis apagar todo o rastro." },
                ]);
            } else {
                _chainDialog(k, stateContext, [
                    { title: "Quadro de Fotos", content: "Várias fotografias emolduradas. Rostos que você não reconhece." },
                    { title: "Detalhe", content: "Uma mulher em particular aparece em três fotos diferentes. Ela sorri nas primeiras. Não sorri na última." },
                ]);
            }
            return;
        }
    }

    if (objData.id === "sala.sofa") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Sofá", content: "Um sofá de couro gasto. As almofadas estão com os zíperes abertos." },
                { title: "Sofá", content: "Cheiro de cigarro velho e algo adocicado. Alguém passou muito tempo aqui." },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaReviroU = gameState.objectStates[objData.id] === "revirado";
            if (jaReviroU) {
                _dialog(k, stateContext, "Sofá", "Você já revirou. O cartão está no chão — ou no seu inventário.");
                return;
            }
            gameState.objectStates[objData.id] = "revirado";
            gameState.objectStates["sala.cartao_visita"] = "visivel";
            _chainDialog(k, stateContext, [
                { title: "Almofadas", content: "Você levanta cada almofada. A última esconde algo preso no forro rasgado." },
                { title: "Cartão", content: "Um cartão de visita. Nome apagado. Endereço legível: \"Rua das Acácias, 7 — Subsolo\"." },
                { title: "Cartão", content: "No verso, carimbo: \"CLÍNICA D.M. — AVALIAÇÃO PSIQUIÁTRICA PARTICULAR\"." },
            ]);
            return;
        }
    }

    if (objData.id === "sala.cartao_visita") {
        if (action === "Examinar") {
            if (gameState.objectStates[objData.id] === "oculto") {
                _dialog(k, stateContext, "Sofá", "Nada visível. Talvez valha revirar as almofadas.");
                return;
            }
            _dialog(k, stateContext, "Cartão de Visita", "\"Rua das Acácias, 7 — Subsolo. Clínica D.M.\" — As iniciais de novo. Este lugar existe.");
            return;
        }
        if (action === "Pegar") {
            if (gameState.objectStates[objData.id] === "oculto") return;
            if (!gameState.inventory.includes("Cartão D.M.")) gameState.inventory.push("Cartão D.M.");
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTÁRIO", "Você guarda o cartão. Uma pista de onde tudo começou.");
            return;
        }
    }

    if (objData.id === "sala.estante") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Estante", content: "Fileiras de livros empoeirados. A maioria sem título legível na lombada." },
                { title: "Detalhe", content: "Um deles se destaca: lombada sem texto e uma leve borda metálica. Não é um livro." },
            ]);
            return;
        }
        if (action === "Usar") {
            const jaAbriu = gameState.objectStates[objData.id] === "aberta";
            if (jaAbriu) {
                _dialog(k, stateContext, "Estante", "O livro-caixa já está aberto. Vazio agora.");
                return;
            }
            gameState.objectStates[objData.id] = "aberta";
            if (!gameState.inventory.includes("Chave da Despensa")) gameState.inventory.push("Chave da Despensa");
            _chainDialog(k, stateContext, [
                { title: "Livro Falso", content: "Você puxa o livro sem título. É oco — uma caixa disfarçada." },
                { title: "Chave da Despensa", content: "Dentro: uma chave com uma etiqueta de papel. \"DESPENSA\". A letra é de criança." },
                { title: "Chave da Despensa", content: "Alguém a escondeu aqui. Esperando que a pessoa certa encontrasse." },
            ]);
            return;
        }
    }

    if (objData.id === "sala.janela_cozinha" || objData.id === "sala.porta_exterior") {
        if (action === "Examinar" && objData.id === "sala.porta_exterior") {
            const jaOuviu = gameState.flags && gameState.flags.ouviu_gravacao;
            if (jaOuviu) {
                _chainDialog(k, stateContext, [
                    { title: "Porta de Saída", content: "A saída. Ela falou em uma passagem na despensa da cozinha, mas esta porta também pode funcionar." },
                    { title: "Fechadura", content: "Trancada. Com a chave certa..." },
                ]);
            } else {
                _chainDialog(k, stateContext, [
                    { title: "Porta de Saída", content: "A saída para o exterior. Trancada com chave." },
                    { title: "Fechadura", content: "Você vai precisar encontrar a chave para sair por aqui." },
                ]);
            }
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // COZINHA — CENÁRIO DEVASTADO (pulo pela janela)
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "cozinha.buraco_telhado") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Buraco no Teto", content: "A abertura por onde você caiu. Lá de cima, a janela do quarto — inacessível agora." },
                { title: "Buraco no Teto", content: "Luz da lua entra pelo buraco. E frio. Muito frio." },
            ]);
            return;
        }
    }

    if (objData.id === "cozinha.mesa_quebrada") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Mesa Quebrada", content: "A mesa amorteceu parte da sua queda. A madeira está estilhaçada em arco perfeito." },
                { title: "Mesa Quebrada", content: "Sem ela, os ferimentos seriam muito piores. Ou você não estaria aqui para pensar nisso." },
            ]);
            return;
        }
        if (action === "Usar") {
            _dialog(k, stateContext, "Mesa Quebrada", "Você tenta apoiar o peso. A madeira range e cede. Não vai aguentar.");
            return;
        }
    }

    if (objData.id === "cozinha.destrocos_telha") {
        if (action === "Examinar") {
            _dialog(k, stateContext, "Destroços", "Fragmentos de telha antiga. Cerâmica vermelha. Algumas ainda intactas, afiadas nas bordas.");
            return;
        }
        if (action === "Pegar") {
            if (!gameState.inventory.includes("Fragmento de Telha")) gameState.inventory.push("Fragmento de Telha");
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTÁRIO", "Você pega um fragmento afiado. Pode ser útil.");
            return;
        }
    }

    if (objData.id === "cozinha.perna_mesa") {
        if (action === "Examinar") {
            _dialog(k, stateContext, "Perna de Mesa", "Uma perna de madeira maciça. Pesada. Poderia ser usada como alavanca.");
            return;
        }
        if (action === "Pegar") {
            if (!gameState.inventory.includes("Alavanca de Madeira")) gameState.inventory.push("Alavanca de Madeira");
            if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
            k.destroy(gameObject);
            _dialog(k, stateContext, "INVENTÁRIO", "Você pega a perna da mesa. Sólida e pesada — serve como alavanca.");
            return;
        }
    }

    if (objData.id === "cozinha.nota_chao") {
        if (action === "Examinar") {
            const jaliU = gameState.objectStates[objData.id] === "read";
            if (jaliU) {
                _dialog(k, stateContext, "Nota", "Você já leu. As palavras ficaram.");
                return;
            }
            gameState.objectStates[objData.id] = "read";
            _chainDialog(k, stateContext, [
                { title: "Nota", content: "Amassada e com marca d'água. A letra é familiar — a mesma do diário do outro quarto?" },
                { title: "Nota", content: "\"Não use a porta principal. Câmera. Use a despensa — parede do fundo cede.\"" },
                { title: "Instrução", content: "A parede do fundo da despensa. Você precisa chegar lá." },
            ]);
            return;
        }
    }

    if (objData.id === "cozinha.porta_despensa") {
        if (action === "Examinar") {
            const estado = gameState.objectStates[objData.id];
            if (estado === "aberta") {
                _dialog(k, stateContext, "Despensa", "A porta está aberta. A saída está lá dentro.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Porta da Despensa", content: "Uma porta simples, mas amarrada com corda grossa por fora." },
                { title: "Corda", content: "Não há como abrir sem cortar a corda. Você precisa de algo afiado." },
            ]);
            return;
        }
        if (action === "Usar") {
            // Verificar se tem algo cortante
            const temFaca = gameState.inventory.includes("Faca de Cozinha");
            const temFragmento = gameState.inventory.includes("Fragmento de Telha");
            const jaAbriu = gameState.inventory.includes("Corda Cortada");

            if (jaAbriu) {
                // Deixa _transitionRoom tratar
            } else if (temFaca || temFragmento) {
                const ferramenta = temFaca ? "Faca de Cozinha" : "Fragmento de Telha";
                gameState.inventory.push("Corda Cortada");
                advanceTime(5);
                _chainDialog(k, stateContext, [
                    { title: `Usando ${ferramenta}`, content: "Você corta a corda. As fibras cedem uma a uma." },
                    { title: "Porta Livre", content: "A porta da despensa está desbloqueada." },
                ]);
                return;
            } else {
                _chainDialog(k, stateContext, [
                    { title: "Corda", content: "A corda está bem amarrada. Você tentou puxar, mas não cede." },
                    { title: "Precisa", content: "Precisa de algo afiado para cortar. O fragmento de telha no chão talvez funcione." },
                ]);
                return;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // COZINHA — CENÁRIO NORMAL (entrou pela porta)
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "cozinha.mesa") {
        if (action === "Examinar") {
            const movida = gameState.objectStates[objData.id] === "movida";
            if (movida) {
                _dialog(k, stateContext, "Mesa", "Você já moveu a mesa. O alçapão está exposto no chão.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Mesa", content: "Uma mesa de madeira pesada. As patas deixaram marcas circulares no chão — foi movida antes." },
                { title: "Chão", content: "As marcas no assoalho formam um círculo em torno de... algo. Uma junta no piso?" },
            ]);
            return;
        }
        if (action === "Usar") {
            const movida = gameState.objectStates[objData.id] === "movida";
            if (movida) {
                _dialog(k, stateContext, "Mesa", "A mesa já está de lado. O alçapão está visível.");
                return;
            }
            gameState.objectStates[objData.id] = "movida";
            gameState.objectStates["cozinha.alcapao"] = "visivel";
            advanceTime(5);
            _chainDialog(k, stateContext, [
                { title: "Esforço", content: "Você empurra a mesa com o ombro. Ela range e cede. Cada centímetro custa." },
                { title: "Alçapão", content: "No chão: um alçapão de madeira com uma argola de ferro. Escondido debaixo da mesa." },
                { title: "Alçapão", content: "O frio sobe pela fenda. Há um espaço embaixo desta casa." },
            ]);
            return;
        }
    }

    if (objData.id === "cozinha.alcapao") {
        if (action === "Examinar") {
            const visivel = gameState.objectStates[objData.id] === "visivel"
                || gameState.objectStates[objData.id] === "aberto";
            if (!visivel) {
                _dialog(k, stateContext, "Chão", "Chão de madeira. Nada de especial visível aqui.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Alçapão", content: "Uma tampa de madeira grossa com argola de ferro. Bem vedada, mas não trancada." },
                { title: "Frio", content: "O frio que sobe pela fenda. Lá embaixo há espaço suficiente para uma pessoa." },
            ]);
            return;
        }
    }

    if (objData.id === "cozinha.nota_geladeira") {
        if (action === "Examinar") {
            const jaliU = gameState.objectStates[objData.id] === "read";
            if (jaliU) {
                _dialog(k, stateContext, "Bilhete", "Você já leu.");
                return;
            }
            gameState.objectStates[objData.id] = "read";
            _chainDialog(k, stateContext, [
                { title: "Bilhete", content: "Um bilhete preso com ímã. Letra apressada." },
                { title: "Bilhete", content: "\"Se você está lendo isso, ainda há tempo. Não use as portas que eles trancaram.\"" },
                { title: "Bilhete", content: "\"Embaixo da mesa tem uma saída. Eles nunca encontraram.\"" },
            ]);
            return;
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // COZINHA — OBJETOS COMPARTILHADOS (geladeira, pia, fogão, armário)
    // ════════════════════════════════════════════════════════════════════════════

    if (objData.id === "cozinha.geladeira") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Geladeira", content: "Um modelo antigo, ronco constante. A borracha da porta está ressecada." },
                { title: "Geladeira", content: "Há algo colado na parte lateral — uma nota? Ou só gordura acumulada?" },
            ]);
            return;
        }
        if (action === "Abrir") {
            const jaAbriu = gameState.objectStates[objData.id] === "aberta";
            if (jaAbriu) {
                _dialog(k, stateContext, "Geladeira", "Já está aberta. Só comida velha dentro.");
                return;
            }
            gameState.objectStates[objData.id] = "aberta";
            applyVisualState(k, objData, gameObject);
            _chainDialog(k, stateContext, [
                { title: "Geladeira", content: "A porta cede com um ruído de vedação quebrando." },
                { title: "Conteúdo", content: "Comida deteriorada. Um vidro de maionese. E, no compartimento de vegetais, uma faca de cozinha enrolada em pano." },
                { title: "Faca", content: "Alguém a escondeu aqui. Intencionalmente." },
            ]);
            if (!gameState.inventory.includes("Faca de Cozinha")) gameState.inventory.push("Faca de Cozinha");
            return;
        }
    }

    if (objData.id === "cozinha.pia") {
        if (action === "Examinar") {
            _dialog(k, stateContext, "Pia", "Inox enferrujado. A torneira pinga em ritmo irregular. Gotas que soam muito altas no silêncio.");
            return;
        }
        if (action === "Usar") {
            _chainDialog(k, stateContext, [
                { title: "Torneira", content: "Você abre a torneira. A água sai marrom por alguns segundos. Depois, limpa." },
                { title: "Torneira", content: "Você bebe. Ainda que o gosto seja metálico, alivia a secura na garganta." },
            ]);
            advanceTime(3);
            return;
        }
    }

    if (objData.id === "cozinha.fogao") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Fogão", content: "As bocas estão apagadas. Uma delas tem a grelha virada ao contrário." },
                { title: "Fogão", content: "Cheiro leve de gás. Residual — ou há um vazamento pequeno em algum lugar." },
            ]);
            return;
        }
        if (action === "Usar") {
            _chainDialog(k, stateContext, [
                { title: "Fogão", content: "Você gira o botão. Um clique. Outro. Nada acende." },
                { title: "Fogão", content: "O gás sai — você o ouve, levemente. Melhor não insistir." },
            ]);
            return;
        }
    }

    if (objData.id === "cozinha.armario_trancado") {
        if (action === "Examinar") {
            const aberto = gameState.objectStates[objData.id] === "aberto";
            if (aberto) {
                _dialog(k, stateContext, "Armário", "Já está aberto. A faca foi retirada.");
                return;
            }
            _chainDialog(k, stateContext, [
                { title: "Armário", content: "Madeira escura, trancada. O trinco não é original — foi adicionado depois." },
                { title: "Trinco", content: "O parafuso está frouxo. Com alavanca suficiente, a dobradiça cederia." },
            ]);
            return;
        }
        if (action === "Abrir") {
            const aberto = gameState.objectStates[objData.id] === "aberto";
            if (aberto) {
                _dialog(k, stateContext, "Armário", "Já aberto.");
                return;
            }
            const temAlavanca = gameState.inventory.includes("Alavanca de Madeira");
            const temFragmento = gameState.inventory.includes("Fragmento de Telha");
            if (temAlavanca || temFragmento) {
                gameState.objectStates[objData.id] = "aberto";
                applyVisualState(k, objData, gameObject);
                if (!gameState.inventory.includes("Faca de Cozinha")) gameState.inventory.push("Faca de Cozinha");
                _chainDialog(k, stateContext, [
                    { title: "Alavanca", content: "Você encaixa a alavanca na dobradiça. Um esforço longo. A madeira geme." },
                    { title: "Armário", content: "O trinco salta. O armário abre." },
                    { title: "Faca", content: "Dentro, entre panos velhos: uma faca de cozinha. Escondida aqui com propósito." },
                ]);
            } else {
                _chainDialog(k, stateContext, [
                    { title: "Armário Trancado", content: "Você puxa a maçaneta. Não cede." },
                    { title: "Dobradiça", content: "A dobradiça está fraca. Uma alavanca quebraria — mas você não tem nada para isso agora." },
                ]);
            }
            return;
        }
    }

    if (objData.id === "cozinha.janela_cozinha") {
        if (action === "Examinar") {
            _chainDialog(k, stateContext, [
                { title: "Janela", content: "Uma janela pequena voltada para o jardim. Grade de ferro por fora." },
                { title: "Jardim", content: "O jardim está escuro. Mas uma das grades parece dobrada — como se alguém já tivesse tentado forçar de fora." },
            ]);
            return;
        }
    }
    if ((objData.type === "door" || objData.type === "stairs") && action === "Usar") {
        _transitionRoom(k, stateContext, objData);
        return;
    }

    if (objData.id === "corredor_segundo_andar.ventilacao") {
        if (action === "Examinar") {
            _dialog(k, stateContext, "Barulho",
                "Um barulho baixo, constante. Ar quente sai pela grelha. Ou é alguém respirando?");
            return;
        }
    }

    if (objData.id === "corredor_segundo_andar.mancha_parede") {
        const tries = (gameState.actionCounters["mancha_vista"] || 0) + 1;
        gameState.actionCounters["mancha_vista"] = tries;

        if (tries === 1) {
            _dialog(k, stateContext, "Mancha", "Uma mancha marrom na parede. Pintura? Ou algo mais?");
            return;
        }
        if (tries === 2) {
            _dialog(k, stateContext, "Suspição", "Você a limpa com os dedos. Seca. Muito seca. Há quanto tempo está aqui?");
            return;
        }
        if (tries >= 3) {
            _dialog(k, stateContext, "Realização", "Tem um cheiro estranho, parece enxofre.");
            return;
        }
    }

    // Tratamento de interruptores (switches)
    if (objData.type === "switch" && (action === "Ligar Luz" || action === "Desligar Luz")) {
        const newState = action === "Ligar Luz" ? "on" : "off";
        gameState.objectStates[objData.id] = newState;
        applyVisualState(k, objData, gameObject);

        // Extrair nome da room a partir do ID (ex: "quarto_um.interruptor" → "quarto_um")
        const roomName = objData.id.split(".")[0];
        const isLightOn = newState === "on";
        gameState.setRoomLight(roomName, isLightOn);

        const msg = isLightOn
            ? "Você liga o interruptor. A luz pisca uma vez e permanece acesa, cortando a escuridão."
            : "Você desliga o interruptor. A escuridão retorna ao quarto.";
        _dialog(k, stateContext, objData.label, msg);


        if (isLightOn) {
            flickerLight(k, true, () => {
                gameState.setRoomLight(roomName, isLightOn);
                _dialog(k, stateContext, objData.label, msg);
            });
        } else {
            _dialog(k, stateContext, objData.label, msg);
        }
        return;
    }

    if (action === "Examinar") {
        _dialog(k, stateContext, objData.label, `Voce examina ${objData.label}. Nada de especial chama atencao agora.`);
        return;
    }

    if (action === "Pegar") {
        if (!gameState.inventory.includes(objData.label)) gameState.inventory.push(objData.label);
        if (!gameState.pickedUpItems.includes(objData.id)) gameState.pickedUpItems.push(objData.id);
        k.destroy(gameObject);
        _dialog(k, stateContext, "INVENTARIO", `Voce guarda ${objData.label} na mochila.`);
        return;
    }

    if (action === "Abrir" || action === "Fechar") {
        gameState.objectStates[objData.id] = action === "Abrir" ? "aberta" : "fechada";
        applyVisualState(k, objData, gameObject);
        return;
    }

    if (action === "Usar") {
        _dialog(k, stateContext, objData.label, `Voce usa ${objData.label}. Nada de especial acontece.`);
        return;
    }

    k.debug.log(`Acao nao programada: ${action}`);
}

function _transitionRoom(k, stateContext, objData) {
    const targetRoom = objData.targetRoom;
    if (!targetRoom) {
        _dialog(k, stateContext, objData.label, "Nada acontece.");
        return;
    }

    const requiredItem = objData.requires?.item;
    if (requiredItem && !gameState.inventory.includes(requiredItem)) {
        _dialog(k, stateContext, objData.label, `Esta trancado. Voce precisa de ${requiredItem}.`);
        return;
    }

    stateContext.inDialog = true;
    showDialog(k, objData.label,
        objData.transitionText || `Voce atravessa ${objData.label} e segue para o proximo comodo.`,
        () => {
            stateContext.inDialog = false;
            gameState.pendingDialog = {
                title: objData.arrivalTitle || objData.label,
                text: objData.arrivalText || `Voce chega em ${targetRoom}.`,
            };
            k.go(targetRoom);
        }
    );
}

function _dialog(k, stateContext, title, content) {
    stateContext.inDialog = true;
    showDialog(k, title, content, () => { stateContext.inDialog = false; });
}

function _chainDialog(k, stateContext, pages) {
    stateContext.inDialog = true;
    showDialogChain(k, pages, () => { stateContext.inDialog = false; });
}

export function applyVisualState(k, objData, gameObject) {
    const estado = gameState.objectStates[objData.id];
    if (estado === "aberta" || estado === "on" || estado === "destrancada") {
        gameObject.color = k.Color.fromHex("#ffffff");
    } else {
        gameObject.color = k.Color.fromHex(objData.color || "#ffffff");
    }
}
