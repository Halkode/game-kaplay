// Pulso de objeto interativo (chama atenção do jogador)
export function pulseObject(k, gameObj) {
    k.tween(1, 1.1, 0.4, (v) => gameObj.scale = k.vec2(v), k.easings.easeInOutSine)
        .then(() => k.tween(1.1, 1, 0.4, (v) => gameObj.scale = k.vec2(v), k.easings.easeInOutSine));
}

// Shake de câmera (susto, batida, trovão)
export function shakeCamera(k, intensity = 3, duration = 0.3) {
    const origin = k.camPos();
    const steps = Math.floor(duration / 0.05);
    let i = 0;
    const t = k.loop(0.05, () => {
        k.camPos(origin.x + (Math.random() - 0.5) * intensity * 2,
            origin.y + (Math.random() - 0.5) * intensity * 2);
        if (++i >= steps) { t.cancel(); k.camPos(origin); }
    });
}

// Poeira ao pegar item sujo
export function spawnDustParticles(k, pos) {
    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 25;
        const p = k.add([
            k.rect(2, 2),
            k.pos(pos.x, pos.y),
            k.color(180, 160, 130),
            k.opacity(1),
            k.z(950),
        ]);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        k.tween(1, 0, 0.6, (v) => {
            p.opacity = v;
            p.pos.x += vx * k.dt();
            p.pos.y += vy * k.dt();
        }, k.easings.easeOutQuad).then(() => k.destroy(p));
    }
}

// Abre uma "sub-cena" em cima da atual — janela de exame detalhado
export function zoomIntoObject(k, stateContext, spriteKey, description, onClose) {
    stateContext.inDialog = true;

    const overlay = k.add([k.rect(k.width(), k.height()), k.pos(0, 0),
    k.fixed(), k.color(0, 0, 0), k.opacity(0), k.z(9500)]);

    k.tween(0, 0.75, 0.3, (v) => overlay.opacity = v);

    const obj = k.add([
        k.sprite(spriteKey, { width: 120, height: 120 }),
        k.pos(k.center()),
        k.anchor("center"),
        k.fixed(),
        k.z(9600),
        k.scale(0.5),
    ]);
    k.tween(k.vec2(0.5), k.vec2(1), 0.3, (v) => obj.scale = v, k.easings.easeOutBack);

    // Clique fecha
    const listener = k.onClick(() => {
        k.tween(1, 0, 0.2, (v) => { overlay.opacity = v; obj.opacity = v; })
            .then(() => {
                k.destroy(overlay); k.destroy(obj);
                listener.cancel();
                stateContext.inDialog = false;
                if (onClose) onClose();
            });
    });
}