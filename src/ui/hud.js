import { showInventoryPanel } from "./inventory.js";
import { showSettingsPanel } from "./settings.js";
import { getFormattedTime } from "../systems/timeAndLight.js";
import { gameState } from "../state.js";

// Inicializa os elementos visuais fixos que ficam por cima da sala
export function setupHUD(k, stateContext) {
    
    // ============================================
    // MENU SUPERIOR
    // ============================================
    
    // TEXTO DO RELÓGIO MINIMALISTA
    const clockText = k.add([
        k.text(getFormattedTime(), { size: 10 }),
        k.pos(225, 30), // Canto superior direito, abaixo da mochila
        k.anchor("center"),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(1001), 
    ]);

    // O relógio atualiza dinamicamente
    k.onUpdate(() => {
        clockText.text = getFormattedTime();
    });

    // BOTÃO DA MOCHILA (INVENTÁRIO)
    const bagBtn = k.add([
        k.sprite("bag", { width: 22, height: 22 }),
        k.pos(225, 15), 
        k.anchor("center"),
        k.fixed(),
        k.z(1001),
        k.area(),
    ]);

    bagBtn.onHover(() => k.setCursor("pointer"));
    bagBtn.onHoverEnd(() => k.setCursor("default"));
    bagBtn.onClick(() => {
        if (!stateContext.activeMenu && !stateContext.inDialog && !stateContext.inSettings) {
            showInventoryPanel(k);
        }
    });

    // BOTÃO DE CONFIGURAÇÕES (ENGRENAGEM)
    const settingsBtn = k.add([
        k.rect(16, 16, { radius: 2 }),
        k.pos(15, 15), // Canto oposto da Tela 
        k.color(30, 30, 40),
        k.anchor("center"),
        k.fixed(),
        k.z(1001),
        k.area(),
    ]);
    settingsBtn.add([
        k.text("⚙", { size: 12 }), 
        k.anchor("center"),
        k.color(200, 200, 200)
    ]);

    settingsBtn.onHover(() => { k.setCursor("pointer"); settingsBtn.color = k.Color.fromHex("#555566"); });
    settingsBtn.onHoverEnd(() => { k.setCursor("default"); settingsBtn.color = k.Color.fromHex("#1e1e28"); });

    settingsBtn.onClick(() => {
        if (!stateContext.activeMenu && !stateContext.inDialog && !stateContext.inSettings) {
            stateContext.inSettings = true;
            const sPanel = showSettingsPanel(k);
            sPanel.onDestroy(() => {
                stateContext.inSettings = false;
            });
        }
    });

    // ============================================
    // CONTROLES MOBILE DA CÂMERA (EM TELA)
    // ============================================
    
    // Flag injetada no state para a câmera poder olhar
    stateContext.mobilePanX = 0; 

    // Helper pra gerar os botões gigantes invisiveis(ou opacos) da lateral
    const drawScrollBtn = (xPos, label, numMove) => {
        const btn = k.add([
            k.rect(40, 60, { radius: 4 }), // Area bem gordinha pra dedo tocar na borda
            k.pos(xPos, 80),
            k.anchor("center"),
            k.color(0, 0, 0),
            k.opacity(0), // Fica Invisível por default. O OnUpdate cuidará disso!
            k.fixed(),
            k.z(1000),
            k.area(),
        ]);
        btn.add([ k.text(label, { size: 18 }), k.anchor("center"), k.color(255,255,255), k.opacity(0.8) ]);

        // Eventos multi-plataforma para Desktop(click) e Mobile(touch)
        btn.onHover(() => { k.setCursor("pointer"); btn.opacity = 0.5; });
        btn.onHoverEnd(() => { k.setCursor("default"); btn.opacity = 0.3; });

        const startMoving = () => { if(!stateContext.inSettings && !stateContext.inDialog) stateContext.mobilePanX = numMove; };

        // Processa segurar botão a cada frame
        k.onUpdate(() => {
            if (btn.isHovering() && k.isMouseDown()) {
                startMoving();
            } else if (stateContext.mobilePanX === numMove) {
                stateContext.mobilePanX = 0;
            }
        });

        return btn;
    };

    const navLeft = drawScrollBtn(25, "<", -1);
    const navRight = drawScrollBtn(215, ">", 1);

    // O Update processa a lógica de esconder os menus se o jogador trocou a opção na configuração de "Mobile" para "Mouse"
    k.onUpdate(() => {
        const isButtonMode = gameState.settings.controlMode === "buttons";
        let targetOpacity = isButtonMode ? 0.3 : 0.0;
        
        // Aplica Visibilidade e Hitbox
        navLeft.opacity = targetOpacity;
        navRight.opacity = targetOpacity;
        // Pula o frame se inSettings
        if (stateContext.inSettings || !isButtonMode) {
            stateContext.mobilePanX = 0; // aborta pan!
        }
    });
}
