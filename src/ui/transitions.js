// Transições de cena para o jogo.
//
// Exports:
//   fadeIn(k, duration)        — Fade de preto → transparente ao entrar na cena
//   fadeOut(k, duration)       — Promise: fade transparente → preto (para await antes de k.go)
//   fadeOutAndGo(k, scene, dur)— Atalho: faz fadeOut e então chama k.go(scene)

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fade-in ao entrar numa cena.
 * Adiciona um rect preto que desaparece progressivamente e depois se destrói.
 */
export function fadeIn(k, duration = 0.5) {
    const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(0, 0, 0),
        k.opacity(1),
        k.z(99999),
    ]);
    k.tween(1, 0, duration,
        (v) => { if (overlay.exists()) overlay.opacity = v; },
        k.easings.easeOutQuad
    ).then(() => { if (overlay.exists()) k.destroy(overlay); });
}

/**
 * Fade-out antes de trocar de cena.
 * Retorna uma Promise que resolve quando a animação termina.
 * O overlay permanece visível até k.go() destruir a cena.
 */
export function fadeOut(k, duration = 0.45) {
    return new Promise((resolve) => {
        const overlay = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.fixed(),
            k.color(0, 0, 0),
            k.opacity(0),
            k.z(99999),
        ]);
        k.tween(0, 1, duration,
            (v) => { if (overlay.exists()) overlay.opacity = v; },
            k.easings.easeInQuad
        ).then(resolve);
    });
}

/**
 * Atalho: faz fadeOut e troca de cena em seguida.
 * Elimina o boilerplate de "await fadeOut; k.go()" nos handlers.
 *
 * @param {object}  k        — instância Kaplay
 * @param {string}  scene    — nome da cena destino
 * @param {number}  duration — duração do fade (segundos)
 * @param {object}  data     — dados opcionais passados para k.go()
 */
export function fadeOutAndGo(k, scene, duration = 0.4, data = undefined) {
    const overlay = k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.fixed(),
        k.color(0, 0, 0),
        k.opacity(0),
        k.z(99999),
    ]);
    k.tween(0, 1, duration,
        (v) => { if (overlay.exists()) overlay.opacity = v; },
        k.easings.easeInQuad
    ).then(() => k.go(scene, data));
}