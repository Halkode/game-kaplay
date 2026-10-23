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
| `interruptor.png` | 14x14 | A | **existe** (1024px, reduzir) | Interruptor de parede antigo |

### Quarto inicial (`quarto_um`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `quarto_um.parede.png` | 240x160 | A | **existe** (1344x768, reduzir) | Parede azul-acinzentada com rodapé e piso de tábuas |
| `quarto_um.janela.png` | 40x34 | A | **existe** | Janela de guilhotina, noite sem lua |
| `quarto_um.janela.aberta.png` | 40x34 | C | falta | Janela aberta, cortina ao vento |
| `quarto_um.estante.png` | 40x36 | A | **existe** | Estante de livros |
| `quarto_um.escrivaninha.png` | 30x20 | A | falta | Escrivaninha de carvalho, xícara e caderno |
| `quarto_um.quadro.png` | 30x24 | B | falta | Pintura a óleo de um quarto visto de fora |
| `quarto_um.cama.png` | 52x30 | B | falta | Cama de solteiro com lençóis revirados |
| `quarto_um.espelho.png` | 20x36 | B | falta | Espelho de parede com moldura escura |

### Corredor (`corredor`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `corredor.parede.png` | 240x160 | A | falta | Corredor cinza, papel de parede descascando |
| `corredor.escada.png` | 30x64 | A | falta | Topo de escada de madeira descendo |
| `corredor.porta_esquerda.png` | 24x52 | A | falta | Porta escura com cadeado embutido |
| `corredor.ventilacao.png` | 18x18 | A | falta | Grelha de ventilação metálica |
| `corredor.ventilacao.aberta.png` | 18x18 | C | falta | Grelha removida, buraco escuro |
| `corredor.papeis_chao.png` | 20x10 | B | falta | Papéis espalhados no chão |
| `corredor.papeis_chao2.png` | 25x12 | B | falta | Relatórios antigos amarelados |
| `corredor.quadro_caido.png` | 26x18 | B | falta | Quadro caído, virado contra a parede |
| `corredor.mancha_parede.png` | 22x22 | B | falta | Mancha marrom-avermelhada na parede |

### Quarto dois (`quarto_dois`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `quarto_dois.parede.png` | 240x160 | A | falta | Quarto verde-escuro, abandonado |
| `quarto_dois.quadro.png` | 26x22 | A | falta | Aquarela desbotada, levemente torta |
| `quarto_dois.cofre.png` | 24x20 | A | falta | Cofre de parede com 3 discos |
| `quarto_dois.cofre.aberto.png` | 24x20 | C | falta | Cofre aberto, vazio |
| `quarto_dois.mesa_diario.png` | 32x22 | A | falta | Mesinha com diário aberto e lamparina |
| `quarto_dois.radio.png` | 24x18 | A | falta | Rádio-gravador cassete anos 80 |
| `quarto_dois.cama.png` | 55x32 | A | falta | Cama com colchão rasgado |
| `quarto_dois.fita_cassete.png` | 12x8 | A | falta | Fita cassete preta sem rótulo |
| `quarto_dois.calendario.png` | 28x22 | B | falta | Calendário com dia 14 circulado de vermelho |
| `quarto_dois.janela_selada.png` | 36x28 | B | falta | Janela com fita adesiva nas bordas |
| `quarto_dois.janela_selada.aberta.png` | 36x28 | C | falta | Fita arrancada, frase riscada na moldura |
| `quarto_dois.espelho_rachado.png` | 18x32 | B | falta | Espelho rachado ao meio |
| `quarto_dois.manchas_chao.png` | 30x8 | B | falta | Manchas de arrasto no assoalho |

### Sala (`sala`)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `sala.parede.png` | 240x160 | A | falta | Sala de estar antiga, papel de parede marrom |
| `sala.porta_exterior.png` | 26x56 | A | falta | Porta da frente reforçada |
| `sala.estante.png` | 38x62 | A | falta | Estante alta com livros empoeirados |
| `sala.sofa.png` | 65x30 | A | falta | Sofá de couro gasto |
| `sala.cartao_visita.png` | 12x8 | A | falta | Cartão de visita no chão |
| `sala.televisao.png` | 44x32 | B | falta | TV de tubo com estática |
| `sala.televisao.desligada.png` | 44x32 | C | falta | Mesma TV com tela preta |
| `sala.telefone.png` | 18x16 | B | falta | Telefone de parede com fio arrancado |
| `sala.quadro_fotos.png` | 30x24 | B | falta | Moldura com várias fotos |

