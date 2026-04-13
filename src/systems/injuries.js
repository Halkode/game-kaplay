// src/systems/injuries.js

/**
 * SISTEMA DE FERIMENTOS LOCALIZADOS
 * 
 * Baseado em Barotrauma/Project Zomboid:
 * - Ferimentos afetam partes específicas do corpo
 * - Cada parte tem saúde, sangramento e status
 * - Pode afetar interações e diálogos
 * - Progressão realista: dor → incapacidade → morte
 */

import { gameState } from "../state.js";
import { advanceTime } from "./timeAndLight.js";

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const BODY_PARTS = {
    head: {
        name: "Cabeça",
        maxHealth: 100,
        importance: "critical",    // crítico = morte se 0
        bleedRate: 0.5,            // sangra 0.5% do dano por segundo
        painMultiplier: 1.5,       // dor sente-se 50% mais
    },
    torso: {
        name: "Tórax",
        maxHealth: 150,
        importance: "critical",
        bleedRate: 0.4,
        painMultiplier: 1.2,
    },
    leftArm: {
        name: "Braço Esquerdo",
        maxHealth: 80,
        importance: "major",
        bleedRate: 0.3,
        painMultiplier: 1.0,
    },
    rightArm: {
        name: "Braço Direito",
        maxHealth: 80,
        importance: "major",
        bleedRate: 0.3,
        painMultiplier: 1.0,
    },
    leftLeg: {
        name: "Perna Esquerda",
        maxHealth: 100,
        importance: "major",
        bleedRate: 0.35,
        painMultiplier: 1.1,
    },
    rightLeg: {
        name: "Perna Direita",
        maxHealth: 100,
        importance: "major",
        bleedRate: 0.35,
        painMultiplier: 1.1,
    },
};

const INJURY_TYPES = {
    bruise: {
        name: "Hematoma",
        color: "#4a0080",
        severity: 0.3,
        healsOver: 300,         // minutos
    },
    laceration: {
        name: "Laceração",
        color: "#8b0000",
        severity: 0.6,
        healsOver: 600,
        bleedMultiplier: 1.5,
    },
    fracture: {
        name: "Fratura",
        color: "#ff6600",
        severity: 0.8,
        healsOver: 1200,        // 20 horas
        disablesMovement: true,
    },
    sprain: {
        name: "Entorse",
        color: "#ffa500",
        severity: 0.5,
        healsOver: 450,
        reducesMovement: 0.5,   // metade da velocidade
    },
};

// ════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DO SISTEMA
// ════════════════════════════════════════════════════════════════════════════

export function initializeInjurySystem() {
    gameState.injuries = {};
    gameState.bloodLoss = 0;
    gameState.totalPain = 0;
    gameState.consciousness = 100;  // 0-100. < 20 = visão desfocada
    gameState.injuryHistory = [];   // log de ferimentos para narrativa

    // Inicializar cada parte do corpo
    Object.keys(BODY_PARTS).forEach((part) => {
        gameState.injuries[part] = {
            health: BODY_PARTS[part].maxHealth,
            wounds: [],             // array de ferimentos simultâneos
            bleeding: 0,
            pain: 0,
            status: "healthy",      // healthy | wounded | critical | disabled
        };
    });
}

// ════════════════════════════════════════════════════════════════════════════
// APLICAR DANO
// ════════════════════════════════════════════════════════════════════════════

/**
 * Inflige dano a uma parte do corpo específica.
 * 
 * @param {string} part         - ID da parte (ex: "leftArm")
 * @param {number} damage       - Dano base (0-100)
 * @param {string} injuryType   - Tipo de ferimento
 * @param {object} options      - Opções: { force: bool, showDialog: bool }
 */
