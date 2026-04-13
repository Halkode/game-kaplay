// Central de interacoes e dialogos do jogo.
// As transicoes agora acontecem entre rooms em vez de finalizar direto.

import { gameState } from "../state.js";
import { showDialog, showDialogChain, showChoiceDialog } from "../ui/dialog.js";
import { advanceTime } from "./timeAndLight.js";
import { playWindowJumpSequence } from "./cutscenes.js";

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

    if ((objData.type === "door" || objData.type === "stairs") && action === "Usar") {
        _transitionRoom(k, stateContext, objData);
        return;
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
