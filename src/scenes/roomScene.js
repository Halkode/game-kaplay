// Cena genérica de sala. Cada sala em data/rooms/ vira uma cena com o mesmo id.
//
// Responsável por: desenhar paredes e entidades (sprite ou placeholder),
// detectar clique/hover, abrir o menu radial, mover a câmera em loop (wrap)
// e manter o visual sincronizado com gameState.objectStates.

import { createRadialMenu } from "../ui/radialMenu.js";
import { showDialog } from "../ui/dialog.js";
import { showInventoryPanel } from "../ui/inventory.js";
import { setupHUD } from "../ui/hud.js";
import { fadeIn } from "../ui/transitions.js";
import { setupLighting } from "../systems/timeAndLight.js";
import { getAvailableActions, runInteraction, stateKey, isOpenState } from "../systems/interactions.js";
import { gameState } from "../core/state.js";
import { resolveSprite, reportMissingSprites } from "../assets/loader.js";
import { navigationConfig, applyNavigationConfig } from "../config/navigation.js";
import { VIEW_WIDTH, VIEW_HEIGHT } from "../config/game.js";

const DEFAULT_ROOM_WIDTH = VIEW_WIDTH * 4; // 4 paredes de 240px
const FLOOR_HEIGHT = 40;

/** Estado inicial vem do campo `initial` de cada entidade. */
function applyInitialState(room) {
    for (const entity of room.entities) {
        const key = stateKey(room.id, entity.id);
        if (entity.initial !== undefined && gameState.objectStates[key] === undefined) {
            gameState.objectStates[key] = entity.initial;
        }
    }
}

