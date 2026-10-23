// Motor de interações.
//
// A lógica de cada objeto mora no arquivo da sala (data/rooms/*.js), no campo
// `on` da entidade. Este arquivo só sabe:
//   1. montar o `ctx` (atalhos para estado, inventário, diálogos, tempo...)
//   2. chamar o handler certo e esperar ele terminar
//   3. aplicar o comportamento padrão quando a entidade não define o handler
//
// Formatos aceitos em `on.<Ação>`:
//   "texto"                       → diálogo simples com o nome do objeto
//   [["Título", "texto"], ...]    → sequência de diálogos
//   (ctx) => ...                  → função (pode ser async); se retornar
//                                   string ou lista, ela é exibida como acima

import { gameState } from "../core/state.js";
import { say, sayChain, ask } from "../ui/dialog.js";
import { advanceTime } from "./timeAndLight.js";
import { injurePart } from "./injuries.js";
import { flickerLight } from "./animations.js";
import { fadeOutAndGo } from "../ui/transitions.js";
import { itemName } from "../data/items.js";

const OPEN_STATES = ["aberta", "aberto", "on", "destrancada"];

/** Chave global do estado de uma entidade: "sala.entidade". */
export function stateKey(roomId, entityId) {
    return entityId.includes(".") ? entityId : `${roomId}.${entityId}`;
}

export function isOpenState(state) {
    return OPEN_STATES.includes(state);
}

/** Rótulos do menu radial (algumas ações mudam de nome conforme o estado). */
export function getAvailableActions(room, entity) {
    const st = gameState.objectStates[stateKey(room.id, entity.id)];
    return (entity.actions || []).map((action) => {
        if (action === "Alternar_Luz") return st === "on" ? "Desligar Luz" : "Ligar Luz";
        return action;
    });
}

/**
 * Executa uma ação sobre uma entidade.
 * @param {object} scene — { k, room, ui, refresh(), removeEntity(id) } (montado em roomScene.js)
 */
