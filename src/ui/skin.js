// Aplica a textura de painel/botão (ui.painel, ui.botao) num retângulo de UI.
// O retângulo continua existindo (área de clique e posição dos filhos), só fica
// invisível. Sem o PNG, nada muda e o retângulo colorido aparece como antes.
// Chamar logo depois de criar o nó, antes de adicionar texto, para a textura
// ficar atrás do conteúdo.

import { hasSprite } from "../assets/loader.js";

export function skin(k, node, w, h, { sprite = "ui.painel", anchor = "center" } = {}) {
    if (!hasSprite(sprite)) return null;
    node.opacity = 0;
    if (node.outline) node.outline.width = 0;
    // Sprites slice9 desenham errado com anchor "center" no Kaplay 3001,
    // então sempre usamos topleft e deslocamos.
    const offset = anchor === "center" ? k.vec2(-w / 2, -h / 2) : k.vec2(0, 0);
    return node.add([k.sprite(sprite, { width: w, height: h }), k.pos(offset), k.anchor("topleft")]);
}
