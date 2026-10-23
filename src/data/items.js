// Catálogo de itens. O inventário guarda apenas o id; nome e descrição vêm daqui.
// Ícone: src/assets/sprites/itens/item.<id>.png (16x16). Sem arquivo → placeholder.

export const ITEMS = {
    chave_velha:       { name: "Chave Velha",        description: "Enferrujada. Estava atrás do livro marrom." },
    quadro_quarto:     { name: "Quadro",             description: "Pintura de 1987. No verso: \"Quando a porta não abre, a janela canta.\"" },
    chave_ventilacao:  { name: "Chave Pequena",      description: "Amarrada a um barbante. Estava dentro da ventilação." },
    mapa_casa:         { name: "Mapa da Casa",       description: "Planta baixa com quatro cômodos marcados com X." },
    foto_data:         { name: "Foto com Data",      description: "Duas pessoas em frente à casa. No verso: dia 14." },
    relatorio_medico:  { name: "Relatório Médico",   description: "\"ARQUIVADO — NÃO REABRIR\". O nome foi apagado." },
    fita_cassete:      { name: "Fita Cassete",       description: "Preta, sem rótulo. Muito manuseada." },
    cartao_dm:         { name: "Cartão D.M.",        description: "\"Rua das Acácias, 7 — Subsolo. Clínica D.M.\"" },
    chave_despensa:    { name: "Chave da Despensa",  description: "Etiqueta de papel com letra de criança." },
    fragmento_telha:   { name: "Fragmento de Telha", description: "Cerâmica vermelha, borda afiada." },
    telha_pontiaguda:  { name: "Telha Pontiaguda",   description: "Um caco comprido e pontudo." },
    perna_mesa:        { name: "Perna de Mesa",      description: "Madeira maciça. Serve como alavanca." },
    faca_cozinha:      { name: "Faca de Cozinha",    description: "Estava escondida de propósito." },
    lanterna:          { name: "Lanterna",           description: "Ilumina um pouco a escuridão." },
};

/** Itens que servem para cortar (corda da despensa, etc.). */
export const CUTTING_ITEMS = ["faca_cozinha", "fragmento_telha", "telha_pontiaguda"];

export function itemName(id) {
    return ITEMS[id]?.name ?? id;
}
