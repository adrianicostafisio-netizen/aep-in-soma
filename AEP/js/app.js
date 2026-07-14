/* ========================================================================
   AET — Main Application
   ======================================================================== */

(function() {
  // ─── State ──────────────────────────────────────────────────────────
  let currentSection = 1;
  let currentAssessmentId = null;
  let saveTimeout = null;
  const TOTAL_SECTIONS = 15;

  // ─── Checklist Definitions ──────────────────────────────────────────
  const CHECKLISTS = {
    4: {
      title: 'Organização do Trabalho',
      items: [
        { id: 'ritmo', label: 'Ritmo de trabalho', hint: 'Cadência, pressão por produtividade' },
        { id: 'pausas', label: 'Pausas durante a jornada', hint: 'Liberdade para pausas, tempo de descanso' },
        { id: 'horas_extras', label: 'Horas extras', hint: 'Frequência e duração das horas extras' },
        { id: 'folgas', label: 'Folgas e descanso semanal', hint: 'Regularidade das folgas' },
        { id: 'dimensionamento', label: 'Dimensionamento da equipe', hint: 'Equipe adequada para a demanda' },
        { id: 'monotonia', label: 'Monotonia e repetitividade mental', hint: 'Trabalho repetitivo sem variação' },
        { id: 'pressao', label: 'Pressão por produtividade', hint: 'Cobranças, metas, tempo' },
        { id: 'autonomia', label: 'Autonomia do trabalhador', hint: 'Liberdade para decidir como executar' }
      ]
    },
    5: {
      title: 'Exigências Físicas',
      items: [
        { id: 'postura_predominante', label: 'Postura predominante (de pé)', hint: 'Permanência >2h contínuas ou >85% da jornada' },
        { id: 'postura_sentada_prolongada', label: 'Postura sentada por longos períodos', hint: 'Superior a 2 horas contínuas' },
        { id: 'postura_estatica', label: 'Postura estática prolongada', hint: 'Manutenção de postura fixa sem alternância' },
        { id: 'movimentos_repetitivos', label: 'Movimentos repetitivos', hint: 'Ciclos <30s ou mesmas ações >50% do tempo' },
        { id: 'esforco_fisico', label: 'Esforço físico intenso', hint: 'Escala de esforço percebido (Borg)' },
        { id: 'flexao_coluna', label: 'Flexão de coluna vertebral frequente', hint: 'Inclinação do tronco, agachamento' },
        { id: 'elevacao_mmss', label: 'Elevação de membros superiores', hint: 'Braços acima do nível dos ombros' },
        { id: 'pedais_alavancas', label: 'Uso de pedais ou alavancas', hint: 'Frequência >3x/min estando de pé' },
        { id: 'deslocamento', label: 'Constante deslocamento a pé', hint: 'Caminhadas >2h contínuas na jornada' },
        { id: 'movimentacao_pacientes', label: 'Movimentação de Pacientes', hint: 'Acamados, independentes, cadeirantes' }
      ]
    },
    6: {
      title: 'Manipulação de Cargas',
      items: [
        { id: 'levantamento_manual', label: 'Levantamento manual de cargas', hint: 'Peso, frequência e distância' },
        { id: 'transporte_manual', label: 'Transporte manual de cargas', hint: 'Distância de pega e solta' },
        { id: 'puxar_empurrar', label: 'Puxar/empurrar cargas', hint: 'Piso, inclinação, obstáculos' },
        { id: 'peso_manipulado', label: 'Peso manipulado > 3kg (pinça) ou > 5kg (palmar)', hint: 'Valores de referência NR-17' },
        { id: 'alcance_horizontal', label: 'Alcance horizontal > 60cm', hint: 'Distância entre corpo e objeto' },
        { id: 'manuseio_ferramentas_pesadas', label: 'Ferramentas/objetos pesados (>1kg pinça, >3kg palmar por >2h)', hint: 'Manuseio prolongado' },
        { id: 'facilitadores', label: 'Facilitadores ergonômicos disponíveis', hint: 'Carrinhos, paleteiras, equipamentos de guindar' },
        { id: 'movimentacao_pacientes', label: 'Movimentação de pacientes (se aplicável)', hint: 'Acamados, independentes, equipamentos' }
      ]
    },
    7: {
      title: 'Ferramentas e Equipamentos',
      items: [
        { id: 'adequacao', label: 'Ferramentas adequadas à tarefa', hint: 'Tipo e especificação corretos' },
        { id: 'peso_ferramentas', label: 'Peso das ferramentas', hint: 'Dentro dos limites aceitáveis' },
        { id: 'conservacao', label: 'Estado de conservação', hint: 'Manutenção em dia' },
        { id: 'pega_ergonomica', label: 'Pega ergonômica', hint: 'Empunhadura confortável, antiderrapante' },
        { id: 'vibração_ferram', label: 'Exposição a vibração (ferramentas)', hint: 'Ferramentas vibratórias' },
        { id: 'epis', label: 'EPIs adequados e em bom estado', hint: 'Uniformes, calçados, EPIs específicos' },
        { id: 'treinamento_equip', label: 'Treinamento para uso dos equipamentos', hint: 'Capacitação recebida' }
      ]
    },
    8: {
      title: 'Mobiliário',
      items: [
        { id: 'mesa_altura', label: 'Altura da mesa/bancada adequada', hint: 'Trabalho pesado: púbis | Moderado: cotovelo | Precisão: acima do cotovelo' },
        { id: 'mesa_regulagem', label: 'Mesa com regulagem de altura', hint: 'Possibilidade de ajuste individual' },
        { id: 'mesa_borda', label: 'Bordas arredondadas (raio ≥ 2,5mm)', hint: 'Sem quinas vivas que comprimam' },
        { id: 'cadeira_regulagem', label: 'Cadeira com regulagem de altura', hint: 'Ajuste de assento e encosto' },
        { id: 'cadeira_apoio_lombar', label: 'Apoio lombar', hint: 'Encosto com suporte lombar' },
        { id: 'cadeira_apoio_braco', label: 'Apoio de braço', hint: 'Apoio regulável para antebraço' },
        { id: 'espaco_pernas', label: 'Espaço para as pernas', hint: 'Espaço suficiente sob a mesa' },
        { id: 'monitor_distancia', label: 'Distância olho-monitor (50–70cm)', hint: 'Altura do topo do monitor na linha dos olhos' },
        { id: 'apoio_pes', label: 'Apoio para pés (se necessário)', hint: 'Quando pés não alcançam o chão' },
        { id: 'apoio_punho', label: 'Apoio para punhos', hint: 'Apoio durante digitação/uso do mouse' }
      ]
    }
  };

  // ─── Environment Rating Items ─────────────────────────────────────
  const ENVIRONMENT_ITEMS = [
    { id: 'iluminacao', label: 'Iluminação', icon: '💡' },
    { id: 'ruido', label: 'Ruído', icon: '🔊' },
    { id: 'temperatura', label: 'Temperatura', icon: '🌡️' },
    { id: 'ventilacao', label: 'Ventilação', icon: '🌬️' },
    { id: 'vibracao', label: 'Vibração', icon: '📳' },
    { id: 'umidade', label: 'Umidade', icon: '💧' },
    { id: 'limpeza', label: 'Limpeza', icon: '🧹' },
    { id: 'organizacao', label: 'Organização', icon: '📦' },
    { id: 'espaco_fisico', label: 'Espaço físico', icon: '📐' }
  ];

  // ─── Body Map Regions ─────────────────────────────────────────────
  const BODY_REGIONS = [
    { id: 'pescoco', label: 'Cabeça' },
    { id: 'ombro_d', label: 'Ombro Direito' },
    { id: 'ombro_e', label: 'Ombro Esquerdo' },
    { id: 'braco_d', label: 'Braço Direito' },
    { id: 'braco_e', label: 'Braço Esquerdo' },
    { id: 'cotovelo_d', label: 'Cotovelo Direito' },
    { id: 'cotovelo_e', label: 'Cotovelo Esquerdo' },
    { id: 'antebraco_d', label: 'Antebraço Direito' },
    { id: 'antebraco_e', label: 'Antebraço Esquerdo' },
    { id: 'punho_d', label: 'Punho/Mão Direita' },
    { id: 'punho_e', label: 'Punho/Mão Esquerda' },
    { id: 'coluna_cervical', label: 'Coluna Cervical' },
    { id: 'coluna_toracica', label: 'Coluna Torácica' },
    { id: 'coluna_lombar', label: 'Coluna Lombar' },
    { id: 'quadril_d', label: 'Quadril Direito' },
    { id: 'quadril_e', label: 'Quadril Esquerdo' },
    { id: 'joelho_d', label: 'Joelho Direito' },
    { id: 'joelho_e', label: 'Joelho Esquerdo' },
    { id: 'tornozelo_d', label: 'Tornozelo/Pé Direito' },
    { id: 'tornozelo_e', label: 'Tornozelo/Pé Esquerdo' }
  ];

  const COMPLAINT_TYPES = ['Dor', 'Formigamento', 'Dormência', 'Cansaço', 'Queimação', 'Fraqueza', 'Inchaço', 'Rigidez'];

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════

  async function init() {
    initTheme();
    const lockScreen = document.getElementById('lockScreen');
    const title = document.getElementById('lockTitle');
    const desc = document.getElementById('lockDesc');
    const btn = document.getElementById('btnUnlock');
    const input = document.getElementById('pinInput');
    const err = document.getElementById('lockError');
    
    if (CryptoDB.isSetup()) {
      title.textContent = 'Acesso Protegido';
      desc.textContent = 'Insira seu PIN para acessar os dados criptografados.';
      btn.textContent = 'Desbloquear';
    } else {
      title.textContent = 'Configurar Segurança';
      desc.textContent = 'Crie um PIN (4 a 6 dígitos numéricos) para criptografar o app.';
      btn.textContent = 'Criar PIN e Entrar';
    }
    
    btn.addEventListener('click', async () => {
      const pin = input.value;
      if (pin.length < 4) {
        err.textContent = 'O PIN deve ter no mínimo 4 dígitos';
        err.style.display = 'block';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Aguarde...';
      
      try {
        if (CryptoDB.isSetup()) {
          const success = await CryptoDB.unlock(pin);
          if (success) {
            lockScreen.style.display = 'none';
            startApp();
          } else {
            err.textContent = 'PIN Incorreto!';
            err.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Desbloquear';
          }
        } else {
          await CryptoDB.setup(pin);
          lockScreen.style.display = 'none';
          startApp();
        }
      } catch (e) {
        console.error(e);
        err.textContent = 'Erro de criptografia!';
        err.style.display = 'block';
        btn.disabled = false;
        btn.textContent = CryptoDB.isSetup() ? 'Desbloquear' : 'Criar PIN e Entrar';
      }
    });
  }

  function startApp() {
    initEventListeners();
    renderSectionSteps();
    renderChecklists();
    renderEnvironmentRating();
    renderBodyMap();
    loadDashboard();
    setDefaultDate();
  }

  function initTheme() {
    const saved = localStorage.getItem('aet_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function setDefaultDate() {
    const dateInput = document.getElementById('dataAvaliacao');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════

  function initEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // New assessment
    document.getElementById('btnNewAssessment').addEventListener('click', startNewAssessment);

    // Home button
    document.getElementById('btnHome').addEventListener('click', goHome);

    // Methodology button
    document.getElementById('btnMethodology').addEventListener('click', () => showScreen('screenMethodology'));

    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));

    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        loadDashboard(e.target.dataset.filter);
      });
    });

    // Toggle button groups
    document.querySelectorAll('.toggle-group').forEach(group => {
      group.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (group.dataset.multiple === "true") {
            btn.classList.toggle('active');
          } else {
            group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
          triggerAutoSave();
          if (group.dataset.field === 'tipo_aep') {
             renderChecklists(); // Re-render when type changes
          }
        });
      });
    });

    // CNPJ mask
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
      cnpjInput.addEventListener('input', (e) => {
        e.target.value = maskCNPJ(e.target.value);
      });
    }

    // Auto-save on input change
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
      el.addEventListener('input', () => triggerAutoSave());
    });

    // Photo upload
    document.getElementById('photoUploadArea').addEventListener('click', () => {
      document.getElementById('photoInput').click();
    });
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

    // Export buttons
    document.getElementById('btnExport').addEventListener('click', showExportModal);
    document.getElementById('btnExportAll').addEventListener('click', showExportModal);
    
    const btnGenMat = document.getElementById('btnGenerateMatrix');
    if (btnGenMat) btnGenMat.addEventListener('click', generateRiskMatrix);

    // Enterprise autocomplete
    const empresaInput = document.getElementById('empresa');
    if (empresaInput) {
      empresaInput.addEventListener('input', debounce(handleEmpresaAutocomplete, 250));
      empresaInput.addEventListener('blur', () => {
        setTimeout(() => {
          document.getElementById('empresaDropdown').classList.remove('active');
        }, 200);
      });
    }

    // Modal close
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // THEME
  // ═══════════════════════════════════════════════════════════════════

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aet_theme', next);
  }

  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    const isForm = screenId === 'screenForm';
    document.getElementById('progressContainer').style.display = isForm ? 'block' : 'none';
    document.getElementById('btnHome').style.display = isForm ? 'flex' : 'none';
    document.getElementById('btnExport').style.display = isForm ? 'flex' : 'none';
    document.getElementById('saveStatus').style.display = isForm ? 'flex' : 'none';

    if (isForm) {
      showSection(currentSection);
    }
  }

  function showSection(num) {
    currentSection = num;
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`section${num}`);
    if (section) {
      section.classList.add('active');
    }
    
    if (num === 11) {
      generateRiskMatrix();
    }
    if (num === 14) {
      calculateConformity();
    }
    
    updateProgress();
    updateSectionSteps();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function nextSection() {
    if (currentSection === 1) {
      if (!validateSection1()) return;
    }
    if (currentSection < TOTAL_SECTIONS) {
      await saveCurrentSection();
      showSection(currentSection + 1);
    }
  }

  async function prevSection() {
    if (currentSection > 1) {
      await saveCurrentSection();
      showSection(currentSection - 1);
    }
  }

  async function goToSection(num) {
    if (currentAssessmentId) {
      await saveCurrentSection();
    }
    showSection(num);
  }

  async function goHome() {
    if (currentAssessmentId) {
      await saveCurrentSection();
    }
    currentAssessmentId = null;
    currentSection = 1;
    showScreen('screenDashboard');
    loadDashboard();
  }

  // ═══════════════════════════════════════════════════════════════════
  // PROGRESS
  // ═══════════════════════════════════════════════════════════════════

  const SECTION_TITLES = [
    '',
    '1. Identificação',
    '2. Trabalhador',
    '3. Tarefa',
    '4. Org. Trabalho',
    '5. Exig. Físicas',
    '6. Cargas',
    '7. Ferramentas',
    '8. Mobiliário',
    '9. Ambiente',
    '10. Psicossociais',
    '11. Matriz de Risco',
    '12. Queixas',
    '13. Fotos',
    '14. Conclusão',
    '15. Plano de Ação'
  ];

  function renderSectionSteps() {
    const container = document.getElementById('sectionSteps');
    let html = '';
    for (let i = 1; i <= TOTAL_SECTIONS; i++) {
      html += `<button class="section-step" data-step="${i}" onclick="AET.goToSection(${i})">${SECTION_TITLES[i]}</button>`;
    }
    container.innerHTML = html;
  }

  function updateSectionSteps() {
    document.querySelectorAll('.section-step').forEach(step => {
      const num = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      if (num === currentSection) {
        step.classList.add('active');
      } else if (num < currentSection) {
        step.classList.add('completed');
      }
    });
  }

  function updateProgress() {
    const percent = Math.round((currentSection / TOTAL_SECTIONS) * 100);
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressText').textContent = `Seção ${currentSection} de ${TOTAL_SECTIONS}`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════

  async function loadDashboard(filter = 'all') {
    const list = document.getElementById('assessmentList');
    const avaliacoes = await AvaliacaoDB.getAll(filter);

    if (avaliacoes.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Nenhuma avaliação${filter !== 'all' ? ' neste filtro' : ' ainda'}</h3>
          <p>Clique em "Nova Avaliação" para iniciar sua primeira pesquisa de campo.</p>
        </div>`;
      return;
    }

    list.innerHTML = avaliacoes.map(a => `
      <div class="assessment-item">
        <div class="assessment-item-header" onclick="AET.openAssessment(${a.id})" style="cursor:pointer">
          <h4>${a.empresa_nome || 'Sem empresa'}</h4>
          <span class="status-badge ${a.status}">${a.status === 'draft' ? 'Rascunho' : 'Concluída'}</span>
        </div>
        <div class="assessment-meta" onclick="AET.openAssessment(${a.id})" style="cursor:pointer; margin-bottom: 12px;">
          <span>📋 ${a.numero_aet}</span>
          <span>🏢 ${a.setor || '—'}</span>
          <span>📅 ${formatDate(a.data)}</span>
          <span>👤 ${a.avaliador || '—'}</span>
        </div>
        <div class="assessment-actions" style="display:flex; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <button class="btn btn-secondary btn-sm" onclick="AET.openAssessment(${a.id})">✏️ Editar</button>
          <button class="btn btn-secondary btn-sm" onclick="AET.showExportModal(${a.id})">📥 Exportar</button>
          <button class="btn btn-secondary btn-sm" style="color:var(--color-danger)" onclick="if(confirm('Tem certeza que deseja excluir esta avaliação?')) { AET.deleteAssessment(${a.id}) }">🗑️ Excluir</button>
        </div>
      </div>
    `).join('');
  }

  async function handleSearch(e) {
    const term = e.target.value.trim();
    if (!term) {
      loadDashboard();
      return;
    }
    const results = await AvaliacaoDB.search(term);
    const list = document.getElementById('assessmentList');

    if (results.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Nenhum resultado</h3>
          <p>Tente buscar por outro termo.</p>
        </div>`;
      return;
    }

    list.innerHTML = results.map(a => `
      <div class="assessment-item" onclick="AET.openAssessment(${a.id})">
        <div class="assessment-item-header">
          <h4>${a.empresa_nome || 'Sem empresa'}</h4>
          <span class="status-badge ${a.status}">${a.status === 'draft' ? 'Rascunho' : 'Concluída'}</span>
        </div>
        <div class="assessment-meta">
          <span>📋 ${a.numero_aet}</span>
          <span>🏢 ${a.setor || '—'}</span>
          <span>📅 ${formatDate(a.data)}</span>
        </div>
      </div>
    `).join('');
  }

  // ═══════════════════════════════════════════════════════════════════
  // ASSESSMENT CRUD
  // ═══════════════════════════════════════════════════════════════════

  async function startNewAssessment() {
    resetForm();
    setDefaultDate();
    const { id, numero_aet } = await AvaliacaoDB.create({
      empresa: '',
      data: document.getElementById('dataAvaliacao').value
    });
    currentAssessmentId = id;
    document.getElementById('numeroAet').value = numero_aet;
    currentSection = 1;
    showScreen('screenForm');
    showToast('Nova avaliação criada');
  }

  async function openAssessment(id) {
    currentAssessmentId = id;
    const avaliacao = await AvaliacaoDB.getById(id);
    if (!avaliacao) return;

    resetForm();
    
    // Load section 1 data
    document.getElementById('empresa').value = avaliacao.empresa_nome || '';
    document.getElementById('setor').value = avaliacao.setor || '';
    document.getElementById('area').value = avaliacao.area || '';
    document.getElementById('numeroAet').value = avaliacao.numero_aet || '';
    document.getElementById('dataAvaliacao').value = avaliacao.data || '';
    document.getElementById('avaliador').value = avaliacao.avaliador || '';

    // Load all section data
    const secoes = await SecaoDB.getAllForAssessment(id);
    for (const secao of secoes) {
      if (secao.dados && typeof secao.dados === 'object') {
        loadSectionData(secao.secao, secao.dados);
      }
    }

    // Load photos
    await renderPhotos();

    // Load body map complaints
    await renderComplaints();

    currentSection = 1;
    showScreen('screenForm');
  }

  // ═══════════════════════════════════════════════════════════════════
  // FORM DATA: SAVE & LOAD
  // ═══════════════════════════════════════════════════════════════════

  
  // ═══════════════════════════════════════════════════════════════════
  // MATRIZ DE RISCO (SEÇÃO 11)
  // ═══════════════════════════════════════════════════════════════════

  function calculateProbability(f_prot, exp) {
    const fp = parseInt(f_prot);
    const ex = parseInt(exp);
    if (!fp || !ex) return null;
    
    if (fp === 1) { // Adequadas e eficientes
      if (ex === 4) return 2; // Improvável
      return 1; // Altamente improvável
    }
    if (fp === 2) { // Insuficientes
      if (ex === 1) return 2; // Improvável
      if (ex === 2 || ex === 3) return 3; // Provável
      if (ex === 4) return 4; // Altamente provável
    }
    if (fp === 3) { // Inexistentes
      if (ex === 1) return 3; // Provável
      return 4; // Altamente provável
    }
    return null;
  }

  function getProbabilityLabel(prob) {
    const p = parseInt(prob);
    if (p === 1) return '1 - Altamente improvável';
    if (p === 2) return '2 - Improvável';
    if (p === 3) return '3 - Provável';
    if (p === 4) return '4 - Altamente provável';
    return '-';
  }

  function calculateRiskClassification(prob, sev) {
    const p = parseInt(prob);
    const s = parseInt(sev);
    if (!p || !s) return null;

    // s = 1 (Leve)
    if (s === 1) {
      if (p === 1) return { level: 1, label: '1 - BAIXO', cssClass: 'baixo', color: '#52c41a' };
      if (p === 2) return { level: 2, label: '2 - MÉDIO', cssClass: 'medio', color: '#faad14' };
      if (p === 3) return { level: 2, label: '2 - MÉDIO', cssClass: 'medio', color: '#faad14' };
      if (p === 4) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
    }
    // s = 2 (Séria)
    if (s === 2) {
      if (p === 1) return { level: 2, label: '2 - MÉDIO', cssClass: 'medio', color: '#faad14' };
      if (p === 2) return { level: 2, label: '2 - MÉDIO', cssClass: 'medio', color: '#faad14' };
      if (p === 3) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
      if (p === 4) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
    }
    // s = 3 (Crítica)
    if (s === 3) {
      if (p === 1) return { level: 2, label: '2 - MÉDIO', cssClass: 'medio', color: '#faad14' };
      if (p === 2) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
      if (p === 3) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
      if (p === 4) return { level: 4, label: '4 - EXTREMO', cssClass: 'critico', color: '#ff4d4f' };
    }
    // s = 4 (Incapacitante/Fatal)
    if (s === 4) {
      if (p === 1) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
      if (p === 2) return { level: 3, label: '3 - ALTO', cssClass: 'alto', color: '#ff9800' };
      if (p === 3) return { level: 4, label: '4 - EXTREMO', cssClass: 'critico', color: '#ff4d4f' };
      if (p === 4) return { level: 4, label: '4 - EXTREMO', cssClass: 'critico', color: '#ff4d4f' };
    }
    return null;
  }

  function getRiskGuidelinesAndProcedures(level) {
    const lvl = parseInt(level);
    if (lvl === 1) {
      return {
        guidelines: 'Monitorar',
        procedures: "Dar conhecimento aos envolvidos dos riscos inerentes a função, instruí-los sobre o uso do EPI's, acompanhar as medidas de controle existentes."
      };
    }
    if (lvl === 2) {
      return {
        guidelines: 'Gerenciar ativamente',
        procedures: "Realizar a fiscalização diária da utilização dos EPI's, sendo da responsabilidade do encarregado do posto e do supervisor, instruir sobre as normas e procedimentos de segurança, acompanhar e/ou implementar as medidas de controlo."
      };
    }
    if (lvl === 3) {
      return {
        guidelines: 'Gerenciar proativamente',
        procedures: "Inspecionar ferramentas, equipamentos e matérias antes de iniciar as atividades. Sinalizar e delimitar área de trabalho. Manter ambiente de trabalho organizado. Realizar a fiscalização diária da utilização dos EPI's, sendo da responsabilidade do encarregado do posto e do supervisor, instruir sobre as normas e procedimentos de segurança, implementar as medidas de controles."
      };
    }
    if (lvl === 4) {
      return {
        guidelines: 'Evitar / Eliminar',
        procedures: "Não realizar a atividade nas condições existentes. Solicitar ao responsável pelo posto de trabalho, o desenvolvimento de outros métodos para a execução da atividade."
      };
    }
    return { guidelines: '-', procedures: '-' };
  }

  async function generateRiskMatrix() {
    if (!currentAssessmentId) return;
    
    const risks = [];
    
    for (let s = 4; s <= 8; s++) {
      const rec = await SecaoDB.get(currentAssessmentId, s);
      if (rec && rec.dados && rec.dados.checklist) {
        for (const [k, v] of Object.entries(rec.dados.checklist)) {
          if (v.status === 'inadequate') {
             const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
             const label = clItem ? clItem.label : k;
             risks.push({ id: `risk_${s}_${k}`, name: label, section: CHECKLISTS[s].title });
          }
        }
      }
    }

    // Add Section 9 (Ambiente)
    const envRec = await SecaoDB.get(currentAssessmentId, 9);
    if (envRec && envRec.dados && envRec.dados.ratings) {
      ENVIRONMENT_ITEMS.forEach(item => {
        const rating = envRec.dados.ratings[item.id];
        if (rating && rating.value === 1) {
          risks.push({ id: `risk_9_${item.id}`, name: `Condições ambientais inadequadas: ${item.label}`, section: 'Ambiente de Trabalho' });
        }
      });
    }
    
    // Add Psico
    const psicoRec = await SecaoDB.get(currentAssessmentId, 10);
    if (psicoRec && psicoRec.dados) {
        const pData = psicoRec.dados;
        for (let i = 1; i <= 6; i++) {
           const r = pData[`psico_dim${i}_riscos`];
           if (r) {
              const rList = r.split(',');
              rList.forEach((item, idx) => {
                 const trimmed = item.trim();
                 if (trimmed) {
                    risks.push({ id: `risk_psico_${i}_${idx}`, name: trimmed, section: 'Fatores Psicossociais' });
                 }
              });
           }
        }
    }
    
    const container = document.getElementById('riskMatrixContainer');
    if (risks.length === 0) {
      container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">Nenhum risco classificado como inadequado/agravante foi detectado nas etapas anteriores.</p>';
      return;
    }
    
    const matrixRec = await SecaoDB.get(currentAssessmentId, 11);
    const savedData = matrixRec && matrixRec.dados ? matrixRec.dados.risks || {} : {};

    let html = `<div class="risk-matrix-table-container">
      <table class="risk-matrix-table">
        <thead>
          <tr>
            <th>Origem</th>
            <th>Fator de Risco</th>
            <th title="Fator de Proteção / Medidas de Controle">Fator de Proteção</th>
            <th title="Perfil de Exposição Qualitativo">Perfil de Exposição</th>
            <th>Probabilidade</th>
            <th>Severidade</th>
            <th>Classificação de Risco</th>
            <th>Medidas / Diretrizes</th>
            <th>Procedimentos</th>
          </tr>
        </thead>
        <tbody>`;
    
    risks.forEach(r => {
       const savedRisk = savedData[r.id] || {};
       const sFP = savedRisk.f_prot || '';
       const sPE = savedRisk.p_exp || savedRisk.prob || ''; 
       const sG = savedRisk.grav || '';
 
       const probVal = calculateProbability(sFP, sPE);
       const probLabel = getProbabilityLabel(probVal);
       const classObj = calculateRiskClassification(probVal, sG);
       const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null);

       const cssClass = classObj ? classObj.cssClass : 'na';
       const levelLabel = classObj ? classObj.label : '--';
       const guidelinesLabel = guideObj ? guideObj.guidelines : '-';
       const proceduresLabel = guideObj ? guideObj.procedures : '-';

       // Resolve e-Social mapping
       let esocialCode = '-';
       const key = r.id.replace('risk_', '');
       let mappedKey = key;
       if (key.startsWith('psico_')) {
         const parts = key.split('_');
         mappedKey = `psico_dim${parts[1]}_riscos`;
       } else {
         const parts = key.split('_');
         if (parts.length > 1 && !isNaN(parts[0])) {
           mappedKey = parts.slice(1).join('_');
         }
       }
       esocialCode = ESOCIAL_MAP[mappedKey] || '-';

       html += `<tr>
         <td style="font-size:0.85em; color: var(--color-text-secondary); font-weight: 500;">${r.section}</td>
         <td>
           <div style="font-weight:600; color: var(--color-text);">${r.name}</div>
           <div style="font-size:0.75rem; color: var(--color-primary); margin-top: 2px;"><b>e-Social:</b> ${esocialCode}</div>
         </td>
         <td>
           <select class="risk-fprot" data-risk-id="${r.id}">
             <option value="">--</option>
             <option value="1" ${sFP=='1'?'selected':''}>1 - Adequadas/eficientes</option>
             <option value="2" ${sFP=='2'?'selected':''}>2 - Insuficientes</option>
             <option value="3" ${sFP=='3'?'selected':''}>3 - Inexistentes</option>
           </select>
         </td>
         <td>
           <select class="risk-pexp" data-risk-id="${r.id}">
             <option value="">--</option>
             <option value="1" ${sPE=='1'?'selected':''}>1 - Exposição Baixa</option>
             <option value="2" ${sPE=='2'?'selected':''}>2 - Exposição Média</option>
             <option value="3" ${sPE=='3'?'selected':''}>3 - Exposição Alta</option>
             <option value="4" ${sPE=='4'?'selected':''}>4 - Exposição Extrema</option>
           </select>
         </td>
         <td>
           <span class="risk-probability-text" id="prob_${r.id}">${probLabel}</span>
         </td>
         <td>
           <select class="risk-grav" data-risk-id="${r.id}">
             <option value="">--</option>
             <option value="1" ${sG=='1'?'selected':''}>1 - Leve</option>
             <option value="2" ${sG=='2'?'selected':''}>2 - Séria</option>
             <option value="3" ${sG=='3'?'selected':''}>3 - Crítica</option>
             <option value="4" ${sG=='4'?'selected':''}>4 - Incapacitante/Fatal</option>
           </select>
         </td>
         <td style="text-align:center;">
           <span class="risk-level-badge ${cssClass}" id="badge_${r.id}">${levelLabel}</span>
         </td>
         <td>
           <span class="risk-monitoring-text" id="dir_${r.id}">${guidelinesLabel}</span>
         </td>
         <td>
           <span class="risk-action-text" id="proc_${r.id}">${proceduresLabel}</span>
         </td>
       </tr>`;
    });
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
    
    container.querySelectorAll('select').forEach(sel => {
       sel.addEventListener('change', () => {
         const row = sel.closest('tr');
         const rId = sel.dataset.riskId;
         
         const fprot = row.querySelector('.risk-fprot').value;
         const pexp = row.querySelector('.risk-pexp').value;
         const grav = row.querySelector('.risk-grav').value;
 
         const probSp = row.querySelector(`#prob_${rId}`);
         const badge = row.querySelector(`#badge_${rId}`);
         const dirSp = row.querySelector(`#dir_${rId}`);
         const procSp = row.querySelector(`#proc_${rId}`);
 
         const probVal = calculateProbability(fprot, pexp);
         
         if (probVal) {
           probSp.textContent = getProbabilityLabel(probVal);
         } else {
           probSp.textContent = '-';
         }

         const classObj = calculateRiskClassification(probVal, grav);
         if (classObj) {
           badge.textContent = classObj.label;
           badge.className = `risk-level-badge ${classObj.cssClass}`;
           
           const guideObj = getRiskGuidelinesAndProcedures(classObj.level);
           dirSp.textContent = guideObj.guidelines;
           procSp.textContent = guideObj.procedures;
         } else {
           badge.textContent = '--';
           badge.className = 'risk-level-badge na';
           dirSp.textContent = '-';
           procSp.textContent = '-';
         }
         
         triggerAutoSave();
       });
    });
  }

  function collectSectionData(sectionNum) {
    const section = document.getElementById(`section${sectionNum}`);
    if (!section) return {};

    const data = {};

    // Collect input values
    section.querySelectorAll('[data-field]').forEach(el => {
      const field = el.dataset.field;
      if (el.classList.contains('toggle-group')) {
        const active = el.querySelector('.toggle-btn.active');
        data[field] = active ? active.dataset.value : '';
      } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        data[field] = el.value;
      }
    });

    // Collect toggle groups at section level
    section.querySelectorAll('.toggle-group[data-field]').forEach(group => {
      const field = group.dataset.field;
      if (group.dataset.multiple === "true") {
        const actives = Array.from(group.querySelectorAll('.toggle-btn.active')).map(b => b.dataset.value);
        data[field] = actives.join(',');
      } else {
        const active = group.querySelector('.toggle-btn.active');
        data[field] = active ? active.dataset.value : '';
      }
    });

    // Collect checklist data for sections 4-8
    if (sectionNum >= 4 && sectionNum <= 8) {
      const checklist = {};
      section.querySelectorAll('.checklist-item').forEach(item => {
        const id = item.dataset.itemId;
        const statusBtn = item.querySelector('.status-btn.active');
        const obsInput = item.querySelector('.checklist-obs textarea');
        const improvInput = item.querySelector('.checklist-improvement textarea');
        checklist[id] = {
          status: statusBtn ? statusBtn.dataset.status : '',
          obs: obsInput ? obsInput.value : '',
          melhoria: improvInput ? improvInput.value : ''
        };
      });
      data.checklist = checklist;
    }

    // Collect environment ratings for section 9
    if (sectionNum === 9) {
      const ratings = {};
      section.querySelectorAll('.checklist-item').forEach(item => {
        const id = item.dataset.itemId;
        const ratingBtn = item.querySelector('.rating-btn.active');
        const obsInput = item.querySelector('.checklist-obs textarea');
        const improvInput = item.querySelector('.checklist-improvement textarea');
        ratings[id] = {
          value: ratingBtn ? parseInt(ratingBtn.dataset.value) : 0,
          obs: obsInput ? obsInput.value : '',
          melhoria: improvInput ? improvInput.value : ''
        };
      });
      data.ratings = ratings;
    }

    // Collect risk matrix data for section 11
    if (sectionNum === 11) {
      const risks = {};
      section.querySelectorAll('.risk-fprot').forEach(el => {
        const id = el.dataset.riskId;
        const f_prot = el.value;
        const p_exp = section.querySelector(`.risk-pexp[data-risk-id="${id}"]`).value;
        const grav = section.querySelector(`.risk-grav[data-risk-id="${id}"]`).value;
        risks[id] = { f_prot, p_exp, grav };
      });
      data.risks = risks;
    }

    return data;
  }

  function loadSectionData(sectionNum, data) {
    const section = document.getElementById(`section${sectionNum}`);
    if (!section || !data) return;

    // Restore input values
    Object.entries(data).forEach(([field, value]) => {
      if (field === 'checklist' || field === 'ratings') return;

      // Try direct elements
      const el = section.querySelector(`[data-field="${field}"]`);
      if (!el) return;

      if (el.classList.contains('toggle-group')) {
        el.querySelectorAll('.toggle-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === value);
        });
      } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        el.value = value;
      }
    });

    // Restore toggle groups
    section.querySelectorAll('.toggle-group[data-field]').forEach(group => {
      const field = group.dataset.field;
      if (data[field]) {
        if (group.dataset.multiple === "true") {
          const values = data[field].split(',');
          group.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', values.includes(btn.dataset.value));
          });
        } else {
          group.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === data[field]);
          });
        }
      }
    });

    // Restore checklists (sections 4-8)
    if (data.checklist) {
      Object.entries(data.checklist).forEach(([id, vals]) => {
        const item = section.querySelector(`.checklist-item[data-item-id="${id}"]`);
        if (!item) return;
        if (vals.status) {
          item.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === vals.status);
          });
          // Show improvement field if inadequate
          const improvement = item.querySelector('.checklist-improvement');
          if (improvement) {
            improvement.classList.toggle('visible', vals.status === 'inadequate');
          }
        }
        const obsInput = item.querySelector('.checklist-obs textarea');
        if (obsInput && vals.obs) obsInput.value = vals.obs;
        const improvInput = item.querySelector('.checklist-improvement textarea');
        if (improvInput && vals.melhoria) improvInput.value = vals.melhoria;
      });
    }

    // Restore environment ratings (section 9)
    if (data.ratings) {
      Object.entries(data.ratings).forEach(([id, vals]) => {
        const item = section.querySelector(`.checklist-item[data-item-id="${id}"]`);
        if (!item) return;
        if (vals.value) {
          item.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.value) === vals.value);
          });
          // Show improvement if rating is poor (1 or 2)
          const improvement = item.querySelector('.checklist-improvement');
          if (improvement) {
            improvement.classList.toggle('visible', vals.value <= 2);
          }
        }
        const obsInput = item.querySelector('.checklist-obs textarea');
        if (obsInput && vals.obs) obsInput.value = vals.obs;
        const improvInput = item.querySelector('.checklist-improvement textarea');
        if (improvInput && vals.melhoria) improvInput.value = vals.melhoria;
      });
    }
  }

  async function saveCurrentSection() {
    if (!currentAssessmentId) return;

    const data = collectSectionData(currentSection);
    await SecaoDB.save(currentAssessmentId, currentSection, data);

    // Also update main assessment record for section 1
    if (currentSection === 1) {
      await AvaliacaoDB.update(currentAssessmentId, {
        empresa_nome: data.empresa || '',
        setor: data.setor || '',
        area: data.area || '',
        data: data.data || '',
        avaliador: data.avaliador || ''
      });
      // Upsert empresa
      if (data.empresa) {
        await EmpresaDB.upsert(data.empresa, data.cnpj);
      }
    }

    updateSaveStatus('Salvo ✓');
  }

  async function calculateConformity() {
    if (!currentAssessmentId) return;
    
    let red = 0, yellow = 0, green = 0;
    
    try {
      // Use SecaoDB which handles decryption automatically
      const sections = await SecaoDB.getAllForAssessment(currentAssessmentId);
      const sMap = {};
      sections.forEach(s => sMap[s.secao] = s.dados);
      
      // Check checklists (sections 4-8)
      for (let s = 4; s <= 8; s++) {
        const dados = sMap[s];
        if (dados && dados.checklist) {
          for (const val of Object.values(dados.checklist)) {
            if (val.status === 'inadequate') red++;
            else if (val.status === 'adequate') green++;
          }
        }
      }
      
      // Check environment (section 9)
      const envDados = sMap[9];
      if (envDados && envDados.ratings) {
        ENVIRONMENT_ITEMS.forEach(item => {
          const rating = envDados.ratings[item.id];
          if (rating) {
            const val = rating.value;
            if (val === 1) red++;
            else if (val === 2 || val === 3) yellow++;
            else if (val === 4) green++;
          }
        });
      }
      
      // Check queixas
      const queixas = await QueixaDB.getAll(currentAssessmentId);
      if (queixas.length > 0) {
        const maxIntensity = Math.max(...queixas.map(q => q.intensidade || 0));
        if (maxIntensity >= 4) red += 2;
        else if (maxIntensity >= 2) yellow += 2;
        else green += 1;
      }
    } catch(e) {
      console.error('Erro ao calcular conformidade:', e);
    }
    
    // Update DOM
    const elRed = document.getElementById('countRed');
    const elYellow = document.getElementById('countYellow');
    const elGreen = document.getElementById('countGreen');
    
    if (elRed) elRed.textContent = red;
    if (elYellow) elYellow.textContent = yellow;
    if (elGreen) elGreen.textContent = green;
    
    // Update semaphore active lights
    const total = red + yellow + green;
    if (total > 0) {
      const semaforoRed = document.getElementById('semaforoRed');
      const semaforoYellow = document.getElementById('semaforoYellow');
      const semaforoGreen = document.getElementById('semaforoGreen');
      if (semaforoRed) semaforoRed.classList.toggle('active', red > 0);
      if (semaforoYellow) semaforoYellow.classList.toggle('active', yellow > 0);
      if (semaforoGreen) semaforoGreen.classList.toggle('active', green > 0);
    }
  }

  // ─── Auto-save ──────────────────────────────────────────────────
  function triggerAutoSave() {
    updateSaveStatus('saving');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveCurrentSection();
    }, 2000);
  }

  function updateSaveStatus(status) {
    const el = document.getElementById('saveStatus');
    el.className = `save-status ${status}`;
    const textEl = el.querySelector('.save-text');
    if (status === 'saving') textEl.textContent = 'Salvando...';
    else if (status === 'saved') textEl.textContent = 'Salvo ✓';
    else if (status === 'error') textEl.textContent = 'Erro ao salvar';
  }

  // ═══════════════════════════════════════════════════════════════════
  // CHECKLIST RENDERER (Sections 4-8)
  // ═══════════════════════════════════════════════════════════════════

  function renderChecklists() {
    const tipoAepEl = document.querySelector('.toggle-group[data-field="tipo_aep"] .toggle-btn.active');
    const tipoAep = tipoAepEl ? tipoAepEl.dataset.value : 'operacional';

    for (const [sectionNum, config] of Object.entries(CHECKLISTS)) {
      const container = document.getElementById(`checklist${sectionNum}`);
      if (!container) continue;

      if (tipoAep === 'administrativo' && parseInt(sectionNum) === 6) {
        container.innerHTML = `<div class="form-card" style="text-align:center; padding: 20px;"><p style="color:var(--color-text-muted);">A avaliação de Manipulação de Cargas não se aplica para o perfil Administrativo.</p></div>`;
        continue;
      }

      container.innerHTML = config.items.map(item => `
        <div class="checklist-item" data-item-id="${item.id}">
          <div class="checklist-item-header">
            <div class="checklist-item-title">${item.label}</div>
            <div class="checklist-status">
              <button class="status-btn adequate" data-status="adequate" onclick="AET.setChecklistStatus(this)" title="Adequado">✓</button>
              <button class="status-btn inadequate" data-status="inadequate" onclick="AET.setChecklistStatus(this)" title="Inadequado">✗</button>
              <button class="status-btn na" data-status="na" onclick="AET.setChecklistStatus(this)" title="Não se aplica">N/A</button>
            </div>
          </div>
          <div class="form-hint" style="margin-bottom:var(--space-2)">${item.hint}</div>
          <div class="checklist-obs">
            <textarea class="form-textarea short" placeholder="Observação..." oninput="AET.triggerAutoSave()"></textarea>
          </div>
          <div class="checklist-improvement">
            <label>Sugestão de melhoria do trabalhador</label>
            <textarea class="form-textarea short" placeholder="O que o trabalhador sugere para melhorar?" oninput="AET.triggerAutoSave()"></textarea>
          </div>
        </div>
      `).join('');
    }
  }

  function setChecklistStatus(btn) {
    const item = btn.closest('.checklist-item');
    const status = btn.dataset.status;

    // Toggle active state
    item.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide improvement field
    const improvement = item.querySelector('.checklist-improvement');
    if (improvement) {
      improvement.classList.toggle('visible', status === 'inadequate');
    }

    triggerAutoSave();
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENVIRONMENT RATING (Section 9)
  // ═══════════════════════════════════════════════════════════════════

  function renderEnvironmentRating() {
    const container = document.getElementById('ratingList9');
    if (!container) return;

    container.innerHTML = ENVIRONMENT_ITEMS.map(item => `
      <div class="checklist-item" data-item-id="${item.id}">
        <div class="checklist-item-header">
          <div class="checklist-item-title">${item.icon} ${item.label}</div>
        </div>
        <div class="rating-group">
          <button class="rating-btn" data-value="0" onclick="AET.setRating(this)">N/A</button>
          <button class="rating-btn" data-value="1" onclick="AET.setRating(this)">Muito Ruim</button>
          <button class="rating-btn" data-value="2" onclick="AET.setRating(this)">Ruim</button>
          <button class="rating-btn" data-value="3" onclick="AET.setRating(this)">Regular</button>
          <button class="rating-btn" data-value="4" onclick="AET.setRating(this)">Bom</button>
        </div>
        <div class="checklist-obs" style="margin-top:var(--space-2)">
          <textarea class="form-textarea short" placeholder="Observação..." oninput="AET.triggerAutoSave()"></textarea>
        </div>
        <div class="checklist-improvement">
          <label>Sugestão de melhoria do trabalhador</label>
          <textarea class="form-textarea short" placeholder="O que o trabalhador sugere para melhorar?" oninput="AET.triggerAutoSave()"></textarea>
        </div>
      </div>
    `).join('');
  }

  function setRating(btn) {
    const item = btn.closest('.checklist-item');
    const value = parseInt(btn.dataset.value);

    item.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show improvement if rating is poor
    const improvement = item.querySelector('.checklist-improvement');
    if (improvement) {
      improvement.classList.toggle('visible', value <= 2);
    }

    triggerAutoSave();
  }

  // ═══════════════════════════════════════════════════════════════════
  // BODY MAP (Section 10)
  // ═══════════════════════════════════════════════════════════════════

  function renderBodyMap() {
    const wrapper = document.getElementById('bodyMapWrapper');
    if (!wrapper) return;

    // SVG body map with clickable regions - using onclick directly for max browser compatibility
    wrapper.innerHTML = `
      <svg viewBox="0 0 300 460" class="body-map-svg" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;width:100%;max-width:300px;display:block;margin:0 auto;">
        <!-- Head/Neck -->
        <ellipse class="body-region" data-region="pescoco" onclick="window._aetBodyMapClick('pescoco')" cx="150" cy="52" rx="28" ry="32" />
        <text x="150" y="56" text-anchor="middle" font-size="8" fill="var(--color-text-muted)" pointer-events="none">Cabeça</text>

        <!-- Shoulders -->
        <ellipse class="body-region" data-region="ombro_e" onclick="window._aetBodyMapClick('ombro_e')" cx="100" cy="110" rx="28" ry="18" />
        <text x="100" y="114" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">Ombro E</text>
        
        <ellipse class="body-region" data-region="ombro_d" onclick="window._aetBodyMapClick('ombro_d')" cx="200" cy="110" rx="28" ry="18" />
        <text x="200" y="114" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">Ombro D</text>

        <!-- Spine -->
        <rect class="body-region" data-region="coluna_cervical" onclick="window._aetBodyMapClick('coluna_cervical')" x="135" y="85" width="30" height="25" rx="5" />
        <text x="150" y="101" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">C.Cerv</text>

        <rect class="body-region" data-region="coluna_toracica" onclick="window._aetBodyMapClick('coluna_toracica')" x="130" y="115" width="40" height="55" rx="6" />
        <text x="150" y="146" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">C.Torácica</text>

        <rect class="body-region" data-region="coluna_lombar" onclick="window._aetBodyMapClick('coluna_lombar')" x="130" y="175" width="40" height="45" rx="6" />
        <text x="150" y="201" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">C.Lombar</text>

        <!-- Arms Left -->
        <rect class="body-region" data-region="braco_e" onclick="window._aetBodyMapClick('braco_e')" x="62" y="130" width="24" height="50" rx="10" />
        <text x="74" y="159" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Braço E</text>
        
        <ellipse class="body-region" data-region="cotovelo_e" onclick="window._aetBodyMapClick('cotovelo_e')" cx="68" cy="190" rx="14" ry="12" />
        <text x="68" y="193" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Cot.E</text>

        <rect class="body-region" data-region="antebraco_e" onclick="window._aetBodyMapClick('antebraco_e')" x="56" y="205" width="24" height="45" rx="10" />
        <text x="68" y="231" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Anteb.E</text>

        <ellipse class="body-region" data-region="punho_e" onclick="window._aetBodyMapClick('punho_e')" cx="62" cy="264" rx="16" ry="16" />
        <text x="62" y="268" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Mão E</text>

        <!-- Arms Right -->
        <rect class="body-region" data-region="braco_d" onclick="window._aetBodyMapClick('braco_d')" x="214" y="130" width="24" height="50" rx="10" />
        <text x="226" y="159" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Braço D</text>
        
        <ellipse class="body-region" data-region="cotovelo_d" onclick="window._aetBodyMapClick('cotovelo_d')" cx="232" cy="190" rx="14" ry="12" />
        <text x="232" y="193" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Cot.D</text>

        <rect class="body-region" data-region="antebraco_d" onclick="window._aetBodyMapClick('antebraco_d')" x="220" y="205" width="24" height="45" rx="10" />
        <text x="232" y="231" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Anteb.D</text>

        <ellipse class="body-region" data-region="punho_d" onclick="window._aetBodyMapClick('punho_d')" cx="238" cy="264" rx="16" ry="16" />
        <text x="238" y="268" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Mão D</text>

        <!-- Hips -->
        <ellipse class="body-region" data-region="quadril_e" onclick="window._aetBodyMapClick('quadril_e')" cx="120" cy="240" rx="22" ry="22" />
        <text x="120" y="244" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Quadril E</text>
        
        <ellipse class="body-region" data-region="quadril_d" onclick="window._aetBodyMapClick('quadril_d')" cx="180" cy="240" rx="22" ry="22" />
        <text x="180" y="244" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Quadril D</text>

        <!-- Thighs/Knees Left -->
        <rect class="body-region" data-region="joelho_e" onclick="window._aetBodyMapClick('joelho_e')" x="104" y="270" width="32" height="80" rx="14" />
        <text x="120" y="314" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">Joelho E</text>

        <!-- Thighs/Knees Right -->
        <rect class="body-region" data-region="joelho_d" onclick="window._aetBodyMapClick('joelho_d')" x="164" y="270" width="32" height="80" rx="14" />
        <text x="180" y="314" text-anchor="middle" font-size="7" fill="var(--color-text-muted)" pointer-events="none">Joelho D</text>

        <!-- Lower legs / Ankles Left -->
        <rect class="body-region" data-region="tornozelo_e" onclick="window._aetBodyMapClick('tornozelo_e')" x="106" y="360" width="28" height="70" rx="12" />
        <text x="120" y="399" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Torn/Pé E</text>

        <!-- Lower legs / Ankles Right -->
        <rect class="body-region" data-region="tornozelo_d" onclick="window._aetBodyMapClick('tornozelo_d')" x="166" y="360" width="28" height="70" rx="12" />
        <text x="180" y="399" text-anchor="middle" font-size="6" fill="var(--color-text-muted)" pointer-events="none">Torn/Pé D</text>

        <!-- Body outline for context (decorative) -->
        <path d="M150 20 Q170 20 170 50 L170 85 Q195 85 210 105 L240 130 Q248 140 240 145 L210 180 Q200 200 218 200 L250 264 Q254 275 245 275 L218 270 Q200 260 195 240 L180 220 L180 268 Q182 290 195 350 L196 430 Q196 440 185 440 L168 440 Q160 440 160 430 L155 360 Q150 340 145 360 L140 430 Q140 440 132 440 L115 440 Q105 440 105 430 L106 350 Q118 290 120 268 L120 220 L105 240 Q100 260 82 270 L55 275 Q46 275 50 264 L82 200 Q100 200 90 180 L60 145 Q52 140 60 130 L90 105 Q105 85 130 85 L130 50 Q130 20 150 20 Z" 
          fill="none" stroke="var(--color-border)" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.5" pointer-events="none"/>
      </svg>
    `;

    // Use event delegation on the wrapper — more reliable for SVG elements injected via innerHTML
    wrapper.addEventListener('click', function(e) {
      // Walk up the event target to find a .body-region element
      let el = e.target;
      while (el && el !== wrapper) {
        if (el.classList && el.classList.contains('body-region')) {
          const regionId = el.getAttribute('data-region');
          if (regionId) {
            showComplaintModal(regionId);
          }
          return;
        }
        el = el.parentNode;
      }
    });

    // Also expose a global function so onclick="" attributes on SVG can call it directly
    window._aetBodyMapClick = function(regionId) {
      showComplaintModal(regionId);
    };
  }

  function showComplaintModal(regionId) {
    const regionLabel = BODY_REGIONS.find(r => r.id === regionId)?.label || regionId;
    
    const html = `
      <div class="modal-header">
        <h3>📍 ${regionLabel}</h3>
        <button class="modal-close" onclick="AET.closeModal()">✕</button>
      </div>

      <div class="form-group" style="margin-bottom:var(--space-4)">
        <label class="form-label">Intensidade da queixa</label>
        <div class="intensity-scale" id="intensityScale">
          <button class="intensity-btn" data-intensity="1" onclick="AET.selectIntensity(this)">1</button>
          <button class="intensity-btn" data-intensity="2" onclick="AET.selectIntensity(this)">2</button>
          <button class="intensity-btn" data-intensity="3" onclick="AET.selectIntensity(this)">3</button>
          <button class="intensity-btn" data-intensity="4" onclick="AET.selectIntensity(this)">4</button>
          <button class="intensity-btn" data-intensity="5" onclick="AET.selectIntensity(this)">5</button>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-text-muted)">
          <span>Leve</span>
          <span>Insuportável</span>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--space-4)">
        <label class="form-label">Tipo de queixa</label>
        <div class="complaint-type-tags" id="complaintTypes">
          ${COMPLAINT_TYPES.map(t => `<button class="complaint-tag" data-type="${t}" onclick="AET.selectComplaintType(this)">${t}</button>`).join('')}
        </div>
      </div>

      <div class="form-group" style="margin-bottom:var(--space-6)">
        <label class="form-label">Descrição adicional</label>
        <textarea class="form-textarea short" id="complaintDesc" placeholder="Detalhes sobre a queixa..."></textarea>
      </div>

      <div class="confirm-actions">
        <button class="btn btn-secondary btn-lg" onclick="AET.closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-lg" onclick="AET.saveComplaint('${regionId}')">Salvar Queixa</button>
      </div>
    `;

    openModal(html);
  }

  function selectIntensity(btn) {
    document.querySelectorAll('#intensityScale .intensity-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function selectComplaintType(btn) {
    btn.classList.toggle('active');
  }

  async function saveComplaint(regionId) {
    if (!currentAssessmentId) {
      showToast('Nenhuma avaliação aberta. Volte ao início e selecione uma avaliação.');
      return;
    }

    const intensityBtn = document.querySelector('#intensityScale .intensity-btn.active');
    if (!intensityBtn) {
      showToast('Selecione a intensidade da queixa');
      return;
    }

    const intensity = parseInt(intensityBtn.dataset.intensity);
    const types = Array.from(document.querySelectorAll('#complaintTypes .complaint-tag.active'))
      .map(t => t.dataset.type);
    const desc = document.getElementById('complaintDesc').value;

    try {
      await QueixaDB.add(
        currentAssessmentId,
        regionId,
        intensity,
        types.join(', '),
        desc
      );
      updateBodyMapRegion(regionId, intensity);
      closeModal();
      await renderComplaints();
      showToast('Queixa registrada');
    } catch(e) {
      console.error('Erro ao salvar queixa:', e);
      showToast('Erro ao salvar queixa: ' + e.message);
    }
  }

  function updateBodyMapRegion(regionId, intensity) {
    const region = document.querySelector(`.body-region[data-region="${regionId}"]`);
    if (!region) return;
    
    // Remove existing intensity classes
    for (let i = 1; i <= 5; i++) {
      region.classList.remove(`intensity-${i}`);
    }
    region.classList.add('selected', `intensity-${intensity}`);
  }

  async function renderComplaints() {
    if (!currentAssessmentId) return;
    
    const queixas = await QueixaDB.getAll(currentAssessmentId);
    const container = document.getElementById('complaintsList');
    
    // Reset body map
    document.querySelectorAll('.body-region').forEach(r => {
      r.classList.remove('selected');
      for (let i = 1; i <= 5; i++) r.classList.remove(`intensity-${i}`);
    });

    if (queixas.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Update body map visuals
    queixas.forEach(q => updateBodyMapRegion(q.regiao, q.intensidade));

    // Render complaint list
    container.innerHTML = `
      <div class="form-card">
        <div class="form-card-title">📋 Queixas Registradas (${queixas.length})</div>
        ${queixas.map(q => {
          const label = BODY_REGIONS.find(r => r.id === q.regiao)?.label || q.regiao;
          const colors = ['', '#D4A017', '#E67E22', '#E74C3C', '#C0392B', '#8B0000'];
          const bgs = ['', '#FFF3CD', '#FFE0B2', '#FFCCBC', '#F8BBD0', '#EF9A9A'];
          return `
            <div class="complaint-entry">
              <span class="complaint-region-badge" style="background:${bgs[q.intensidade]};color:${colors[q.intensidade]}">${label}</span>
              <div class="complaint-details">
                <strong>Intensidade ${q.intensidade}/5</strong>
                ${q.tipo ? ` · ${q.tipo}` : ''}
                ${q.descricao ? `<br><small style="color:var(--color-text-muted)">${q.descricao}</small>` : ''}
              </div>
              <button class="complaint-remove" onclick="AET.removeComplaint(${q.id})" title="Remover">✕</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async function removeComplaint(id) {
    await QueixaDB.delete(id);
    await renderComplaints();
    showToast('Queixa removida');
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHOTOS (Section 11)
  // ═══════════════════════════════════════════════════════════════════

  async function handlePhotoUpload(e) {
    if (!currentAssessmentId) {
      showToast('Nenhuma avaliação aberta. Selecione uma avaliação primeiro.');
      return;
    }
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    showToast('Processando fotos...');
    try {
      for (const file of files) {
        const compressed = await compressImage(file, 1920, 0.8);
        await FotoDB.add(currentAssessmentId, compressed);
      }
      await renderPhotos();
      e.target.value = '';
      showToast(`${files.length} foto(s) adicionada(s) com sucesso!`);
    } catch(e) {
      console.error('Erro ao adicionar foto:', e);
      showToast('Erro ao adicionar foto: ' + e.message);
      e.target.value = '';
    }
  }

  function compressImage(file, maxDim, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }


  let censorCanvas, censorCtx, isDrawing = false, startX, startY;
  
  async function openCensorModal(id) {
    const foto = await FotoDB.getAll(currentAssessmentId).then(fotos => fotos.find(f => f.id === id));
    if (!foto || !foto.blob) return;
    
    const url = URL.createObjectURL(foto.blob);
    
    const html = `
      <div class="modal-header">
        <h3>⬛ Censurar Imagem</h3>
        <button class="modal-close" onclick="AET.closeModal()">✕</button>
      </div>
      <p style="margin-bottom:var(--space-3)">Clique e arraste sobre a imagem para desenhar tarjas pretas.</p>
      <div style="text-align:center; background:#000; overflow:auto; max-height: 60vh;">
        <canvas id="censorCanvas" style="cursor:crosshair; max-width:100%;"></canvas>
      </div>
      <div style="margin-top:var(--space-4); display:flex; justify-content:flex-end; gap:var(--space-2)">
        <button class="btn btn-secondary" onclick="AET.closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="AET.saveCensor(${id})">Salvar Imagem</button>
      </div>
    `;
    openModal(html);
    
    setTimeout(() => {
      censorCanvas = document.getElementById('censorCanvas');
      censorCtx = censorCanvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        censorCanvas.width = img.width;
        censorCanvas.height = img.height;
        censorCtx.drawImage(img, 0, 0);
        
        let rects = [];
        let currentRect = null;
        
        function getPos(e) {
          const rect = censorCanvas.getBoundingClientRect();
          const scaleX = censorCanvas.width / rect.width;
          const scaleY = censorCanvas.height / rect.height;
          
          let clientX, clientY;
          if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else {
            clientX = e.clientX;
            clientY = e.clientY;
          }
          
          return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
          };
        }
        
        function redraw() {
          censorCtx.drawImage(img, 0, 0);
          censorCtx.fillStyle = 'black';
          for (let r of rects) {
            censorCtx.fillRect(r.x, r.y, r.w, r.h);
          }
          if (currentRect) {
            censorCtx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
          }
        }
        
        function start(e) {
          e.preventDefault();
          isDrawing = true;
          const pos = getPos(e);
          startX = pos.x;
          startY = pos.y;
          currentRect = {x: startX, y: startY, w: 0, h: 0};
        }
        
        function move(e) {
          if (!isDrawing) return;
          e.preventDefault();
          const pos = getPos(e);
          currentRect.w = pos.x - startX;
          currentRect.h = pos.y - startY;
          redraw();
        }
        
        function stop(e) {
          if (!isDrawing) return;
          e.preventDefault();
          isDrawing = false;
          if (currentRect && Math.abs(currentRect.w) > 5 && Math.abs(currentRect.h) > 5) {
            rects.push(currentRect);
          }
          currentRect = null;
          redraw();
        }
        
        censorCanvas.addEventListener('mousedown', start);
        censorCanvas.addEventListener('mousemove', move);
        censorCanvas.addEventListener('mouseup', stop);
        censorCanvas.addEventListener('mouseout', stop);
        
        censorCanvas.addEventListener('touchstart', start, {passive: false});
        censorCanvas.addEventListener('touchmove', move, {passive: false});
        censorCanvas.addEventListener('touchend', stop);
      };
      img.src = url;
    }, 100);
  }
  
  function saveCensor(id) {
    if (!censorCanvas) return;
    censorCanvas.toBlob(async (blob) => {
      await updatePhoto(id, 'blob', blob);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updatePhoto(id, 'data_url', reader.result);
        closeModal();
        await renderPhotos();
        showToast('Imagem atualizada');
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.85);
  }

  async function renderPhotos() {
    if (!currentAssessmentId) return;
    const fotos = await FotoDB.getAll(currentAssessmentId);
    const grid = document.getElementById('photoGrid');

    if (fotos.length === 0) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = fotos.map(foto => {
      const url = foto.blob ? URL.createObjectURL(foto.blob) : '';
      return `
        <div class="photo-card" data-photo-id="${foto.id}">
          <img src="${url}" alt="Foto do posto de trabalho" loading="lazy">
          <div class="photo-card-body">
            <input type="text" placeholder="Legenda da foto..." value="${foto.legenda || ''}" 
              onchange="AET.updatePhoto(${foto.id}, 'legenda', this.value)">
            <textarea placeholder="Observação..." 
              onchange="AET.updatePhoto(${foto.id}, 'observacao', this.value)">${foto.observacao || ''}</textarea>
          </div>
          <div class="photo-card-actions">
            <button class="btn btn-ghost" onclick="AET.openCensorModal(${foto.id})">⬛ Censurar</button>
            <button class="btn btn-ghost" onclick="AET.deletePhoto(${foto.id})" style="color:var(--color-danger)">🗑️ Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function updatePhoto(id, field, value) {
    await FotoDB.update(id, { [field]: value });
  }

  async function deletePhoto(id) {
    await FotoDB.delete(id);
    await renderPhotos();
    showToast('Foto removida');
  }

  // ═══════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════

  function validateSection1() {
    let valid = true;
    const fields = [
      { id: 'empresa', errorId: 'empresaError' },
      { id: 'setor', errorId: 'setorError' },
      { id: 'avaliador', errorId: 'avaliadorError' }
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const error = document.getElementById(f.errorId);
      if (!input.value.trim()) {
        input.classList.add('error');
        error.classList.add('visible');
        valid = false;
      } else {
        input.classList.remove('error');
        error.classList.remove('visible');
      }
    });

    if (!valid) {
      showToast('Preencha os campos obrigatórios');
    }
    return valid;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUBMIT / FINALIZE
  // ═══════════════════════════════════════════════════════════════════

  function showSubmitConfirm() {
    saveCurrentSection();
    
    const html = `
      <div class="confirm-dialog">
        <div class="confirm-icon">✅</div>
        <h3>Finalizar Avaliação?</h3>
        <p>A avaliação será marcada como concluída. Você poderá editá-la depois se necessário.</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary btn-lg" onclick="AET.closeModal()">Cancelar</button>
          <button class="btn btn-primary btn-lg" onclick="AET.submitAssessment()" style="background:linear-gradient(135deg, #5B8C3E, #4A7030);">Finalizar</button>
        </div>
      </div>
    `;

    openModal(html);
  }

  async function submitAssessment() {
    if (!currentAssessmentId) return;
    
    await saveCurrentSection();
    await AvaliacaoDB.complete(currentAssessmentId);
    
    closeModal();
    showToast('Avaliação finalizada com sucesso!');
    
    setTimeout(() => {
      goHome();
    }, 1500);
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════════

  async function showExportModal(id) {
    if (id && typeof id !== 'object') {
      currentAssessmentId = id;
    }
    if (!currentAssessmentId) {
      alert('Por favor, clique em "Exportar" na avaliação desejada na lista abaixo.');
      return;
    }
    
    const html = `
      <div class="modal-header">
        <h3>📤 Exportar Dados</h3>
        <button class="modal-close" onclick="AET.closeModal()">✕</button>
      </div>
      <h2>Exportar Avaliação</h2>
      <p style="margin-bottom: var(--space-4);">Escolha o formato desejado para exportação.</p>
        
      <div id="exportActionCards" class="action-cards" style="grid-template-columns: 1fr;">
        <div class="action-card" onclick="AET.exportAssessment()">
          <div class="card-icon" style="background: var(--color-primary-light); color: white;">🌐</div>
          <h3>Relatório Web (Recomendado)</h3>
          <p>Layout completo com imagens, ideal para leitura e impressão PDF (Ctrl+P)</p>
        </div>
      </div>
      <div class="action-cards" style="margin-top: var(--space-3)">
        <div class="action-card" onclick="AET.exportXLSX()">
          <div class="card-icon secondary">📊</div>
          <h3>Excel (.xlsx)</h3>
          <p>Planilha por seção</p>
        </div>
        <div class="action-card" onclick="AET.exportCSV()">
          <div class="card-icon secondary">📄</div>
          <h3>CSV</h3>
          <p>Arquivo de texto</p>
        </div>
        <div class="action-card" onclick="AET.exportPDF()">
          <div class="card-icon secondary">📕</div>
          <h3>PDF Básico</h3>
          <p>Apenas texto</p>
        </div>
        <div class="action-card" onclick="window.print()">
          <div class="card-icon secondary">🖨️</div>
          <h3>Imprimir</h3>
          <p>Tela atual</p>
        </div>
      </div>
    `;
    openModal(html);
  }


  const ESOCIAL_MAP = {
    // Organização do Trabalho
    'ritmo': '04.03.002 - Necessidade de manter ritmos intensos de trabalho',
    'pausas': '04.03.001 - Trabalho realizado sem pausas pré-definidas para descanso',
    'horas_extras': '04.03.010 - Desequilíbrio entre tempo de trabalho e tempo de repouso',
    'folgas': '04.03.010 - Desequilíbrio entre tempo de trabalho e tempo de repouso',
    // Exigências Físicas
    'postura_predominante': '04.01.003 - Postura de pé por longos períodos',
    'postura_sentada_prolongada': '04.01.002 - Postura sentada por longos períodos',
    'postura_estatica': '04.01.001 - Trabalho em posturas incômodas ou pouco confortáveis por longos períodos',
    'movimentos_repetitivos': '04.01.008 - Frequente execução de movimentos repetitivos',
    'esforco_fisico': '04.01.005 - Trabalho com esforço físico intenso',
    'flexao_coluna': '04.01.012 - Exigência de flexões de coluna vertebral frequentes',
    'elevacao_mmss': '04.01.015 - Exigência de elevação frequente de membros superiores',
    // Manipulação de Cargas
    'levantamento_manual': '04.01.006 - Levantamento e transporte manual de cargas ou volumes',
    'transporte_manual': '04.01.006 - Levantamento e transporte manual de cargas ou volumes',
    'puxar_empurrar': '04.01.007 - Frequente ação de puxar/empurrar cargas ou volumes',
    'pega_pobre': '04.01.016 - Manuseio ou movimentação de cargas e volumes sem pega ou com pega pobre',
    // Ferramentas e Equipamentos
    'vibração_ferram': '04.01.018 - Exposição a vibrações localizadas (mão-braço)',
    // Mobiliário
    'mesa_altura': '04.02.002 - Mobiliário sem meios de regulagem de ajuste',
    'cadeira_assento': '04.02.005 - Assento inadequado',
    // Ambiente
    'iluminacao': '04.04.005/006 - Condições de trabalho com iluminação inadequada',
    'ruido': '04.04.001 - Níveis de pressão sonora fora dos parâmetros de conforto',
    'temperatura': '04.04.002 - Temperatura efetiva fora dos parâmetros de conforto',
    'vibracao': '04.01.017 - Exposição a vibração de corpo inteiro',
    // Fatores Psicossociais
    'psico_dim1_riscos': '04.05.002 - Situações de sobrecarga de trabalho mental / cognitivo',
    'psico_dim2_riscos': '04.05.011 - Falta de autonomia no trabalho',
    'psico_dim3_riscos': '04.05.008 - Trabalho com demandas divergentes / conflito de papéis',
    'psico_dim4_riscos': '04.05.001 - Excesso de situações de estresse',
    'psico_dim5_riscos': '04.05.007 - Assédio de qualquer natureza no trabalho',
    'psico_dim6_riscos': '04.05.010 - Insatisfação no trabalho'
  };

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  async function exportHTMLReport() {
    if (!currentAssessmentId) return;

    try {
      const data = currentAssessmentId 
        ? await AvaliacaoDB.getById(currentAssessmentId)
        : null;
        
      if (!data) {
        showToast('Nenhuma avaliação selecionada.');
        return;
      }

      // Fetch all sections
      const sections = await SecaoDB.getAllForAssessment(currentAssessmentId);
      const sMap = {};
      sections.forEach(s => sMap[s.secao] = s.dados);

      // Fetch all photos
      const photos = await FotoDB.getAll(currentAssessmentId);
      
      // Fetch all complaints
      const queixas = await QueixaDB.getAll(currentAssessmentId);

      // Determine Traffic light, worker recommendations, and e-Social mapped risks
      let red = 0, yellow = 0, green = 0;
      let relRecomendacoes = [];
      let detectedEsocialRisks = new Set();

      for (let s = 4; s <= 8; s++) {
        if (sMap[s] && sMap[s].checklist) {
          for (const [k, v] of Object.entries(sMap[s].checklist)) {
            if (v.status === 'inadequate') {
              red++;
              if (ESOCIAL_MAP[k]) detectedEsocialRisks.add(ESOCIAL_MAP[k]);
            }
            else if (v.status === 'adequate') green++;
            
            if (v.melhoria) {
              const title = CHECKLISTS[s] ? CHECKLISTS[s].title : 'Checklist ' + s;
              relRecomendacoes.push({ origin: title, item: k.replace(/_/g, ' '), text: v.melhoria });
            }
          }
        }
      }
      if (sMap[9] && sMap[9].ratings) {
        ENVIRONMENT_ITEMS.forEach(i => {
          const r = sMap[9].ratings[i.id];
          if (r) {
            const val = r.value;
            if (val === 1) {
              red++;
              if (ESOCIAL_MAP[i.id]) detectedEsocialRisks.add(ESOCIAL_MAP[i.id]);
            }
            else if (val === 2 || val === 3) yellow++;
            else if (val === 4) green++;
            
            if (r.melhoria) {
              relRecomendacoes.push({ origin: 'Ambiente de Trabalho', item: i.label, text: r.melhoria });
            }
          }
        });
      }

      // Generate HTML string
      let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório AET - ${data.numero_aet || 'Nova'}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #5B8C3E; margin-top: 0; }
            .header { border-bottom: 2px solid #5B8C3E; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; }
            .meta-item { background: #f5f7f2; padding: 10px; border-radius: 5px; }
            .meta-label { font-weight: bold; font-size: 0.85rem; color: #666; text-transform: uppercase; }
            .meta-value { font-size: 1.1rem; }
            
            .semaforo-container { display: flex; justify-content: space-around; background: #f5f7f2; padding: 20px; border-radius: 10px; margin: 30px 0; }
            .light { text-align: center; display: flex; flex-direction: column; align-items: center; }
            .circle { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 10px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
            .circle.red { background: #ff4d4f; }
            .circle.yellow { background: #faad14; }
            .circle.green { background: #52c41a; }
            .count { font-size: 1.5rem; font-weight: bold; line-height: 1; margin-bottom: 5px; }
            
            .section { margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background: #f5f7f2; }
            
            .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .photo-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; background: #fafafa; }
            .photo-item img { max-width: 100%; height: auto; border-radius: 3px; margin-bottom: 10px; }
            
            @media print {
              body { padding: 0; }
              .page-break { page-break-before: always; }
              .photo-item { page-break-inside: avoid; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Avaliação Ergonômica Preliminar (AEP) - IN SOMA</h1>
            <h2>${data.numero_aet || 'N/A'}</h2>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item"><div class="meta-label">Empresa</div><div class="meta-value">${data.empresa_nome || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Setor / Área</div><div class="meta-value">${data.setor || '-'} / ${data.area || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Data da Avaliação</div><div class="meta-value">${formatDate(data.data) || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Avaliador Responsável</div><div class="meta-value">${data.avaliador || '-'}</div></div>
          </div>
          
          <div class="section">
            <h3>Conformidade NR-17 (Visão Geral)</h3>
            <div class="semaforo-container">
              <div class="light"><div class="circle red"></div><div class="count">${red}</div><div>Inadequados</div></div>
              <div class="light"><div class="circle yellow"></div><div class="count">${yellow}</div><div>Atenção</div></div>
              <div class="light"><div class="circle green"></div><div class="count">${green}</div><div>Adequados</div></div>
            </div>
          </div>
      `;
      
      // Trabalhador
      if (sMap[2]) {
        html += '<div class="section"><h3>Dados do Trabalhador</h3><table>';
        html += '<tr><th>Sexo</th><td>' + (sMap[2].sexo || '-') + '</td></tr>';
        html += '<tr><th>Função</th><td>' + (sMap[2].funcao || '-') + '</td></tr>';
        html += '<tr><th>Turno / Horário</th><td>' + (sMap[2].turno || '-') + (sMap[2].jornada ? ' (' + sMap[2].jornada + ')' : '') + '</td></tr>';
        html += '</table></div>';
      }

      // Atividade (Seção 3)
      if (sMap[3]) {
        html += '<div class="section"><h3>Caracterização da Atividade</h3><table>';
        if (sMap[3].nome_tarefa) html += '<tr><th>Nome da Tarefa</th><td>' + sMap[3].nome_tarefa + '</td></tr>';
        html += '<tr><th>Tarefa Real</th><td>' + (sMap[3].descricao_tarefa ? sMap[3].descricao_tarefa.replace(/\n/g, '<br>') : '-') + '</td></tr>';
        if (sMap[3].dificuldades) html += '<tr><th>Dificuldades</th><td>' + sMap[3].dificuldades.replace(/\n/g, '<br>') + '</td></tr>';
        if (sMap[3].estrategias) html += '<tr><th>Estratégias</th><td>' + sMap[3].estrategias.replace(/\n/g, '<br>') + '</td></tr>';
        html += '</table></div>';
      }

      // Checklists rendering
      for (let s = 4; s <= 8; s++) {
        if (sMap[s] && sMap[s].checklist) {
          let hasItems = false;
          let tableHtml = '<table><tr><th>Item</th><th>Status</th><th>Observação</th></tr>';
          for (const [k, v] of Object.entries(sMap[s].checklist)) {
            if (v.status) {
              hasItems = true;
              const obs = v.obs || '';
              const imp = v.melhoria || '';
              const statusText = v.status === 'adequate' ? '✅ Adequado' : (v.status === 'inadequate' ? '❌ Inadequado' : 'N/A');
              const extra = imp ? '<br><small><b>Melhoria:</b> ' + imp + '</small>' : '';
              tableHtml += '<tr><td>' + k.replace(/_/g, ' ') + '</td><td>' + statusText + '</td><td>' + obs + extra + '</td></tr>';
            }
          }
          tableHtml += '</table>';
          if (hasItems) {
            const title = CHECKLISTS[s] ? CHECKLISTS[s].title : 'Checklist ' + s;
            html += '<div class="section"><h3>' + title + '</h3>' + tableHtml + '</div>';
          }
        }
      }
      
      
      // Psicossociais
      if (sMap[10]) {
        let psicoHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">';
        const dims = [
          { title: 'Demandas e Pressão de Trabalho', riscos: 'psico_dim1_riscos', obs: 'psico_dim1_obs' },
          { title: 'Autonomia e Controle', riscos: 'psico_dim2_riscos', obs: 'psico_dim2_obs' },
          { title: 'Clareza de Papéis e Gestão', riscos: 'psico_dim3_riscos', obs: 'psico_dim3_obs' },
          { title: 'Apoio da Liderança e da Equipe', riscos: 'psico_dim4_riscos', obs: 'psico_dim4_obs' },
          { title: 'Respeito nas Relações de Trabalho', riscos: 'psico_dim5_riscos', obs: 'psico_dim5_obs' },
          { title: 'Reconhecimento e Segurança', riscos: 'psico_dim6_riscos', obs: 'psico_dim6_obs' }
        ];
        let hasPsico = false;
        
        for (const dim of dims) {
          const riscosStr = sMap[10][dim.riscos] || '';
          const obsStr = sMap[10][dim.obs] || '';
          
          if (riscosStr || obsStr) {
            hasPsico = true;
            const formatRiscos = riscosStr ? riscosStr.split(',').map(r => '• ' + r).join('<br>') : '';
            psicoHtml += `<div style="border-left: 5px solid #ff4d4f; background: #fff5f5; padding: 15px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               <h4 style="margin: 0 0 10px 0; color: #cc0000;">${dim.title}</h4>
               <p style="margin:0 0 10px 0; font-size:0.9em; font-weight:bold;">Agravantes Detectados:</p>
               <div style="font-size:0.85em; margin-bottom:10px;">${formatRiscos || '-'}</div>
               <p style="margin:0; font-size:0.8em; color:#555;"><i>Obs: ${obsStr || '-'}</i></p>
            </div>`;
          } else {
             psicoHtml += `<div style="border-left: 5px solid #52c41a; background: #f6ffed; padding: 15px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
               <h4 style="margin: 0 0 10px 0; color: #389e0d;">${dim.title}</h4>
               <p style="margin:0; font-size:0.9em; color:#389e0d;">Nenhum agravante identificado.</p>
            </div>`;
          }
        }
        psicoHtml += '</div>';
        html += '<div class="section page-break"><h3>Fatores Psicossociais e Cognitivos</h3>';
        if (hasPsico) {
          html += psicoHtml;
        } else {
          html += '<p>A análise qualitativa não identificou agravantes psicossociais na organização do trabalho.</p>';
        }
        html += '</div>';
      }

      
      // Matriz de Risco (Seção 11) — rebuild names from source sections
      if (sMap[11] && sMap[11].risks) {
        const rMap = sMap[11].risks;

        // Rebuild risk name+section from checklist sections (same logic as generateRiskMatrix)
        const riskMeta = {};
        for (let s = 4; s <= 8; s++) {
          if (sMap[s] && sMap[s].checklist) {
            for (const [k, v] of Object.entries(sMap[s].checklist)) {
              if (v.status === 'inadequate') {
                const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
                const label = clItem ? clItem.label : k.replace(/_/g, ' ');
                riskMeta[`risk_${s}_${k}`] = { name: label, section: CHECKLISTS[s]?.title || 'Seção ' + s };
              }
            }
          }
        }
        // Section 9
        if (sMap[9] && sMap[9].ratings) {
          ENVIRONMENT_ITEMS.forEach(item => {
            const rating = sMap[9].ratings[item.id];
            if (rating && rating.value === 1) {
              riskMeta[`risk_9_${item.id}`] = { name: `Condições ambientais inadequadas: ${item.label}`, section: 'Ambiente de Trabalho' };
            }
          });
        }
        // Psicossociais
        if (sMap[10]) {
          for (let i = 1; i <= 6; i++) {
            const r = sMap[10][`psico_dim${i}_riscos`];
            if (r) {
              r.split(',').forEach((item, idx) => {
                riskMeta[`risk_psico_${i}_${idx}`] = { name: item.trim(), section: 'Fatores Psicossociais' };
              });
            }
          }
        }

        const entries = Object.entries(rMap).filter(([id, r]) => (r.p_exp || r.prob || r.f_prot) && r.grav);
        if (entries.length > 0) {
          html += '<div class="section page-break"><h3>Matriz de Risco Ergonômico</h3>';
          html += '<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">';
          html += '<thead><tr style="background:#f5f5f5;"><th>Origem</th><th>Fator de Risco (com e-Social)</th><th>Fator de Proteção</th><th>Perfil de Exposição</th><th>Probabilidade</th><th>Severidade</th><th>Classificação de Risco</th><th>Medidas / Diretrizes</th><th>Procedimentos</th></tr></thead><tbody>';
          
          for (const [id, r] of entries) {
            const meta = riskMeta[id] || { name: r.name || id, section: r.section || '-' };
            const f_prot = r.f_prot || '';
            const p_exp = r.p_exp || r.prob || '';
            const grav = r.grav || '';

            // Labels
            let fpLabel = '-';
            if (f_prot === '1') fpLabel = 'Adequadas/eficientes';
            else if (f_prot === '2') fpLabel = 'Insuficientes';
            else if (f_prot === '3') fpLabel = 'Inexistentes';

            let peLabel = '-';
            if (p_exp === '1') peLabel = 'Baixa';
            else if (p_exp === '2') peLabel = 'Média';
            else if (p_exp === '3') peLabel = 'Alta';
            else if (p_exp === '4') peLabel = 'Extrema';

            let sevLabel = '-';
            if (grav === '1') sevLabel = 'Leve';
            else if (grav === '2') sevLabel = 'Séria';
            else if (grav === '3') sevLabel = 'Crítica';
            else if (grav === '4') sevLabel = 'Incapacitante/Fatal';

            const probVal = calculateProbability(f_prot, p_exp);
            const probLabel = getProbabilityLabel(probVal);
            const classObj = calculateRiskClassification(probVal, grav);
            const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null);

            const levelLabel = classObj ? classObj.label : '--';
            const colorStyle = classObj ? `background:${classObj.color}; color:#fff; font-weight:bold;` : 'color:#666;';
            const guidelinesLabel = guideObj ? guideObj.guidelines : '-';
            const proceduresLabel = guideObj ? guideObj.procedures : '-';

            // Resolve e-Social mapping
            let esocialCode = '-';
            const key = id.replace('risk_', '');
            let mappedKey = key;
            if (key.startsWith('psico_')) {
              const parts = key.split('_');
              mappedKey = `psico_dim${parts[1]}_riscos`;
            } else {
              const parts = key.split('_');
              if (parts.length > 1 && !isNaN(parts[0])) {
                mappedKey = parts.slice(1).join('_');
              }
            }
            esocialCode = ESOCIAL_MAP[mappedKey] || '-';

            html += `<tr>
               <td style="color:#666; font-size:0.8em; padding:6px;">${meta.section}</td>
               <td style="padding:6px;">
                 <b>${meta.name}</b><br>
                 <small style="color:#666;">e-Social: ${esocialCode}</small>
               </td>
               <td style="text-align:center; padding:6px;">${fpLabel}</td>
               <td style="text-align:center; padding:6px;">${peLabel}</td>
               <td style="text-align:center; padding:6px;">${probLabel}</td>
               <td style="text-align:center; padding:6px;">${sevLabel}</td>
               <td style="text-align:center; padding:6px; ${colorStyle}">${levelLabel}</td>
               <td style="padding:6px; font-size:0.8em;">${guidelinesLabel}</td>
               <td style="padding:6px; font-size:0.8em; line-height:1.2;">${proceduresLabel}</td>
            </tr>`;
          }
          html += '</tbody></table></div>';
        }
      }

      // Queixas
      if (queixas && queixas.length > 0) {
        html += '<div class="section"><h3>Queixas Osteomusculares</h3><table><tr><th>Região</th><th>Intensidade</th><th>Tipo</th><th>Anotação</th></tr>';
        queixas.forEach(q => {
          html += '<tr><td>' + (q.regiao || '-') + '</td><td>' + (q.intensidade || '0') + '/5</td><td>' + (q.tipo || '-') + '</td><td>' + (q.nota || '-') + '</td></tr>';
        });
        html += '</table></div>';
      }
      
      // Recomendações dos Trabalhadores
      if (relRecomendacoes.length > 0) {
        html += '<div class="section"><h3>Recomendações dos Trabalhadores</h3><table><tr><th>Origem</th><th>Item Avaliado</th><th>Sugestão / Melhoria</th></tr>';
        relRecomendacoes.forEach(r => {
          html += '<tr><td>' + r.origin + '</td><td>' + r.item + '</td><td>' + r.text + '</td></tr>';
        });
        html += '</table></div>';
      }

      // Fotos Base64 Fix
      if (photos && photos.length > 0) {
        html += '<div class="section page-break"><h3>Registro Fotográfico</h3><div class="photo-grid">';
        for (const p of photos) {
          let imgSrc = p.data_url || '';
          if (!imgSrc && p.blob) {
            imgSrc = await blobToBase64(p.blob);
          }
          html += `
            <div class="photo-item">
              <img src="${imgSrc}" alt="Foto ${p.ordem}">
              <p><b>Legenda:</b> ${p.legenda || '-'}</p>
              <p><small>${p.observacao || ''}</small></p>
            </div>
          `;
        }
        html += '</div></div>';
      }
      

      // E-Social Render — also include psychosocial risks
      // Add psychosocial risks to e-Social detection
      if (sMap[10]) {
        const psicoRiscos = ['psico_dim1_riscos','psico_dim2_riscos','psico_dim3_riscos',
                             'psico_dim4_riscos','psico_dim5_riscos','psico_dim6_riscos'];
        psicoRiscos.forEach(key => {
          if (sMap[10][key]) {
            detectedEsocialRisks.add('04.03.002 - Outras situações de estresse físico e/ou psíquico (Fatores Psicossociais)');
          }
        });
      }
      


      
      // Conclusão
      if (sMap[14] && sMap[14].conclusao) {
        html += '<div class="section page-break"><h3>Conclusão Preliminar</h3><p>' + sMap[14].conclusao.replace(/\n/g, '<br>') + '</p></div>';
      }
      if (sMap[15] && sMap[15].recomendacoes) {
        const recomendacoesList = sMap[15].recomendacoes.split('\n').filter(line => line.trim() !== '').map(line => `<li>${line.replace(/^[-*]\s*/, '')}</li>`).join('');
        html += '<div class="section"><h3>Plano de Ação / Recomendações (Avaliador)</h3><ul>' + recomendacoesList + '</ul></div>';
      }
      
      html += '</body></html>';
      return html;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

      // ═══════════════════════════════════════════════════════════════════
  // END APP / EXPORTS
  // ═══════════════════════════════════════════════════════════════════

  async function deleteAssessment(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
      await AvaliacaoDB.delete(id);
      loadDashboard();
    }
  }

  async function exportAssessment(id) {
    const reportId = id || currentAssessmentId;
    const cardsContainer = document.getElementById('exportActionCards');
    
    if (cardsContainer) {
      cardsContainer.innerHTML = '<div style="padding:20px;text-align:center;">Gerando relatório, aguarde...</div>';
    }

    try {
      const html = await exportHTMLReport();
      if (!html) {
        alert('Erro ao gerar o relatório. Verifique se a avaliação tem dados.');
        if (cardsContainer) cardsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-danger)">Erro ao gerar o relatório.</div>';
        return;
      }
      
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      if (cardsContainer) {
        cardsContainer.innerHTML = `
          <div style="padding:20px;text-align:center;">
            <h3 style="color:var(--color-success); margin-bottom:15px;">✓ Relatório Gerado com Sucesso!</h3>
            <a href="${url}" target="_blank" class="btn btn-primary btn-lg" style="display:block; margin-bottom:15px; text-decoration:none;">Visualizar Relatório Web</a>
            <a href="${url}" download="AEP_INSOMA_Relatorio_${reportId}.html" class="btn btn-secondary" style="display:block; text-decoration:none;">Baixar Arquivo (.html)</a>
          </div>
        `;
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `AEP_INSOMA_Relatorio_${reportId}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao exportar a avaliação.');
      if (cardsContainer) cardsContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-danger)">Erro ao exportar.</div>';
    }
  }

  function resetForm() {
    currentAssessmentId = null;
    currentSection = 1;
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => el.value = '');
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('photoGrid').innerHTML = '';
    document.getElementById('riskMatrixContainer').innerHTML = '';
    document.getElementById('bodyMapWrapper').querySelectorAll('.body-part.active').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.rating-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.status-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.checklist-improvement.visible').forEach(el => el.classList.remove('visible'));
    updateSaveStatus('');
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function maskCNPJ(value) {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substr(0, 18);
  }

  function openModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (overlay && content) {
      content.innerHTML = html;
      overlay.classList.add('active');
    }
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        const content = document.getElementById('modalContent');
        if (content) content.innerHTML = '';
      }, 300);
    }
  }

  async function handleEmpresaAutocomplete(e) {
    const val = e.target.value.toLowerCase();
    const dropdown = document.getElementById('empresaDropdown');
    if (!dropdown) return;
    if (!val) {
      dropdown.classList.remove('active');
      return;
    }
    const empresas = await EmpresaDB.getAll();
    const matches = empresas.filter(emp => emp.nome.toLowerCase().includes(val) || emp.cnpj.includes(val));
    if (matches.length > 0) {
      dropdown.innerHTML = matches.map(m => `<div class="dropdown-item" onclick="document.getElementById('empresa').value='${m.nome}'; document.getElementById('cnpj').value='${m.cnpj}'; document.getElementById('empresaDropdown').classList.remove('active'); triggerAutoSave();">${m.nome} - ${m.cnpj}</div>`).join('');
      dropdown.classList.add('active');
    } else {
      dropdown.classList.remove('active');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function showToast(msg) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
       toast = document.createElement('div');
       toast.id = 'toastMsg';
       toast.style.position = 'fixed';
       toast.style.bottom = '20px';
       toast.style.right = '20px';
       toast.style.backgroundColor = 'var(--color-primary, #333)';
       toast.style.color = '#fff';
       toast.style.padding = '12px 20px';
       toast.style.borderRadius = '8px';
       toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
       toast.style.zIndex = '9999';
       toast.style.transition = 'opacity 0.3s';
       toast.style.opacity = '0';
       toast.style.pointerEvents = 'none';
       document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 3000);
  }

  function appendText(fieldId, text) {
    const el = document.getElementById(fieldId);
    if (el) {
      el.value = (el.value ? el.value + '\n' : '') + text;
      triggerAutoSave();
    }
  }

  async function showSubmitConfirm() {
    if (!currentAssessmentId) return;
    await saveCurrentSection();
    const ok = confirm('Deseja finalizar esta avaliação? Após finalizar, ela será marcada como concluída.');
    if (ok) {
      await AvaliacaoDB.update(currentAssessmentId, { status: 'completed' });
      showToast('Avaliação finalizada com sucesso!');
      goHome();
    }
  }

  window.AET = {
    init,
    goToSection: showSection,
    startNewAssessment,
    deleteAssessment,
    exportAssessment,
    showExportModal,
    exportHTMLReport,
    closeModal,
    showToast,
    formatDate,
    openAssessment,
    goHome,
    saveCensor,
    triggerAutoSave,
    nextSection,
    prevSection,
    appendText,
    showSubmitConfirm,
    setChecklistStatus,
    setRating,
    selectIntensity,
    selectComplaintType,
    saveComplaint,
    removeComplaint,
    openCensorModal,
    updatePhoto,
    deletePhoto,
    exportHTMLReport,
    exportXLSX: async function() {
      if (!currentAssessmentId) return;
      try {
        const data = await ExportDB.getFullAssessment(currentAssessmentId);
        if (!data) {
          alert('Dados não encontrados.');
          return;
        }
        const { avaliacao, secoes, queixas } = data;
        
        const sMap = {};
        secoes.forEach(s => sMap[s.secao] = s.dados);

        const wb = XLSX.utils.book_new();

        // Sheet 1: Identificacao
        const identData = [
          ['AEP - IN SOMA - IDENTIFICAÇÃO'],
          [],
          ['EMPRESA', avaliacao.empresa_nome || ''],
          ['CNPJ', sMap[1]?.cnpj || ''],
          ['Nº AET', avaliacao.numero_aet || ''],
          ['UNIDADE', sMap[1]?.unidade || ''],
          ['SETOR', avaliacao.setor || ''],
          ['ÁREA', avaliacao.area || ''],
          ['TAREFA', sMap[1]?.tarefa || ''],
          ['AVALIADOR', avaliacao.avaliador || ''],
          ['DATA', avaliacao.data || ''],
          [],
          ['TRABALHADOR AVALIADO'],
          ['Sexo', sMap[2]?.sexo || ''],
          ['Função', sMap[2]?.funcao || ''],
          ['Tempo Função', (sMap[2]?.tempo_funcao || '') + ' ' + (sMap[2]?.tempo_funcao_unidade || '')],
          ['Tempo Empresa', (sMap[2]?.tempo_empresa || '') + ' ' + (sMap[2]?.tempo_empresa_unidade || '')],
          ['Turno', sMap[2]?.turno || ''],
          ['Jornada', sMap[2]?.jornada || ''],
          [],
          ['CARACTERIZAÇÃO DA ATIVIDADE'],
          ['Nome da Tarefa', sMap[3]?.nome_tarefa || ''],
          ['Descrição', sMap[3]?.descricao_tarefa || ''],
          ['Dificuldades', sMap[3]?.dificuldades || ''],
          ['Estratégias', sMap[3]?.estrategias || ''],
          ['Variabilidades', sMap[3]?.variabilidades || '']
        ];
        const wsIdent = XLSX.utils.aoa_to_sheet(identData);
        XLSX.utils.book_append_sheet(wb, wsIdent, 'Identificação');

        // Sheet 2: Checklists
        const checklistRows = [
          ['Seção', 'Item', 'Status', 'Observação', 'Proposta de Melhoria']
        ];
        for (const [sNum, config] of Object.entries(CHECKLISTS)) {
          const cDados = sMap[sNum];
          if (cDados && cDados.checklist) {
            config.items.forEach(item => {
              const val = cDados.checklist[item.id] || {};
              checklistRows.push([
                config.title,
                item.label,
                val.status === 'adequate' ? 'ADEQUADO' : (val.status === 'inadequate' ? 'INADEQUADO' : 'NÃO AVALIADO'),
                val.obs || '',
                val.melhoria || ''
              ]);
            });
          }
        }
        const envDados = sMap[9];
        if (envDados && envDados.ratings) {
          ENVIRONMENT_ITEMS.forEach(item => {
            const val = envDados.ratings[item.id] || {};
            const statusText = val.value === 4 ? 'ADEQUADO' : ((val.value === 1) ? 'INADEQUADO' : (val.value === 2 || val.value === 3 ? 'ATENÇÃO' : 'NÃO AVALIADO'));
            checklistRows.push([
              'Ambiente de Trabalho',
              item.label,
              statusText,
              val.obs || '',
              val.melhoria || ''
            ]);
          });
        }
        const wsCheck = XLSX.utils.aoa_to_sheet(checklistRows);
        XLSX.utils.book_append_sheet(wb, wsCheck, 'Checklists');

        // Sheet 3: Matriz de Risco
        const matrixRows = [
          ['Origem', 'Fator de Risco', 'e-Social (Tabela 23)', 'Fator de Proteção', 'Perfil de Exposição', 'Probabilidade', 'Severidade', 'Classificação de Risco', 'Medidas / Diretrizes', 'Procedimentos']
        ];
        if (sMap[11] && sMap[11].risks) {
          const riskMeta = {};
          for (let s = 4; s <= 8; s++) {
            if (sMap[s] && sMap[s].checklist) {
              for (const [k, v] of Object.entries(sMap[s].checklist)) {
                if (v.status === 'inadequate') {
                  const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
                  riskMeta[`risk_${s}_${k}`] = { name: clItem ? clItem.label : k, section: CHECKLISTS[s].title };
                }
              }
            }
          }
          if (sMap[9] && sMap[9].ratings) {
            ENVIRONMENT_ITEMS.forEach(item => {
              const rating = sMap[9].ratings[item.id];
              if (rating && rating.value === 1) {
                riskMeta[`risk_9_${item.id}`] = { name: `Condições ambientais inadequadas: ${item.label}`, section: 'Ambiente de Trabalho' };
              }
            });
          }
          if (sMap[10]) {
            for (let i = 1; i <= 6; i++) {
              const r = sMap[10][`psico_dim${i}_riscos`];
              if (r) {
                r.split(',').forEach((item, idx) => {
                  riskMeta[`risk_psico_${i}_${idx}`] = { name: item.trim(), section: 'Fatores Psicossociais' };
                });
              }
            }
          }

          Object.entries(sMap[11].risks).forEach(([id, r]) => {
            const meta = riskMeta[id] || { name: r.name || id, section: r.section || '-' };
            const f_prot = r.f_prot || '';
            const p_exp = r.p_exp || r.prob || '';
            const grav = r.grav || '';
            
            if ((p_exp || f_prot) && grav) {
              let fpLabel = '-';
              if (f_prot === '1') fpLabel = '1 - Adequadas/eficientes';
              else if (f_prot === '2') fpLabel = '2 - Insuficientes';
              else if (f_prot === '3') fpLabel = '3 - Inexistentes';

              let peLabel = '-';
              if (p_exp === '1') peLabel = '1 - Exposição Baixa';
              else if (p_exp === '2') peLabel = '2 - Exposição Média';
              else if (p_exp === '3') peLabel = '3 - Exposição Alta';
              else if (p_exp === '4') peLabel = '4 - Exposição Extrema';

              let sevLabel = '-';
              if (grav === '1') sevLabel = '1 - Leve';
              else if (grav === '2') sevLabel = '2 - Séria';
              else if (grav === '3') sevLabel = '3 - Crítica';
              else if (grav === '4') sevLabel = '4 - Incapacitante/Fatal';

              const probVal = calculateProbability(f_prot, p_exp);
              const probLabel = getProbabilityLabel(probVal);
              const classObj = calculateRiskClassification(probVal, grav);
              const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null);

              const lvl = classObj ? classObj.label : '--';
              const mon = guideObj ? guideObj.guidelines : '-';
              const act = guideObj ? guideObj.procedures : '-';

              // Resolve e-Social mapping
              let esocialCode = '-';
              const key = id.replace('risk_', '');
              let mappedKey = key;
              if (key.startsWith('psico_')) {
                const parts = key.split('_');
                mappedKey = `psico_dim${parts[1]}_riscos`;
              } else {
                const parts = key.split('_');
                if (parts.length > 1 && !isNaN(parts[0])) {
                  mappedKey = parts.slice(1).join('_');
                }
              }
              esocialCode = ESOCIAL_MAP[mappedKey] || '-';

              matrixRows.push([
                meta.section,
                meta.name,
                esocialCode,
                fpLabel,
                peLabel,
                probLabel,
                sevLabel,
                lvl,
                mon,
                act
              ]);
            }
          });
        }
        const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);
        XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz de Risco');

        // Sheet 4: Queixas e Conclusao
        const qcRows = [
          ['QUEIXAS OSTEOMUSCULARES RELATADAS'],
          ['Região', 'Intensidade (1-5)', 'Tipo de Queixa', 'Observações']
        ];
        queixas.forEach(q => {
          qcRows.push([q.regiao || '', q.intensidade || '', q.tipo || '', q.descricao || '']);
        });
        qcRows.push([]);
        qcRows.push(['CONCLUSÃO PRELIMINAR']);
        qcRows.push(['Conclusão', sMap[14]?.conclusao || '']);
        qcRows.push([]);
        qcRows.push(['RECOMENDAÇÕES PRELIMINARES']);
        qcRows.push(['Recomendações', sMap[15]?.recomendacoes || '']);

        const wsQC = XLSX.utils.aoa_to_sheet(qcRows);
        XLSX.utils.book_append_sheet(wb, wsQC, 'Queixas e Conclusão');

        XLSX.writeFile(wb, `AEP_IN_SOMA_${avaliacao.empresa_nome.replace(/\s+/g, '_')}_${avaliacao.numero_aet}.xlsx`);
        showToast('Excel exportado com sucesso!');
      } catch (e) {
        console.error(e);
        alert('Erro ao exportar Excel: ' + e.message);
      }
    },
    exportCSV: async function() {
      if (!currentAssessmentId) return;
      try {
        const data = await ExportDB.getFullAssessment(currentAssessmentId);
        if (!data) return;
        const { avaliacao, secoes } = data;
        const sMap = {};
        secoes.forEach(s => sMap[s.secao] = s.dados);

        let csvContent = 'Origem;Fator de Risco;e-Social (Tabela 23);Fator de Protecao;Perfil de Exposicao;Probabilidade;Severidade;Classificacao de Risco;Medidas / Diretrizes;Procedimentos\n';
        
        if (sMap[11] && sMap[11].risks) {
          const riskMeta = {};
          for (let s = 4; s <= 8; s++) {
            if (sMap[s] && sMap[s].checklist) {
              for (const [k, v] of Object.entries(sMap[s].checklist)) {
                if (v.status === 'inadequate') {
                  const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
                  riskMeta[`risk_${s}_${k}`] = { name: clItem ? clItem.label : k, section: CHECKLISTS[s].title };
                }
              }
            }
          }
          if (sMap[9] && sMap[9].ratings) {
            ENVIRONMENT_ITEMS.forEach(item => {
              const rating = sMap[9].ratings[item.id];
              if (rating && rating.value === 1) {
                riskMeta[`risk_9_${item.id}`] = { name: `Condições ambientais inadequadas: ${item.label}`, section: 'Ambiente de Trabalho' };
              }
            });
          }
          if (sMap[10]) {
            for (let i = 1; i <= 6; i++) {
              const r = sMap[10][`psico_dim${i}_riscos`];
              if (r) {
                r.split(',').forEach((item, idx) => {
                  riskMeta[`risk_psico_${i}_${idx}`] = { name: item.trim(), section: 'Fatores Psicossociais' };
                });
              }
            }
          }

          Object.entries(sMap[11].risks).forEach(([id, r]) => {
            const meta = riskMeta[id] || { name: r.name || id, section: r.section || '-' };
            const f_prot = r.f_prot || '';
            const p_exp = r.p_exp || r.prob || '';
            const grav = r.grav || '';

            if ((p_exp || f_prot) && grav) {
              let fpLabel = '-';
              if (f_prot === '1') fpLabel = '1 - Adequadas/eficientes';
              else if (f_prot === '2') fpLabel = '2 - Insuficientes';
              else if (f_prot === '3') fpLabel = '3 - Inexistentes';

              let peLabel = '-';
              if (p_exp === '1') peLabel = '1 - Exposição Baixa';
              else if (p_exp === '2') peLabel = '2 - Exposição Média';
              else if (p_exp === '3') peLabel = '3 - Exposição Alta';
              else if (p_exp === '4') peLabel = '4 - Exposição Extrema';

              let sevLabel = '-';
              if (grav === '1') sevLabel = '1 - Leve';
              else if (grav === '2') sevLabel = '2 - Séria';
              else if (grav === '3') sevLabel = '3 - Crítica';
              else if (grav === '4') sevLabel = '4 - Incapacitante/Fatal';

              const probVal = calculateProbability(f_prot, p_exp);
              const probLabel = getProbabilityLabel(probVal);
              const classObj = calculateRiskClassification(probVal, grav);
              const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null);

              const lvl = classObj ? classObj.label : '--';
              const mon = guideObj ? guideObj.guidelines : '-';
              const act = (guideObj ? guideObj.procedures : '-').replace(/[\r\n]+/g, ' | ');

              // Resolve e-Social mapping
              let esocialCode = '-';
              const key = id.replace('risk_', '');
              let mappedKey = key;
              if (key.startsWith('psico_')) {
                const parts = key.split('_');
                mappedKey = `psico_dim${parts[1]}_riscos`;
              } else {
                const parts = key.split('_');
                if (parts.length > 1 && !isNaN(parts[0])) {
                  mappedKey = parts.slice(1).join('_');
                }
              }
              esocialCode = ESOCIAL_MAP[mappedKey] || '-';

              csvContent += `"${meta.section}";"${meta.name}";"${esocialCode}";"${fpLabel}";"${peLabel}";"${probLabel}";"${sevLabel}";"${lvl}";"${mon}";"${act}"\n`;
            }
          });
        }

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AEP_IN_SOMA_MatrizRisco_${avaliacao.numero_aet}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('CSV exportado com sucesso!');
      } catch (e) {
        alert('Erro ao exportar CSV: ' + e.message);
      }
    },
    exportPDF: function() {
      // Open relational HTML report and print it
      exportAssessment().then(() => {
        setTimeout(() => {
          window.print();
        }, 1000);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', init);

})();
