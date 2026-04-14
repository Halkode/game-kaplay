// Biblioteca de animações reutilizáveis para o jogo.
// Todas as funções recebem `k` (instância Kaplay) como primeiro argumento.

// ─────────────────────────────────────────────────────────────────────────────
// FLICKER DE LUZ
// Simula uma lâmpada antiga acendendo/apagando.
// Deve ser chamado APÓS alterar gameState.objectStates — a escuridão dinâmica
// de timeAndLight.js já começa a transicionar; o overlay de brilho quente
// completa a ilusão de uma lâmpada real.
// ─────────────────────────────────────────────────────────────────────────────
export function flickerLight(k, turningOn, onDone) {
    const glow = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(255, 235, 160),   // brilho amarelo-quente de incandescente
        k.opacity(0),
        k.z(901),                  // logo acima da camada de escuridão (z=900)
    ]);

    // Sequências de opacidade que simulam a lâmpada tentando acender/apagar
    const SEQ_ON = [0.18, 0.02, 0.30, 0.04, 0.22];
    const SEQ_OFF = [0.22, 0.05, 0.18, 0.00];
    const seq = turningOn ? SEQ_ON : SEQ_OFF;

    let i = 0;
    function next() {
        if (i >= seq.length) {
            k.destroy(glow);
            if (onDone) onDone();
            return;
        }
        const duration = turningOn ? 0.03 + Math.random() * 0.05 : 0.06;
        k.tween(glow.opacity, seq[i], duration,
            (v) => { if (glow.exists()) glow.opacity = v; },
            k.easings.linear
        ).then(() => { i++; next(); });
    }
    next();
}

// ─────────────────────────────────────────────────────────────────────────────
// FLASH DE TELA
// Pisca a tela com uma cor por um instante (susto, trovão, explosão).
// ─────────────────────────────────────────────────────────────────────────────
export function flashScreen(k, r = 255, g = 255, b = 255, intensity = 0.6, duration = 0.15) {
    const flash = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(r, g, b),
        k.opacity(intensity),
        k.z(9800),
    ]);
    k.tween(intensity, 0, duration, (v) => {
        if (flash.exists()) flash.opacity = v;
    }, k.easings.easeOutQuad).then(() => k.destroy(flash));
}

// ─────────────────────────────────────────────────────────────────────────────
// PULSO EM OBJETO
// Escala levemente um objeto interativo para chamar atenção.
// O objeto precisa ter o componente k.scale() ou a propriedade scale.
// ─────────────────────────────────────────────────────────────────────────────
export function pulseObject(k, gameObj, amount = 1.12, duration = 0.35) {
    if (!gameObj || !gameObj.exists()) return;
    const base = gameObj.scale ? gameObj.scale.x : 1;
    k.tween(base, base * amount, duration / 2,
        (v) => { if (gameObj.exists()) gameObj.scale = k.vec2(v); },
        k.easings.easeOutSine
    ).then(() => {
        k.tween(base * amount, base, duration / 2,
            (v) => { if (gameObj.exists()) gameObj.scale = k.vec2(v); },
            k.easings.easeInSine
        );
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SHAKE DE CÂMERA
// ─────────────────────────────────────────────────────────────────────────────
export function shakeCamera(k, intensity = 3, duration = 0.3) {
    const origin = k.camPos();
    const steps = Math.ceil(duration / 0.05);
    let i = 0;
    const t = k.loop(0.05, () => {
        k.camPos(
            origin.x + (Math.random() - 0.5) * intensity * 2,
            origin.y + (Math.random() - 0.5) * intensity * 2,
        );
        if (++i >= steps) {
            t.cancel();
            k.camPos(origin);
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTÍCULAS DE POEIRA
// Emite partículas no ponto indicado (coordenadas de TELA — use k.toScreen()).
// ─────────────────────────────────────────────────────────────────────────────
export function spawnDustParticles(k, screenPos, count = 8) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 12 + Math.random() * 20;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const p = k.add([
            k.rect(2, 2),
            k.pos(screenPos.x, screenPos.y),
            k.color(170, 148, 110),
            k.opacity(0.85),
            k.fixed(),
            k.z(9700),
        ]);

        const dur = 0.5 + Math.random() * 0.3;
        const start = k.time();
        const startX = screenPos.x;
        const startY = screenPos.y;

        // Usa onUpdate para mover com velocidade constante (não depende de dt interno do tween)
        const upd = k.onUpdate(() => {
            if (!p.exists()) { upd.cancel(); return; }
            const elapsed = k.time() - start;
            const progress = Math.min(elapsed / dur, 1);
            p.pos.x = startX + vx * elapsed;
            p.pos.y = startY + vy * elapsed;
            p.opacity = 0.85 * (1 - progress);
            if (progress >= 1) { upd.cancel(); k.destroy(p); }
        });
    }
}