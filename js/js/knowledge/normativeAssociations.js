/**
 * normativeAssociations.js
 * Matriz de Fundamentação Ergonômica — Fase 4.6 (Correção Controlada)
 *
 * REGRAS ABSOLUTAS (Fase 4.6):
 *  1. Ausência de dado NUNCA confirma referência.
 *  2. Coexistência de dois checkpoints inadequados NUNCA prova relação causal.
 *  3. Palavra-chave genérica NUNCA confirma requisito normativo específico.
 *  4. Confirmação = dado positivo + relação documentalmente sustentada.
 *
 * Cada entrada define:
 *  grau              : 'A' | 'B' | 'C'
 *  referencia        : ID(s) da referência (ou null para C)
 *  descricaoProfissional : Texto de exibição (nunca o código interno)
 *  criteriosAplicabilidade : Condições necessárias (documentação)
 *  dadosNecessarios  : Campos do sMap exigidos
 *  testAplicabilidade: function(checkpointId, sMap) -> boolean
 *  limitacao         : Texto do limite da interpretação
 *  limitacaoAplicabilidade : Texto quando referência não aplicável
 */

const NORMATIVE_ASSOCIATIONS = {

  // ─── SEÇÃO 6: EXIGÊNCIAS FÍSICAS ─────────────────────────────────────────

  postura_predominante: {
    grau: 'B',
    referencia: ['REF_NR17_1762', 'REF_NR17_1767'],
    descricaoProfissional: 'trabalho predominantemente de pé por longos períodos',
    criteriosAplicabilidade: [
      'Dado positivo de ausência de assento de descanso registrado, OU',
      'Dado positivo indicando que a alternância sentado/em pé não é viabilizada, quando a tarefa permitir'
    ],
    dadosNecessarios: ['ausencia_assento_descanso_confirmada', 'impossibilidade_alternancia_registrada'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: exige dado positivo — ausência de outro campo NÃO é evidência.
      var sec9 = (sMap[9] && sMap[9].checklist) ? sMap[9].checklist : {};
      // Dado positivo 1: assento de descanso explicitamente inadequado/ausente
      var assentoExplicitamenteInadequado = !!(sec9['cadeira_regulagem'] &&
        sec9['cadeira_regulagem'].status === 'inadequate');
      // Dado positivo 2: texto descritivo com termos que indicam ausência de alternância
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '').toLowerCase();
      var termosEmPeSemAlternancia = [
        'em pé sem', 'de pé sem', 'sem sentar', 'sem alternân', 'sem alternancia',
        'não pode sentar', 'nao pode sentar', 'sem pausa para sentar', 'permanentemente em pé',
        'permanentemente de pé', 'sem descanso sentado'
      ];
      var textoPositivoEmPe = termosEmPeSemAlternancia.some(function(t) {
        return tarefa.indexOf(t) !== -1;
      });
      return assentoExplicitamenteInadequado || textoPositivoEmPe;
    },
    limitacao: 'A NR-17 não restringe o tempo absoluto em pé; exige mitigação por alternância ou assento de descanso. Confirmação exige dado positivo de ausência dessas medidas.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado positivo sobre ausência de assento de descanso ou impossibilidade de alternância registrada.'
  },

  postura_sentada_prolongada: {
    grau: 'B',
    referencia: ['REF_NR17_1762'],
    descricaoProfissional: 'permanência prolongada na postura sentada',
    criteriosAplicabilidade: [
      'Dado positivo de que a atividade permite alternância entre sentado e em pé, E',
      'Dado positivo de que essa alternância não é favorecida/viabilizada pelo posto ou organização'
    ],
    dadosNecessarios: ['viabilidade_alternancia_confirmada', 'alternancia_nao_viabilizada'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: exige dado positivo sobre viabilidade de alternância não viabilizada.
      // Ausência de postura_predominante inadequada NÃO é evidência de viabilidade.
      var sec6 = (sMap[6] && sMap[6].checklist) ? sMap[6].checklist : {};
      // Campo explícito de alternância registrada na seção 6
      var alternanciaViavelRegistrada = sMap[6] && sMap[6].alternancia_viavel === 'sim';
      var alternanciaPosturalRegistrada = !!(sMap[6] && sMap[6].alternancia_postural);
      // Texto descritivo com indicadores de que alternância é possível mas não viabilizada
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '').toLowerCase();
      var termosAlternanciaViavel = [
        'poderia alternar', 'é possível alternar', 'possível levantar',
        'não alterna', 'nao alterna', 'sem possibilidade de levantar',
        'permanece sentado', 'sem alternância', 'sem alternancia',
        'assento fixo sem', 'cadeira fixa sem'
      ];
      var textoPositivoAlternancia = termosAlternanciaViavel.some(function(t) {
        return tarefa.indexOf(t) !== -1;
      });
      return alternanciaViavelRegistrada || alternanciaPosturalRegistrada || textoPositivoAlternancia;
    },
    limitacao: 'A NR-17 não quantifica limites máximos para postura sentada. Foca na alternância quando viável. Confirmação exige dado positivo de viabilidade não explorada.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado positivo de que a alternância é viável mas não foi viabilizada pelo posto ou organização.'
  },

  postura_estatica: {
    grau: 'B',
    referencia: ['REF_NR17_174'],
    descricaoProfissional: 'manutenção de postura estática ou fixa durante a atividade',
    criteriosAplicabilidade: [
      'Restrição de alternância postural decorrente do ritmo ou exigências de tempo'
    ],
    dadosNecessarios: ['ritmo_restritivo', 'exigencias_tempo'],
    testAplicabilidade: function(checkpointId, sMap) {
      var sec5 = (sMap[5] && sMap[5].checklist) ? sMap[5].checklist : {};
      var ritmoRestrito = sec5['ritmo'] && sec5['ritmo'].status === 'inadequate';
      var ritmoMaquina = sMap[5] && sMap[5].ritmo_imposto_maquina === 'sim';
      var ritmoNaoLivre = sMap[5] && sMap[5].ritmo_livre === 'nao';
      return !!(ritmoRestrito || ritmoMaquina || ritmoNaoLivre);
    },
    limitacao: 'A NR-17 não define duração limite de postura estática. Relaciona-se à organização do trabalho.',
    limitacaoAplicabilidade: 'Referência omitida quando não há registro de restrição de ritmo ou movimento associado.'
  },

  movimentos_repetitivos: {
    grau: 'B',
    referencia: ['REF_NR17_174'],
    descricaoProfissional: 'atividade com movimentos repetitivos de membros superiores',
    criteriosAplicabilidade: [
      'Repetitividade associada a ritmo imposto ou exigências de tempo organizacionais'
    ],
    dadosNecessarios: ['ritmo_imposto', 'metas_producao'],
    testAplicabilidade: function(checkpointId, sMap) {
      var sec5 = (sMap[5] && sMap[5].checklist) ? sMap[5].checklist : {};
      var ritmoInadequado = sec5['ritmo'] && sec5['ritmo'].status === 'inadequate';
      var pressaoInadequada = sec5['pressao'] && sec5['pressao'].status === 'inadequate';
      var ritmoMaquina = sMap[5] && sMap[5].ritmo_imposto_maquina === 'sim';
      var ritmoNaoLivre = sMap[5] && sMap[5].ritmo_livre === 'nao';
      return !!(ritmoInadequado || pressaoInadequada || ritmoMaquina || ritmoNaoLivre);
    },
    limitacao: 'A NR-17 geral não quantifica movimentos repetitivos por ciclo fora dos anexos de telemarketing/checkout.',
    limitacaoAplicabilidade: 'Referência omitida quando não há correlação com estressores de ritmo/metas registrados.'
  },

  esforco_fisico: {
    grau: 'B',
    referencia: ['REF_NR17_174'],
    descricaoProfissional: 'exigência de esforço físico na atividade',
    criteriosAplicabilidade: [
      'Esforço físico associado a exigências temporais ou ritmo organizacional'
    ],
    dadosNecessarios: ['ritmo_imposto', 'exigencias_tempo'],
    testAplicabilidade: function(checkpointId, sMap) {
      var sec5 = (sMap[5] && sMap[5].checklist) ? sMap[5].checklist : {};
      var ritmoInadequado = sec5['ritmo'] && sec5['ritmo'].status === 'inadequate';
      var ritmoMaquina = sMap[5] && sMap[5].ritmo_imposto_maquina === 'sim';
      var ritmoNaoLivre = sMap[5] && sMap[5].ritmo_livre === 'nao';
      return !!(ritmoInadequado || ritmoMaquina || ritmoNaoLivre);
    },
    limitacao: 'A NR-17 não quantifica limiares de força em Newtons. Trata da organização do trabalho.',
    limitacaoAplicabilidade: 'Referência omitida quando não há exigência temporal documentada associada ao esforço.'
  },

  pedais_alavancas: {
    grau: 'B',
    referencia: ['REF_NR17_177'],
    descricaoProfissional: 'acionamento de pedais ou alavancas durante a atividade',
    criteriosAplicabilidade: [
      'Dado positivo de uso de pedal, alavanca, comando, controle ou painel de acionamento',
      'Com indicação de dificuldade ou inadequação de acesso/manejo'
    ],
    dadosNecessarios: ['dado_positivo_pedal_alavanca_comando'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: a simples existência de itens na Seção 8 NÃO confirma.
      // Exige dado textual específico sobre tipo de controle.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      var termos = [
        'pedal', 'alavanca', 'comando', 'controle', 'painel de acion',
        'acionamento', 'botão', 'manete', 'manivela', 'acionar', 'aciona com o pé',
        'aciona com o braço', 'acionada pelo pé', 'acionada pela mão'
      ];
      return termos.some(function(t) { return textoCompleto.indexOf(t) !== -1; });
    },
    limitacao: 'A NR-17 regula comandos em geral, não define ângulos específicos para pedais de membros inferiores.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado textual específico sobre pedal, alavanca ou comando de acionamento.'
  },

  deslocamento: {
    grau: 'C',
    referencia: null,
    descricaoProfissional: 'deslocamento a pé durante a execução da tarefa',
    criteriosAplicabilidade: [],
    dadosNecessarios: [],
    testAplicabilidade: function() { return false; },
    limitacao: 'Sem referência específica mapeada na base atual. Não há regulação de limites para deslocamentos na jornada.',
    limitacaoAplicabilidade: 'Achado pode aparecer na conclusão quando relevante. Referência nunca exibida.'
  },

  movimentacao_pacientes: {
    grau: 'C',
    referencia: null,
    descricaoProfissional: 'demanda de movimentação ou transferência de pacientes',
    criteriosAplicabilidade: [],
    dadosNecessarios: [],
    testAplicabilidade: function() { return false; },
    limitacao: 'O item 17.5 da NR-17 é exclusivo para cargas inertes. A base atual não contém norma específica para movimentação de pacientes.',
    limitacaoAplicabilidade: 'Achado pode aparecer na conclusão quando relevante. Referência nunca exibida.'
  },

  flexao_cervical_30: {
    grau: 'C',
    referencia: null,
    descricaoProfissional: 'postura de flexão cervical acentuada',
    criteriosAplicabilidade: [],
    dadosNecessarios: [],
    testAplicabilidade: function() { return false; },
    limitacao: 'Ângulo de 30° não consta de referência oficial regulamentar na base atual.',
    limitacaoAplicabilidade: 'Achado pode aparecer na conclusão quando relevante. Referência nunca exibida.'
  },

  rotacao_cabeca: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'posturas de rotação ou inclinação da cabeça durante a atividade',
    criteriosAplicabilidade: [
      'Dado positivo de monitor lateral ou layout que exige rotação cervical, OU',
      'Descrição textual de necessidade de virar/olhar para área lateral/posterior'
    ],
    dadosNecessarios: ['monitor_lateral_confirmado', 'dado_descritivo_rotacao_cervical'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: qualquer ferramenta inadequada NÃO confirma.
      // Exige dado específico de rotação/inclinação cervical.
      var sec9 = (sMap[9] && sMap[9].checklist) ? sMap[9].checklist : {};
      var sec8 = sMap[8] || {};
      // Monitor explicitamente inadequado/lateral
      var monitorInadequado = !!(sec9['monitor_distancia'] &&
        sec9['monitor_distancia'].status === 'inadequate');
      // Texto descritivo com indicadores de rotação cervical
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      var termosRotacao = [
        'rotação', 'rotacao', 'girar a cabeça', 'girar o pescoço',
        'virar o pescoço', 'virar a cabeça', 'olhar para o lado',
        'tela lateral', 'monitor lateral', 'tela ao lado', 'lateral da cabeça',
        'pescoço torcido', 'torção cervical', 'torcao cervical',
        'inclinação da cabeça', 'inclinacao da cabeça', 'cabeça inclinada'
      ];
      var temTermoRotacao = termosRotacao.some(function(t) {
        return textoCompleto.indexOf(t) !== -1;
      });
      return monitorInadequado || temTermoRotacao;
    },
    limitacao: 'Ponto 62 Fundacentro: diretriz técnica. Não define limites angulares legais de torção cervical.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado específico sobre monitor lateral ou rotação cervical descrita nos dados coletados.'
  },

  flexao_coluna_45: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'demanda postural de flexão de tronco durante a atividade',
    criteriosAplicabilidade: [
      'Relação descrita entre flexão do tronco e altura do plano de trabalho, bancada ou superfície de trabalho'
    ],
    dadosNecessarios: ['relacao_descrita_flexao_plano_trabalho'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: coexistência de mesa_altura inadequada + flexão NÃO prova relação causal.
      // Exige dado descritivo relacionando a flexão ao plano de trabalho.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      // Termos que indicam relação causal entre flexão e plano de trabalho
      var termosRelacao = [
        'inclin', 'curvad', 'abaixad', 'bancada baixa', 'mesa baixa',
        'plano baixo', 'altura insuficiente', 'forçado a se inclinar',
        'forçado a inclinar', 'inclina para', 'inclinado sobre',
        'debruçado', 'debrucado', 'curvado sobre', 'se curva',
        'altura da bancada', 'altura da mesa obriga', 'superfície baixa',
        'superficie baixa', 'trabalha curvado', 'trabalha inclinado'
      ];
      return termosRelacao.some(function(t) { return textoCompleto.indexOf(t) !== -1; });
    },
    limitacao: 'Ponto 54 Fundacentro: diretriz de design. O ângulo de 45° não é limite normativo regulamentar. Exige relação descrita entre flexão e plano de trabalho.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado descritivo relacionando a flexão de tronco à altura da bancada ou superfície de trabalho.'
  },

  elevacao_ombros_90: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'demanda postural de elevação de membros superiores',
    criteriosAplicabilidade: [
      'Dado específico de alcance vertical, material posicionado acima dos ombros, ou layout que exige elevação dos membros superiores'
    ],
    dadosNecessarios: ['dado_especifico_alcance_vertical_ou_posicao_elevada'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: alcance_horizontal da Seção 7 (cargas) NÃO confirma elevação de ombros.
      // Mesa inadequada isoladamente NÃO confirma (pode ser baixa, não alta).
      // Exige dado descritivo específico de posição elevada ou alcance vertical.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      // Termos que indicam alcance vertical ou posição elevada acima dos ombros
      var termosAlcanceVertical = [
        'acima dos ombros', 'acima da cabeça', 'elevad', 'prateleira alta',
        'alcance vertical', 'suspens', 'overhead', 'estante alta',
        'material elevado', 'produto elevado', 'item elevado', 'caixa elevada',
        'alcançar em cima', 'colocar em cima', 'pegar em cima',
        'braço levantado', 'braços levantados', 'ombro levantado',
        'ombros levantados', 'posição elevada', 'nível elevado',
        'posicionado alto', 'fixado alto'
      ];
      return termosAlcanceVertical.some(function(t) { return textoCompleto.indexOf(t) !== -1; });
    },
    limitacao: 'Ponto 56 Fundacentro: diretriz técnica de design ergonômico. Não define limiar regulamentar de 90°. Exige dado de alcance vertical ou material acima dos ombros.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado específico de alcance vertical ou de materiais posicionados acima da região dos ombros.'
  },

  abducao_ombros_45: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'demanda postural de abdução de membros superiores',
    criteriosAplicabilidade: [
      'Dado específico de alcance lateral, materiais afastados do tronco, ou layout que exige manter os braços afastados'
    ],
    dadosNecessarios: ['dado_especifico_alcance_lateral_ou_bracos_afastados'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: alcance_horizontal de cargas (Seção 7) NÃO confirma abdução de ombros.
      // mesa_regulagem inadequada isoladamente NÃO confirma.
      // Exige dado descritivo específico de alcance lateral ou braços afastados.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      var termosAbducao = [
        'lateral', 'afastado do tronco', 'braço afastado', 'braços afastados',
        'abdução', 'abducao', 'alcance lateral', 'manter os braços',
        'distante do tronco', 'longe do corpo', 'braço para o lado',
        'braços para o lado', 'membro superior afastado',
        'trabalha com os braços abertos', 'posição lateral do braço'
      ];
      return termosAbducao.some(function(t) { return textoCompleto.indexOf(t) !== -1; });
    },
    limitacao: 'Ponto 56 Fundacentro: diretriz técnica de alcances. Não define limiar regulamentar de 45°. Exige dado de alcance lateral ou braços afastados do tronco.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado específico de alcance lateral ou braços mantidos afastados do tronco.'
  },

  desvio_punho_extremo: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'postura desfavorável com desvio acentuado de punho durante a atividade',
    criteriosAplicabilidade: [
      'Dado relacionando o desvio de punho à empunhadura, pega, cabo ou método de preensão da ferramenta'
    ],
    dadosNecessarios: ['dado_especifico_empunhadura_ou_preensao'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: existência de qualquer item na Seção 8 NÃO confirma.
      // Exige dado específico sobre empunhadura ou preensão.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      var termosEspecificos = [
        'pega', 'empunhadura', 'cabo', 'preensão', 'preensao',
        'ferramenta manual', 'punho', 'desvio do punho', 'desvio de punho',
        'torção do punho', 'torcao do punho', 'flexão do punho',
        'extensão do punho', 'posição do punho', 'mão curvada',
        'punho curvado', 'punho dobrado'
      ];
      return termosEspecificos.some(function(t) { return textoCompleto.indexOf(t) !== -1; });
    },
    limitacao: 'Ponto 61 Fundacentro: diretriz técnica para preservar posição neutra do punho. Não define parâmetros angulares regulamentares.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado específico sobre empunhadura, pega ou preensão relacionada ao desvio de punho.'
  },

  // ─── SEÇÃO 8: FERRAMENTAS E EQUIPAMENTOS ─────────────────────────────────

  adequacao: {
    grau: 'B',
    referencia: ['REF_NR17_177'],
    descricaoProfissional: 'inadequação de ferramentas ou equipamentos à tarefa',
    criteriosAplicabilidade: [
      'Descrição complementar da inadequação da ferramenta em relação à tarefa — natureza, dimensão ou característica funcional'
    ],
    dadosNecessarios: ['descricao_inadequacao_ferramenta'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA FASE 4.8: Remoção da exigência artificial de 10 caracteres.
      // Exige termos descritivos de inadequação funcional da ferramenta/equipamento à tarefa.
      var sec8 = sMap[8] || {};
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '').toLowerCase();
      if (!descFerramenta) return false;
      var termosInadequacao = [
        'inadequad', 'imprópri', 'impropri', 'incompatív', 'incompativ',
        'dificulta', 'não atende', 'nao atende', 'adaptação', 'adaptacao',
        'sem trava', 'sem mola', 'tamanho errado', 'peso inadequado',
        'dimensionamento incorreto', 'ruim de usar', 'improvisad'
      ];
      return termosInadequacao.some(function(t) { return descFerramenta.indexOf(t) !== -1; });
    },
    limitacao: 'Item 17.7.1: princípio sistêmico amplo, sem detalhamento específico de tarefa-ferramenta.',
    limitacaoAplicabilidade: 'Referência omitida quando não há descrição complementar da inadequação funcional da ferramenta.'
  },

  peso_ferramentas: {
    grau: 'A',
    referencia: ['REF_NR17_177'],
    descricaoProfissional: 'peso das ferramentas utilizadas na atividade',
    criteriosAplicabilidade: [
      'Dado específico sobre o peso da ferramenta, E',
      'Dado específico sobre a forma de utilização na execução da tarefa',
      'Conforme item 17.7.4: condição avaliada a partir da AEP ou AET'
    ],
    dadosNecessarios: ['dado_especifico_peso_ferramenta', 'dado_especifico_utilizacao_ferramenta'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: descricao_tarefa isoladamente NÃO confirma o item 17.7.4.
      // Exige dados específicos sobre PESO E UTILIZAÇÃO — não apenas que a tarefa está descrita.
      var sec8 = sMap[8] || {};
      // Dado 1: valor de peso registrado especificamente para a ferramenta
      var temPesoRegistrado = !!(sec8.peso_ferramenta_valor);
      // Dado 2: campo de contexto de uso da ferramenta (campo específico, não tarefa geral)
      var temContextoUso = !!(sec8.descricao_tarefa_ferramenta);
      // Dado 3: texto da descrição da FERRAMENTA (não da tarefa) com termos de peso específicos
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '').toLowerCase();
      var termosPesoFerramenta = [
        'pesad', 'pesando', 'kg', 'quilograma', 'grama',
        'peso da ferramenta', 'peso do equipamento',
        'ferramenta pesada', 'equipamento pesado',
        'carga da ferramenta', 'peso elevado da', 'peso do instrumento'
      ];
      var temTermoPesoFerramenta = termosPesoFerramenta.some(function(t) {
        return descFerramenta.indexOf(t) !== -1;
      });
      // Confirmação exige: peso registrado OU (contexto de uso E termos de peso na descrição da ferramenta)
      return temPesoRegistrado || temContextoUso || (temTermoPesoFerramenta && descFerramenta.length >= 10);
    },
    limitacao: 'Item 17.7.4: não define limite de peso em kg. Exige dispositivo de sustentação ou outra medida quando comprometer saúde/segurança, definida a partir da AEP ou AET. A descrição geral da tarefa isoladamente não sustenta a aplicação deste item.',
    limitacaoAplicabilidade: 'Quando os dados não permitirem verificar a condição do item 17.7.4, preservar o achado com linguagem descritiva proporcional, sem referenciar o item especificamente.'
  },

  conservacao: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'estado de conservação das ferramentas',
    criteriosAplicabilidade: [
      'Desgaste físico da ferramenta documentado com impacto no esforço ou desempenho operacional'
    ],
    dadosNecessarios: ['descricao_desgaste_ferramenta'],
    testAplicabilidade: function(checkpointId, sMap) {
      var sec8 = sMap[8] || {};
      var temDescricao = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var palavrasDesgaste = ['desgast', 'danif', 'quebr', 'manutencao', 'manutenção', 'falh'];
      var textoLower = temDescricao.toLowerCase();
      return palavrasDesgaste.some(function(p) { return textoLower.indexOf(p) !== -1; });
    },
    limitacao: 'Ponto 64 Fundacentro: recomendação técnico-operacional. Não constitui enquadramento infracional direto da NR-17.',
    limitacaoAplicabilidade: 'Referência omitida quando não há dado descritivo sobre o desgaste ou impacto no esforço.'
  },

  pega_ergonomica: {
    grau: 'A',
    referencia: ['REF_NR17_177'],
    descricaoProfissional: 'pega ou empunhadura das ferramentas',
    criteriosAplicabilidade: [
      'Empunhadura com quinas ou arestas vivas causando compressão palmar',
      'Formato, textura ou dimensão inadequados à tarefa ou ao eventual uso de luvas',
      'Dificuldade de uso diretamente relacionada à ferramenta descrita nos dados'
    ],
    dadosNecessarios: ['descricao_especifica_pega_ferramenta'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: 'manuseio' é termo genérico e NÃO confirma 17.7.5/17.7.6.
      // Exige palavras específicas relacionadas à pega/empunhadura da ferramenta.
      var sec8 = sMap[8] || {};
      var temDescricao = (
        sec8.descricao_ferramenta ||
        sec8.observacoes_ferramentas ||
        ''
      ).toLowerCase();
      // Palavras-chave específicas de pega/empunhadura — sem 'manuseio'
      var palavrasPega = [
        'pega', 'empunhadura', 'cabo', 'compressao', 'compressão',
        'aresta', 'quina', 'luva', 'formato', 'textura',
        'palma', 'dedos comprimid', 'dedo comprimid',
        'cabo inadequado', 'cabo sem', 'difícil de segurar',
        'dificil de segurar', 'escorrega', 'difícil de pegar',
        'dificil de pegar', 'difícil de apertar'
      ];
      return palavrasPega.some(function(p) { return temDescricao.indexOf(p) !== -1; });
    },
    limitacao: 'Itens 17.7.5 e 17.7.6: regulam compressão palmar por arestas/quinas e adequação da empunhadura à tarefa.',
    limitacaoAplicabilidade: 'Quando houver apenas o checkpoint inadequado sem caracterização específica da pega, preservar o achado sem presumir qual subitem se aplica.'
  },

  vibracao_ferram: {
    grau: 'B',
    referencia: ['REF_FUNDACENTRO_VERIFICACAO'],
    descricaoProfissional: 'exposição a vibrações transmitidas às mãos durante a atividade',
    criteriosAplicabilidade: [
      'Dado indicando ferramenta ou equipamento manual com transmissão de vibração às mãos'
    ],
    dadosNecessarios: ['indicador_vibration_especifico'],
    testAplicabilidade: function(checkpointId, sMap) {
      // REGRA 4.6: 'motor', 'elétrico' são genéricos e NÃO confirmam vibração.
      // Exige dado específico de vibração ou ferramenta com característica vibratória descrita.
      var sec8 = sMap[8] || {};
      var tarefa = ((sMap[3] && sMap[3].descricao_tarefa) || '');
      var descFerramenta = (sec8.descricao_ferramenta || sec8.observacoes_ferramentas || '');
      var textoCompleto = (tarefa + ' ' + descFerramenta).toLowerCase();
      var indicadoresEspecificos = [
        'vibra', 'vibrat', 'vibração', 'percussão', 'percussao',
        'impacto repetit', 'pneumát', 'pneumat', 'oscila',
        'pressao de ar', 'pressão de ar', 'ferramenta vibrat',
        'martelet', 'esmerilhad', 'lixadeira', 'serr', 'furadeira',
        'parafusadeira de impacto', 'chave de impacto'
      ];
      return indicadoresEspecificos.some(function(p) { return textoCompleto.indexOf(p) !== -1; });
    },
    limitacao: 'Ponto 63 Fundacentro: recomendação de atenuação de vibração no cabo. Não substitui limites quantitativos da NR-15.',
    limitacaoAplicabilidade: 'Referência omitida quando não há indicação específica de ferramenta vibratória ou de transmissão de vibração nas mãos.'
  },

  epis: {
    grau: 'C',
    referencia: null,
    descricaoProfissional: 'adequação dos equipamentos de proteção individual utilizados',
    criteriosAplicabilidade: [],
    dadosNecessarios: [],
    testAplicabilidade: function() { return false; },
    limitacao: 'A base disponível não contém referência específica para fundamentar a adequação ergonômica, antropométrica ou o conforto do EPI avaliado neste checkpoint.',
    limitacaoAplicabilidade: 'Achado pode aparecer na conclusão quando tecnicamente relevante (risco mapeado ou relação direta com atividade principal). Referência nunca exibida.'
  },

  treinamento_equip: {
    grau: 'C',
    referencia: null,
    descricaoProfissional: 'treinamento para utilização das ferramentas e equipamentos',
    criteriosAplicabilidade: [],
    dadosNecessarios: [],
    testAplicabilidade: function() { return false; },
    limitacao: 'Sem referência específica mapeada na base atual para treinamento de ferramentas comuns na NR-17.',
    limitacaoAplicabilidade: 'Achado pode aparecer na conclusão quando tecnicamente relevante (risco mapeado ou relação direta com atividade principal). Referência nunca exibida.'
  }

};

