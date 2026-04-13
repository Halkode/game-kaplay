/**
 * Configuração centralizada de navegação por controlMode.
 * Define estratégias de movimento de câmera e interação conforme o modo selecionado.
 * 
 * Modos:
 *   "mouse"   — Navegação automática: câmera segue zonas de scroll (mouse)
 *   "buttons" — Navegação manual: botões visuais de panning (touch/teclado)
 */

export const navigationConfig = {
    // ═══════════════════════════════════════════════════════════════════════════
    // MODO MOUSE: Scroll automático em zonas + movimento livre via mouse
    // ═══════════════════════════════════════════════════════════════════════════
    mouse: {
        name: "Mouse",
        description: "Scroll automático ao mover mouse para as bordas",
        
        // Movimento de câmera
        scrollZoneWidth: 40,        // Pixels a partir da borda para ativar scroll
        maxSpeed: 120,              // Máxima velocidade de scroll (pixels/seg)
        speedFalloff: (ratio) => {
            // ratio: 0 (fora da zona) a 1 (na borda)
            // Usa curva suave (linear neste caso)
            return ratio;
        },
        
        // Keyboard & inputs
        keyboardScrollSpeed: 2,     // Pixels/frame ao segurar setas
        enableKeyboardScroll: true,
        
        // UI de navegação
        showButtons: false,         // Não mostra botões de scroll
        showNavigationHint: false,  // Não mostra dica de navegação
        
        // Wrap-around
        enableWrapAround: true,     // Câmera faz wrap nas laterais
        
        // Comportamento dinâmico
        autoFocusOnInteraction: false, // Não refoca ao interagir
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // MODO BUTTONS: Botões visuais de panning (ideal para touch)
    // ═══════════════════════════════════════════════════════════════════════════
    buttons: {
        name: "Tela/Touch",
        description: "Botões de navegação na tela",
        
        // Movimento de câmera
        scrollZoneWidth: 0,         // Não usa scroll automático
        maxSpeed: 120,              // Velocidade dos botões (pixels/seg)
        speedFalloff: (ratio) => 1, // Sempre velocidade máxima
        
        // Keyboard & inputs
        keyboardScrollSpeed: 0,     // Desabilita scroll via teclado
        enableKeyboardScroll: false,
        
        // UI de navegação
        showButtons: true,          // Mostra botões de scroll
        showNavigationHint: true,   // Mostra dica visual
        buttonPosition: {
            left: 25,               // X do botão esquerdo
            right: 215,             // X do botão direito
            y: 144,                 // Y de ambos os botões
        },
        buttonSize: {
            width: 16,
            height: 16,
        },
        
        // Wrap-around
        enableWrapAround: true,
        
        // Comportamento dinâmico
        autoFocusOnInteraction: false,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GETTER: Retorna config ativa baseado em controlMode
    // ═══════════════════════════════════════════════════════════════════════════
    getActive(controlMode) {
        return this[controlMode] || this.mouse;
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY: Calcula velocidade baseado em distância até a borda
    // ═══════════════════════════════════════════════════════════════════════════
    calculateScrollSpeed(distanceFromEdge, zoneWidth, maxSpeed, speedFalloff) {
        if (distanceFromEdge <= 0) return 0;
        if (distanceFromEdge >= zoneWidth) return 0;
        
        const ratio = 1 - (distanceFromEdge / zoneWidth);
        const falloff = speedFalloff ? speedFalloff(ratio) : ratio;
        return maxSpeed * falloff;
    },
};

/**
 * Aplica configuração de navegação ao contexto de cena.
 * Chame no início de createRoomScene() ou quando settings mudarem.
 * 
 * @param {object} navConfig    — Configuração ativa (de navigationConfig.getActive())
 * @param {object} stateContext — Contexto de estado da cena
 */
export function applyNavigationConfig(navConfig, stateContext) {
    stateContext.navigationConfig = navConfig;
    stateContext.activeCameraMovement = true;
}
