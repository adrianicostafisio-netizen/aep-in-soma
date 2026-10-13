/**
 * Base de Conhecimento - Fundacentro e Documentos Complementares
 * Status: tecnica / historica.
 */
const FUNDACENTRO_KNOWLEDGE = [
  {
    id: "REF_FUNDACENTRO_NHO11",
    documento: "NHO 11 (Fundacentro)",
    item: "Geral",
    titulo: "Avaliação dos Níveis de Iluminamento em Ambientes de Trabalho Internos",
    tema: "Iluminação e conforto visual",
    descricaoTecnica: "Estabelece critérios e procedimentos para a avaliação e garantia de níveis mínimos de iluminamento compatíveis com o conforto visual e segurança.",
    categoriasRelacionadas: ["iluminacao"],
    tipoFonte: "tecnica",
    atoNormativo: "NHO 11 Norma Técnica",
    versao: "2018",
    vigencia: "2018-01-01",
    fonteOficial: "Portal Fundacentro",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_FUNDACENTRO_VERIFICACAO",
    documento: "Pontos de Verificação de Ergonomia (Fundacentro)",
    item: "Geral",
    titulo: "Pontos de Verificação de Ergonomia",
    tema: "Melhorias ergonômicas práticas",
    descricaoTecnica: "Publicação técnica contendo diretrizes práticas para melhorias no manuseio de materiais, ferramentas manuais, segurança de máquinas, postos de trabalho, iluminação e organização do trabalho.",
    categoriasRelacionadas: ["levantamentodecargas", "cargas", "ferramentasmanuais", "mobiliario", "iluminacao", "organizacao", "ambientais"],
    tipoFonte: "tecnica",
    atoNormativo: "Tradução Oficial Fundacentro / OIT",
    versao: "2005",
    vigencia: "2005-01-01",
    fonteOficial: "Portal MTE / Fundacentro",
    dataVerificacao: "2026-08-10"
  },
  {
    id: "REF_FUNDACENTRO_MANUAL17",
    documento: "Manual de Aplicação da NR-17 (MTE/Fundacentro)",
    item: "Geral",
    titulo: "Diretrizes práticas de interpretação ergonômica",
    tema: "Subsídio prático à NR-17",
    descricaoTecnica: "Fornece orientações metodológicas e práticas para a interpretação e conformidade das posturas, alcances e mobiliário de trabalho.",
    categoriasRelacionadas: ["postura", "mobiliario", "alcances"],
    tipoFonte: "historica",
    atoNormativo: "Manual Técnico MTE/Fundacentro",
    versao: "2002",
    vigencia: "2002-01-01",
    fonteOficial: "Portal MTE / Fundacentro",
    dataVerificacao: "2026-08-10"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FUNDACENTRO_KNOWLEDGE;
} else if (typeof window !== 'undefined') {
  window.FUNDACENTRO_KNOWLEDGE = FUNDACENTRO_KNOWLEDGE;
}
