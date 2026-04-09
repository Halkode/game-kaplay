import { gameState } from "../state.js";
import { showDialog } from "../ui/dialog.js";
import { advanceTime } from "./timeAndLight.js";
import { openBookshelfZoom } from "./bookshelfZoom.js";


/**
 * Filtra opções dinâmicas. Exemplo: Se a janela tá aberta, remove "Abrir" e mostra "Fechar".
 */
export function getAvailableActions(objData) {
    const currentState = gameState.objectStates[objData.id];
    return objData.actions.map(action => {
        if (action === "Alternar_Janela") {
            return currentState === "aberta" ? "Fechar" : "Abrir";
        }
        if (action === "Alternar_Luz") {
            return currentState === "on" ? "Desligar Luz" : "Ligar Luz";
        }
        return action;
    });
}

/**
 * Processador global central de interações de qualquer objeto
 */
export function handleInteraction(k, stateContext, action, objData, gameObject) {
    const currentState = gameState.objectStates[objData.id];

    if (action === "Examinar") {
        stateContext.inDialog = true;
        const stateDesc = currentState ? ` (Estado: ${currentState})` : "";
        const texto = `Você observa de perto: ${objData.label}${stateDesc}. Existem alguns detalhes interessantes.`;
        showDialog(k, objData.label, texto, () => stateContext.inDialog = false);
        return;
    }

    if (action === "Pegar") {
        gameState.inventory.push(objData.label);
        gameState.pickedUpItems.push(objData.id);
        k.destroy(gameObject);

        stateContext.inDialog = true;
        showDialog(k, "INVENTÁRIO", `vou colocar isso ${objData.label} na mochila.`, () => stateContext.inDialog = false);
        return;
    }

    if (action === "Abrir" || action === "Fechar") {
        const isOpening = action === "Abrir";
        gameState.objectStates[objData.id] = isOpening ? "aberta" : "fechada";

        applyVisualState(k, objData, gameObject);

        // Opcional: Pode colocar um k.play("som_porta") aqui depois
        k.debug.log(`A ${objData.label} foi ${isOpening ? "aberta" : "fechada"}!`);
        return;
    }

    if (action === "Ligar Luz" || action === "Desligar Luz") {
        const isTurningOn = action === "Ligar Luz";
        gameState.objectStates[objData.id] = isTurningOn ? "on" : "off";
        applyVisualState(k, objData, gameObject);
        k.debug.log(`O ${objData.label} agora est\xE1 ${isTurningOn ? "LIGADO" : "DESLIGADO"}.`);
        return;
    }

    // --- ESPECÍFICO DO OBJETO ---
    if (objData.label === "Porta" && action === "Usar") {
        const attemptKey = `${objData.id}_usar_locked`;
        const tentativas = (gameState.actionCounters[attemptKey] || 0) + 1;
        gameState.actionCounters[attemptKey] = tentativas;

        stateContext.inDialog = true;

        if (tentativas >= 3) {
            advanceTime(15); // Avança 15 minutos ao ficar tentando abrir a maçaneta

            showDialog(k, "Trancada", "Você perdeu um certo tempo forçando a maçaneta. A noite parece cair mais rápido lá fora.", () => {
                stateContext.inDialog = false;
            });
            // Opcional: zerar as tentativas caso queira que repita
            gameState.actionCounters[attemptKey] = 0;
        } else {
            showDialog(k, "Trancada", "A porta está firmemente trancada.", () => {
                stateContext.inDialog = false;
            });
        }
        return;
    }

    if (objData.id === "estante_quarto_escuro" && action === "Examinar") {
        openBookshelfZoom(k, stateContext);
        return;
    }

    k.debug.log(`Ação não programada: ${action}`);
}

/**
 * Chamado quando a cena carrega E quando o estado muda pra aplicar o gráfico certo
 */
export function applyVisualState(k, objData, gameObject) {
    const estado = gameState.objectStates[objData.id];


    if (estado === "aberta" || estado === "on") {
        gameObject.color = k.Color.fromHex("#ffffff");
    } else {
        gameObject.color = k.Color.fromHex(objData.color || "#ffffff");
    }
}
