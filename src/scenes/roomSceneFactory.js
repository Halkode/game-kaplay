import { createRadialMenu } from "../ui/radialMenu.js";
import { showDialog } from "../ui/dialog.js";
import { showInventoryPanel } from "../ui/inventory.js";
import { setupHUD } from "../ui/hud.js";
import { setupLighting } from "../systems/timeAndLight.js";
import { gameState } from "../state.js";
import { getAvailableActions, handleInteraction, applyVisualState } from "../systems/interactions.js";
import { fadeIn } from "../ui/transitions.js";
import { navigationConfig, applyNavigationConfig } from "../config/navigation.js";

export function createRoomScene(k, sceneName, roomDataOrFactory) {
    k.scene(sceneName, () => {
        const roomData = typeof roomDataOrFactory === "function"
            ? roomDataOrFactory()
            : roomDataOrFactory;

        if (roomData.initialState) {
            for (const [key, value] of Object.entries(roomData.initialState)) {
                if (gameState.objectStates[key] === undefined) {
                    gameState.objectStates[key] = value;
                }
            }
        }

        k.setCursor("default");
        fadeIn(k, 0.4);

        gameState.currentRoom = sceneName;

        const state = {
            activeMenu: null,
            inDialog: false,
            inSettings: false,
            mobilePanX: 0,
        };

        const navConfig = navigationConfig.getActive(gameState.settings.controlMode);
        applyNavigationConfig(navConfig, state);

        setupLighting(k, sceneName);
        setupHUD(k, state);

        if (gameState.pendingDialog) {
            const pd = gameState.pendingDialog;
            gameState.pendingDialog = null;
            state.inDialog = true;
            k.wait(0.45, () => {
                showDialog(k, pd.title, pd.text, () => { state.inDialog = false; });
            });
        }

        k.onKeyPress("i", () => {
            if (!state.activeMenu && !state.inDialog) showInventoryPanel(k);
        });

        const navConfigSchema = roomData.navigation || {};
        const SCENE_WIDTH = navConfigSchema.sceneWidth || 960;
        const SCENE_HEIGHT = navConfigSchema.sceneHeight || 160;
        const doWrapAround = navConfigSchema.wrapAround !== false;

        function wrapAround() {
            if (!doWrapAround) return { id: "noWrap" };
            return {
                id: "wrapAround",
                require: ["pos"],
                update() {
                    const camX = k.getCamPos().x;
                    const halfScene = SCENE_WIDTH / 2;
                    if (this.pos.x < camX - halfScene) {
                        this.pos.x += SCENE_WIDTH;
                    } else if (this.pos.x > camX + halfScene) {
                        this.pos.x -= SCENE_WIDTH;
                    }
                },
            };
        }

        if (roomData.backgrounds) {
            roomData.backgrounds.forEach((bg) => {
                if (bg.type === "color") {
                    k.add([
                        k.rect(bg.width || SCENE_WIDTH, bg.height || SCENE_HEIGHT),
                        k.pos(bg.x || 0, bg.y || 0),
                        k.color(k.Color.fromHex(bg.color)),
                        wrapAround(),
                        k.z(bg.z || 0)
                    ]);
                } else if (bg.type === "sprite") {
                    k.add([
                        k.sprite(bg.spriteId || bg.sprite),
                        k.pos(bg.x || 0, bg.y || 0),
                        wrapAround(),
                        k.z(bg.z || 0)
                    ]);
                } else if (bg.type === "floor") {
                    const fh = bg.height || 40;
                    k.add([
                        k.rect(bg.width || SCENE_WIDTH, fh),
                        k.pos(bg.x || 0, bg.y || (SCENE_HEIGHT - fh)),
                        k.color(k.Color.fromHex(bg.color)),
                        wrapAround(),
                        k.z(bg.z || 1)
                    ]);
                }
            });
        } else if (roomData.walls) {
            roomData.walls.forEach((w) => {
                k.add([k.rect(240, SCENE_HEIGHT), k.pos(w.x, 0), k.color(k.Color.fromHex(w.color)), wrapAround(), k.z(0)]);
                k.add([k.rect(2, SCENE_HEIGHT), k.pos(w.x + 238, 0), k.color(10, 10, 15), k.opacity(0.3), wrapAround(), k.z(1)]);
                k.add([k.rect(240, SCENE_HEIGHT - 120), k.pos(w.x, 120), k.color(28, 25, 23), wrapAround(), k.z(2)]);
            });
        }

        const sceneObjects = [];

        const registerInteractiveNode = (objData, hitBoxWidth, hitBoxHeight, visualComponentNode) => {
            if (!objData.actions && !objData.targetRoom) return; // Se não tem interação, apenas desenha

            const tooltip = k.add([
                k.text(objData.label || "", { size: 6 }),
                k.pos(0, 0),
                k.fixed(),
                k.z(5000),
                k.color(255, 240, 180),
                k.opacity(0),
            ]);

            visualComponentNode.onDestroy(() => k.destroy(tooltip));

            sceneObjects.push({
                obj: objData,
                o: visualComponentNode,
                objW: hitBoxWidth,
                objH: hitBoxHeight,
                tooltip
            });
        };

        if (roomData.objects) {
            roomData.objects.forEach((obj) => {
                if (obj.actions && gameState.pickedUpItems.includes(obj.id)) return;

                const objW = obj.width || 40;
                const objH = obj.height || 40;
                const zIndex = obj.z || 50;

                const graphicComponent = obj.type === "sprite" || obj.sprite
                    ? k.sprite(obj.sprite || obj.spriteId, { width: objW, height: objH })
                    : k.rect(objW, objH);

                const colorComponent = obj.type === "sprite" || obj.sprite
                    ? k.color(255, 255, 255)
                    : k.color(k.Color.fromHex(obj.color || obj.colorBase || "#ffffff"));

                const o = k.add([
                    graphicComponent,
                    colorComponent,
                    k.pos(obj.x - objW / 2, obj.y - objH / 2),
                    k.z(zIndex),
                    wrapAround(),
                ]);

                applyVisualState(k, obj, o);

                if (!roomData.hotspots) {
                    registerInteractiveNode(obj, objW, objH, o);
                }
            });
        }

        if (roomData.hotspots) {
            roomData.hotspots.forEach((spot) => {
                if (gameState.pickedUpItems.includes(spot.id)) return;

                const sW = spot.width || 40;
                const sH = spot.height || 40;
                const zIndex = spot.z || 100;

                const ghostNode = k.add([
                    k.rect(sW, sH),
                    k.pos(spot.x - sW / 2, spot.y - sH / 2),
                    k.opacity(0),
                    k.z(zIndex),
                    wrapAround()
                ]);

                registerInteractiveNode(spot, sW, sH, ghostNode);
            });
        }

        function getObjectUnderMouse(mousePos) {
            for (const entry of sceneObjects) {
                if (!entry.o.exists()) continue;
                const sp = k.toScreen(entry.o.pos);
                if (
                    mousePos.x >= sp.x &&
                    mousePos.x <= sp.x + entry.objW &&
                    mousePos.y >= sp.y &&
                    mousePos.y <= sp.y + entry.objH
                ) {
                    return entry;
                }
            }
            return null;
        }

        let currentHovered = null;
        k.onUpdate(() => {
            const mouse = k.mousePos();
            const blocked = state.activeMenu || state.inDialog || state.inSettings;
            const hovered = blocked ? null : getObjectUnderMouse(mouse);

            if (hovered !== currentHovered) {
                if (currentHovered) {
                    currentHovered.tooltip.opacity = 0;
                    k.setCursor("default");
                }
                if (hovered) {
                    hovered.tooltip.opacity = 1;
                    k.setCursor("pointer");
                }
                currentHovered = hovered;
            }

            if (currentHovered) {
                currentHovered.tooltip.pos = k.vec2(mouse.x + 10, mouse.y - 14);
            }
        });

        k.onClick(() => {
            const mouse = k.mousePos();
            if (state.activeMenu) {
                if (!state.activeMenu.isHovering()) {
                    state.activeMenu.destroy();
                    state.activeMenu = null;
                }
                return;
            }
            if (state.inDialog || state.inSettings) return;
            const hit = getObjectUnderMouse(mouse);
            if (!hit) return;

            const sp = k.toScreen(hit.o.pos);
            const EDGE_BUFFER = 40;
            const mX = Math.max(EDGE_BUFFER, Math.min(sp.x + hit.objW / 2, k.width() - EDGE_BUFFER));
            const mY = Math.max(EDGE_BUFFER, Math.min(sp.y + hit.objH / 2, k.height() - EDGE_BUFFER));

            state.activeMenu = createRadialMenu(
                k,
                k.vec2(mX, mY),
                getAvailableActions(hit.obj),
                (action) => {
                    state.activeMenu = null;
                    handleInteraction(k, state, action, hit.obj, hit.o);
                }
            );
        });

        const startCamX = gameState.savedCamX ?? 120;
        gameState.savedCamX = null;
        let camX = startCamX;
        k.setCamPos(camX, 80);

        // Movimento via teclado (apenas se habilitado na config)
        if (state.navigationConfig.enableKeyboardScroll) {
            k.onKeyDown("left", () => {
                if (!state.activeMenu && !state.inDialog) camX -= state.navigationConfig.keyboardScrollSpeed;
            });
            k.onKeyDown("right", () => {
                if (!state.activeMenu && !state.inDialog) camX += state.navigationConfig.keyboardScrollSpeed;
            });
        }

        k.onUpdate(() => {
            if (!state.activeMenu && !state.inDialog) {
                const cfg = state.navigationConfig;

                // Movimento via mouse scroll (se habilitado e zona definida)
                if (cfg.scrollZoneWidth > 0) {
                    const mouse = k.mousePos();
                    let speed = 0;

                    if (mouse.x < cfg.scrollZoneWidth) {
                        const distFromEdge = mouse.x;
                        speed = -navigationConfig.calculateScrollSpeed(
                            distFromEdge,
                            cfg.scrollZoneWidth,
                            cfg.maxSpeed,
                            cfg.speedFalloff
                        );
                    } else if (mouse.x > k.width() - cfg.scrollZoneWidth) {
                        const distFromEdge = k.width() - mouse.x;
                        speed = navigationConfig.calculateScrollSpeed(
                            distFromEdge,
                            cfg.scrollZoneWidth,
                            cfg.maxSpeed,
                            cfg.speedFalloff
                        );
                    }

                    camX += speed * k.dt();
                }

                // Movimento via botões mobile (se habilitado via state.mobilePanX)
                if (cfg.showButtons && state.mobilePanX !== 0) {
                    camX += state.mobilePanX * cfg.maxSpeed * k.dt();
                }
            }
            k.setCamPos(camX, 80);
        });
    });
}
