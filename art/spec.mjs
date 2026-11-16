// Especificação de arte: a fonte única de verdade para cada imagem do jogo.
//
// Cada entrada diz o nome do sprite, o tamanho exato, o tipo (que define as
// regras de transparência), a perspectiva e a descrição usada para gerar a
// imagem no PixelLab ou no SpriteCook.
//
// Os tamanhos dos objetos precisam bater com `w`/`h` das entidades em
// src/data/rooms/ (o teste tests/art.test.mjs confere isso).
//
// Comandos:
//   npm run art:prompt -- <nome>   imprime o prompt e a paleta para gerar
//   npm run art:import -- <png> <nome>   processa uma imagem gerada
//   npm run art:build              reprocessa tudo de art/raw/
//   npm run art:check              verifica tamanho, transparência e paleta
//   npm run art:preview            captura as salas dentro do jogo
//   npm run art:docs               atualiza as tabelas do ASSETS.md

// ── Guia de estilo ───────────────────────────────────────────────────────────

export const STYLE = {
    base: "16-bit pixel art, horror point-and-click adventure, dark muted desaturated palette, soft flat lighting, no outline glow, no text",
    // Vista frontal ao nível dos olhos: a câmera olha reto para a parede.
    perspective: {
        parede: "straight-on front view of one interior wall at eye level, orthographic, no vanishing point, floorboards strip at the bottom",
        objeto: "straight-on front elevation view at eye level, orthographic, no perspective, no visible top surface",
        chao: "seen slightly from above at a shallow angle, lying flat on wooden floorboards",
        item: "single inventory icon, centered, slight 3/4 view, readable silhouette",
        cena: "close-up full-screen illustration, front view",
        ui: "flat game UI element",
    },
    light: "dim interior light from above-left, no strong cast shadows (the game darkens the scene at night)",
};

/** Limites usados pela verificação (OKLab, 0 = preto, 1 = branco). */
export const LIMITS = {
    // Brilho médio máximo. Paredes escuras para os objetos se destacarem.
    meanLightness: { parede: 0.42, cena: 0.5, objeto: 0.62, item: 0.7, ui: 0.7, minigame: 0.66 },
    // Linha do chão nas paredes (y >= 120 é piso).
    floorY: 120,
};

// Tom dominante de cada sala (rampas de art/palette.hex).
export const ROOM_TONES = {
    quarto_um: "azul-acinzentado frio",
    corredor: "cinza neutro com papel amarelado",
    quarto_dois: "verde-musgo escuro",
    sala: "marrom madeira",
    cozinha: "azulejo cinza-esverdeado encardido, madeira escura",
    cozinha_devastada: "mesmo da cozinha, com poeira e cacos vermelhos",
    quintal: "noite azul-escura, mato verde-musgo",
};

// ── Tipos ────────────────────────────────────────────────────────────────────
// parede/cena: opaca, 240x160.
// objeto/estado: fundo transparente, alfa binário. `cheio: true` permite
//   ocupar a caixa inteira (porta embutida, grelha).
// item: ícone 16x16 transparente.
// destaque: pista que precisa chamar atenção (papel, bilhete); pode ser mais clara.
// adjust: { lightness, chroma, hue, hueMix } corrige o tom antes da paleta.

const FOLDER = { parede: "salas", cena: "cenas", objeto: "objetos", estado: "objetos", item: "itens", ui: "ui", minigame: "minigame" };

const parede = (name, desc, extra = {}) => ({ name, kind: "parede", w: 240, h: 160, prio: "A", desc, ...extra });
const obj = (name, w, h, prio, desc, extra = {}) => ({ name, kind: "objeto", w, h, prio, desc, view: "objeto", ...extra });
const chao = (name, w, h, prio, desc, extra = {}) => obj(name, w, h, prio, desc, { view: "chao", ...extra });
const estado = (base, state, desc, extra = {}) => ({ name: `${base}.${state}`, base, state, kind: "estado", prio: "C", desc, ...extra });
const item = (id, desc, extra = {}) => ({ name: `item.${id}`, kind: "item", w: 16, h: 16, prio: "B", desc, view: "item", ...extra });

