import { gameState } from "../state.js";

// Função re-desenha as opções e lida com clique das opções de UI
export function showSettingsPanel(k) {
    const w = 180;
    const h = 140;
    
    // Fundo do Modal
    const panel = k.add([
        k.rect(w, h, { radius: 8 }),
        k.pos(k.center().x, k.center().y),
        k.anchor("center"),
        k.color(30, 30, 35),
        k.outline(3, k.Color.fromHex("#a07850")),
        k.fixed(),
        k.z(10010),
        k.area(), // Bloqueia clicks de passarem para cena principal
        "settingsPanel"
    ]);

    // Titulo
    panel.add([
        k.text("CONFIGURAÇÕES", { size: 10 }),
        k.pos(0, -50),
        k.anchor("center"),
        k.color(255, 255, 200),
    ]);

    const drawButton = (label, posY, colorHex, onClickCallback) => {
        const btn = panel.add([
            k.rect(140, 18, { radius: 4 }),
            k.pos(0, posY),
            k.anchor("center"),
            k.color(k.Color.fromHex(colorHex)),
            k.area()
        ]);
        
        const txt = btn.add([
            k.text(label, { size: 8 }),
            k.anchor("center"),
            k.color(255, 255, 255)
        ]);

        btn.onHover(() => { k.setCursor("pointer"); btn.opacity = 0.8; });
        btn.onHoverEnd(() => { k.setCursor("default"); btn.opacity = 1; });
        btn.onClick(onClickCallback);
        
        return { btn, txt };
    };

    // Navegação (Mouse ou Touch)
    const navText = () => `NAVEGAÇÃO: ${gameState.settings.controlMode === "mouse" ? "MOUSE" : "TELA/TOUCH"}`;
    const navBtn = drawButton(navText(), -20, "#555577", () => {
        gameState.settings.controlMode = gameState.settings.controlMode === "mouse" ? "buttons" : "mouse";
        navBtn.txt.text = navText();
    });

    // Tela Cheia (Fullscreen)
    const fsText = () => `TELA CHEIA: ${k.isFullscreen() ? "LIGADO" : "DESLIGADO"}`;
    const fsBtn = drawButton(fsText(), 5, "#555577", () => {
        k.setFullscreen(!k.isFullscreen());
        // Aguarda 1 frame pra checar o estado via kaplay engine internamente, porem js é sincrono com on click entao garantimos a escrita crua primeiro
        setTimeout(() => fsBtn.txt.text = fsText(), 50); 
    });

    // Abandonar o jogo
    drawButton("VOLTAR AO MENU INICIAL", 35, "#883333", () => {
        // Redireciona via engine e destrói o modal
        k.destroy(panel);
        k.setCursor("default");
        //k.go("menu"); // O seu projeto não tem o link "menu" configurado perfeitamente ainda, se chamarmos isso ele pode crashar o preview se o menu.js não estiver definido
        // Então daremos reload da tela (F5 virtual) como solução retrô temporária garantida
        window.location.reload();
    });

    // Fechar Configurações
    drawButton("CONTINUAR JOGANDO", 60, "#338833", () => {
        k.destroy(panel);
        k.setCursor("default");
    });

    return panel;
}
