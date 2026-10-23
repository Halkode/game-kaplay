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

## Diretrizes de arte (para SpriteCook / PixelLab)

- **Resolução interna:** 240x160, ampliada 3x com `crisp`. Gere pixel art **no tamanho exato
  da tabela** (ou 2x e reduza com nearest-neighbor). Imagens de 1024px reduzidas para 20px
  ficam borradas e pesam MB à toa.
- **Vista:** frontal, lateral, plana, como uma parede vista de frente (estilo point-and-click).
- **Fundo transparente** em todos os objetos e itens. Paredes são opacas.
- **Paleta:** escura e fria (azul-acinzentado, marrom, verde-musgo), contraste baixo.
  A camada de escuridão do jogo já escurece tudo à noite, então não pinte sombras pesadas.
- **Paredes:** a faixa de chão fica em `y >= 120` (últimos 40px). Objetos de chão
  encostam nessa linha.
- **Prompt base sugerido:** `pixel art, 16-bit horror adventure, front view, dark muted
  palette, flat lighting, transparent background, <objeto>, <W>x<H> pixels`.

## Lista de assets

Prioridade: **A** = aparece no começo ou é essencial para o puzzle; **B** = cenário;
**C** = variante de estado (opcional).

### Compartilhados

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `porta_madeira.png` | 24x52 | A | **existe** | Porta de madeira comum (usada em 5 portas) |
| `interruptor.png` | 14x14 | A | **existe** | Interruptor de parede antigo |

### Quarto inicial (`quarto_um`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `quarto_um.parede.png` | 240x160 | A | **existe** | Parede azul-acinzentada com rodapé e piso de tábuas |
| `quarto_um.janela.png` | 40x34 | A | **existe** | Janela de guilhotina, noite sem lua |
| `quarto_um.janela.aberta.png` | 40x34 | C | falta | Janela aberta, cortina ao vento |
| `quarto_um.estante.png` | 40x36 | A | **existe** | Estante de livros |
| `quarto_um.escrivaninha.png` | 30x20 | A | **existe** | Escrivaninha de carvalho, xícara e caderno |
| `quarto_um.quadro.png` | 30x24 | B | **existe** | Pintura a óleo de um quarto visto de fora |
| `quarto_um.cama.png` | 52x30 | B | **existe** | Cama de solteiro com lençóis revirados |
| `quarto_um.espelho.png` | 20x36 | B | **existe** | Espelho de parede com moldura escura |

### Corredor (`corredor`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `corredor.parede.png` | 240x160 | A | **existe** | Corredor cinza, papel de parede descascando |
| `corredor.escada.png` | 30x64 | A | **existe** | Topo de escada de madeira descendo |
| `corredor.porta_esquerda.png` | 24x52 | A | **existe** | Porta escura com cadeado embutido |
| `corredor.ventilacao.png` | 18x18 | A | **existe** | Grelha de ventilação metálica |
| `corredor.ventilacao.aberta.png` | 18x18 | C | falta | Grelha removida, buraco escuro |
| `corredor.papeis_chao.png` | 20x10 | B | **existe** | Papéis espalhados no chão |
| `corredor.papeis_chao2.png` | 25x12 | B | **existe** | Relatórios antigos amarelados |
| `corredor.quadro_caido.png` | 26x18 | B | **existe** | Quadro caído, virado contra a parede |
| `corredor.mancha_parede.png` | 22x22 | B | **existe** | Mancha marrom-avermelhada na parede |

### Quarto dois (`quarto_dois`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `quarto_dois.parede.png` | 240x160 | A | **existe** | Quarto verde-escuro, abandonado |
| `quarto_dois.quadro.png` | 26x22 | A | **existe** | Aquarela desbotada, levemente torta |
| `quarto_dois.cofre.png` | 24x20 | A | **existe** | Cofre de parede com 3 discos |
| `quarto_dois.cofre.aberto.png` | 24x20 | C | falta | Cofre aberto, vazio |
| `quarto_dois.mesa_diario.png` | 32x22 | A | **existe** | Mesinha com diário aberto e lamparina |
| `quarto_dois.radio.png` | 24x18 | A | **existe** | Rádio-gravador cassete anos 80 |
| `quarto_dois.cama.png` | 55x32 | A | **existe** | Cama com colchão rasgado |
| `quarto_dois.fita_cassete.png` | 12x8 | A | **existe** | Fita cassete preta sem rótulo |
| `quarto_dois.calendario.png` | 28x22 | B | **existe** | Calendário com dia 14 circulado de vermelho |
| `quarto_dois.janela_selada.png` | 36x28 | B | **existe** | Janela com fita adesiva nas bordas |
| `quarto_dois.janela_selada.aberta.png` | 36x28 | C | falta | Fita arrancada, frase riscada na moldura |
| `quarto_dois.espelho_rachado.png` | 18x32 | B | **existe** | Espelho rachado ao meio |
| `quarto_dois.manchas_chao.png` | 30x8 | B | **existe** | Manchas de arrasto no assoalho |

