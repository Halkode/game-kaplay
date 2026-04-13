import { showInventoryPanel } from "./inventory.js";
import { showSettingsPanel } from "./settings.js";
import { showHealthPanel } from "./health.js";
import { getFormattedTime } from "../systems/timeAndLight.js";
import { gameState } from "../state.js";
import { navigationConfig } from "../config/navigation.js";

// Inicializa os elementos visuais fixos que ficam por cima da sala
export function setupHUD(k, stateContext) {
    
    // ============================================
    // MENU SUPERIOR (TOP BAR STATUS)
    // ============================================
    
    // Fundo da barra superior
    k.add([
        k.rect(240, 18),
        k.pos(0, 0),
        k.color(15, 15, 20),
        k.opacity(0.85),
        k.fixed(),
        k.z(1000)
    ]);

    // BOTÃO DE CONFIGURAÇÕES (ENGRENAGEM) - Esquerda
    const settingsBtn = k.add([
        k.rect(14, 14, { radius: 2 }),
        k.pos(12, 9), 
        k.color(30, 30, 40),
        k.anchor("center"),
        k.fixed(),
        k.z(1001),
        k.area(),
    ]);
    settingsBtn.add([
        k.text("⚙", { size: 10 }), 
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

    // TEXTO DO RELÓGIO MINIMALISTA - Centro
    const clockText = k.add([
        k.text(getFormattedTime(), { size: 10 }),
        k.pos(120, 9), // Topo centro
        k.anchor("center"),
        k.color(220, 220, 230),
        k.fixed(),
        k.z(1001), 
    ]);
    k.onUpdate(() => {
        clockText.text = getFormattedTime();
    });

    // BOTÃO DE SAÚDE (CORAÇÃO) - Direita
    const healthBtn = k.add([
        k.rect(16, 14, { radius: 2 }),
        k.pos(200, 9),
        k.color(30, 20, 20),
        k.anchor("center"),
        k.fixed(),
        k.z(1001),
        k.area()
    ]);
    healthBtn.add([
        k.text("❤", { size: 9 }),
        k.anchor("center"),
        k.color(200, 50, 50)
    ]);

    healthBtn.onHover(() => { k.setCursor("pointer"); healthBtn.color = k.Color.fromHex("#4a2020"); });
    healthBtn.onHoverEnd(() => { k.setCursor("default"); healthBtn.color = k.Color.fromHex("#1e1414"); });
    healthBtn.onClick(() => {
        if (!stateContext.activeMenu && !stateContext.inDialog && !stateContext.inSettings) {
            const hPanel = showHealthPanel(k);
            // k.wait(0) delega a atribuição para o próximo tick, evitando que o
            // k.onClick() global destrua o painel de saúde no mesmo milissegundo de sua criação
            k.wait(0, () => { stateContext.activeMenu = hPanel; });
            
            hPanel.onDestroy(() => {
                if (stateContext.activeMenu === hPanel) stateContext.activeMenu = null;
            });
        }
    });

    // BOTÃO DA MOCHILA (INVENTÁRIO) - Direita Extrema
    const bagBtn = k.add([
        k.sprite("bag", { width: 16, height: 16 }),
        k.pos(226, 9), 
        k.anchor("center"),
        k.fixed(),
        k.z(1001),
        k.area(),
    ]);

    bagBtn.onHover(() => k.setCursor("pointer"));
    bagBtn.onHoverEnd(() => k.setCursor("default"));
    bagBtn.onClick(() => {
        if (!stateContext.activeMenu && !stateContext.inDialog && !stateContext.inSettings) {
            const iPanel = showInventoryPanel(k);
            k.wait(0, () => { stateContext.activeMenu = iPanel; });

            iPanel.onDestroy(() => {
                if (stateContext.activeMenu === iPanel) stateContext.activeMenu = null;
            });
        }
    });

    // ============================================
    // CONTROLES MOBILE DA CÂMERA (EM TELA)
    // ============================================
    
    // Flag injetada no state para a câmera poder olhar
    stateContext.mobilePanX = 0;
    
    // Obter config de navegação ativa
    const activeNavConfig = navigationConfig.getActive(gameState.settings.controlMode);

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

    // Renderizar botões apenas se a config permite
    let navLeft, navRight;
    if (activeNavConfig.showButtons) {
        navLeft = drawScrollBtn(activeNavConfig.buttonPosition.left, "<", -1);
        navRight = drawScrollBtn(activeNavConfig.buttonPosition.right, ">", 1);
    }

    // O Update processa a lógica de esconder os menus se o jogador trocou a opção na configuração de "Mobile" para "Mouse"
    k.onUpdate(() => {
        const currentNavConfig = navigationConfig.getActive(gameState.settings.controlMode);
        const shouldShowButtons = currentNavConfig.showButtons;
        let targetOpacity = shouldShowButtons ? 0.3 : 0.0;
        
        // Aplica Visibilidade e Hitbox (se botões foram criados)
        if (navLeft && navRight) {
            navLeft.opacity = targetOpacity;
            navRight.opacity = targetOpacity;
        }
        // Pula o frame se inSettings
        if (stateContext.inSettings || !shouldShowButtons) {
            stateContext.mobilePanX = 0; // aborta pan!
        }
    });
}
