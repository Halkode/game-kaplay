# Jogo Kaplay

Jogo de suspense point-and-click feito com [Kaplay](https://kaplayjs.com) + Vite.
Resolução interna 240x160, ampliada 3x.

```sh
npm install
npm run dev     # http://localhost:3001
npm run build   # gera dist/
npm run zip     # build + dist/game.zip (itch.io etc.)
```

## Estrutura

```
src/
  main.js                 inicia o Kaplay, carrega sprites, registra cenas
  config/
    game.js               resolução, escala, cena inicial
    navigation.js         câmera por mouse ou botões (touch)
  core/
    state.js              gameState (fonte única) + resetGameState()
  assets/
    loader.js             carrega todo PNG de assets/sprites/** automaticamente
    sprites/              texturas (ver ASSETS.md)
    cursores/             cursor e ponteiro
  data/                   CONTEÚDO do jogo (o que muda com frequência)
    rooms/                uma sala por arquivo: layout + estado + lógica
    items.js              catálogo de itens (id → nome, descrição)
    endings.js            finais
  systems/                REGRAS (raramente mudam)
    interactions.js       motor de interações (ctx, ações padrão)
    timeAndLight.js       relógio, escuridão; advanceTime() também avança ferimentos
    injuries.js           ferimentos por parte do corpo
    cutscenes.js          pulo pela janela
    animations.js         flicker, flash, shake, partículas
  scenes/
    roomScene.js          cena genérica de sala (desenho, clique, câmera, wrap)
    bookshelf.js          minigame da estante
    menu.js, quintal.js, credits.js
  ui/                     HUD, diálogos, inventário, saúde, configurações, menu radial
```

## Como uma sala funciona

Cada entidade em `src/data/rooms/<sala>.js` descreve tudo de um objeto num lugar só:

```js
{
    id: "cofre", label: "Cofre",
    x: 500, y: 80, w: 24, h: 20, color: "#3a3a3a", // posição (centro), tamanho e cor do placeholder
    initial: "oculto", hiddenWhen: ["oculto"],     // estado inicial; some enquanto oculto
    actions: ["Examinar", "Usar"],                  // opções do menu radial
    on: {
        Examinar: "Três discos giratórios.",        // texto simples
        Usar(ctx) {                                 // ou lógica
            if (!ctx.flag("leu_diario")) return [["Cofre", "Precisa da combinação."]];
            ctx.setState("aberto");
            ctx.give("foto_data");
            return "Um clique seco. O cofre abre.";
        },
    },
}
```

- `exit: { to, requires, text, ending }` transforma a entidade em porta/passagem
  (o "Usar" padrão já trata chave e transição).
- `ctx` tem: `state`, `setState`, `has`, `give`, `take`, `flag`, `setFlag`, `count`,
  `say`, `chain`, `choose`, `advance`, `injure`, `pickUp`, `exit`, `goTo`.
- O sprite é achado pelo nome `<sala>.<id>.png` (e `<sala>.<id>.<estado>.png`).
  Sem arquivo, vira retângulo colorido. Ver [ASSETS.md](ASSETS.md).

### Depuração

Em `npm run dev`, no console do navegador:

```js
__room.act("cofre", "Usar")     // executa uma ação sem clicar
__room.state                    // gameState inteiro
__room.state.addItem("chave_velha")
```