### Sala (`sala`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `sala.parede.png` | 240x160 | A | **existe** | Sala de estar antiga, papel de parede marrom |
| `sala.porta_exterior.png` | 26x56 | A | **existe** | Porta da frente reforçada |
| `sala.estante.png` | 38x62 | A | **existe** | Estante alta com livros empoeirados |
| `sala.sofa.png` | 65x30 | A | **existe** | Sofá de couro gasto |
| `sala.cartao_visita.png` | 12x8 | A | **existe** | Cartão de visita no chão |
| `sala.televisao.png` | 44x32 | B | **existe** | TV de tubo com estática |
| `sala.televisao.desligada.png` | 44x32 | C | falta | Mesma TV com tela preta |
| `sala.telefone.png` | 18x16 | B | **existe** | Telefone de parede com fio arrancado |
| `sala.quadro_fotos.png` | 30x24 | B | **existe** | Moldura com várias fotos |

### Cozinha (`cozinha`, variante normal)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cozinha.parede.png` | 240x160 | A | **existe** | Cozinha antiga, azulejos encardidos |
| `cozinha.geladeira.png` | 38x62 | A | **existe** | Geladeira anos 70 |
| `cozinha.geladeira.aberta.png` | 38x62 | C | falta | Geladeira aberta, luz fraca |
| `cozinha.armario.png` | 38x65 | A | **existe** | Armário de madeira com trinco |
| `cozinha.mesa.png` | 60x40 | A | **existe** | Mesa de madeira pesada |
| `cozinha.mesa.movida.png` | 60x40 | C | falta | Mesa empurrada para o lado |
| `cozinha.alcapao.png` | 30x12 | A | **existe** | Alçapão de madeira com argola de ferro |
| `cozinha.nota_geladeira.png` | 12x8 | A | **existe** | Bilhete preso com ímã |
| `cozinha.fogao.png` | 40x30 | B | **existe** | Fogão antigo de 4 bocas |
| `cozinha.pia.png` | 40x30 | B | **existe** | Pia de inox enferrujada |
| `cozinha.janela.png` | 36x28 | B | **existe** | Janela pequena com grade |
| `cozinha.porta_despensa.png` | 24x52 | A | **existe** | Porta amarrada com corda grossa |
| `cozinha.porta_despensa.aberta.png` | 24x52 | C | falta | Corda cortada, porta entreaberta |

### Cozinha devastada (`cozinha`, depois do pulo)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cozinha_devastada.parede.png` | 240x160 | A | **existe** | Mesma cozinha com entulho e telhas no chão |
| `cozinha_devastada.buraco_telhado.png` | 60x20 | A | **existe** | Buraco no teto, luz da lua |
| `cozinha_devastada.mesa_quebrada.png` | 55x22 | A | **existe** | Mesa partida ao meio |
| `cozinha_devastada.perna_mesa.png` | 30x8 | A | **existe** | Perna de mesa solta no chão |
| `cozinha_devastada.destrocos_telha.png` | 20x10 | A | **existe** | Cacos de telha vermelha |
| `cozinha_devastada.destrocos_telha2.png` | 18x8 | B | **existe** | Caco comprido e pontudo |
| `cozinha_devastada.nota_chao.png` | 14x10 | A | **existe** | Nota amassada no chão |

### Itens do inventário (16x16, fundo transparente)

`item.chave_velha` **existe**. Faltam: `item.chave_ventilacao`, `item.chave_despensa`, `item.quadro_quarto`,
`item.mapa_casa`, `item.foto_data`, `item.relatorio_medico`, `item.fita_cassete`,
`item.cartao_dm`, `item.fragmento_telha`, `item.telha_pontiaguda`, `item.perna_mesa`,
`item.faca_cozinha`, `item.lanterna` (prioridade B; ids em `src/data/items.js`).

### Outras telas

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cena_janela.fechada.png` | 240x160 | A | **existe** | Close da janela fechada (cutscene do pulo) |
| `cena_janela.aberta.png` | 240x160 | A | **existe** | Close da janela aberta |
| `quintal.fundo.png` | 240x160 | B | falta | Quintal à noite, mato alto, cerca velha |
| `ui_mochila.png` | 16x16 | A | **existe** | Ícone da mochila no HUD |

### Interface e minigame

| Arquivo | Tamanho | Status | Uso |
|---|---|---|---|
| `ui.painel.png` | 48x48 (slice9, borda 8) | **existe** | Fundo de diálogo, inventário, saúde e configurações |
| `ui.botao.png` | 24x12 (slice9, borda 4) | **existe** | Botões de escolha do diálogo e "Fechar" da estante |
| `ui.engrenagem.png` | 16x16 | **existe** | Botão de configurações no HUD |
| `ui.coracao.png` | 16x16 | **existe** | Botão de saúde no HUD |
| `estante.fundo.png` | 220x128 | **existe** | Fundo do minigame da estante (tábua em y≈69) |
| `livro_<cor>.png` | largura variável x 40 | **existe** (9 cores) | Livros do minigame |

O corte em 9 partes (slice9) fica em `SLICE9`, em `src/assets/loader.js`. Os painéis usam
`skin()` de `src/ui/skin.js`: sem o PNG, volta o retângulo colorido.

### Não usado

`ui/ui_pausa.png` está carregado, mas nada usa.

### Como os sprites foram feitos

Objetos, UI, chave e minigame: PixelLab (pixflux), gerados em 2x e reduzidos para o tamanho
da tabela. Paredes: texturas do PixelLab compostas em 240x160 (parede, rodapé em y 112–120,
chão a partir de y 120). Os scripts de pós-processamento não estão no repositório.

## Total

Feito: as 6 paredes, os 43 objetos padrão, a chave velha, a UI e o minigame.
Falta: 8 variantes opcionais de estado (C), 13 ícones de itens e `quintal.fundo`.
Tudo que falta continua aparecendo como placeholder.
