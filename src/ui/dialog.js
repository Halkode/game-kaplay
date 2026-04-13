// Sistema de diálogos do jogo.
//
// Exports:
//   showDialog(k, title, content, onEnd)
//     Diálogo simples com typewriter. Clique avança/finaliza.
//
//   showDialogChain(k, pages, onEnd)
//     Sequência de diálogos automáticos. pages = [{title, content}, ...]
//
//   showChoiceDialog(k, title, content, choices, onChoice)
//     Diálogo com botões de escolha. choices = [{label, value}, ...]
//     onChoice(value) é chamado com o valor da opção escolhida.

// ── Utilitário interno ──────────────────────────────────────────────────────

function _buildBox(k) {
    const box = k.add([
        k.rect(k.width() - 20, 54, { radius: 4 }),
        k.pos(10, k.height() - 64),
        k.color(8, 8, 14),
        k.outline(2, k.Color.fromHex("#c8b090")),
        k.fixed(),
        k.z(10000),
        k.area(),
        "dialog",
    ]);
    return box;
}

function _addTitle(k, box, title) {
    box.add([
        k.text(title, { size: 7 }),
        k.pos(6, 4),
        k.color(255, 220, 100),
    ]);
}

function _typewrite(k, box, content, onFinish) {
    const contentText = box.add([
        k.text("", { size: 6, width: k.width() - 32 }),
        k.pos(6, 16),
        k.color(240, 235, 225),
    ]);

    let count = 0;
    const total = content.length;
    let finished = false;

    const timer = k.loop(0.028, () => {
        count = Math.min(count + 1, total);
        contentText.text = content.substring(0, count);
        if (count >= total) {
            timer.cancel();
            finished = true;
            if (onFinish) onFinish();
        }
    });

    // Retorna função para "pular" o typewriter
    return {
        skip() {
            if (!finished) {
                timer.cancel();
                count = total;
                contentText.text = content;
                finished = true;
                if (onFinish) onFinish();
            }
        },
        get done() { return finished; },
    };
}

// ── API PÚBLICA ─────────────────────────────────────────────────────────────

/**
 * Diálogo simples com typewriter. Clique avança/finaliza.
 * @param {function} [onShow] — callback executado imediatamente ao exibir o diálogo
 */
export function showDialog(k, title, content, onEnd, onShow) {
    if (onShow) onShow();

    const box = _buildBox(k);
    _addTitle(k, box, title);
    const tw = _typewrite(k, box, content);

    // Indicador "▶" piscante no canto inferior direito (aparece ao terminar)
    const arrow = box.add([
        k.text("▶", { size: 5 }),
        k.pos(k.width() - 38, 44),
        k.color(255, 220, 100),
        k.opacity(0),
    ]);
    k.loop(0.5, () => {
        if (!box.exists()) return;
        if (tw.done) arrow.opacity = arrow.opacity > 0 ? 0 : 1;
    });

    const listener = k.onClick(() => {
        if (!tw.done) { tw.skip(); return; }
        k.destroy(box);
        listener.cancel();
        if (onEnd) onEnd();
    });
}

/**
 * Sequência de múltiplos diálogos encadeados.
 * pages = [ { title, content, onShow? }, ... ]
 * onShow é chamado imediatamente quando cada diálogo é exibido.
 */
export function showDialogChain(k, pages, onEnd) {
    function showPage(index) {
        if (index >= pages.length) {
            if (onEnd) onEnd();
            return;
        }
        const { title, content, onShow } = pages[index];
        showDialog(k, title, content, () => showPage(index + 1), onShow);
    }
    showPage(0);
}

/**
 * Diálogo com escolha entre opções.
 * choices = [ { label: "Texto", value: "identificador" }, ... ]
 * onChoice(value) é chamado quando o jogador escolhe.
 */
export function showChoiceDialog(k, title, content, choices, onChoice) {
    const box = _buildBox(k);

    // Caixa um pouco mais alta para comportar os botões
    // Reposiciona e redimensiona dynamicamente
    box.pos.y = k.height() - 74;

    _addTitle(k, box, title);

    // Texto (sem typewriter para não atrasar a escolha)
    box.add([
        k.text(content, { size: 6, width: k.width() - 32 }),
        k.pos(6, 15),
        k.color(240, 235, 225),
    ]);

    // Botões de escolha
    const BTN_W = Math.floor((k.width() - 28 - (choices.length - 1) * 4) / choices.length);
    const BTN_H = 13;
    const BTN_Y = 42;

    choices.forEach((choice, i) => {
        const btnX = 4 + i * (BTN_W + 4);

        const btn = box.add([
            k.rect(BTN_W, BTN_H, { radius: 2 }),
            k.pos(btnX, BTN_Y),
            k.color(k.Color.fromHex("#2a2040")),
            k.outline(1, k.Color.fromHex("#9080c0")),
            k.area(),
        ]);

        btn.add([
            k.text(choice.label, { size: 5, width: BTN_W - 4 }),
            k.pos(BTN_W / 2, BTN_H / 2),
            k.anchor("center"),
            k.color(220, 210, 255),
        ]);

        btn.onHover(() => {
            btn.color = k.Color.fromHex("#4a3870");
            k.setCursor("pointer");
        });
        btn.onHoverEnd(() => {
            btn.color = k.Color.fromHex("#2a2040");
            k.setCursor("default");
        });

        btn.onClick(() => {
            k.destroy(box);
            k.setCursor("default");
            if (onChoice) onChoice(choice.value);
        });
    });
}