export async function runInteraction(scene, entity, action) {
    const ctx = createContext(scene, entity);
    scene.ui.inDialog = true;
    try {
        const handler = entity.on?.[action];
        if (handler === undefined) {
            await defaultInteraction(ctx, action);
        } else {
            await ctx.show(typeof handler === "function" ? await handler(ctx) : handler);
        }
    } catch (err) {
        console.error(`[interação] ${entity.id} / ${action}`, err);
    } finally {
        scene.ui.inDialog = false;
        scene.refresh();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Comportamento padrão
// ─────────────────────────────────────────────────────────────────────────────

async function defaultInteraction(ctx, action) {
    const { entity } = ctx;

    if (action === "Ligar Luz" || action === "Desligar Luz") {
        return ctx.toggleLight(action === "Ligar Luz");
    }
    if (action === "Usar" && entity.exit) {
        return ctx.exit();
    }
    if (action === "Pegar" && entity.item) {
        return ctx.pickUp(entity.item, `Você guarda ${itemName(entity.item)}.`);
    }
    if (action === "Abrir" || action === "Fechar") {
        ctx.setState(action === "Abrir" ? "aberta" : "fechada");
        return;
    }
    if (action === "Examinar") {
        return ctx.say(`Você examina ${entity.label}. Nada de especial chama atenção agora.`);
    }
    if (action === "Usar") {
        return ctx.say(`Você usa ${entity.label}. Nada de especial acontece.`);
    }
    console.warn(`[interação] Ação não programada: ${entity.id} / ${action}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ctx: tudo que um handler de sala precisa, sem importar nada
// ─────────────────────────────────────────────────────────────────────────────

function createContext(scene, entity) {
    const { k, room, ui } = scene;
    const key = stateKey(room.id, entity.id);

    const ctx = {
        k,
        room,
        entity,
        label: entity.label,
        key,

        // ── Estado de objetos ──
        get state() {
            return gameState.objectStates[key];
        },
        getState(id = entity.id) {
            return gameState.objectStates[stateKey(room.id, id)];
        },
        setState(value, id = entity.id) {
            gameState.objectStates[stateKey(room.id, id)] = value;
            scene.refresh();
        },

        // ── Inventário ──
        has: (id) => gameState.hasItem(id),
        hasAny: (ids) => ids.find((id) => gameState.hasItem(id)) ?? null,
        give: (id) => gameState.addItem(id),
        take: (id) => gameState.removeItem(id),
        itemName,

        // ── Narrativa ──
        flag: (name) => !!gameState.flags[name],
        setFlag: (name, value = true) => { gameState.flags[name] = value; },
        /** Incrementa e retorna um contador (padrão: quantas vezes esta entidade foi usada). */
        count(name = key) {
            gameState.actionCounters[name] = (gameState.actionCounters[name] || 0) + 1;
            return gameState.actionCounters[name];
        },
        resetCount(name = key) {
            gameState.actionCounters[name] = 0;
        },

        // ── Diálogos ──
        say(title, text) {
            return text === undefined ? say(k, entity.label, title) : say(k, title, text);
        },
        chain: (pages) => sayChain(k, pages),
        /** choices: { valor: "Rótulo", ... } → resolve com o valor escolhido. */
        choose(title, text, choices) {
            const list = Object.entries(choices).map(([value, label]) => ({ value, label }));
            return ask(k, title, text, list);
        },
        /** Exibe o retorno de um handler (string, lista de páginas ou nada). */
        async show(result) {
            if (typeof result === "string") return ctx.say(result);
            if (Array.isArray(result)) return ctx.chain(result);
        },

        // ── Mundo ──
        advance: (minutes) => advanceTime(minutes),
        injure: (part, damage, type) => injurePart(part, damage, type, { force: true, showDialog: false }),

        /** Coloca o item no inventário e tira o objeto do cenário. */
        async pickUp(itemId, text) {
            if (itemId) gameState.addItem(itemId);
            if (!gameState.pickedUpItems.includes(key)) gameState.pickedUpItems.push(key);
            scene.removeEntity(entity.id);
            if (text) await say(k, "INVENTÁRIO", text);
        },

        async toggleLight(on) {
            ctx.setState(on ? "on" : "off");
            gameState.setRoomLight(room.id, on);
            if (on) {
                await new Promise((resolve) => flickerLight(k, true, resolve));
                return ctx.say("Você liga o interruptor. A luz pisca uma vez e permanece acesa, cortando a escuridão.");
            }
            return ctx.say("Você desliga o interruptor. A escuridão retorna.");
        },

        /** Bloqueia a cena (fade/cutscene em andamento até trocar de sala). */
        leave() {
            ui.leaving = true;
        },

        /** Vai para outra cena sem diálogo (minigames, cutscenes). */
        goTo(sceneName, duration = 0.3) {
            ctx.leave();
            gameState.savedCamX = k.getCamPos().x;
            fadeOutAndGo(k, sceneName, duration);
        },

        /** Usa a saída definida em `entity.exit` (porta, escada, passagem). */
        async exit() {
            const exit = entity.exit;
            if (!exit?.to) return ctx.say("Nada acontece.");

            if (exit.requires && !gameState.hasItem(exit.requires)) {
                return ctx.say(exit.lockedText || `Está trancado. Você precisa de ${itemName(exit.requires)}.`);
            }

            await ctx.say(exit.text || `Você atravessa ${entity.label} e segue para o próximo cômodo.`);
            if (exit.ending) gameState.ending = exit.ending;
            if (exit.arrivalText) {
                gameState.pendingDialog = { title: exit.arrivalTitle || entity.label, text: exit.arrivalText };
            }
            ctx.leave();
            fadeOutAndGo(k, exit.to, 0.35);
        },
    };

    return ctx;
}
