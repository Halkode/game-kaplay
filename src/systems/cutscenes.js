/**
 * Sistema de cutscenes cinemáticas.
 * Gerencia sequências de eventos, diálogos, animações e transições.
 */

import { gameState } from "../state.js";
import { showDialog, showDialogChain } from "../ui/dialog.js";
import { fadeOut, fadeIn } from "../ui/transitions.js";
import { flashScreen, shakeCamera } from "./animations.js";
import { injurePart, updateInjuries, getInjurySummary } from "./injuries.js";

/**
 * Sequência cinemática: Pulo pela janela
 * 
 * O jogador se aproxima, abre a janela, pula, fade escuro, diálogo de impacto.
 * Termina com transição para a cozinha.
 * 
 * @param {object} k — instância Kaplay
 * @param {object} stateContext — contexto da cena
 */
export function playWindowJumpSequence(k, stateContext) {
    stateContext.inDialog = true;

    const windowOverlay = _createWindowOverlay(k);

    showDialog(
        k,
        "Aproximação",
        "Você caminha lentamente até a janela. Cada passo ecoa no quarto vazio. A noite lá fora parece esperar.",
        () => {
            stateContext.inDialog = false;

            // Animar câmera se movendo para a direita (onde está a janela)
            const startTime = k.time();
            const duration = 1.2; // segundos
            let camX = k.camPos().x;
            let animFinished = false;

            const animUpdate = k.onUpdate(() => {
                const elapsed = k.time() - startTime;
                if (elapsed >= duration) {
                    animUpdate.cancel();
                    animFinished = true;
                    // Animar a abertura da janela no overlay
                    _animateWindowOpening(k, windowOverlay, stateContext);
                    return;
                }
                camX += 60 * k.dt();
                k.camPos(camX, 80);
            });
        }
    );
}

/**
 * Cria um overlay com o sprite detalhado da janela.
 * Mostra a janela fechada, depois abre.
 */
function _createWindowOverlay(k) {
    const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(0, 0, 0),
        k.opacity(0),
        k.z(5000),
    ]);

    // Sprite da janela fechada (detalhada)
    const windowSprite = overlay.add([
        k.sprite("janela_cena_fechada"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.scale(1.5), // Escala para preencher mais da tela
    ]);

    // Armazenar referência para animação
    overlay.windowSprite = windowSprite;

    // Fade in suave do overlay
    k.tween(0, 0.8, 0.4, (v) => {
        if (overlay.exists()) overlay.opacity = v;
    }, k.easings.easeInQuad);

    return overlay;
}

/**
 * Anima a abertura da janela e continua a sequência.
 */
function _animateWindowOpening(k, windowOverlay, stateContext) {
    stateContext.inDialog = true;

    showDialogChain(
        k,
        [
            { title: "Resolve", content: "Não há mais tempo para hesitar. A janela é a saída." },
            { title: "Ação", content: "Você empurra o caixilho. Ele cede com um rangido." },
            { title: "Vento", content: "Uma brisa fria invade o quarto. Está feito. Agora..." },
        ],
        () => {
            stateContext.inDialog = false;

            // Trocar sprite da janela fechada para aberta
            if (windowOverlay.exists() && windowOverlay.windowSprite) {
                windowOverlay.windowSprite.sprite = "janela_cena_aberta";
            }

            // ─────────────────────────────────────────────────────────────────────
            // PASSO 3: Breve pausa (o personagem fica na beira com vista clara)
            // ─────────────────────────────────────────────────────────────────────
            k.wait(1.2, () => {
                // Destruir completamente o overlay ANTES de fazer fadeOut
                if (windowOverlay.exists()) {
                    k.destroy(windowOverlay);
                }

                // Pequena pausa antes do próximo fade
                k.wait(0.2, () => {
                    _playWindowJumpFadeOut(k, stateContext);
                });
            });
        }
    );
}

/**
 * Continuação: Fade escuro + diálogos de queda.
 */
function _playWindowJumpFadeOut(k, stateContext) {

    const fadeOverlay = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(0, 0, 0),
        k.opacity(0),
        k.z(9999),
    ]);

    k.tween(0, 1, 0.6, (v) => {
        if (fadeOverlay.exists()) fadeOverlay.opacity = v;
    }, k.easings.easeInQuad).then(() => {

        stateContext.inDialog = true;
        gameState.recordPathChoice("window");

        const impactSequence = [
            {
                title: "Queda",
                content: "Você salta. O ar gelado corta seu rosto. Por um momento, sente liberdade.",
                onShow: () => {
                    // Sem dano durante queda
                }
            },
            {
                title: "Impacto",
                content: "Seu pé bate em algo sólido — o telhado inferior.",
                onShow: () => {
                    injurePart("rightLeg", 45, "fracture", { force: true, showDialog: false });
                    injurePart("leftLeg", 35, "sprain", { force: true, showDialog: false });
                    shakeCamera(k, 5, 0.4);
                    flashScreen(k, 255, 100, 100, 0.3, 0.3);
                }
            },
            {
                title: "Desastre",
                content: "Mas o impacto é forte demais. Telhas antigas cedem sob seu peso.",
                onShow: () => {
                    injurePart("torso", 40, "laceration", { force: true, showDialog: false });
                    injurePart("leftArm", 25, "bruise", { force: true, showDialog: false });
                    shakeCamera(k, 6, 0.5);
                    flashScreen(k, 255, 50, 50, 0.4, 0.35);
                }
            },
            {
                title: "Dor",
                content: "Você escorrega. Seus dedos arranhão a madeira podre enquanto cai.",
                onShow: () => {
                    injurePart("head", 30, "laceration", { force: true, showDialog: false });
                    injurePart("rightArm", 20, "laceration", { force: true, showDialog: false });
                    shakeCamera(k, 4, 0.3);
                }
            },
        ];
        showDialogChain(k, impactSequence, () => {
            stateContext.inDialog = false;
            if (fadeOverlay.exists()) k.destroy(fadeOverlay);
            _playWindowJumpFadeIn(k, stateContext);
        });
    });
}

/**
 * Continuação: Fade in na cozinha.
 */
function _playWindowJumpFadeIn(k, stateContext) {
    fadeIn(k, 0.5);

    k.wait(0.5, () => {
        stateContext.inDialog = true;

        const injuries = getInjurySummary();
        const injuryText = injuries.length > 0
            ? `Seu corpo dói em vários lugares:\n${injuries.join("\n")}`
            : "Você conseguiu de alguma forma sair ileso.";

        showDialog(
            k,
            "Despertar",
            `Você acorda em um piso frio. A cozinha do andar inferior...\n\n${injuryText}`,
            () => {
                stateContext.inDialog = false;
                gameState.pendingDialog = null;
                k.go("cozinha");
            }
        );
    });
}
