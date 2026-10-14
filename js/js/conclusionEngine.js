/**
 * ErgonomicConclusionEngine - Motor de Conclusão Ergonômica Interpretativa
 * Versão: Fase 4.4 — Regra de Decisão com 4 decisões independentes
 *
 * Fluxo: DADO → ACHADO → REGISTRO NA AUDITORIA → ANÁLISE DE RELEVÂNCIA
 *        → INTERPRETAÇÃO → TESTE DE APLICABILIDADE DA REFERÊNCIA
 *        → FUNDAMENTAÇÃO → SÍNTESE DA CONCLUSÃO
 *
 * Regras obrigatórias:
 *  - Todo achado inadequado é registrado na auditoria (registrarNaAuditoria = true)
 *  - Nem todo achado inadequado aparece na conclusão (incluirNaConclusao avaliado)
 *  - Achados C podem aparecer na conclusão quando relevantes
 *  - Achados C nunca recebem referência específica inexistente
 *  - Associações A exigem teste de aplicabilidade documental
 *  - Associações B exigem contexto adicional antes de exibir referência
 *  - Nenhuma associação caracteriza não conformidade automaticamente
 */
var ErgonomicConclusionEngine = (function() {

  // Mapeamento legível de regiões corporais para o texto da conclusão
  const BODY_REGIONS_MAP = {
    pescoco: 'pescoço',
    ombro_d: 'ombro direito',
    ombro_e: 'ombro esquerdo',
    braco_d: 'braço direito',
    braco_e: 'braço esquerdo',
    cotovelo_d: 'cotovelo direito',
    cotovelo_e: 'cotovelo esquerdo',
    antebraco_d: 'antebraço direito',
    antebraco_e: 'antebraço esquerdo',
    punho_d: 'região do punho e mão direita',
    punho_e: 'região do punho e mão esquerda',
    coluna_cervical: 'região cervical',
    coluna_toracica: 'região torácica',
    coluna_lombar: 'região lombar',
    quadril_d: 'quadril direito',
    quadril_e: 'quadril esquerdo',
    joelho_d: 'joelho direito',
    joelho_e: 'joelho esquerdo',
    tornozelo_d: 'região do tornozelo e pé direito',
    tornozelo_e: 'região do tornozelo e pé esquerdo',
    costas_superior: 'região dorsal superior',
    costas_inferior: 'região dorsal inferior',
    quadril: 'quadril',
    joelho: 'joelho',
    perna: 'perna',
    tornozelo: 'tornozelo',
    pe: 'pé'
  };

  // Mapeamento de checkpoints para descrição profissional (fallback quando módulo externo não disponível)
  const CHECKPOINT_DESC_MAP = {
    ritmo: 'exigências relacionadas ao ritmo de trabalho',
    pausas: 'organização de pausas de trabalho',
    horas_extras: 'frequência de horas extras executadas',
    folgas: 'regularidade de folgas e descanso semanal',
    dimensionamento: 'dimensionamento de pessoal na equipe',
    pressao: 'pressão por produtividade e cumprimento de metas',
    autonomia: 'baixa autonomia na organização ou execução da atividade',
    postura_predominante: 'trabalho predominantemente de pé por longos períodos',
    postura_sentada_prolongada: 'permanência prolongada na postura sentada',
    postura_estatica: 'manutenção de postura estática ou fixa durante a atividade',
    movimentos_repetitivos: 'atividade com movimentos repetitivos de membros superiores',
    esforco_fisico: 'exigência de esforço físico na atividade',
    pedais_alavancas: 'acionamento de pedais ou alavancas durante a atividade',
    deslocamento: 'deslocamento a pé durante a execução da tarefa',
    movimentacao_pacientes: 'demanda de movimentação ou transferência de pacientes',
    flexao_cervical_30: 'postura de flexão cervical acentuada',
    rotacao_cabeça: 'posturas de rotação ou inclinação da cabeça durante a atividade',
    rotacao_cabeca: 'posturas de rotação ou inclinação da cabeça durante a atividade',
    flexao_coluna_45: 'demanda postural de flexão de tronco durante a atividade',
    elevacao_ombros_90: 'demanda postural de elevação de membros superiores',
    abducao_ombros_45: 'demanda postural de abdução de membros superiores',
    desvio_punho_extremo: 'postura desfavorável com desvio acentuado de punho durante a atividade',
    levantamento_manual: 'demanda de levantamento manual de carga',
    transporte_manual: 'demanda de transporte manual de carga',
    peso_manipulado: 'manuseio de carga com peso relevante',
    alcance_horizontal: 'alcances horizontais durante o manuseio de materiais',
    manuseio_ferramentas_pesadas: 'manuseio de ferramentas ou objetos com peso relevante',
    facilitadores: 'indisponibilidade de facilitadores ergonômicos no manuseio',
    adequacao: 'inadequação de ferramentas ou equipamentos à tarefa',
    peso_ferramentas: 'peso das ferramentas utilizadas na atividade',
    conservacao: 'estado de conservação das ferramentas',
    pega_ergonomica: 'pega ou empunhadura das ferramentas',
    'vibração_ferram': 'exposição a vibrações transmitidas às mãos durante a atividade',
    vibracao_ferram: 'exposição a vibrações transmitidas às mãos durante a atividade',
    epis: 'adequação dos equipamentos de proteção individual utilizados',
    treinamento_equip: 'treinamento para utilização das ferramentas e equipamentos',
    mesa_altura: 'altura inadequada da mesa ou plano de trabalho',
    mesa_regulagem: 'características ou dimensões inadequadas da mesa de trabalho',
    mesa_borda: 'compressão de tecidos por quinas vivas ou bordas sem arredondamento',
    cadeira_regulagem: 'assento com limitação de ajustabilidade',
    cadeira_apoio_lombar: 'assento sem suporte ou apoio lombar adequado',
    cadeira_apoio_braco: 'assento sem apoios reguláveis de braço',
    espaco_pernas: 'espaço físico livre inadequado para pernas sob a bancada',
    monitor_distancia: 'posicionamento ou distância inadequada do monitor',
    apoio_pes: 'ausência ou inadequação de apoio para os pés',
    apoio_punho: 'ausência de apoio adequado para os membros superiores'
  };

  /**
   * Obtém o módulo de associações normativas (interno ou externo)
   */
  function getAssociationsModule() {
    if (typeof window !== 'undefined' && window.avaliarAplicabilidade) {
      return {
        avaliarAplicabilidade: window.avaliarAplicabilidade,
        avaliarRelevanciaParaConclusao: window.avaliarRelevanciaParaConclusao
      };
    }
    try {
      return require('./knowledge/normativeAssociations.js');
    } catch (e) {
      return null;
    }
  }

  /**
   * Obtém a base de conhecimento consolidada
   */
  function getKnowledgeBase() {
    let base = [];
    if (typeof window !== 'undefined') {
      if (window.NR17_KNOWLEDGE)        base = base.concat(window.NR17_KNOWLEDGE);
      if (window.NR01_KNOWLEDGE)        base = base.concat(window.NR01_KNOWLEDGE);
      if (window.FUNDACENTRO_KNOWLEDGE) base = base.concat(window.FUNDACENTRO_KNOWLEDGE);
    } else {
      try {
        base = base.concat(require('./knowledge/nr17.js'));
        base = base.concat(require('./knowledge/nr01.js'));
        base = base.concat(require('./knowledge/fundacentro.js'));
      } catch (e) { /* fallback silencioso */ }
    }
    return base;
  }

  /**
   * Descrição profissional de um checkpoint — nunca expõe o código interno
   */
  function descricaoProfissional(checkpointId, assocModule) {
    // 1. Tentar módulo de associações
    if (assocModule && assocModule.NORMATIVE_ASSOCIATIONS) {
      const meta = assocModule.NORMATIVE_ASSOCIATIONS[checkpointId];
      if (meta && meta.descricaoProfissional) return meta.descricaoProfissional;
    }
    if (typeof window !== 'undefined' && window.NORMATIVE_ASSOCIATIONS) {
      const meta = window.NORMATIVE_ASSOCIATIONS[checkpointId];
      if (meta && meta.descricaoProfissional) return meta.descricaoProfissional;
    }
    // 2. Fallback no mapa local
    return CHECKPOINT_DESC_MAP[checkpointId] || checkpointId.replace(/_/g, ' ');
  }

  /**
   * Determina a frase de ritmo de trabalho com base nos dados efetivamente coletados
   */
  function resolverDescRitmo(sMap) {
    if (!sMap[5]) return null;
    if (sMap[5].ritmo_imposto_maquina === 'sim') return 'ritmo de trabalho imposto pela máquina';
    if (sMap[5].ritmo_imposto_linha === 'sim')   return 'ritmo de trabalho imposto pela dinâmica da linha';
    if (sMap[5].ritmo_livre === 'nao')            return 'ritmo de trabalho não determinado livremente pelo trabalhador';
    return null; // Não inventar origem quando não registrada
  }

  /**
   * Motor principal — gera o objeto estruturado de raciocínio ergonômico
   *
   * @param {object} sMap       - Mapa completo de dados da AEP
   * @param {Array}  complaints - Queixas registradas [{regiao, intensidade}]
   * @returns {object}          - Objeto de resultado com conclusão e auditoria
   */
  function generateInterpretiveConclusion(sMap, complaints) {
    const kb = getKnowledgeBase();
    const assocModule = getAssociationsModule();

    const result = {
      achados: [],             // Achados: registrarNaAuditoria = true para todos
      objetoAuditoria: [],     // Log detalhado com as 4 decisões por checkpoint
      achadosNaConclusao: [],  // Subconjunto: incluirNaConclusao = true
      fatoresExposicao: [],
      demandas: [],
      interacoes: [],
      queixasRelacionadas: [],
      fundamentacao: [],       // Referências efetivamente aplicáveis
      prioridades: [],
      limitacoes: [],
      conclusao: '',
      sugerirAprofundamento: false
    };

    // Mapa de riscos (Seção 12)
    const rMap = (sMap[12] && sMap[12].risks) ? sMap[12].risks : {};

    // ─── PASSO 1: DADO → ACHADO → REGISTRO NA AUDITORIA ──────────────────
    const sectionConfigs = {
      5: { cat: 'organizacao',  name: 'Organização do Trabalho' },
      6: { cat: 'fisicas',      name: 'Exigências Físicas' },
      7: { cat: 'cargas',       name: 'Manipulação de Cargas' },
      8: { cat: 'ferramentas',  name: 'Ferramentas e Equipamentos' },
      9: { cat: 'mobiliario',   name: 'Mobiliário' }
    };

    for (const [secNum, config] of Object.entries(sectionConfigs)) {
      const secData = sMap[secNum];
      if (secData && secData.checklist) {
        for (const [itemId, itemVal] of Object.entries(secData.checklist)) {
          if (itemVal && (itemVal.status === 'inadequate' || itemVal.status === 'warning')) {

            // Achado sempre registrado
            const achado = {
              id: itemId,
              categoria: config.cat,
              status: itemVal.status,
              descricaoProfissional: descricaoProfissional(itemId, assocModule),
              origem: {
                secao: secNum.toString(),
                valorOriginal: itemVal.status
              }
            };
            result.achados.push(achado);

            // ─── PASSO 2: ANÁLISE DE RELEVÂNCIA + TESTE DE APLICABILIDADE ─────
            let decisao;
            if (assocModule && assocModule.avaliarAplicabilidade) {
              decisao = assocModule.avaliarAplicabilidade(itemId, sMap);
            } else if (typeof window !== 'undefined' && window.avaliarAplicabilidade) {
              decisao = window.avaliarAplicabilidade(itemId, sMap);
            } else {
              // Fallback mínimo sem módulo externo
              decisao = {
                checkpointId: itemId,
                grau: 'C',
                descricaoProfissional: achado.descricaoProfissional,
                referencia: null,
                registrarNaAuditoria: true,
                incluirNaConclusao: false,
                exibirReferencia: false,
                caracterizarNaoConformidade: false,
                aplicabilidade: 'nao_confirmada',
                limitacao: 'Módulo de associações normativas não carregado.',
                justificativa: 'Módulo externo não disponível.'
              };
            }

            // ─── PASSO 3: DECIDIR incluirNaConclusao ─────────────────────────
            let incluir = false;
            if (assocModule && assocModule.avaliarRelevanciaParaConclusao) {
              incluir = assocModule.avaliarRelevanciaParaConclusao(decisao, sMap, complaints, rMap);
            } else if (typeof window !== 'undefined' && window.avaliarRelevanciaParaConclusao) {
              incluir = window.avaliarRelevanciaParaConclusao(decisao, sMap, complaints, rMap);
            } else {
              // Fallback: inclui achados de categorias principais
              incluir = ['fisicas', 'cargas', 'ferramentas'].includes(config.cat);
            }
            decisao.incluirNaConclusao = incluir;

            // Garantir: nunca caracterizar não conformidade
            decisao.caracterizarNaoConformidade = false;

            result.objetoAuditoria.push(decisao);

            if (incluir) {
              result.achadosNaConclusao.push(decisao);
              // Referências efetivamente aplicáveis
              if (decisao.exibirReferencia && decisao.referencia) {
                const refs = Array.isArray(decisao.referencia) ? decisao.referencia : [decisao.referencia];
                refs.forEach(refId => {
                  const refObj = kb.find(r => r.id === refId);
                  if (refObj && !result.fundamentacao.find(r => r.id === refId)) {
                    result.fundamentacao.push(refObj);
                  }
                });
              }
            }

            // Demandas para interações (manutenção do comportamento existente)
            if (config.cat === 'fisicas') {
              result.demandas.push(achado.descricaoProfissional);
            } else if (config.cat === 'cargas') {
              result.demandas.push('exigência de manuseio ou levantamento de carga');
            } else if (config.cat === 'organizacao') {
              // Especial para ritmo: usar dado efetivamente registrado
              if (itemId === 'ritmo') {
                const descRitmo = resolverDescRitmo(sMap);
                if (descRitmo) result.demandas.push(descRitmo);
              } else {
                result.demandas.push(achado.descricaoProfissional);
              }
            }
          }
        }
      } else {
        result.limitacoes.push(`Checklist da seção de ${config.name} não preenchido na avaliação.`);
      }
    }

    // ─── PASSO 4: FATORES DE EXPOSIÇÃO ────────────────────────────────────
    const actData = sMap[3] || {};
    if (actData.descricao_tarefa) {
      result.fatoresExposicao.push({
        chave: 'descricao_tarefa',
        valor: actData.descricao_tarefa,
        origem: { secao: '3', campo: 'descricao_tarefa' }
      });
    } else {
      result.limitacoes.push('Descrição detalhada da tarefa real ausente.');
    }

    const workerData = sMap[2] || {};
    if (workerData.funcao) {
      result.fatoresExposicao.push({
        chave: 'funcao',
        valor: workerData.funcao,
        origem: { secao: '2', campo: 'funcao' }
      });
    } else {
      result.limitacoes.push('Função do trabalhador não especificada.');
    }

    // Fatores ambientais (Seção 4)
    const envData = sMap[4];
    if (envData && envData.ratings) {
      for (const [envId, rating] of Object.entries(envData.ratings)) {
        if (rating && (rating.value === 1 || rating.value === 2 || rating.value === 3)) {
          result.achados.push({
            id: envId,
            categoria: 'ambientais',
            status: 'inadequate',
            descricaoProfissional: `conforto ambiental (${envId.replace(/_/g, ' ')})`,
            origem: { secao: '4', valorOriginal: rating.value }
          });
        }
      }
    }

    // Tempo de levantamento de cargas
    const tempoCargas = sMap[7] || {};
    if (tempoCargas.cargas_levantamento_horas_turno) {
      result.fatoresExposicao.push({
        chave: 'tempo_levantamento_cargas',
        valor: tempoCargas.cargas_levantamento_horas_turno,
        origem: { secao: '7', campo: 'cargas_levantamento_horas_turno' }
      });
    }

    // ─── PASSO 5: INTERAÇÕES ENTRE FATORES ───────────────────────────────
    const achadosIds = result.achados.map(a => a.id);
    const achadosConclusaoIds = result.achadosNaConclusao.map(a => a.checkpointId);

    const temPosturaAdversa = achadosConclusaoIds.some(id =>
      ['flexao_coluna_45', 'elevacao_ombros_90', 'abducao_ombros_45', 'desvio_punho_extremo'].includes(id)
    );
    const temRepetitividade = achadosConclusaoIds.includes('movimentos_repetitivos');
    const temMobiliarioInadequado = achadosConclusaoIds.some(id =>
      ['cadeira_regulagem', 'postura_sentada_prolongada'].includes(id)
    );

    if (temPosturaAdversa && temRepetitividade) {
      result.interacoes.push({
        tipo: 'biomecanica_postura_repetitividade',
        mensagem: 'A combinação de demanda postural desfavorável com movimentos repetitivos representa demanda musculoesquelética que deve ser considerada conjuntamente na interpretação da atividade.'
      });
      result.sugerirAprofundamento = true;
    }

    if (temPosturaAdversa && temMobiliarioInadequado) {
      result.interacoes.push({
        tipo: 'biomecanica_posto_mobiliario',
        mensagem: 'A limitação de ajustabilidade do assento constitui condição do posto que deve ser considerada em conjunto com as demandas posturais observadas.'
      });
    }

    const temFlexaoTronco  = achadosConclusaoIds.includes('flexao_coluna_45');
    const temLevantamento  = achadosIds.includes('levantamento_manual');
    const temTransporte    = achadosIds.includes('transporte_manual');
    if (temFlexaoTronco && (temLevantamento || temTransporte)) {
      result.interacoes.push({
        tipo: 'combinada_cargas_tronco',
        mensagem: 'Na atividade avaliada, a movimentação manual de cargas ocorre associada à demanda postural de flexão do tronco, devendo esses fatores ser considerados conjuntamente na interpretação da demanda biomecânica.'
      });
    }

    // ─── PASSO 6: QUEIXAS E COMPATIBILIDADE ANATÔMICA ────────────────────
    if (complaints && complaints.length > 0) {
      const COMPLAINT_CORRELATIONS = {
        pescoco:         ['flexao_cervical_30', 'rotacao_cabeça', 'rotacao_cabeca', 'monitor_distancia'],
        ombro_d:         ['elevacao_ombros_90', 'abducao_ombros_45', 'levantamento_manual'],
        ombro_e:         ['elevacao_ombros_90', 'abducao_ombros_45', 'levantamento_manual'],
        braco_d:         ['elevacao_ombros_90', 'abducao_ombros_45'],
        braco_e:         ['elevacao_ombros_90', 'abducao_ombros_45'],
        cotovelo_d:      ['movimentos_repetitivos'],
        cotovelo_e:      ['movimentos_repetitivos'],
        antebraco_d:     ['movimentos_repetitivos', 'pega_ergonomica', 'desvio_punho_extremo'],
        antebraco_e:     ['movimentos_repetitivos', 'pega_ergonomica', 'desvio_punho_extremo'],
        punho_d:         ['desvio_punho_extremo', 'movimentos_repetitivos', 'apoio_punho'],
        punho_e:         ['desvio_punho_extremo', 'movimentos_repetitivos', 'apoio_punho'],
        costas_superior: ['flexao_coluna_45', 'cadeira_apoio_lombar'],
        costas_inferior: ['flexao_coluna_45', 'levantamento_manual', 'transporte_manual', 'cadeira_apoio_lombar'],
        coluna_lombar:   ['flexao_coluna_45', 'levantamento_manual', 'transporte_manual', 'postura_sentada_prolongada'],
        coluna_cervical: ['flexao_cervical_30', 'rotacao_cabeça', 'rotacao_cabeca'],
        quadril:         ['postura_sentada_prolongada', 'postura_estatica'],
        joelho:          ['postura_predominante', 'postura_estatica'],
        perna:           ['postura_predominante', 'deslocamento', 'apoio_pes'],
        tornozelo:       ['postura_predominante', 'deslocamento'],
        pe:              ['postura_predominante', 'deslocamento']
      };

      complaints.forEach(q => {
        const regiao = q.regiao;
        const itensRelacionados = COMPLAINT_CORRELATIONS[regiao] || [];
        const achadosComp = result.achados.filter(a => itensRelacionados.includes(a.id));

        if (achadosComp.length > 0) {
          const regiaoLimpa = BODY_REGIONS_MAP[regiao] || regiao.replace(/_/g, ' ');
          const tipoSintoma = (q.tipo && q.tipo !== '-') ? q.tipo.toLowerCase() : 'desconforto';
          const intText = (q.intensidade && q.intensidade !== '0') ? ` (intensidade ${q.intensidade}/5)` : '';
          const msgCompatibilidade = `Foi relatado ${tipoSintoma} em ${regiaoLimpa}${intText}, região correspondente ao segmento corporal envolvido na demanda postural identificada. Essa informação deve ser considerada de forma complementar na interpretação das condições de trabalho, sem que essa compatibilidade, isoladamente, permita estabelecer relação causal.`;

          result.queixasRelacionadas.push({
            queixa: regiao,
            intensidade: q.intensidade,
            mensagem: msgCompatibilidade
          });
          result.interacoes.push({
            tipo: 'queixa_compatibilidade_anatomica',
            mensagem: msgCompatibilidade
          });
        }
      });
    }

    // ─── PASSO 7: FUNDAMENTAÇÃO — hierarquia das fontes ──────────────────
    const hierarchyOrder = { normativa: 1, interpretativa_oficial: 2, tecnica: 3, historica: 4 };
    result.fundamentacao.sort((a, b) =>
      (hierarchyOrder[a.tipoFonte] || 9) - (hierarchyOrder[b.tipoFonte] || 9)
    );
    const temNormativaModerna = result.fundamentacao.some(r => r.tipoFonte === 'normativa' && r.documento === 'NR-17');
    if (temNormativaModerna) {
      result.fundamentacao = result.fundamentacao.filter(r => r.id !== 'REF_FUNDACENTRO_MANUAL17');
    }

    // ─── PASSO 8: MATRIZ DE RISCO ─────────────────────────────────────────
    Object.entries(rMap).forEach(([riskId, riskVal]) => {
      if (riskVal && riskVal.grav) {
        const gravidade = parseInt(riskVal.grav);
        const prob = parseInt(riskVal.p_exp || riskVal.prob || 0);
        const rpn = gravidade * prob;

        // Leitura direta ou mapeamento da classificação de risco oficial (sem escala temporal paralela)
        let labelClassificacao = 'risco baixo';
        if (riskVal.classification) {
          labelClassificacao = riskVal.classification.toLowerCase();
        } else if (rpn >= 27) {
          labelClassificacao = 'risco extremo';
        } else if (rpn >= 12) {
          labelClassificacao = 'risco alto';
        } else if (rpn >= 4) {
          labelClassificacao = 'risco médio';
        } else if (rpn >= 2) {
          labelClassificacao = 'risco tolerável';
        }

        if (rpn >= 4) {
          result.prioridades.push({
            risco: riskVal.name || riskId.replace('risk_', '').replace(/_/g, ' '),
            rpn: rpn,
            prioridade: labelClassificacao
          });
        }
      }
    });
    result.prioridades.sort((a, b) => b.rpn - a.rpn);

    // ─── PASSO 9: SÍNTESE DA CONCLUSÃO ────────────────────────────────────
    const funcao = result.fatoresExposicao.find(f => f.chave === 'funcao')?.valor || 'trabalhador';

    let text = 'CONCLUSÃO ERGONÔMICA\n\n';

    // Trava de segurança: Se houver qualquer achado inadequado na AEP, ele DEVE constar na síntese
    if (result.achadosNaConclusao.length === 0 && result.achados.length > 0) {
      // Se por algum critério restrito nenhum foi adicionado, promovemos todos os achados registrados
      result.objetoAuditoria.forEach(d => { d.incluirNaConclusao = true; });
      result.achadosNaConclusao = [...result.objetoAuditoria];
    }

    // Parágrafo 1: Caracterização factual da atividade (sem colar bloco gigante entre aspas)
    text += `A Avaliação Ergonômica Preliminar (AEP) para a função de ${funcao} contemplou a análise das atividades operacionais desenvolvidas no posto de trabalho. `;

    // Sem achados em todo o processo → ramificação adequada
    if (result.achadosNaConclusao.length === 0 && result.achados.length === 0) {
      text += `Nos aspectos investigados nesta Avaliação Ergonômica Preliminar, não foram identificadas inadequações ergonômicas nos parâmetros avaliados. Recomenda-se a manutenção das condições observadas e o acompanhamento periódico.`;
      result.conclusao = text;
      return result;
    }

    // Parágrafo 1 (cont.): ritmo de trabalho
    const descRitmo = resolverDescRitmo(sMap);
    if (descRitmo) {
      text += `A atividade é realizada em ${descRitmo}. `;
    }

    // Fatores identificados com contextualização descritiva integradora
    const desviosDescritivos = result.achadosNaConclusao.map(d => {
      const id = d.checkpointId;
      
      // Mobiliário - Mesa
      if (id === 'mesa_altura' || id === 'mesa_regulagem') {
        const obsMesa = ((sMap[9] && (sMap[9].mesa_observacoes || (sMap[9].checklist && sMap[9].checklist[id] && sMap[9].checklist[id].obs))) || '').trim();
        const obsLower = obsMesa.toLowerCase();
        if (obsLower.includes('profundidade') && obsLower.includes('monitor')) {
          return 'limitação na profundidade da mesa de trabalho, com interferência no posicionamento adequado do monitor';
        }
        if (obsMesa.length > 5) {
          return `características/dimensões da mesa de trabalho, observando-se que ${obsMesa.charAt(0).toLowerCase() + obsMesa.slice(1)}`;
        }
      }

      // Mobiliário - Cadeira
      if (id === 'cadeira_regulagem' || id === 'cadeira_apoio_lombar') {
        const obsCadeira = ((sMap[9] && (sMap[9].cadeira_observacoes || (sMap[9].checklist && sMap[9].checklist[id] && sMap[9].checklist[id].obs))) || '').trim();
        const obsLower = obsCadeira.toLowerCase();
        if (obsLower.includes('insuficiente') || obsLower.includes('antropométrica') || obsLower.includes('antropometrica')) {
          return 'assento com regulagem de altura, porém com limite de amplitude insuficiente para as características da trabalhadora';
        }
        if (obsCadeira.length > 5) {
          return `assento com ajustabilidade limitada, notadamente ${obsCadeira.charAt(0).toLowerCase() + obsCadeira.slice(1)}`;
        }
      }

      // Postura - Elevação de ombros
      if (id === 'elevacao_ombros_90') {
        const obsOmbro = ((sMap[6] && (sMap[6].postura_observacoes || (sMap[6].checklist && sMap[6].checklist[id] && sMap[6].checklist[id].obs))) || '').trim();
        const obsLower = obsOmbro.toLowerCase();
        if (obsLower.includes('prontuário') || obsLower.includes('prontuario') || obsLower.includes('balcão') || obsLower.includes('balcao')) {
          const temFreq = obsLower.includes('duas vezes por semana') || obsLower.includes('2 vezes por semana') || obsLower.includes('semanal');
          const sufixoFreq = temFreq ? ', atividade registrada duas vezes por semana' : '';
          return `demanda postural de elevação dos membros superiores durante o alcance de prontuários no balcão${sufixoFreq}`;
        }
        if (obsOmbro.length > 5) {
          return `${d.descricaoProfissional} (${obsOmbro})`;
        }
      }

      return d.descricaoProfissional;
    });

    text += `Durante a análise, foram identificados os seguintes fatores ergonômicos que requerem atenção: ${desviosDescritivos.join('; ')}. `;

    // Dados de exposição de carga (quando pertinente)
    const temAchadoCarga = achadosIds.some(id =>
      ['levantamento_manual', 'transporte_manual', 'peso_manipulado', 'manuseio_ferramentas_pesadas'].includes(id)
    );
    if (temAchadoCarga && tempoCargas.cargas_levantamento_horas_turno) {
      text += `A movimentação de cargas foi registrada com duração de ${tempoCargas.cargas_levantamento_horas_turno} no turno de trabalho. `;
    }
    text += '\n\n';

    // Parágrafo 2: interações + fatores favoráveis + queixas
    let p2Text = '';

    if (result.interacoes.length > 0) {
      const tiposVistas = new Set();
      result.interacoes.forEach(i => {
        if (!tiposVistas.has(i.tipo)) {
          p2Text += `${i.mensagem} `;
          tiposVistas.add(i.tipo);
        }
      });
    }

    // Fatores favoráveis registrados (pausas, ritmo livre, alternância)
    const favoraveis = [];
    const sec5 = sMap[5] || {};
    const sec6 = sMap[6] || {};
    if (sec5.ritmo_livre === 'sim') favoraveis.push('ritmo de trabalho livremente determinado pelo trabalhador');
    if (sec5.pausas_instituidas === 'sim' || (sec5.checklist && sec5.checklist.pausas && sec5.checklist.pausas.status === 'adequate')) {
      favoraveis.push('existência de pausas programadas durante a jornada');
    }
    if (sec6.alternancia_viavel === 'sim' || (sec6.checklist && sec6.checklist.postura_sentada_prolongada && sec6.checklist.postura_sentada_prolongada.status === 'adequate')) {
      favoraveis.push('possibilidade de alternância postural entre a posição sentada e em pé');
    }

    if (favoraveis.length > 0) {
      p2Text += `Como aspectos favoráveis observados na organização e na execução da atividade, destacam-se: ${favoraveis.join('; ')}. `;
    }

    if (p2Text.trim()) {
      text += p2Text.trim() + '\n\n';
    }

    // Parágrafo 3: classificação de riscos e direcionamento
    if (result.prioridades.length > 0) {
      const prioridadesText = result.prioridades
        .map(p => `${p.risco} (${p.prioridade})`)
        .join('; ');
      text += `Em relação à classificação de riscos, as demandas que necessitam de acompanhamento incluem: ${prioridadesText}. `;
    }

    if (result.sugerirAprofundamento) {
      text += `Os achados e as interações biomecânicas identificadas indicam a pertinência de aprofundamento da análise da atividade, devendo a necessidade de Análise Ergonômica do Trabalho (AET) ser avaliada pelo profissional responsável. `;
    } else {
      text += `Com base nos achados, recomenda-se a definição e o acompanhamento de medidas de prevenção relacionadas aos fatores identificados, visando subsidiar o gerenciamento de riscos no Programa de Gerenciamento de Riscos (PGR — NR-01). `;
    }

    // Parágrafo 4: limitações (apenas críticas ao texto)
    const limitacoesRelevantes = result.limitacoes.filter(lim =>
      lim.includes('crítico') || lim.includes('bloqueante')
    );
    if (limitacoesRelevantes.length > 0) {
      text += `\n\nCabe registrar que a presente conclusão apresenta limitações de análise em decorrência de: ${limitacoesRelevantes.join('; ')}.`;
    }

    result.conclusao = text;
    return result;
  }

  return {
    generateInterpretiveConclusion: generateInterpretiveConclusion,
    getKnowledgeBase: getKnowledgeBase
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErgonomicConclusionEngine;
} else if (typeof window !== 'undefined') {
  window.ErgonomicConclusionEngine = ErgonomicConclusionEngine;
}
