// Carregamento automático de sprites.
//
// Qualquer PNG dentro de src/assets/sprites/** é registrado com o nome do
// arquivo (sem extensão). Para adicionar uma textura nova basta salvar o
// arquivo com o nome certo; nenhum código precisa mudar.
//
// Convenção de nomes (veja ASSETS.md):
//   <sala>.<objeto>.png           → sprite padrão do objeto
//   <sala>.<objeto>.<estado>.png  → sprite usado quando o objeto está nesse estado
//   <sala>.parede.png             → fundo repetido nas 4 paredes da sala
//   <sala>.parede.<1-4>.png       → fundo de uma parede específica
//   item.<id>.png                 → ícone do item no inventário
//
// Se o arquivo não existir, o jogo desenha um retângulo colorido (placeholder).

const files = import.meta.glob("./sprites/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
});

const available = new Map();
for (const [path, url] of Object.entries(files)) {
    const name = path.split("/").pop().replace(/\.png$/, "");
    if (available.has(name)) {
        console.warn(`[assets] Nome de sprite duplicado: "${name}" (${path})`);
    }
    available.set(name, url);
}

const requested = new Set();
const reported = new Set();

export function loadAllSprites(k) {
    for (const [name, url] of available) {
        k.loadSprite(name, url);
    }
}

export function hasSprite(name) {
    return !!name && available.has(name);
}

/**
 * Escolhe o sprite mais específico que existir para um objeto.
 * Ex.: resolveSprite("quarto_um.janela", "aberta")
 *      → "quarto_um.janela.aberta" ou "quarto_um.janela" ou null
 */
export function resolveSprite(base, state) {
    if (!base) return null;
    if (state) {
        const withState = `${base}.${state}`;
        if (available.has(withState)) return withState;
    }
    requested.add(base);
    return available.has(base) ? base : null;
}

/** Lista no console (uma vez cada) os sprites que o jogo procurou e não encontrou. */
export function reportMissingSprites() {
    const missing = [...requested].filter((n) => !available.has(n) && !reported.has(n)).sort();
    missing.forEach((n) => reported.add(n));
    if (missing.length) {
        console.info(`[assets] ${missing.length} sprites usando placeholder:`, missing);
    }
    return missing;
}
