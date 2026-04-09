import { createRadialMenu } from "../ui/radialMenu.js";
import { showDialog } from "../ui/dialog.js";
import { showInventoryPanel } from "../ui/inventory.js";
import { setupHUD } from "../ui/hud.js";
import { setupLighting } from "../systems/timeAndLight.js";
import { gameState } from "../state.js";
import { room1 } from "../data/rooms.js";
import { getAvailableActions, handleInteraction, applyVisualState } from "../systems/interactions.js";

export function gameScene(k) {
    k.scene("game", () => {
        k.setCursor("default");

        const state = { activeMenu: null, clickedObject: false, inDialog: false };

        // Interface Gráfica e Overlays de Clima
        setupLighting(k);
        setupHUD(k, state);

        // Atalho de Teclado
        k.onKeyPress("i", () => {
            if (!state.activeMenu && !state.inDialog) showInventoryPanel(k);
        });

        const SCENE_WIDTH = 960;  // 4x a largura da tela
        const SCENE_HEIGHT = 160;

        // Componente customizado para fazer o cenário repetir (loop infinito)
        function wrapAround() {
            return {
                id: "wrapAround",
                require: ["pos"],
                update() {
                    const camX = k.camPos().x;
                    const halfScene = SCENE_WIDTH / 2;
                    if (this.pos.x < camX - halfScene) {
                        this.pos.x += SCENE_WIDTH;
                    } else if (this.pos.x > camX + halfScene) {
                        this.pos.x -= SCENE_WIDTH;
                    }
                }
            };
        }

        // Pegamos as paredes e objetos do nosso arquivo de dados da sala
        const walls = room1.walls;
        const objects = room1.objects;

        walls.forEach(w => {
            k.add([
                k.sprite("parede_quarto", { width: 240, height: SCENE_HEIGHT }),
                k.pos(w.x, 0),
                wrapAround(),
            ]);

            k.add([
                k.rect(2, SCENE_HEIGHT),
                k.pos(w.x + 238, 0),
                k.color(10, 10, 15),
                k.opacity(0.3),
                wrapAround(),
            ]);

            // Chão da Sala
            k.add([
                k.rect(240, SCENE_HEIGHT - 120),
                k.pos(w.x, 120),
                k.color(28, 25, 23), // Um cinza/marrom escuro pra dar sensação de base
                wrapAround(),
            ]);
        });

        objects.forEach(obj => {
            if (gameState.pickedUpItems.includes(obj.id)) return;

            const graphicComponent = obj.sprite
                ? k.sprite(obj.sprite, { width: 14 })
                : k.rect(40, 40);

            const colorComponent = obj.sprite
                ? k.color(255, 255, 255)
                : k.color(k.Color.fromHex("#FFFFFF"));

            const o = k.add([
                graphicComponent,
                k.pos(obj.x - 20, obj.y - 20),
                colorComponent,
                k.area(),
                wrapAround(),
                { label: obj.label },
            ]);

            // Força ele a iniciar com a aparência que ficou salva no state
            applyVisualState(k, obj, o);

            o.onHover(() => k.setCursor("pointer"));
            o.onHoverEnd(() => k.setCursor("default"));

            o.onClick(() => {
                state.clickedObject = true;
                if (state.activeMenu) {
                    state.activeMenu.destroy();
                    state.activeMenu = null;
                    return;
                }
                const screenPos = k.toScreen(o.pos);
                let mX = screenPos.x + 20; // +20 foca exatamente no meio da sprinte do objeto!
                let mY = screenPos.y + 20;

                // Buffer de proteção: Faz o botão 'deslizar' de volta pra tela se o objeto estiver no cantinho
                const EDGE_BUFFER = 40;
                mX = Math.max(EDGE_BUFFER, Math.min(mX, k.width() - EDGE_BUFFER));
                mY = Math.max(EDGE_BUFFER, Math.min(mY, k.height() - EDGE_BUFFER));

                state.activeMenu = createRadialMenu(
                    k,
                    k.vec2(mX, mY),
                    getAvailableActions(obj), // Processa inteligentemente o array final ("Abrir" vs "Fechar")
                    (action) => {
                        state.activeMenu = null;

                        // Delega TODO o trabalho pesado que estava aqui para o gerenciador de sistemas!
                        handleInteraction(k, state, action, obj, o);
                    },
                    o
                );
            });
        });
        k.onClick(() => {
            if (state.clickedObject) {
                state.clickedObject = false;  // reseta o flag
                return;  // ignora — o objeto já tratou
            }
            if (state.activeMenu && !state.activeMenu.isHovering()) {
                state.activeMenu.destroy();
                state.activeMenu = null;
            }
        });
        // debug — mostra parede atual e posição do mouse
        const debugText = k.add([
            k.text("", { size: 8 }),
            k.pos(4, 4),
            k.fixed(),
            k.z(100),
            k.color(255, 255, 255),
        ]);

        k.onUpdate(() => {
            const mouse = k.mousePos();
            const camX = k.camPos().x;
            const SCROLL_ZONE = 40;
            const MAX_SPEED = 120;

            // bloqueia scroll se menu ou diálogo estiverem abertos
            if (!state.activeMenu && !state.inDialog) {

                // Evita que o scroll infinito role solto se o player arrastar o mouse pra fora do jogo (limites absolutos < 2)
                if (mouse.x <= 2 || mouse.x >= k.width() - 2 || mouse.y <= 2 || mouse.y >= k.height() - 2) return;

                let speed = 0;
                if (mouse.x < SCROLL_ZONE) {
                    speed = -MAX_SPEED * (1 - mouse.x / SCROLL_ZONE);
                } else if (mouse.x > 240 - SCROLL_ZONE) {
                    speed = MAX_SPEED * ((mouse.x - (240 - SCROLL_ZONE)) / SCROLL_ZONE);
                }
                const newX = camX + speed * k.dt();
                k.camPos(newX, 80);
            }

            const wrapX = ((k.camPos().x % SCENE_WIDTH) + SCENE_WIDTH) % SCENE_WIDTH;
            const wallIndex = Math.floor(wrapX / 240);
            const wallNames = ["Norte", "Leste", "Sul", "Oeste"];

            debugText.text =
                `Parede: ${wallNames[wallIndex]}\n` +
                `CamX: ${Math.round(k.camPos().x)}\n` +
                `Mouse: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`;
        });

        // câmera começa no centro da primeira parede
        k.camPos(120, 80);
    });
}