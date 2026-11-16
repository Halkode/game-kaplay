# Texturas e sprites

O jogo carrega sozinho qualquer PNG salvo em `src/assets/sprites/` (em qualquer subpasta).
O nome do arquivo é o nome do sprite. Se o arquivo não existir, o objeto aparece como um
retângulo colorido (placeholder) e o jogo continua funcionando.

Em `npm run dev`, o console do navegador lista os sprites que ainda estão em placeholder
(`[assets] N sprites usando placeholder`).

## Convenção de nomes

| Arquivo | Uso |
|---|---|
| `<sala>.parede.png` | Fundo repetido nas 4 paredes da sala (240x160 cada) |
| `<sala>.parede.<1-4>.png` | Fundo de uma parede específica (opcional, sobrescreve o anterior) |
| `<sala>.<objeto>.png` | Sprite do objeto |
| `<sala>.<objeto>.<estado>.png` | Variante usada quando o objeto está naquele estado (ex.: `quarto_um.janela.aberta.png`) |
| `item.<id>.png` | Ícone do item no inventário |
| `cena_<nome>.<estado>.png` | Ilustração de cutscene em tela cheia |

Um objeto pode usar outro nome com o campo `sprite` (ex.: todas as portas comuns usam
`porta_madeira`, todos os interruptores usam `interruptor`). Assim um único arquivo serve
para vários lugares.

Pastas sugeridas (o nome da pasta não importa para o código):
`salas/`, `objetos/`, `itens/`, `ui/`, `cenas/`.

## Pipeline de arte

A arte não é uma pilha de imagens soltas: tudo passa pelo mesmo caminho, para que as
salas combinem entre si.

```
art/spec.mjs  →  gerar (PixelLab / SpriteCook)  →  art/raw/  →  npm run art:build  →  src/assets/sprites/
                                                                    │
                                              npm run art:check  ←──┘  →  npm run art:preview
```

1. **Especificação** (`art/spec.mjs`): nome, tamanho exato, tipo, perspectiva e descrição
   de cada imagem. O teste `npm test` confere que os tamanhos batem com `w`/`h` das salas.
2. **Geração**: `npm run art:prompt -- <nome>` imprime o prompt completo (estilo,
   perspectiva, tom da sala) e a paleta. Gere em 2x ou maior; o tamanho final é ajustado.
3. **Importação**: `npm run art:import -- <arquivo.png> <nome>` guarda o original em
   `art/raw/` e gera o sprite final: converte para a paleta mestre, deixa o alfa
   binário, recorta o fundo vazio e reduz pela cor mais frequente de cada bloco
   (nunca interpola, então nada fica borrado).
4. **Verificação**: `npm run art:check` reprova tamanho errado, pixel semitransparente,
   cor fora da paleta, parede com furo ou objeto sem fundo transparente, e avisa
   quando um objeto está claro demais para o ambiente.
5. **Conferência no jogo**: `npm run art:preview` abre o jogo num navegador sem janela,
   fotografa cada parede de cada sala (estado inicial e com as variantes de estado) e
   monta `art/preview/index.html` e `preview.png`.
6. **Correção**: o que destoar é gerado de novo ou recebe `adjust` na especificação
   (brilho, saturação, matiz) e passa por `npm run art:build` outra vez.

### Identidade visual

- **Paleta mestre** (`art/palette.hex`, 46 cores): rampas escuras e pouco saturadas
  (neutro azulado, madeira, musgo, papel envelhecido, sangue, luz de lâmpada, noite).
  Todo sprite é convertido para ela; mudar a paleta e rodar `art:build` muda o jogo todo.
- **Perspectiva**: vista frontal ao nível dos olhos, sem ponto de fuga. Objetos de chão
  são vistos levemente de cima. Ícones de inventário em 3/4.
- **Paredes**: montadas por `scripts/art/walls.mjs` com a mesma estrutura em todas as
  salas: sombra do teto (y 0–3), papel de parede da sala (y 4–111,
  `art/textures/<sala>.papel.png`), rodapé e piso comuns (y 112–159,
  `art/textures/base_piso.png`). **A linha do chão é sempre y = 120.**