const LIST = [
    // Compartilhados
    obj("porta_madeira", 24, 52, "A", "plain dark wooden interior door with brass knob, closed", { room: "*", cheio: true }),
    obj("interruptor", 14, 14, "A", "old cream bakelite light switch plate, toggle down", { room: "*", adjust: { lightness: 0.8, chroma: 0.8 } }),
    estado("interruptor", "on", "same light switch, toggle up"),

    // Quarto inicial
    parede("quarto_um.parede", "bedroom wall, cold blue-grey plaster, dark baseboard, worn floorboards"),
    obj("quarto_um.janela", 40, 34, "A", "sash window at night, moonless dark sky, wooden frame"),
    estado("quarto_um.janela", "aberta", "same sash window raised open, curtain blowing inward"),
    obj("quarto_um.estante", 40, 36, "A", "small wooden bookshelf with old books"),
    obj("quarto_um.escrivaninha", 30, 20, "A", "oak writing desk with a cup and a notebook"),
    obj("quarto_um.quadro", 30, 24, "B", "oil painting of a bedroom window seen from outside, dark frame"),
    obj("quarto_um.cama", 52, 30, "B", "single bed with messy grey sheets, dark wooden frame"),
    obj("quarto_um.espelho", 20, 36, "B", "wall mirror with dark frame, dim reflection"),

    // Corredor
    parede("corredor.parede", "hallway wall, grey peeling wallpaper, dark wainscot, floorboards"),
    obj("corredor.escada", 30, 64, "A", "top of a wooden staircase going down, banister", { adjust: { chroma: 0.5, hue: 55, hueMix: 0.7 } }),
    obj("corredor.porta_esquerda", 24, 52, "A", "dark heavy door with built-in lock", { cheio: true }),
    obj("corredor.ventilacao", 18, 18, "A", "metal ventilation grille on a wall", { cheio: true }),
    estado("corredor.ventilacao", "aberta", "grille removed, dark square hole in the wall", { cheio: true }),
    chao("corredor.papeis_chao", 20, 10, "B", "scattered papers on the floor", { destaque: true }),
    chao("corredor.papeis_chao2", 25, 12, "B", "old yellowed reports on the floor"),
    chao("corredor.quadro_caido", 26, 18, "B", "fallen picture frame leaning face against the wall"),
    obj("corredor.mancha_parede", 22, 22, "B", "dark reddish-brown stain on the wall", { adjust: { lightness: 0.75, chroma: 0.7, hue: 35, hueMix: 0.5 } }),

    // Quarto dois
    parede("quarto_dois.parede", "abandoned bedroom wall, dark moss-green damask wallpaper, floorboards"),
    obj("quarto_dois.quadro", 26, 22, "A", "faded watercolor in a frame, slightly crooked"),
    obj("quarto_dois.cofre", 24, 20, "A", "small wall safe with three dials"),
    estado("quarto_dois.cofre", "aberto", "same wall safe with door open, empty inside"),
    obj("quarto_dois.mesa_diario", 32, 22, "A", "small table with an open diary and an oil lamp"),
    obj("quarto_dois.radio", 24, 18, "A", "1980s cassette radio recorder"),
    estado("quarto_dois.radio", "tocando", "same cassette radio playing, small red light on, reels visible"),
    obj("quarto_dois.cama", 55, 32, "A", "bed with torn mattress, stuffing showing"),
    estado("quarto_dois.cama", "revirada", "same bed, mattress flipped and pushed aside"),
    chao("quarto_dois.fita_cassete", 12, 8, "A", "black unlabeled cassette tape"),
    obj("quarto_dois.calendario", 28, 22, "B", "wall calendar with day 14 circled in red"),
    obj("quarto_dois.janela_selada", 36, 28, "B", "window sealed with tape along the edges"),
    estado("quarto_dois.janela_selada", "aberta", "same window, tape torn off, a scratched phrase on the frame"),
    obj("quarto_dois.espelho_rachado", 18, 32, "B", "wall mirror cracked down the middle"),
    chao("quarto_dois.manchas_chao", 30, 8, "B", "dark drag marks on the floorboards"),

    // Sala
    parede("sala.parede", "old living room wall, dark brown patterned wallpaper, wainscot, floorboards"),
    obj("sala.porta_exterior", 26, 56, "A", "reinforced front door with bolts", { cheio: true, adjust: { chroma: 0.5, hue: 55, hueMix: 0.9 } }),
    obj("sala.estante", 38, 62, "A", "tall bookcase with dusty books"),
    estado("sala.estante", "aberta", "same tall bookcase swung open like a door, dark gap behind"),
    obj("sala.sofa", 65, 30, "A", "worn dark leather sofa"),
    estado("sala.sofa", "revirado", "same sofa with cushions thrown off and torn"),
    chao("sala.cartao_visita", 12, 8, "A", "small business card on the floor", { destaque: true }),
    obj("sala.televisao", 44, 32, "B", "old CRT television showing grey static"),
    estado("sala.televisao", "desligada", "same CRT television switched off, black screen"),
    obj("sala.telefone", 18, 16, "B", "wall telephone with the cord ripped out"),
    obj("sala.quadro_fotos", 30, 24, "B", "frame holding several small photos"),

    // Cozinha (normal)
    parede("cozinha.parede", "old kitchen wall, grimy grey-green tiles, dark counter line, floorboards"),
    obj("cozinha.geladeira", 38, 62, "A", "1970s refrigerator, dirty off-white enamel", { adjust: { lightness: 0.68, chroma: 0.5 } }),
    estado("cozinha.geladeira", "aberta", "same refrigerator open, weak inner light, nearly empty shelves"),
    obj("cozinha.armario", 38, 65, "A", "tall wooden kitchen cupboard with a latch"),
    estado("cozinha.armario", "aberto", "same cupboard with doors open, few jars inside"),
    obj("cozinha.mesa", 60, 40, "A", "heavy wooden kitchen table", { adjust: { lightness: 0.85, chroma: 0.5, hue: 55, hueMix: 0.6 } }),
    estado("cozinha.mesa", "movida", "same heavy table pushed to the side"),
    chao("cozinha.alcapao", 30, 12, "A", "wooden trapdoor with an iron ring"),
    obj("cozinha.nota_geladeira", 12, 8, "A", "paper note held by a magnet", { destaque: true }),
    obj("cozinha.fogao", 40, 30, "B", "old four-burner stove", { adjust: { lightness: 0.75, chroma: 0.6 } }),
    obj("cozinha.pia", 40, 30, "B", "rusty steel sink on a cabinet", { adjust: { lightness: 0.78, chroma: 0.6 } }),
    obj("cozinha.janela", 36, 28, "B", "small window with iron bars, night outside"),
    obj("cozinha.porta_despensa", 24, 52, "A", "pantry door tied shut with thick rope", { cheio: true }),
    estado("cozinha.porta_despensa", "aberta", "same pantry door, rope cut, door ajar with darkness behind", { cheio: true }),

    // Cozinha devastada
    parede("cozinha_devastada.parede", "same old kitchen wall with rubble and broken roof tiles on the floor"),
    obj("cozinha_devastada.buraco_telhado", 60, 20, "A", "hole in the ceiling with moonlight and broken rafters", { adjust: { lightness: 0.8, chroma: 0.5 } }),
    obj("cozinha_devastada.mesa_quebrada", 55, 22, "A", "wooden table broken in half", { adjust: { lightness: 0.8, chroma: 0.6, hue: 55, hueMix: 0.6 } }),
    chao("cozinha_devastada.perna_mesa", 30, 8, "A", "loose wooden table leg lying on the floor"),
    chao("cozinha_devastada.destrocos_telha", 20, 10, "A", "shards of red clay roof tile"),
    chao("cozinha_devastada.destrocos_telha2", 18, 8, "B", "long pointed shard of red clay tile"),
    chao("cozinha_devastada.nota_chao", 14, 10, "A", "crumpled note on the floor", { destaque: true }),

    // Itens (ids em src/data/items.js)
    item("chave_velha", "old rusty iron key"),
    item("chave_ventilacao", "small key tied to a piece of string"),
    item("chave_despensa", "key with a paper tag"),
    item("quadro_quarto", "small framed painting"),
    item("mapa_casa", "folded house floor plan with X marks"),
    item("foto_data", "old photograph of two people"),
    item("relatorio_medico", "medical report folder stamped ARCHIVED"),
    item("fita_cassete", "black cassette tape"),
    item("cartao_dm", "small business card"),
    item("fragmento_telha", "sharp shard of red clay tile"),
    item("telha_pontiaguda", "long pointed red clay tile shard"),
    item("perna_mesa", "wooden table leg"),
    item("faca_cozinha", "kitchen knife"),
    item("lanterna", "small flashlight"),

    // Outras telas
    { name: "cena_janela.fechada", kind: "cena", w: 240, h: 160, prio: "A", view: "cena", desc: "close-up of a closed sash window at night from inside" },
    { name: "cena_janela.aberta", kind: "cena", w: 240, h: 160, prio: "A", view: "cena", desc: "close-up of the same window open, cold night air" },
    { name: "quintal.fundo", kind: "cena", w: 240, h: 160, prio: "B", view: "cena", desc: "backyard at night, tall grass, old wooden fence, the house behind" },

    // Interface
    { name: "ui_mochila", kind: "ui", w: 16, h: 16, prio: "A", desc: "backpack icon" },
    { name: "ui.botao", kind: "ui", w: 24, h: 12, prio: "A", desc: "button frame (9-slice)" },
    { name: "ui.painel", kind: "ui", w: 48, h: 48, prio: "A", desc: "panel frame (9-slice)", cheio: true },
    { name: "ui.coracao", kind: "ui", w: 16, h: 16, prio: "A", desc: "heart icon" },
    { name: "ui.engrenagem", kind: "ui", w: 16, h: 16, prio: "A", desc: "gear icon" },
    { name: "ui_pausa", kind: "ui", w: 64, h: 64, prio: "C", desc: "pause icon (não usado)" },

    // Minigame da estante (tamanhos próprios, desenhados em tamanho natural)
    { name: "estante.fundo", kind: "minigame", w: 220, h: 128, prio: "A", desc: "bookshelf close-up background", cheio: true },
    ...[["amarelo", 20], ["azul", 18], ["bege", 21], ["cinza", 7], ["marrom", 15], ["preto", 8], ["roxo", 17], ["verde", 9], ["vermelho", 11]].map(
        ([cor, w]) => ({ name: `livro_${cor}`, kind: "minigame", w, h: 40, prio: "A", desc: `${cor} book spine`, cheio: true })
    ),
];

// Estados herdam tamanho e pasta do objeto base.
const byName = new Map(LIST.map((a) => [a.name, a]));
for (const a of LIST) {
    if (a.kind === "estado") {
        const base = byName.get(a.base);
        if (!base) throw new Error(`Estado ${a.name} sem objeto base ${a.base}`);
        a.w = base.w;
        a.h = base.h;
        a.view = base.view;
        a.cheio = a.cheio ?? base.cheio;
    }
    a.folder = FOLDER[a.kind];
    a.view = a.view || (a.kind === "parede" ? "parede" : a.kind === "cena" ? "cena" : "ui");
    a.room = a.room || (a.kind === "item" ? null : a.name.split(".")[0]);
}

export const ASSETS = LIST;
export const ASSET_BY_NAME = byName;

/** Prompt completo para PixelLab / SpriteCook. */
export function promptFor(asset) {
    const tone = ROOM_TONES[asset.room] ? `, ${ROOM_TONES[asset.room]} tones` : "";
    const bg = ["parede", "cena"].includes(asset.kind) ? "" : ", isolated on transparent background";
    return `${STYLE.base}, ${STYLE.perspective[asset.view]}, ${asset.desc}${tone}${bg}, ${STYLE.light}`;
}
