/**
 * Base de Conhecimento - NR-01 Vigente
 * Ato Normativo Oficial: Portaria MTE nº 1.419, de 27 de agosto de 2024.
 * Data de Entrada em Vigor: 26/05/2026.
 * Status: normativa / interpretativa_oficial.
 */
const NR01_KNOWLEDGE = [
  {
    id: "REF_NR01_15314",
    documento: "NR-01",
    item: "1.5.3.1.4",
    titulo: "Escopo do GRO",
    tema: "Fatores ergonômicos e psicossociais",
    descricaoTecnica: "O gerenciamento de riscos ocupacionais deve abranger os riscos relacionados aos fatores ergonômicos, incluindo os fatores de risco psicossociais relacionados ao trabalho.",
    categoriasRelacionadas: ["gro", "fatoresderiscopsicossociaisrelacionadosaotrabalho"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_1532",
    documento: "NR-01",
    item: "1.5.3.2",
    titulo: "Processo do GRO",
    tema: "Medidas de controle",
    descricaoTecnica: "A organização deve identificar perigos, avaliar e classificar riscos, implementar medidas de prevenção e acompanhar o controle dos riscos.",
    categoriasRelacionadas: ["gerenciamentoderiscosocupacionais"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_15321",
    documento: "NR-01",
    item: "1.5.3.2.1",
    titulo: "Integração Ergonômica",
    tema: "Consideração da NR-17",
    descricaoTecnica: "A organização deve considerar as condições de trabalho nos termos da NR-17, incluindo os fatores de risco psicossociais relacionados ao trabalho.",
    categoriasRelacionadas: ["fatoresderiscopsicossociaisrelacionadosaotrabalho", "gerenciamentoderiscosocupacionais"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_1544",
    documento: "NR-01",
    item: "1.5.4.4",
    titulo: "Avaliação de Riscos",
    tema: "Avaliação estruturada",
    descricaoTecnica: "Exige a avaliação de riscos ocupacionais de forma estruturada.",
    categoriasRelacionadas: ["gerenciamentoderiscosocupacionais"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_154453",
    documento: "NR-01",
    item: "1.5.4.4.5.3",
    titulo: "Avaliação da Probabilidade",
    tema: "Fatores ergonômicos e psicossociais",
    descricaoTecnica: "Para fatores ergonômicos, incluindo fatores de risco psicossociais relacionados ao trabalho, a avaliação da probabilidade deve considerar as exigências da atividade de trabalho e a eficácia das medidas de prevenção implementadas.",
    categoriasRelacionadas: ["gerenciamentoderiscosocupacionais"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_155",
    documento: "NR-01",
    item: "1.5.5",
    titulo: "Controle de Riscos",
    tema: "Medidas de prevenção",
    descricaoTecnica: "Diretrizes para a implantação de medidas de prevenção ergonômicas e controle dos riscos ocupacionais.",
    categoriasRelacionadas: ["medidadesprevencao"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_NR01_1573",
    documento: "NR-01",
    item: "1.5.7.3",
    titulo: "Inventário de Riscos",
    tema: "PGR",
    descricaoTecnica: "O inventário de riscos do PGR deve incluir obrigatoriamente os resultados da avaliação de ergonomia nos termos da NR-17.",
    categoriasRelacionadas: ["gerenciamentoderiscosocupacionais"],
    tipoFonte: "normativa",
    atoNormativo: "Portaria MTE nº 1.419/2024",
    versao: "2024",
    vigencia: "2026-05-26",
    fonteOficial: "Portal ENIT / MTE",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_MTE_MANUALGRO",
    documento: "Manual de interpretação e aplicação do capítulo 1.5 da NR-1 — GRO/PGR",
    item: "Geral",
    titulo: "Interpretação do GRO/PGR",
    tema: "GRO/PGR",
    descricaoTecnica: "Fornece diretrizes oficiais para interpretação do GRO, avaliação de riscos, medidas de prevenção, integração da ergonomia com o PGR e acompanhamento dos riscos.",
    categoriasRelacionadas: ["gerenciamentoderiscosocupacionais", "medidadesprevencao", "acompanhamento"],
    tipoFonte: "interpretativa_oficial",
    atoNormativo: "MTE Manual Oficial",
    versao: "2026",
    vigencia: "2026-05-26",
    fonteOficial: "Ministério do Trabalho e Emprego",
    dataVerificacao: "2026-08-10"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NR01_KNOWLEDGE;
} else if (typeof window !== 'undefined') {
  window.NR01_KNOWLEDGE = NR01_KNOWLEDGE;
}