- **Luz**: vem de cima; sem sombras fortes, porque o jogo já escurece a cena à noite.
- **Brilho**: paredes com brilho médio até 0,42 e objetos até 0,62 (OKLab), para os
  objetos se destacarem sem parecer recortados. Pistas de papel podem ser mais claras
  (`destaque: true`).

## Lista de assets

Prioridade: **A** = essencial para a história; **B** = cenário; **C** = variante de estado.

<!-- art:docs:start -->
<!-- Gerado por `npm run art:docs` a partir de art/spec.mjs. Não edite à mão. -->

### Compartilhados

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `porta_madeira.png` | 24x52 | objeto | A | ok | plain dark wooden interior door with brass knob, closed |
| `interruptor.png` | 14x14 | objeto | A | ok | old cream bakelite light switch plate, toggle down |

### interruptor

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `interruptor.on.png` | 14x14 | estado | C | falta | same light switch, toggle up |

### quarto_um

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `quarto_um.parede.png` | 240x160 | parede | A | ok | bedroom wall, cold blue-grey plaster, dark baseboard, worn floorboards |
| `quarto_um.janela.png` | 40x34 | objeto | A | ok | sash window at night, moonless dark sky, wooden frame |
| `quarto_um.janela.aberta.png` | 40x34 | estado | C | falta | same sash window raised open, curtain blowing inward |
| `quarto_um.estante.png` | 40x36 | objeto | A | ok | small wooden bookshelf with old books |
| `quarto_um.escrivaninha.png` | 30x20 | objeto | A | ok | oak writing desk with a cup and a notebook |
| `quarto_um.quadro.png` | 30x24 | objeto | B | ok | oil painting of a bedroom window seen from outside, dark frame |
| `quarto_um.cama.png` | 52x30 | objeto | B | ok | single bed with messy grey sheets, dark wooden frame |
| `quarto_um.espelho.png` | 20x36 | objeto | B | ok | wall mirror with dark frame, dim reflection |

### corredor

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `corredor.parede.png` | 240x160 | parede | A | ok | hallway wall, grey peeling wallpaper, dark wainscot, floorboards |
| `corredor.escada.png` | 30x64 | objeto | A | ok | top of a wooden staircase going down, banister |
| `corredor.porta_esquerda.png` | 24x52 | objeto | A | ok | dark heavy door with built-in lock |
| `corredor.ventilacao.png` | 18x18 | objeto | A | ok | metal ventilation grille on a wall |
| `corredor.ventilacao.aberta.png` | 18x18 | estado | C | falta | grille removed, dark square hole in the wall |
| `corredor.papeis_chao.png` | 20x10 | objeto | B | ok | scattered papers on the floor |
| `corredor.papeis_chao2.png` | 25x12 | objeto | B | ok | old yellowed reports on the floor |
| `corredor.quadro_caido.png` | 26x18 | objeto | B | ok | fallen picture frame leaning face against the wall |
| `corredor.mancha_parede.png` | 22x22 | objeto | B | ok | dark reddish-brown stain on the wall |

