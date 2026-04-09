export function fadeOut(k, duration = 0.5) {
    return new Promise(resolve => {
        const overlay = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.fixed(),
            k.color(0, 0, 0),
            k.opacity(0),
            k.z(99999),
        ]);
        k.tween(0, 1, duration, (v) => overlay.opacity = v, k.easings.easeInQuad)
            .then(resolve);
    });
}

export function fadeIn(k, duration = 0.5) {
    const overlay = k.add([
        k.rect(k.width(), k.height()), k.pos(0, 0), k.fixed(),
        k.color(0, 0, 0), k.opacity(1), k.z(99999),
    ]);
    k.tween(1, 0, duration, (v) => overlay.opacity = v, k.easings.easeOutQuad)
        .then(() => k.destroy(overlay));
}