// Alias para chaves com caractere especial (compatibilidade com dados existentes)
NORMATIVE_ASSOCIATIONS['vibração_ferram'] = NORMATIVE_ASSOCIATIONS['vibracao_ferram'];
NORMATIVE_ASSOCIATIONS['rotacao_cabeça']  = NORMATIVE_ASSOCIATIONS['rotacao_cabeca'];

// ─── Descrições profissionais para checkpoints fora da matriz A/B/C ──────────
// Aparecem no objeto de auditoria mas não geram referência
var DESC_COMPLEMENTAR = {
  mesa_altura:          'altura inadequada da mesa ou plano de trabalho',
  mesa_regulagem:       'características ou dimensões inadequadas da mesa de trabalho',
  mesa_borda:           'compressão de tecidos por quinas vivas ou bordas sem arredondamento',
  cadeira_regulagem:    'assento com limitação de ajustabilidade',
  cadeira_apoio_lombar: 'assento sem suporte ou apoio lombar adequado',
  cadeira_apoio_braco:  'assento sem apoios reguláveis de braço',
  espaco_pernas:        'espaço físico livre inadequado para pernas sob a bancada',
  monitor_distancia:    'posicionamento ou distância inadequada do monitor',
  apoio_pes:            'ausência ou inadequação de apoio para os pés',
  apoio_punho:          'ausência de apoio adequado para os membros superiores',
  levantamento_manual:  'demanda de levantamento manual de carga',
  transporte_manual:    'demanda de transporte manual de carga',
  peso_manipulado:      'manuseio de carga com peso relevante',
  alcance_horizontal:   'alcances horizontais durante o manuseio de materiais',
  manuseio_ferramentas_pesadas: 'manuseio de ferramentas ou objetos com peso relevante',
  facilitadores:        'indisponibilidade de facilitadores ergonômicos no manuseio',
  ritmo:                'exigências relacionadas ao ritmo de trabalho',
  pausas:               'organização de pausas de trabalho',
  horas_extras:         'frequência de horas extras executadas',
  folgas:               'regularidade de folgas e descanso semanal',
  dimensionamento:      'dimensionamento de pessoal na equipe',
  pressao:              'pressão por produtividade e cumprimento de metas',
  autonomia:            'baixa autonomia na organização ou execução da atividade'
};