### quarto_dois

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `quarto_dois.parede.png` | 240x160 | parede | A | ok | abandoned bedroom wall, dark moss-green damask wallpaper, floorboards |
| `quarto_dois.quadro.png` | 26x22 | objeto | A | ok | faded watercolor in a frame, slightly crooked |
| `quarto_dois.cofre.png` | 24x20 | objeto | A | ok | small wall safe with three dials |
| `quarto_dois.cofre.aberto.png` | 24x20 | estado | C | falta | same wall safe with door open, empty inside |
| `quarto_dois.mesa_diario.png` | 32x22 | objeto | A | ok | small table with an open diary and an oil lamp |
| `quarto_dois.radio.png` | 24x18 | objeto | A | ok | 1980s cassette radio recorder |
| `quarto_dois.radio.tocando.png` | 24x18 | estado | C | falta | same cassette radio playing, small red light on, reels visible |
| `quarto_dois.cama.png` | 55x32 | objeto | A | ok | bed with torn mattress, stuffing showing |
| `quarto_dois.cama.revirada.png` | 55x32 | estado | C | falta | same bed, mattress flipped and pushed aside |
| `quarto_dois.fita_cassete.png` | 12x8 | objeto | A | ok | black unlabeled cassette tape |
| `quarto_dois.calendario.png` | 28x22 | objeto | B | ok | wall calendar with day 14 circled in red |
| `quarto_dois.janela_selada.png` | 36x28 | objeto | B | ok | window sealed with tape along the edges |
| `quarto_dois.janela_selada.aberta.png` | 36x28 | estado | C | falta | same window, tape torn off, a scratched phrase on the frame |
| `quarto_dois.espelho_rachado.png` | 18x32 | objeto | B | ok | wall mirror cracked down the middle |
| `quarto_dois.manchas_chao.png` | 30x8 | objeto | B | ok | dark drag marks on the floorboards |

### sala

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `sala.parede.png` | 240x160 | parede | A | ok | old living room wall, dark brown patterned wallpaper, wainscot, floorboards |
| `sala.porta_exterior.png` | 26x56 | objeto | A | ok | reinforced front door with bolts |
| `sala.estante.png` | 38x62 | objeto | A | ok | tall bookcase with dusty books |
| `sala.estante.aberta.png` | 38x62 | estado | C | falta | same tall bookcase swung open like a door, dark gap behind |
| `sala.sofa.png` | 65x30 | objeto | A | ok | worn dark leather sofa |
| `sala.sofa.revirado.png` | 65x30 | estado | C | falta | same sofa with cushions thrown off and torn |
| `sala.cartao_visita.png` | 12x8 | objeto | A | ok | small business card on the floor |
| `sala.televisao.png` | 44x32 | objeto | B | ok | old CRT television showing grey static |
| `sala.televisao.desligada.png` | 44x32 | estado | C | falta | same CRT television switched off, black screen |
| `sala.telefone.png` | 18x16 | objeto | B | ok | wall telephone with the cord ripped out |
| `sala.quadro_fotos.png` | 30x24 | objeto | B | ok | frame holding several small photos |

### cozinha

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `cozinha.parede.png` | 240x160 | parede | A | ok | old kitchen wall, grimy grey-green tiles, dark counter line, floorboards |
| `cozinha.geladeira.png` | 38x62 | objeto | A | ok | 1970s refrigerator, dirty off-white enamel |
| `cozinha.geladeira.aberta.png` | 38x62 | estado | C | falta | same refrigerator open, weak inner light, nearly empty shelves |
| `cozinha.armario.png` | 38x65 | objeto | A | ok | tall wooden kitchen cupboard with a latch |
| `cozinha.armario.aberto.png` | 38x65 | estado | C | falta | same cupboard with doors open, few jars inside |
| `cozinha.mesa.png` | 60x40 | objeto | A | ok | heavy wooden kitchen table |
| `cozinha.mesa.movida.png` | 60x40 | estado | C | falta | same heavy table pushed to the side |
| `cozinha.alcapao.png` | 30x12 | objeto | A | ok | wooden trapdoor with an iron ring |
| `cozinha.nota_geladeira.png` | 12x8 | objeto | A | ok | paper note held by a magnet |
| `cozinha.fogao.png` | 40x30 | objeto | B | ok | old four-burner stove |
| `cozinha.pia.png` | 40x30 | objeto | B | ok | rusty steel sink on a cabinet |
| `cozinha.janela.png` | 36x28 | objeto | B | ok | small window with iron bars, night outside |
| `cozinha.porta_despensa.png` | 24x52 | objeto | A | ok | pantry door tied shut with thick rope |
| `cozinha.porta_despensa.aberta.png` | 24x52 | estado | C | falta | same pantry door, rope cut, door ajar with darkness behind |