export function registerRoomScene(k, roomDef) {
    k.scene(roomDef.id, () => {
        // Salas com variantes (ex.: cozinha devastada/normal) escolhem o layout ao entrar.
        const room = roomDef.resolve ? roomDef.resolve(gameState) : roomDef;
        const ROOM_WIDTH = room.width || DEFAULT_ROOM_WIDTH;
        const wrap = room.wrapAround !== false;

        applyInitialState(room);
        gameState.currentRoom = room.id;

        // Sincroniza a luz com o interruptor da sala (se houver)
        const lightSwitch = room.entities.find((e) => e.actions?.includes("Alternar_Luz"));
        if (lightSwitch) {
            gameState.setRoomLight(room.id, gameState.objectStates[stateKey(room.id, lightSwitch.id)] === "on");
        }

        k.setCursor("default");
        fadeIn(k, 0.4);

        // Estado da UI desta cena
        const ui = {
            activeMenu: null,
            inDialog: false,
            inSettings: false,
            leaving: false,
            mobilePanX: 0,
        };
        const isBlocked = () => !!(ui.activeMenu || ui.inDialog || ui.inSettings || ui.leaving);

        applyNavigationConfig(navigationConfig.getActive(gameState.settings.controlMode), ui);
        setupLighting(k, room.id);
        setupHUD(k, ui);

        if (gameState.pendingDialog) {
            const pd = gameState.pendingDialog;
            gameState.pendingDialog = null;
            ui.inDialog = true;
            k.wait(0.45, () => showDialog(k, pd.title, pd.text, () => { ui.inDialog = false; }));
        }

        k.onKeyPress("i", () => {
            if (!isBlocked()) showInventoryPanel(k);
        });

        // ── Wrap-around: objetos reaparecem do outro lado ao girar a câmera ──
        function wrapAround() {
            if (!wrap) return { id: "noWrap" };
            return {
                id: "wrapAround",
                require: ["pos"],
                update() {
                    const camX = k.getCamPos().x;
                    const half = ROOM_WIDTH / 2;
                    if (this.pos.x < camX - half) this.pos.x += ROOM_WIDTH;
                    else if (this.pos.x > camX + half) this.pos.x -= ROOM_WIDTH;
                },
            };
        }

        // ── Paredes ──
        // Sprite por parede: "<sala>.parede.1".."4" → "<sala>.parede" → cor sólida.
        // `room.wallSprite` permite trocar a base (ex.: variante devastada da cozinha).
        const wallCount = Math.ceil(ROOM_WIDTH / VIEW_WIDTH);
        const wallColor = k.Color.fromHex(room.wallColor || "#2a2a2a");
        for (let i = 0; i < wallCount; i++) {
            const x = i * VIEW_WIDTH;
            const sprite = resolveSprite(room.wallSprite || `${room.id}.parede`, String(i + 1));
            if (sprite) {
                k.add([k.sprite(sprite, { width: VIEW_WIDTH, height: VIEW_HEIGHT }), k.pos(x, 0), k.z(0), wrapAround()]);
                continue;
            }
            k.add([k.rect(VIEW_WIDTH, VIEW_HEIGHT), k.pos(x, 0), k.color(wallColor), k.z(0), wrapAround()]);
            k.add([k.rect(2, VIEW_HEIGHT), k.pos(x + VIEW_WIDTH - 2, 0), k.color(10, 10, 15), k.z(1), wrapAround()]);
            k.add([
                k.rect(VIEW_WIDTH, FLOOR_HEIGHT),
                k.pos(x, VIEW_HEIGHT - FLOOR_HEIGHT),
                k.color(k.Color.fromHex(room.floorColor || "#1c1917")),
                k.z(1),
                wrapAround(),
            ]);
        }

        // ── Entidades ──
        // Cada entidade é um nó raiz (posição + hitbox) com um filho "visual"
        // que é trocado quando o estado muda (sprite por estado ou placeholder).
        const nodes = new Map(); // entity.id → { entity, root, visualKey }

        function isHidden(entity) {
            const st = gameState.objectStates[stateKey(room.id, entity.id)];
            if (entity.hiddenWhen?.includes(st)) return true;
            if (entity.visibleWhen && !entity.visibleWhen(gameState)) return true;
            return false;
        }

        function buildVisual(node) {
            const { entity, root } = node;
            const st = gameState.objectStates[stateKey(room.id, entity.id)];
            const spriteBase = entity.sprite === undefined ? `${room.id}.${entity.id}` : entity.sprite;
            const sprite = resolveSprite(spriteBase, st);
            const visualKey = `${sprite}|${st}`;
            if (visualKey === node.visualKey) return;
            node.visualKey = visualKey;

            root.get("visual").forEach((c) => c.destroy());
            if (sprite) {
                root.add([k.sprite(sprite, { width: entity.w, height: entity.h }), "visual"]);
                return;
            }
            // Placeholder: retângulo com a cor da entidade (clareia quando aberto/ligado)
            let color = k.Color.fromHex(entity.colors?.[st] || entity.color || "#888888");
            if (!entity.colors?.[st] && isOpenState(st)) color = color.lerp(k.WHITE, 0.5);
            root.add([k.rect(entity.w, entity.h), k.color(color), k.outline(1, color.darken(60)), "visual"]);
        }

        function spawnEntity(entity) {
            if (gameState.pickedUpItems.includes(stateKey(room.id, entity.id))) return;
            const root = k.add([
                k.pos(entity.x - entity.w / 2, entity.y - entity.h / 2),
                k.z(entity.z ?? 50),
                wrapAround(),
            ]);
            const node = { entity, root, visualKey: null };
            nodes.set(entity.id, node);
            buildVisual(node);
            root.hidden = isHidden(entity);

            if (entity.actions?.length) {
                node.tooltip = k.add([
                    k.text(entity.label || "", { size: 6 }),
                    k.pos(0, 0),
                    k.fixed(),
                    k.z(5000),
                    k.color(255, 240, 180),
                    k.opacity(0),
                ]);
                root.onDestroy(() => node.tooltip.destroy());
            }
        }

        function refresh() {
            for (const node of nodes.values()) {
                if (!node.root.exists()) continue;
                buildVisual(node);
                node.root.hidden = isHidden(node.entity);
            }
        }

        function removeEntity(id) {
            const node = nodes.get(id);
            if (node?.root.exists()) node.root.destroy();
            nodes.delete(id);
        }

        room.entities.forEach(spawnEntity);
        if (import.meta.env.DEV) reportMissingSprites();

        const scene = { k, room, ui, refresh, removeEntity };

        // Atalho de depuração (só em `npm run dev`): no console do navegador,
        // __room.act("porta", "Usar") executa uma ação sem precisar clicar.
        if (import.meta.env.DEV) {
            window.__room = {
                scene,
                state: gameState,
                act(id, action) {
                    const node = nodes.get(id);
                    if (!node) return console.warn(`Entidade "${id}" não está na sala ${room.id}`);
                    return runInteraction(scene, node.entity, action);
                },
            };
        }

        // ── Hover / clique ──
        // Percorre do maior z para o menor, para o objeto da frente ganhar.
        function getEntityUnderMouse(mouse) {
            let best = null;
            for (const node of nodes.values()) {
                const { entity, root } = node;
                if (!entity.actions?.length || !root.exists() || root.hidden) continue;
                const sp = k.toScreen(root.pos);
                const inside = mouse.x >= sp.x && mouse.x <= sp.x + entity.w
                    && mouse.y >= sp.y && mouse.y <= sp.y + entity.h;
                if (inside && (!best || (entity.z ?? 50) > (best.entity.z ?? 50))) best = node;
            }
            return best;
        }

        let hovered = null;
        k.onUpdate(() => {
            const mouse = k.mousePos();
            const current = isBlocked() ? null : getEntityUnderMouse(mouse);
            if (current !== hovered) {
                if (hovered?.tooltip?.exists()) hovered.tooltip.opacity = 0;
                if (current) current.tooltip.opacity = 1;
                k.setCursor(current ? "pointer" : "default");
                hovered = current;
            }
            if (hovered?.tooltip?.exists()) hovered.tooltip.pos = k.vec2(mouse.x + 10, mouse.y - 14);
        });

        k.onClick(() => {
            if (ui.activeMenu) {
                if (!ui.activeMenu.isHovering()) {
                    ui.activeMenu.destroy();
                    ui.activeMenu = null;
                }
                return;
            }
            if (isBlocked()) return;
            const hit = getEntityUnderMouse(k.mousePos());
            if (!hit) return;

            const sp = k.toScreen(hit.root.pos);
            const EDGE = 40;
            const mX = k.clamp(sp.x + hit.entity.w / 2, EDGE, k.width() - EDGE);
            const mY = k.clamp(sp.y + hit.entity.h / 2, EDGE, k.height() - EDGE);

            ui.activeMenu = createRadialMenu(k, k.vec2(mX, mY), getAvailableActions(room, hit.entity), (action) => {
                ui.activeMenu = null;
                runInteraction(scene, hit.entity, action);
            });
        });

        // ── Câmera ──
        let camX = gameState.savedCamX ?? VIEW_WIDTH / 2;
        gameState.savedCamX = null;
        const camY = VIEW_HEIGHT / 2;
        k.setCamPos(camX, camY);

        if (ui.navigationConfig.enableKeyboardScroll) {
            k.onKeyDown("left", () => { if (!isBlocked()) camX -= ui.navigationConfig.keyboardScrollSpeed; });
            k.onKeyDown("right", () => { if (!isBlocked()) camX += ui.navigationConfig.keyboardScrollSpeed; });
        }

        k.onUpdate(() => {
            if (!isBlocked()) {
                const cfg = ui.navigationConfig;
                if (cfg.scrollZoneWidth > 0) {
                    const mouse = k.mousePos();
                    let speed = 0;
                    if (mouse.x < cfg.scrollZoneWidth) {
                        speed = -navigationConfig.calculateScrollSpeed(mouse.x, cfg.scrollZoneWidth, cfg.maxSpeed, cfg.speedFalloff);
                    } else if (mouse.x > k.width() - cfg.scrollZoneWidth) {
                        speed = navigationConfig.calculateScrollSpeed(k.width() - mouse.x, cfg.scrollZoneWidth, cfg.maxSpeed, cfg.speedFalloff);
                    }
                    camX += speed * k.dt();
                }
                if (cfg.showButtons && ui.mobilePanX !== 0) {
                    camX += ui.mobilePanX * cfg.maxSpeed * k.dt();
                }
            }
            if (!wrap) camX = k.clamp(camX, VIEW_WIDTH / 2, ROOM_WIDTH - VIEW_WIDTH / 2);
            // Cutscenes podem mover a câmera diretamente; só reescreve quando o jogador controla.
            if (!ui.leaving) k.setCamPos(camX, camY);
        });
    });
}