// ─── avaliarAplicabilidade ────────────────────────────────────────────────────
/**
 * Avalia a aplicabilidade de referência para um checkpoint específico.
 * Retorna o objeto de decisão com as 4 decisões independentes.
 *
 * @param {string} checkpointId
 * @param {object} sMap
 * @returns {object}
 */
function avaliarAplicabilidade(checkpointId, sMap) {
  var meta = NORMATIVE_ASSOCIATIONS[checkpointId];

  // Descrição profissional: matriz A/B/C → mapa complementar → fallback legível
  var descProf = meta
    ? meta.descricaoProfissional
    : (DESC_COMPLEMENTAR[checkpointId] || checkpointId.replace(/_/g, ' '));

  var base = {
    checkpointId: checkpointId,
    grau: meta ? meta.grau : 'C',
    descricaoProfissional: descProf,
    referencia: meta ? meta.referencia : null,
    registrarNaAuditoria: true,              // Sempre true — todo achado é registrado
    incluirNaConclusao: false,               // Decidido por avaliarRelevanciaParaConclusao
    exibirReferencia: false,
    caracterizarNaoConformidade: false,      // Sempre false nesta versão
    aplicabilidade: 'nao_confirmada',
    limitacao: meta ? meta.limitacao : 'Sem referência específica mapeada na base atual.',
    justificativa: ''
  };

  if (!meta) {
    base.justificativa = 'Checkpoint sem mapeamento na matriz de fundamentação. Registrado na auditoria.';
    return base;
  }

  if (meta.grau === 'C') {
    base.exibirReferencia = false;
    base.aplicabilidade = 'nao_confirmada';
    base.justificativa = meta.limitacao;
    return base;
  }

  // Graus A e B: testar condição documental
  try {
    var condicaoSatisfeita = meta.testAplicabilidade(checkpointId, sMap);
    if (condicaoSatisfeita) {
      base.exibirReferencia = true;
      base.aplicabilidade = 'confirmada';
      base.justificativa = 'Regra de aplicabilidade documental satisfeita com dados disponíveis.';
    } else {
      base.exibirReferencia = false;
      base.aplicabilidade = 'parcial';
      base.justificativa = meta.limitacaoAplicabilidade || 'Dados mínimos necessários não confirmados.';
    }
  } catch (e) {
    base.exibirReferencia = false;
    base.aplicabilidade = 'nao_confirmada';
    base.justificativa = 'Erro ao avaliar aplicabilidade: ' + e.message;
  }

  return base;
}