### cozinha_devastada

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `cozinha_devastada.parede.png` | 240x160 | parede | A | ok | same old kitchen wall with rubble and broken roof tiles on the floor |
| `cozinha_devastada.buraco_telhado.png` | 60x20 | objeto | A | ok | hole in the ceiling with moonlight and broken rafters |
| `cozinha_devastada.mesa_quebrada.png` | 55x22 | objeto | A | ok | wooden table broken in half |
| `cozinha_devastada.perna_mesa.png` | 30x8 | objeto | A | ok | loose wooden table leg lying on the floor |
| `cozinha_devastada.destrocos_telha.png` | 20x10 | objeto | A | ok | shards of red clay roof tile |
| `cozinha_devastada.destrocos_telha2.png` | 18x8 | objeto | B | ok | long pointed shard of red clay tile |
| `cozinha_devastada.nota_chao.png` | 14x10 | objeto | A | ok | crumpled note on the floor |

### Itens do inventário

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `item.chave_velha.png` | 16x16 | item | B | ok | old rusty iron key |
| `item.chave_ventilacao.png` | 16x16 | item | B | falta | small key tied to a piece of string |
| `item.chave_despensa.png` | 16x16 | item | B | falta | key with a paper tag |
| `item.quadro_quarto.png` | 16x16 | item | B | falta | small framed painting |
| `item.mapa_casa.png` | 16x16 | item | B | falta | folded house floor plan with X marks |
| `item.foto_data.png` | 16x16 | item | B | falta | old photograph of two people |
| `item.relatorio_medico.png` | 16x16 | item | B | falta | medical report folder stamped ARCHIVED |
| `item.fita_cassete.png` | 16x16 | item | B | falta | black cassette tape |
| `item.cartao_dm.png` | 16x16 | item | B | falta | small business card |
| `item.fragmento_telha.png` | 16x16 | item | B | falta | sharp shard of red clay tile |
| `item.telha_pontiaguda.png` | 16x16 | item | B | falta | long pointed red clay tile shard |
| `item.perna_mesa.png` | 16x16 | item | B | falta | wooden table leg |
| `item.faca_cozinha.png` | 16x16 | item | B | falta | kitchen knife |
| `item.lanterna.png` | 16x16 | item | B | falta | small flashlight |

### Telas cheias

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `cena_janela.fechada.png` | 240x160 | cena | A | ok | close-up of a closed sash window at night from inside |
| `cena_janela.aberta.png` | 240x160 | cena | A | ok | close-up of the same window open, cold night air |
| `quintal.fundo.png` | 240x160 | cena | B | falta | backyard at night, tall grass, old wooden fence, the house behind |

### Interface

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `ui_mochila.png` | 16x16 | ui | A | ok | backpack icon |
| `ui.botao.png` | 24x12 | ui | A | ok | button frame (9-slice) |
| `ui.painel.png` | 48x48 | ui | A | ok | panel frame (9-slice) |
| `ui.coracao.png` | 16x16 | ui | A | ok | heart icon |
| `ui.engrenagem.png` | 16x16 | ui | A | ok | gear icon |
| `ui_pausa.png` | 64x64 | ui | C | ok | pause icon (não usado) |

### Minigame da estante

| Arquivo | Tamanho | Tipo | Prior. | Status | Descrição |
|---|---|---|---|---|---|
| `estante.fundo.png` | 220x128 | minigame | A | ok | bookshelf close-up background |
| `livro_amarelo.png` | 20x40 | minigame | A | ok | amarelo book spine |
| `livro_azul.png` | 18x40 | minigame | A | ok | azul book spine |
| `livro_bege.png` | 21x40 | minigame | A | ok | bege book spine |
| `livro_cinza.png` | 7x40 | minigame | A | ok | cinza book spine |
| `livro_marrom.png` | 15x40 | minigame | A | ok | marrom book spine |
| `livro_preto.png` | 8x40 | minigame | A | ok | preto book spine |
| `livro_roxo.png` | 17x40 | minigame | A | ok | roxo book spine |
| `livro_verde.png` | 9x40 | minigame | A | ok | verde book spine |
| `livro_vermelho.png` | 11x40 | minigame | A | ok | vermelho book spine |

**Total:** 72/100 presentes.
<!-- art:docs:end -->