### Cozinha (`cozinha`, variante normal)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cozinha.parede.png` | 240x160 | A | falta | Cozinha antiga, azulejos encardidos |
| `cozinha.geladeira.png` | 38x62 | A | falta | Geladeira anos 70 |
| `cozinha.geladeira.aberta.png` | 38x62 | C | falta | Geladeira aberta, luz fraca |
| `cozinha.armario.png` | 38x65 | A | falta | Armário de madeira com trinco |
| `cozinha.mesa.png` | 60x40 | A | falta | Mesa de madeira pesada |
| `cozinha.mesa.movida.png` | 60x40 | C | falta | Mesa empurrada para o lado |
| `cozinha.alcapao.png` | 30x12 | A | falta | Alçapão de madeira com argola de ferro |
| `cozinha.nota_geladeira.png` | 12x8 | A | falta | Bilhete preso com ímã |
| `cozinha.fogao.png` | 40x30 | B | falta | Fogão antigo de 4 bocas |
| `cozinha.pia.png` | 40x30 | B | falta | Pia de inox enferrujada |
| `cozinha.janela.png` | 36x28 | B | falta | Janela pequena com grade |
| `cozinha.porta_despensa.png` | 24x52 | A | falta | Porta amarrada com corda grossa |
| `cozinha.porta_despensa.aberta.png` | 24x52 | C | falta | Corda cortada, porta entreaberta |

### Cozinha devastada (`cozinha`, depois do pulo)

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cozinha_devastada.parede.png` | 240x160 | A | falta | Mesma cozinha com entulho e telhas no chão |
| `cozinha_devastada.buraco_telhado.png` | 60x20 | A | falta | Buraco no teto, luz da lua |
| `cozinha_devastada.mesa_quebrada.png` | 55x22 | A | falta | Mesa partida ao meio |
| `cozinha_devastada.perna_mesa.png` | 30x8 | A | falta | Perna de mesa solta no chão |
| `cozinha_devastada.destrocos_telha.png` | 20x10 | A | falta | Cacos de telha vermelha |
| `cozinha_devastada.destrocos_telha2.png` | 18x8 | B | falta | Caco comprido e pontudo |
| `cozinha_devastada.nota_chao.png` | 14x10 | A | falta | Nota amassada no chão |

### Itens do inventário (16x16, fundo transparente)

`item.chave_velha`, `item.chave_ventilacao`, `item.chave_despensa`, `item.quadro_quarto`,
`item.mapa_casa`, `item.foto_data`, `item.relatorio_medico`, `item.fita_cassete`,
`item.cartao_dm`, `item.fragmento_telha`, `item.telha_pontiaguda`, `item.perna_mesa`,
`item.faca_cozinha`, `item.lanterna` (prioridade B; ids em `src/data/items.js`).

### Outras telas

| Arquivo | Tamanho | Prioridade | Status | Descrição |
|---|---|---|---|---|
| `cena_janela.fechada.png` | 240x160 | A | **existe** (1024px) | Close da janela fechada (cutscene do pulo) |
| `cena_janela.aberta.png` | 240x160 | A | **existe** (1024px) | Close da janela aberta |
| `quintal.fundo.png` | 240x160 | B | falta | Quintal à noite, mato alto, cerca velha |
| `ui_mochila.png` | 16x16 | A | **existe** (596px, reduzir) | Ícone da mochila no HUD |

### Não usado

`salas/textura_parede_bege.png` e `ui/ui_pausa.png` estão carregados, mas nenhum
objeto usa. Podem virar parede de outra sala ou ser apagados.

## Total

- Paredes: 6 (1 existe)
- Objetos: 55 (4 existem), dos quais 8 são variantes opcionais de estado
- Itens: 14 (nenhum existe)
- Prioridade A: 38 arquivos, 8 já existem. Faltam **30 imagens** para jogar a história
  inteira sem placeholder nos pontos importantes.