// ─── avaliarRelevanciaParaConclusao ──────────────────────────────────────────
/**
 * Avalia se um achado deve ser incluído na conclusão do relatório.
 * As 4 decisões são independentes: registrarNaAuditoria já é true.
 * Esta função decide apenas incluirNaConclusao.
 *
 * @param {object} decisao
 * @param {object} sMap
 * @param {Array}  complaints
 * @param {object} riskMap
 * @returns {boolean}
 */
function avaliarRelevanciaParaConclusao(decisao, sMap, complaints, riskMap) {
  var id = decisao.checkpointId;

  // 1. Compatibilidade anatômica com queixa registrada
  var COMPLAINT_TO_CHECKPOINTS = {
    pescoco:         ['flexao_cervical_30', 'rotacao_cabeca', 'rotacao_cabeça', 'monitor_distancia'],
    coluna_cervical: ['flexao_cervical_30', 'rotacao_cabeca', 'rotacao_cabeça'],
    ombro_d:         ['elevacao_ombros_90', 'abducao_ombros_45'],
    ombro_e:         ['elevacao_ombros_90', 'abducao_ombros_45'],
    braco_d:         ['elevacao_ombros_90', 'abducao_ombros_45'],
    braco_e:         ['elevacao_ombros_90', 'abducao_ombros_45'],
    cotovelo_d:      ['movimentos_repetitivos'],
    cotovelo_e:      ['movimentos_repetitivos'],
    antebraco_d:     ['movimentos_repetitivos', 'pega_ergonomica', 'desvio_punho_extremo'],
    antebraco_e:     ['movimentos_repetitivos', 'pega_ergonomica', 'desvio_punho_extremo'],
    punho_d:         ['desvio_punho_extremo', 'movimentos_repetitivos'],
    punho_e:         ['desvio_punho_extremo', 'movimentos_repetitivos'],
    costas_superior: ['flexao_coluna_45'],
    costas_inferior: ['flexao_coluna_45', 'postura_estatica'],
    coluna_lombar:   ['flexao_coluna_45', 'postura_sentada_prolongada', 'postura_estatica'],
    quadril:         ['postura_sentada_prolongada', 'postura_estatica'],
    joelho:          ['postura_predominante', 'postura_estatica'],
    perna:           ['postura_predominante', 'deslocamento'],
    tornozelo:       ['postura_predominante', 'deslocamento'],
    pe:              ['postura_predominante', 'deslocamento']
  };

  if (complaints && complaints.length > 0) {
    var temCompatibilidade = complaints.some(function(q) {
      var mapeados = COMPLAINT_TO_CHECKPOINTS[q.regiao] || [];
      return mapeados.indexOf(id) !== -1;
    });
    if (temCompatibilidade) return true;
  }

  // 2. Grau A é sempre relevante quando inadequado
  var meta = NORMATIVE_ASSOCIATIONS[id];
  if (meta && meta.grau === 'A') return true;

  // 3. Achados físicos, de carga e de mobiliário principais
  var checkpointsPrincipais = [
    'postura_predominante', 'postura_sentada_prolongada', 'movimentos_repetitivos',
    'esforco_fisico', 'flexao_coluna_45', 'elevacao_ombros_90',
    'abducao_ombros_45', 'desvio_punho_extremo', 'postura_estatica',
    'levantamento_manual', 'transporte_manual', 'peso_manipulado',
    'mesa_altura', 'mesa_regulagem', 'mesa_borda',
    'cadeira_regulagem', 'cadeira_apoio_lombar', 'cadeira_apoio_braco', 'espaco_pernas', 'monitor_distancia'
  ];
  if (checkpointsPrincipais.indexOf(id) !== -1) return true;

  // 4. Relevância pela matriz de risco (RPN >= 4), por associação de nome parcial
  if (riskMap) {
    var primeiraChave = id.split('_')[0];
    var temRiscoAssociado = Object.entries(riskMap).some(function(entry) {
      var riskId = entry[0]; var r = entry[1];
      if (!r || !r.grav) return false;
      var rpn = parseInt(r.grav) * parseInt(r.p_exp || r.prob || 0);
      return rpn >= 4 && riskId.toLowerCase().indexOf(primeiraChave) !== -1;
    });
    if (temRiscoAssociado) return true;
  }

  // 5. Achados C específicos (epis, treinamento_equip) — exige vínculo identificável com a matriz de risco (RPN >= 4)
  if (id === 'epis' && riskMap) {
    var temRiscoEpi = Object.entries(riskMap).some(function(entry) {
      var riskId = entry[0].toLowerCase(); var r = entry[1];
      if (!r || !r.grav) return false;
      var rpn = parseInt(r.grav) * parseInt(r.p_exp || r.prob || 0);
      return rpn >= 4 && (riskId.indexOf('epi') !== -1 || riskId.indexOf('protecao') !== -1 || riskId.indexOf('proteção') !== -1);
    });
    if (temRiscoEpi) return true;
  }

  if (id === 'treinamento_equip' && riskMap) {
    var temRiscoTreinamentoEquip = Object.entries(riskMap).some(function(entry) {
      var riskId = entry[0].toLowerCase(); var r = entry[1];
      if (!r || !r.grav) return false;
      var rpn = parseInt(r.grav) * parseInt(r.p_exp || r.prob || 0);
      return rpn >= 4 && (
        riskId.indexOf('maquina') !== -1 || riskId.indexOf('máquina') !== -1 ||
        riskId.indexOf('equipamento') !== -1 || riskId.indexOf('ferramenta') !== -1 ||
        riskId.indexOf('treinamento') !== -1 || riskId.indexOf('operacao') !== -1 ||
        riskId.indexOf('operaçao') !== -1 || riskId.indexOf('operação') !== -1
      );
    });
    if (temRiscoTreinamentoEquip) return true;
  }

  return false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NORMATIVE_ASSOCIATIONS: NORMATIVE_ASSOCIATIONS,
    avaliarAplicabilidade: avaliarAplicabilidade,
    avaliarRelevanciaParaConclusao: avaliarRelevanciaParaConclusao
  };
} else if (typeof window !== 'undefined') {
  window.NORMATIVE_ASSOCIATIONS = NORMATIVE_ASSOCIATIONS;
  window.avaliarAplicabilidade = avaliarAplicabilidade;
  window.avaliarRelevanciaParaConclusao = avaliarRelevanciaParaConclusao;
}