export function injurePart(part, damage = 30, injuryType = "bruise", options = {}) {
    const { force = false, showDialog = true } = options;

    // Validação
    if (!BODY_PARTS[part] || !INJURY_TYPES[injuryType]) {
        console.warn(`injurePart: parte ou tipo inválido`);
        return;
    }

    const bodyPart = BODY_PARTS[part];
    const injuryData = INJURY_TYPES[injuryType];
    const injury = gameState.injuries[part];

    // Aplicar dano
    const actualDamage = force ? damage : damage * (0.8 + Math.random() * 0.4);
    injury.health = Math.max(0, injury.health - actualDamage);

    // Criar ferimento
    const wound = {
        type: injuryType,
        damage: actualDamage,
        createdAt: gameState.time,
        healsAt: gameState.time + injuryData.healsOver,
        bleeding: actualDamage * bodyPart.bleedRate * injuryData.bleedMultiplier || 0,
    };
    injury.wounds.push(wound);

    // Atualizar status
    updatePartStatus(part);

    // Sangramento
    gameState.bloodLoss += wound.bleeding;

    // Dor
    injury.pain = Math.min(100, injury.pain + actualDamage * bodyPart.painMultiplier);
    gameState.totalPain = calculateTotalPain();

    // Registrar
    gameState.injuryHistory.push({
        part,
        type: injuryType,
        time: gameState.time,
        damage: actualDamage,
    });

    // Afetar consciência por sangramento
    updateConsciousness();

    if (showDialog) {
        console.log(`${bodyPart.name}: ${injuryData.name} (${actualDamage.toFixed(1)} dano)`);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// ATUALIZAR STATUS DE PARTE
// ════════════════════════════════════════════════════════════════════════════

function updatePartStatus(part) {
    const injury = gameState.injuries[part];
    const maxHealth = BODY_PARTS[part].maxHealth;
    const healthPercent = (injury.health / maxHealth) * 100;

    if (healthPercent > 70) {
        injury.status = "healthy";
    } else if (healthPercent > 40) {
        injury.status = "wounded";
    } else if (healthPercent > 0) {
        injury.status = "critical";
    } else {
        injury.status = "disabled";
    }
}

// ════════════��═══════════════════════════════════════════════════════════════
// CALCULAR EFEITOS GLOBAIS
// ════════════════════════════════════════════════════════════════════════════

function calculateTotalPain() {
    return Math.min(100,
        Object.values(gameState.injuries).reduce((sum, inj) => sum + inj.pain, 0) / 6
    );
}

function updateConsciousness() {
    // Perder consciência com sangramento severo
    const bloodLossPercent = Math.min(gameState.bloodLoss / 500, 1);  // 500 = morte
    gameState.consciousness = Math.max(0, 100 - bloodLossPercent * 100);
}

// ════════════════════════════════════════════════════════════════════════════
// REGENERAÇÃO E PROGRESSÃO DE FERIMENTOS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Chamado a cada frame ou ciclo temporal.
 * Processa sangramento, cura e dor.
 */
export function updateInjuries(deltaMinutes) {
    Object.keys(gameState.injuries).forEach((part) => {
        const injury = gameState.injuries[part];

        // ── Processar sangramento ──
        Object.keys(injury.wounds).forEach((i) => {
            const wound = injury.wounds[i];
            const bleedThisFrame = (wound.bleeding / 60) * deltaMinutes;
            gameState.bloodLoss += bleedThisFrame;

            // Reduzir sangramento com tempo
            wound.bleeding *= Math.pow(0.95, deltaMinutes);

            // Fechar ferimento se tempo de cicatrização passou
            if (gameState.time >= wound.healsAt) {
                injury.wounds.splice(i, 1);
            }
        });

        // ── Reduzir dor naturalmente ──
        injury.pain *= Math.pow(0.98, deltaMinutes);

        // ── Regenerar saúde lentamente se sem ferimentos ──
        if (injury.wounds.length === 0) {
            const maxHealth = BODY_PARTS[part].maxHealth;
            if (injury.health < maxHealth) {
                injury.health = Math.min(maxHealth, injury.health + 0.1 * deltaMinutes);
            }
        }

        updatePartStatus(part);
    });

    gameState.totalPain = calculateTotalPain();
    updateConsciousness();
}

// ════════════════════════════════════════════════════════════════════════════
// QUERIES E DIAGNÓSTICO
// ════════════════════════════════════════════════════════════════════════════

export function getSeverityLevel() {
    if (gameState.consciousness <= 0) return "dead";
    if (gameState.consciousness < 20) return "critical";
    if (gameState.totalPain > 70) return "severe";
    if (gameState.bloodLoss > 200) return "hemorrhage";
    if (gameState.totalPain > 40) return "wounded";
    return "healthy";
}

export function getDisabledParts() {
    return Object.entries(gameState.injuries)
        .filter(([_, inj]) => inj.status === "disabled")
        .map(([part, _]) => BODY_PARTS[part].name);
}

export function getMovementPenalty() {
    // Se ambas as pernas estão críticas/desabilitadas
    const legs = ["leftLeg", "rightLeg"];
    const disabledLegs = legs.filter(
        (leg) => gameState.injuries[leg].status === "disabled"
    ).length;

    if (disabledLegs === 2) return 0.1;      // quase imóvel
    if (disabledLegs === 1) return 0.5;      // metade da velocidade

    // Pernas feridas reduzem movimento
    const woundedLegs = legs.filter(
        (leg) => gameState.injuries[leg].status === "critical"
    ).length;

    return Math.max(0.5, 1 - woundedLegs * 0.3);
}

export function getInteractionPenalty() {
    // Braços desabilitados
    const arms = ["leftArm", "rightArm"];
    const disabledArms = arms.filter(
        (arm) => gameState.injuries[arm].status === "disabled"
    ).length;

    if (disabledArms === 2) return false;    // não consegue interagir
    if (disabledArms === 1) return true;     // consegue mas devagar

    return true;
}

export function getConsciousnessLevel() {
    if (gameState.consciousness >= 80) return "clear";
    if (gameState.consciousness >= 50) return "hazy";
    if (gameState.consciousness >= 20) return "blurred";
    return "critical";
}

/**
 * Gera texto descritivo dos ferimentos para UI/diálogos.
 */
export function getInjurySummary() {
    const summary = [];

    Object.entries(gameState.injuries).forEach(([part, injury]) => {
        if (injury.status === "healthy") return;

        const partName = BODY_PARTS[part].name;
        const mainWound = injury.wounds[0];
        const woundType = mainWound ? INJURY_TYPES[mainWound.type].name : "Ferimento";

        summary.push(`${partName}: ${woundType}`);
    });

    return summary;
}

// ════════════════════════════════════════════════════════════════════════════
// EFEITOS NARRATIVOS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Retorna modificações de diálogo baseado em estado de ferimentos.
 * Usado em interactions.js para alterar textos.
 */
export function getInjuryDialogModifier(baseText) {
    const severity = getSeverityLevel();
    const consciousness = getConsciousnessLevel();

    let modifier = "";

    // Modificar baseado em consciência
    if (consciousness === "blurred") {
        modifier += " *Sua visão pisca*";
    } else if (consciousness === "critical") {
        modifier += " *Tudo fica escuro nas beiradas...*";
    }

    // Modificar baseado em dor
    if (gameState.totalPain > 70) {
        modifier += " *Você grita de dor*";
    } else if (gameState.totalPain > 40) {
        modifier += " *Você respira pesadamente*";
    }

    // Modificar baseado em sangramento
    if (gameState.bloodLoss > 200) {
        modifier += " *Você sente tontura...*";
    }

    return baseText + modifier;
}

/**
 * Bloqueia ações baseado em ferimentos.
 */
export function canPerformAction(actionType) {
    // "examine", "walk", "grab", "run"

    if (gameState.consciousness <= 0) return false;  // morto

    if (actionType === "grab" && !getInteractionPenalty()) {
        return false;  // ambos os braços desabilitados
    }

    if (actionType === "run" && getMovementPenalty() < 0.3) {
        return false;  // muito ferido para correr
    }

    if ((actionType === "examine" || actionType === "read") &&
        getConsciousnessLevel() === "critical") {
        return false;  // muito tonto para ler
    }

    return true;
}