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
    5: {
      title: 'Organização do Trabalho',
      items: [
        { id: 'ritmo', label: 'Ritmo de trabalho', hint: 'Cadência, pressão por produtividade' },
        { id: 'pausas', label: 'Pausas durante a jornada', hint: 'Liberdade para pausas, tempo de descanso' },
        { id: 'horas_extras', label: 'Horas extras', hint: 'Frequência e duração das horas extras' },
        { id: 'folgas', label: 'Folgas e descanso semanal', hint: 'Regularidade das folgas' },
        { id: 'dimensionamento', label: 'Dimensionamento da equipe', hint: 'Equipe adequada para a demanda' },
        { id: 'pressao', label: 'Pressão por produtividade', hint: 'Cobranças, metas, tempo' },
        { id: 'autonomia', label: 'Autonomia do trabalhador', hint: 'Liberdade para decidir como executar' }
      ]
    },
    6: {
      title: 'Exigências Físicas',
      items: [
        { id: 'postura_predominante', label: 'Postura predominante (de pé)', hint: 'Permanência >2h contínuas ou >85% da jornada' },
        { id: 'postura_sentada_prolongada', label: 'Postura sentada por longos períodos', hint: 'Superior a 2 horas contínuas' },
        { id: 'postura_estatica', label: 'Postura estática prolongada', hint: 'Manutenção de postura fixa sem alternância' },
        { id: 'movimentos_repetitivos', label: 'Movimentos repetitivos', hint: 'Ciclos <30s ou mesmas ações >50% do tempo' },
        { id: 'esforco_fisico', label: 'Esforço físico intenso', hint: 'Escala de esforço percebido (Borg)' },
        { id: 'pedais_alavancas', label: 'Uso de pedais ou alavancas', hint: 'Frequência >3x/min estando de pé' },
        { id: 'deslocamento', label: 'Constante deslocamento a pé', hint: 'Caminhadas >2h contínuas na jornada' },
        { id: 'movimentacao_pacientes', label: 'Movimentação de Pacientes', hint: 'Acamados, independentes, cadeirantes' },
        { id: 'flexao_cervical_30', label: 'Flexão de cervical > 30º', hint: 'Inclinação da cabeça para a frente' },
        { id: 'rotacao_cabeça', label: 'Rotações e lateralizações da cabeça', hint: 'Girar ou inclinar lateralmente a cabeça frequentemente' },
        { id: 'flexao_coluna_45', label: 'Flexão de coluna > 45º', hint: 'Inclinação acentuada do tronco' },
        { id: 'elevacao_ombros_90', label: 'Elevação dos ombros > 90º', hint: 'Braços elevados acima da linha dos ombros' },
        { id: 'abducao_ombros_45', label: 'Abdução dos ombros > 45º', hint: 'Braços afastados lateralmente do corpo' },
        { id: 'desvio_punho_extremo', label: 'Desvio extremo de punho', hint: 'Flexão, extensão ou desvios ulnar/radial acentuados' }
      ]
    },
    7: {
      title: 'Manipulação de Cargas',
      items: [
        { id: 'levantamento_manual', label: 'Levantamento manual de cargas', hint: 'Peso, frequência e distância' },
        { id: 'transporte_manual', label: 'Transporte manual de cargas', hint: 'Distância de pega e solta' },
        { id: 'peso_manipulado', label: 'Peso manipulado > 3kg (pinça) ou > 5kg (palmar)', hint: 'Valores de referência NR-17' },
        { id: 'alcance_horizontal', label: 'Alcance horizontal > 60cm', hint: 'Distância entre corpo e objeto' },
        { id: 'manuseio_ferramentas_pesadas', label: 'Ferramentas/objetos pesados (>1kg pinça, >3kg palmar por >2h)', hint: 'Manuseio prolongado' },
        { id: 'facilitadores', label: 'Facilitadores ergonômicos disponíveis', hint: 'Carrinhos, paleteiras, equipamentos de guindar' }
      ]
    },
    8: {
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
    9: {
      title: 'Mobiliário',
      items: [
        { id: 'mesa_altura', label: 'Altura da mesa/bancada adequada', hint: 'Trabalho pesado: púbis | Moderado: cotovelo | Precisão: acima do cotovelo' },
        { id: 'mesa_regulagem', label: 'Características e dimensões da mesa', hint: 'Largura, profundidade, altura e formato da mesa' },
        { id: 'mesa_borda', label: 'Bordas arredondadas (raio ≥ 2,5mm)', hint: 'Sem quinas vivas que comprimam' },
        { id: 'cadeira_regulagem', label: 'Cadeira com regulagem de altura', hint: 'Ajuste de assento e encosto' },
        { id: 'cadeira_apoio_lombar', label: 'Apoio lombar', hint: 'Encosto com suporte lombar' },
        { id: 'cadeira_apoio_braco', label: 'Apoio de braço', hint: 'Apoio regulável para antebraço' },
        { id: 'espaco_pernas', label: 'Espaço para as pernas', hint: 'Espaço suficiente sob a mesa' },
        { id: 'monitor_distancia', label: 'Distância olho-monitor (50–70cm)', hint: 'Altura do topo do monitor na linha dos olhos' },
        { id: 'apoio_pes', label: 'Apoio para pés (se necessário)', hint: 'Quando pés não alcançam o chão ou alternância de apoio em pé' },
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
    initSpeechRecognition();
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

  let activeSpeechRecognition = null;
  let activeMicButton = null;

  function setupSpeechRecognitionForTextarea(textarea) {
    if (!textarea) return;

    // Garante que o wrapper exista
    let wrapper = textarea.parentElement;
    if (!wrapper || !wrapper.classList.contains('textarea-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'textarea-wrapper';
      textarea.parentNode.insertBefore(wrapper, textarea);
      wrapper.appendChild(textarea);
    }

    // Se já tiver botão de microfone no wrapper, não duplica
    if (wrapper.querySelector('.mic-btn')) {
      return;
    }

    const micBtn = document.createElement('button');
    micBtn.className = 'mic-btn';
    micBtn.innerHTML = '🎤';
    micBtn.title = 'Ditar texto (Reconhecimento de voz)';
    micBtn.setAttribute('aria-label', 'Ditar texto');
    micBtn.type = 'button';

    micBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      // Se já estiver gravando neste mesmo botão, parar
      if (activeMicButton === micBtn && activeSpeechRecognition) {
        try {
          activeSpeechRecognition.stop();
        } catch(err) {
          console.warn('Erro ao parar reconhecimento de voz:', err);
        }
        return;
      }

      // Se houver gravação em outro campo, encerra a anterior primeiro
      if (activeSpeechRecognition) {
        try {
          activeSpeechRecognition.stop();
        } catch(err) {}
        if (activeMicButton) {
          activeMicButton.classList.remove('recording');
          activeMicButton.innerHTML = '🎤';
          activeMicButton.title = 'Ditar texto (Reconhecimento de voz)';
        }
        activeSpeechRecognition = null;
        activeMicButton = null;
      }

      if (!SpeechRecognition) {
        showToast('Reconhecimento de voz não suportado neste navegador. Utilize Google Chrome, Edge ou Safari.');
        return;
      }

      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        showToast('O acesso ao microfone requer conexão segura HTTPS ou localhost.');
        return;
      }

      let recognition;
      try {
        recognition = new SpeechRecognition();
      } catch(err) {
        console.error('Falha ao instanciar SpeechRecognition:', err);
        showToast('Não foi possível iniciar o microfone no navegador.');
        return;
      }

      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = true;

      let baseText = textarea.value ? textarea.value.trim() + ' ' : '';

      recognition.onstart = () => {
        activeSpeechRecognition = recognition;
        activeMicButton = micBtn;
        micBtn.classList.add('recording');
        micBtn.innerHTML = '⏹️';
        micBtn.title = 'Parar gravação (Ouvindo...)';
        showToast('🎤 Gravando ditado... Fale normalmente.');
      };

      recognition.onresult = (event) => {
        let finalTranscripts = '';
        let interim = '';
        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscripts += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        textarea.value = (baseText + finalTranscripts + interim).trimStart();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showToast('Permissão de microfone negada. Autorize o microfone nas permissões do navegador.');
        } else if (event.error === 'network') {
          showToast('Falha de conexão com o serviço de voz do navegador.');
        } else if (event.error === 'no-speech') {
          // Timeout por ausência de fala
        } else {
          showToast('Erro no reconhecimento de voz: ' + event.error);
        }
      };

      recognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '🎤';
        micBtn.title = 'Ditar texto (Reconhecimento de voz)';
        if (activeSpeechRecognition === recognition) {
          activeSpeechRecognition = null;
          activeMicButton = null;
        }
        triggerAutoSave();
      };

      try {
        recognition.start();
      } catch(err) {
        console.error('Erro ao iniciar gravação:', err);
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '🎤';
        activeSpeechRecognition = null;
        activeMicButton = null;
        showToast('O microfone já estava em inicialização. Clique novamente.');
      }
    });

    wrapper.appendChild(micBtn);
  }

  function initSpeechRecognition() {
    document.querySelectorAll('.form-textarea').forEach(textarea => {
      setupSpeechRecognitionForTextarea(textarea);
    });
  }

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

    // Auto-save on input change
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
      el.addEventListener('input', () => triggerAutoSave());
    });

    // Photo upload handlers
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoCameraInput = document.getElementById('photoCameraInput');
    const photoGalleryInput = document.getElementById('photoGalleryInput');
    const photoInput = document.getElementById('photoInput');
    const btnTakePhoto = document.getElementById('btnTakePhoto');
    const btnChooseGallery = document.getElementById('btnChooseGallery');

    if (btnTakePhoto && photoCameraInput) {
      btnTakePhoto.addEventListener('click', (e) => {
        if (btnTakePhoto.tagName !== 'LABEL') {
          e.stopPropagation();
          photoCameraInput.click();
        }
      });
    }

    if (btnChooseGallery && photoGalleryInput) {
      btnChooseGallery.addEventListener('click', (e) => {
        if (btnChooseGallery.tagName !== 'LABEL') {
          e.stopPropagation();
          photoGalleryInput.click();
        }
      });
    }

    if (photoCameraInput) {
      photoCameraInput.addEventListener('change', (e) => handlePhotoUpload(e));
    }
    if (photoGalleryInput) {
      photoGalleryInput.addEventListener('change', (e) => handlePhotoUpload(e));
    }
    if (photoInput) {
      photoInput.addEventListener('change', (e) => handlePhotoUpload(e));
    }

    // Drag and drop para upload de fotos
    if (photoUploadArea) {
      photoUploadArea.addEventListener('click', (e) => {
        if (e.target !== btnTakePhoto && e.target !== btnChooseGallery) {
          if (photoGalleryInput) photoGalleryInput.click();
          else if (photoInput) photoInput.click();
        }
      });

      photoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUploadArea.classList.add('dragover');
      });
      photoUploadArea.addEventListener('dragleave', () => {
        photoUploadArea.classList.remove('dragover');
      });
      photoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUploadArea.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handlePhotoUpload(e.dataTransfer.files);
        }
      });
    }

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
    
    if (num === 12) {
      generateRiskMatrix();
    }
    if (num === 13) {
      renderPhotos();
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
    sessionStorage.removeItem('aet_current_assessment_id');
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
    '4. Ambiente',
    '5. Org. Trabalho',
    '6. Exig. Físicas',
    '7. Cargas',
    '8. Ferramentas',
    '9. Mobiliário',
    '10. Psicossociais',
    '11. Queixas',
    '12. Matriz de Risco',
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
    sessionStorage.setItem('aet_current_assessment_id', id);
    document.getElementById('numeroAet').value = numero_aet;
    currentSection = 1;
    showScreen('screenForm');
    showToast('Nova avaliação criada');
  }

  async function openAssessment(id) {
    const avaliacao = await AvaliacaoDB.getById(id);
    if (!avaliacao) return;

    resetForm();
    currentAssessmentId = id;
    sessionStorage.setItem('aet_current_assessment_id', id);
    
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

  function getRiskGuidelinesAndProcedures(level, riskId, section) {
    const lvl = parseInt(level);
    const rId = (riskId || '').toLowerCase();
    const sec = (section || '').toLowerCase();
    
    // Apenas se houver vínculo direto específico com EPI/Proteção
    const isEpiRisk = rId.includes('epi') || rId.includes('protecao') || sec.includes('proteção');

    if (isEpiRisk) {
      if (lvl === 1) return { guidelines: 'Monitorar', procedures: 'Instruir sobre a utilização correta do EPI e acompanhar o uso.' };
      if (lvl === 2) return { guidelines: 'Gerenciar ativamente', procedures: 'Fiscalizar a utilização dos EPIs e acompanhar as medidas de proteção.' };
      if (lvl === 3) return { guidelines: 'Gerenciar proativamente', procedures: 'Inspecionar equipamentos de proteção, delimitar áreas e fiscalizar o uso de EPI.' };
      if (lvl === 4) return { guidelines: 'Evitar / Eliminar', procedures: 'Adequar os equipamentos de proteção antes da continuidade da atividade.' };
    }

    // Para riscos ergonômicos gerais sem procedimento específico cadastrado: indicação neutra
    if (lvl >= 1 && lvl <= 4) {
      const guidelinesMap = { 1: 'Monitorar', 2: 'Gerenciar ativamente', 3: 'Gerenciar proativamente', 4: 'Evitar / Eliminar' };
      return {
        guidelines: guidelinesMap[lvl] || 'Acompanhar',
        procedures: 'A definir pelo responsável técnico.'
      };
    }

    return { guidelines: '-', procedures: '-' };
  }

  async function generateRiskMatrix() {
    if (!currentAssessmentId) return;
    
    const risks = [];
    
    for (let s = 5; s <= 9; s++) {
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

    // Add Section 4 (Ambiente)
    const envRec = await SecaoDB.get(currentAssessmentId, 4);
    if (envRec && envRec.dados && envRec.dados.ratings) {
      ENVIRONMENT_ITEMS.forEach(item => {
        const rating = envRec.dados.ratings[item.id];
        if (rating && rating.value === 1) {
          risks.push({ id: `risk_4_${item.id}`, name: `Condições ambientais inadequadas: ${item.label}`, section: 'Ambiente de Trabalho' });
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
    
    const matrixRec = await SecaoDB.get(currentAssessmentId, 12);
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

       html += `<tr>
         <td style="font-size:0.85em; color: var(--color-text-secondary); font-weight: 500;">${r.section}</td>
         <td>
           <div style="font-weight:600; color: var(--color-text);">${r.name}</div>
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
      } else if (el.tagName === 'INPUT' && el.type === 'checkbox') {
        data[field] = el.checked;
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

    // Collect checklist data for sections 5-9
    if (sectionNum >= 5 && sectionNum <= 9) {
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

    // Collect environment ratings for section 4
    if (sectionNum === 4) {
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

    // Collect risk matrix data for section 12
    if (sectionNum === 12) {
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
      } else if (el.tagName === 'INPUT' && el.type === 'checkbox') {
        el.checked = !!value;
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
      
      // Check checklists (sections 5-9)
      for (let s = 5; s <= 9; s++) {
        const dados = sMap[s];
        if (dados && dados.checklist) {
          for (const val of Object.values(dados.checklist)) {
            if (val.status === 'inadequate') red++;
            else if (val.status === 'adequate') green++;
          }
        }
      }
      
      // Check environment (section 4)
      const envDados = sMap[4];
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

    const cargasDet = document.querySelectorAll('.cargas-detalhes-container');
    cargasDet.forEach(el => {
      el.style.display = tipoAep === 'administrativo' ? 'none' : 'block';
    });

    for (const [sectionNum, config] of Object.entries(CHECKLISTS)) {
      const container = document.getElementById(`checklist${sectionNum}`);
      if (!container) continue;

      if (tipoAep === 'administrativo' && parseInt(sectionNum) === 7) {
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
        </div>
      `).join('');
    }
  }

  function setChecklistStatus(btn) {
    const item = btn.closest('.checklist-item');
    item.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    triggerAutoSave();
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENVIRONMENT RATING (Section 4)
  // ═══════════════════════════════════════════════════════════════════

  function renderEnvironmentRating() {
    const container = document.getElementById('ratingList4');
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
      </div>
    `).join('');
  }

  function setRating(btn) {
    const item = btn.closest('.checklist-item');
    item.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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
    const complaintTextarea = document.getElementById('complaintDesc');
    if (complaintTextarea) {
      setupSpeechRecognitionForTextarea(complaintTextarea);
    }
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
  // ═══════════════════════════════════════════════════════════════════
  // PHOTOS (Section 13)
  // ═══════════════════════════════════════════════════════════════════

  let createdPhotoBlobUrls = [];

  async function handlePhotoUpload(inputOrFiles) {
    if (!currentAssessmentId) {
      const storedId = sessionStorage.getItem('aet_current_assessment_id');
      if (storedId) {
        currentAssessmentId = parseInt(storedId, 10);
      }
    }

    if (!currentAssessmentId) {
      showToast('Nenhuma avaliação aberta. Selecione ou crie uma avaliação primeiro.');
      return;
    }

    let files = [];
    if (inputOrFiles instanceof Event) {
      files = Array.from(inputOrFiles.target.files || []);
      inputOrFiles.target.value = '';
    } else if (inputOrFiles instanceof FileList || Array.isArray(inputOrFiles)) {
      files = Array.from(inputOrFiles);
    } else if (inputOrFiles && inputOrFiles.target && inputOrFiles.target.files) {
      files = Array.from(inputOrFiles.target.files);
      inputOrFiles.target.value = '';
    }

    if (!files || files.length === 0) return;

    showToast(`Otimizando e anexando ${files.length} foto(s)...`);

    let successCount = 0;
    let errors = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file, 1280, 0.82);
        await FotoDB.add(currentAssessmentId, compressed);
        successCount++;
      } catch (err) {
        console.error(`Erro ao processar imagem ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    // Limpar os campos de input de arquivo
    const pInput = document.getElementById('photoInput');
    const cInput = document.getElementById('photoCameraInput');
    const gInput = document.getElementById('photoGalleryInput');
    if (pInput) pInput.value = '';
    if (cInput) cInput.value = '';
    if (gInput) gInput.value = '';

    await renderPhotos();

    if (successCount > 0) {
      showToast(`${successCount} foto(s) anexada(s) com sucesso!`);
    }
    if (errors.length > 0) {
      alert(`Atenção no processamento de fotos:\n${errors.join('\n')}`);
    }
  }

  function compressImage(file, maxDim = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo fornecido'));
        return;
      }

      const isImage = file.type ? file.type.startsWith('image/') : /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name);
      if (!isImage) {
        reject(new Error(`O arquivo "${file.name}" não é uma imagem suportada.`));
        return;
      }

      // Timeout de segurança para evitar travamento da Promise
      const timer = setTimeout(() => {
        reject(new Error(`Tempo limite esgotado ao processar "${file.name}". Arquivo muito pesado.`));
      }, 12000);

      const reader = new FileReader();
      reader.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Falha ao ler o arquivo "${file.name}".`));
      };

      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => {
          clearTimeout(timer);
          reject(new Error(`Falha ao decodificar a imagem "${file.name}".`));
        };
        img.onload = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }

            canvas.width = Math.max(1, w);
            canvas.height = Math.max(1, h);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            if (canvas.toBlob) {
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  // Fallback se toBlob retornar nulo
                  const dataUrl = canvas.toDataURL('image/jpeg', quality);
                  const arr = dataUrl.split(',');
                  const bstr = atob(arr[1]);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while (n--) u8arr[n] = bstr.charCodeAt(n);
                  resolve(new Blob([u8arr], { type: 'image/jpeg' }));
                }
              }, 'image/jpeg', quality);
            } else {
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const arr = dataUrl.split(',');
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) u8arr[n] = bstr.charCodeAt(n);
              resolve(new Blob([u8arr], { type: 'image/jpeg' }));
            }
          } catch(err) {
            console.warn('Erro no redimensionamento canvas, utilizando arquivo original:', err);
            resolve(file);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  let censorCanvas, censorCtx, isDrawing = false, startX, startY;
  
  async function openCensorModal(id) {
    const foto = await FotoDB.getAll(currentAssessmentId).then(fotos => fotos.find(f => f.id === id));
    if (!foto || !foto.blob) {
      showToast('Imagem não encontrada para anonimização.');
      return;
    }
    
    const url = URL.createObjectURL(foto.blob);
    
    const html = `
      <div class="modal-header">
        <h3>👁️ Anonimizar Imagem</h3>
        <button class="modal-close" onclick="AET.closeModal()">✕</button>
      </div>
      <p style="margin-bottom:var(--space-3)">Toque ou arraste sobre a imagem para censurar rostos ou dados sensíveis.</p>
      <div style="text-align:center; background:#000; overflow:auto; max-height: 60vh; border-radius: var(--radius-md);">
        <canvas id="censorCanvas" style="cursor:crosshair; max-width:100%; display:block; margin:0 auto;"></canvas>
      </div>
      <div style="margin-top:var(--space-4); display:flex; justify-content:flex-end; gap:var(--space-2)">
        <button class="btn btn-secondary" onclick="AET.closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="AET.saveCensor(${id})">Salvar Alterações</button>
      </div>
    `;
    openModal(html);
    
    setTimeout(() => {
      censorCanvas = document.getElementById('censorCanvas');
      if (!censorCanvas) return;
      censorCtx = censorCanvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        censorCanvas.width = img.width;
        censorCanvas.height = img.height;
        censorCtx.drawImage(img, 0, 0);
        
        let circles = [];
        let currentCircle = null;
        
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
        
        function drawBlurredCircle(c) {
          const radius = Math.sqrt(Math.pow(c.endX - c.startX, 2) + Math.pow(c.endY - c.startY, 2));
          if (radius < 5) return;
          
          censorCtx.save();
          censorCtx.beginPath();
          censorCtx.arc(c.startX, c.startY, radius, 0, Math.PI * 2);
          censorCtx.clip();
          
          // Tenta filtro de desfoque, se falhar ou não suportar, aplica pixelamento 8x8
          if ('filter' in censorCtx) {
            censorCtx.filter = 'blur(16px)';
            censorCtx.drawImage(img, 0, 0);
          } else {
            // Efeito pixelamento / mosaico nativo garantido
            const tempW = Math.max(1, Math.floor(img.width / 16));
            const tempH = Math.max(1, Math.floor(img.height / 16));
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = tempW;
            tempCanvas.height = tempH;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, tempW, tempH);
            censorCtx.imageSmoothingEnabled = false;
            censorCtx.drawImage(tempCanvas, 0, 0, img.width, img.height);
          }
          censorCtx.restore();
        }

        function redraw() {
          censorCtx.drawImage(img, 0, 0);
          for (let c of circles) drawBlurredCircle(c);
          if (currentCircle) drawBlurredCircle(currentCircle);
        }
        
        function start(e) {
          e.preventDefault();
          isDrawing = true;
          const pos = getPos(e);
          startX = pos.x;
          startY = pos.y;
          currentCircle = {startX, startY, endX: startX, endY: startY};
        }
        
        function move(e) {
          if (!isDrawing) return;
          e.preventDefault();
          const pos = getPos(e);
          currentCircle.endX = pos.x;
          currentCircle.endY = pos.y;
          redraw();
        }
        
        function stop(e) {
          if (!isDrawing) return;
          e.preventDefault();
          isDrawing = false;
          circles.push(currentCircle);
          currentCircle = null;
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
    try {
      censorCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Erro ao processar imagem anonimizada');
          return;
        }
        await updatePhoto(id, 'blob', blob);
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          await updatePhoto(id, 'data_url', reader.result);
          closeModal();
          await renderPhotos();
          showToast('Imagem anonimizada com sucesso!');
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.85);
    } catch(err) {
      console.error('Erro ao salvar anonimização:', err);
      showToast('Falha ao salvar anonimização.');
    }
  }

  async function renderPhotos() {
    if (!currentAssessmentId) {
      const storedId = sessionStorage.getItem('aet_current_assessment_id');
      if (storedId) currentAssessmentId = parseInt(storedId, 10);
    }
    if (!currentAssessmentId) return;

    // Liberar URLs de blob anteriores para evitar vazamento de memória
    createdPhotoBlobUrls.forEach(u => {
      try { URL.revokeObjectURL(u); } catch(e) {}
    });
    createdPhotoBlobUrls = [];

    const fotos = await FotoDB.getAll(currentAssessmentId);
    const grid = document.getElementById('photoGrid');
    const countEl = document.getElementById('photoCountLabel');

    if (countEl) {
      countEl.textContent = `Fotos cadastradas (${fotos ? fotos.length : 0})`;
    }

    if (!grid) return;

    if (!fotos || fotos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: var(--space-6); background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
          <p style="color: var(--color-text-muted); margin: 0;">Nenhuma fotografia anexada ainda. Utilize os botões acima para adicionar fotos do posto.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = fotos.map(foto => {
      let url = '';
      if (foto.blob && foto.blob instanceof Blob) {
        url = URL.createObjectURL(foto.blob);
        createdPhotoBlobUrls.push(url);
      } else if (foto.data_url) {
        url = foto.data_url;
      }
      
      const imgSrc = url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12" font-family="sans-serif">Imagem</text></svg>';

      return `
        <div class="photo-card" data-photo-id="${foto.id}">
          <img src="${imgSrc}" alt="Foto do posto de trabalho" loading="lazy">
          <div class="photo-card-body">
            <input type="text" placeholder="Legenda da foto..." value="${foto.legenda || ''}" 
              oninput="AET.updatePhoto(${foto.id}, 'legenda', this.value)"
              onchange="AET.updatePhoto(${foto.id}, 'legenda', this.value)">
            <textarea class="form-textarea short" placeholder="Observação técnica..." 
              oninput="AET.updatePhoto(${foto.id}, 'observacao', this.value)"
              onchange="AET.updatePhoto(${foto.id}, 'observacao', this.value)">${foto.observacao || ''}</textarea>
          </div>
          <div class="photo-card-actions">
            <button type="button" class="btn btn-ghost" onclick="AET.openCensorModal(${foto.id})">👁️ Anonimizar</button>
            <button type="button" class="btn btn-ghost" onclick="AET.deletePhoto(${foto.id})" style="color:var(--color-danger)">🗑️ Excluir</button>
          </div>
        </div>
      `;
    }).join('');

    // Anexar microfone nas observações das fotos
    grid.querySelectorAll('.photo-card textarea').forEach(textarea => {
      setupSpeechRecognitionForTextarea(textarea);
    });
  }

  async function updatePhoto(id, field, value) {
    try {
      await FotoDB.update(id, { [field]: value });
    } catch(err) {
      console.warn('Erro ao atualizar foto:', err);
    }
  }

  async function deletePhoto(id) {
    if (confirm('Deseja realmente remover esta fotografia?')) {
      await FotoDB.delete(id);
      await renderPhotos();
      showToast('Fotografia removida.');
    }
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


  const ESOCIAL_MAP = {};

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

      // Determine Traffic light, worker recommendations
      let red = 0, yellow = 0, green = 0;
      let relRecomendacoes = [];

      for (let s = 5; s <= 9; s++) {
        if (sMap[s] && sMap[s].checklist) {
          for (const [k, v] of Object.entries(sMap[s].checklist)) {
            if (v.status === 'inadequate') {
              red++;
            }
            else if (v.status === 'adequate') green++;
          }
        }
        
        // Section-wide worker suggestions
        const melhKey = s === 5 ? 'melhorias_organizacao' : (s === 6 ? 'melhorias_fisicas' : (s === 7 ? 'melhorias_cargas' : (s === 8 ? 'melhorias_ferramentas' : 'melhorias_mobiliario')));
        const melhVal = sMap[s]?.[melhKey] || '';
        if (melhVal) {
          const title = CHECKLISTS[s] ? CHECKLISTS[s].title : 'Seção ' + s;
          relRecomendacoes.push({ origin: title, item: 'Geral', text: melhVal });
        }
      }

      if (sMap[4] && sMap[4].ratings) {
        ENVIRONMENT_ITEMS.forEach(i => {
          const r = sMap[4].ratings[i.id];
          if (r) {
            const val = r.value;
            if (val === 1) {
              red++;
            }
            else if (val === 2 || val === 3) yellow++;
            else if (val === 4) green++;
          }
        });

        // Section-wide worker suggestions for Environment
        const melhVal = sMap[4]?.melhorias_ambiente || '';
        if (melhVal) {
          relRecomendacoes.push({ origin: 'Ambiente de Trabalho', item: 'Geral', text: melhVal });
        }
      }

      // Generate HTML string
      let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório AEP - ${data.numero_aet ? data.numero_aet.replace(/^AET-/, 'AEP-') : 'Nova'}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
            h1, h2, h3 { color: #5B8C3E; margin-top: 0; }
            .header { border-bottom: 2px solid #5B8C3E; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px; }
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
            <h2>${data.numero_aet ? data.numero_aet.replace(/^AET-/, 'AEP-') : 'N/A'}</h2>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item"><div class="meta-label">Empresa</div><div class="meta-value">${data.empresa_nome || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Unidade</div><div class="meta-value">${sMap[1]?.unidade || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Setor / Área</div><div class="meta-value">${data.setor || '-'} / ${data.area || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Trabalhadores por Posto/Turno</div><div class="meta-value">${sMap[1]?.num_trabalhadores_posto_turno || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Data da Avaliação</div><div class="meta-value">${formatDate(data.data) || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Avaliador Responsável</div><div class="meta-value">${data.avaliador || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Perfil de Avaliação</div><div class="meta-value" style="text-transform: capitalize;">${sMap[1]?.tipo_aep || '-'}</div></div>
            <div class="meta-item"><div class="meta-label">Nº da AEP</div><div class="meta-value">${data.numero_aet ? data.numero_aet.replace(/^AET-/, 'AEP-') : '-'}</div></div>
          </div>
          
          <div class="section">
            <h3>SÍNTESE DOS ITENS AVALIADOS</h3>
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
        html += '<tr><th>Tempo na Função / Empresa</th><td>' + (sMap[2].tempo_funcao || '-') + ' ' + (sMap[2].tempo_funcao_unidade || '') + ' / ' + (sMap[2].tempo_empresa || '-') + ' ' + (sMap[2].tempo_empresa_unidade || '') + '</td></tr>';
        html += '<tr><th>Turno / Horário</th><td>' + (sMap[2].turno || '-') + (sMap[2].jornada ? ' (' + sMap[2].jornada + ')' : '') + '</td></tr>';
        html += '<tr><th>Pausa Refeição</th><td>' + (sMap[2].pausa_refeicao || '-') + '</td></tr>';
        html += '</table></div>';
      }

      // Atividade (Seção 3)
      if (sMap[3]) {
        html += '<div class="section"><h3>Caracterização da Atividade</h3><table>';
        html += '<tr><th>Tarefa Real</th><td>' + (sMap[3].descricao_tarefa ? sMap[3].descricao_tarefa.replace(/\n/g, '<br>') : '-') + '</td></tr>';
        if (sMap[3].dificuldades) html += '<tr><th>Dificuldades</th><td>' + sMap[3].dificuldades.replace(/\n/g, '<br>') + '</td></tr>';
        if (sMap[3].estrategias) html += '<tr><th>Estratégias</th><td>' + sMap[3].estrategias.replace(/\n/g, '<br>') + '</td></tr>';
        if (sMap[3].variabilidades) html += '<tr><th>Variabilidades</th><td>' + sMap[3].variabilidades.replace(/\n/g, '<br>') + '</td></tr>';
        html += '</table></div>';
      }

      // Ambiente (Seção 4)
      if (sMap[4]) {
        let ambHtml = '<div class="section"><h3>Condições Ambientais e Layout</h3>';
        
        ambHtml += '<table>';
        ambHtml += '<tr><th>Tipo de Área</th><td>' + (sMap[4].ambiente_tipo_area === 'interna' ? 'Interna' : (sMap[4].ambiente_tipo_area === 'externa' ? 'Externa' : '-')) + '</td></tr>';
        ambHtml += '<tr><th>Descrição da Área</th><td>' + (sMap[4].ambiente_descricao_area || '-') + '</td></tr>';
        
        const layouts = [];
        if (sMap[4].layout_individuais) layouts.push('Postos individuais isolados');
        if (sMap[4].layout_compartilhados) layouts.push('Postos compartilhados');
        if (sMap[4].layout_producao) layouts.push('Em linha de produção');
        if (sMap[4].layout_celulas) layouts.push('Em células de trabalho');
        if (sMap[4].layout_ilhas) layouts.push('Em ilhas/grupos');
        if (sMap[4].layout_adm_integrada) layouts.push('Área administrativa integrada à operação');
        if (sMap[4].layout_circulacao_livre) layouts.push('Área operacional com circulação livre');
        if (sMap[4].layout_misto) layouts.push('Layout misto');
        ambHtml += '<tr><th>Layout do Ambiente</th><td>' + (layouts.length > 0 ? layouts.join(', ') : '-') + '</td></tr>';
        ambHtml += '</table>';

        if (sMap[4].ratings) {
          ambHtml += '<table><tr><th>Fator Ambiental</th><th>Avaliação</th></tr>';
          ENVIRONMENT_ITEMS.forEach(item => {
            const val = sMap[4].ratings[item.id]?.value || 0;
            let valText = 'N/A';
            if (val === 1) valText = 'Muito Ruim';
            else if (val === 2) valText = 'Ruim';
            else if (val === 3) valText = 'Regular';
            else if (val === 4) valText = 'Bom';
            ambHtml += `<tr><td>${item.label}</td><td>${valText}</td></tr>`;
          });
          ambHtml += '</table>';
        }

        const obsVal = sMap[4].obs_ambiente || '';
        const melhVal = sMap[4].melhorias_ambiente || '';
        if (obsVal || melhVal) {
          ambHtml += `<div style="background:#f5f7f2; padding:12px; border-radius:5px; margin-top:10px; border-left:4px solid #5B8C3E;">`;
          if (obsVal) ambHtml += `<p style="margin:0 0 8px 0; font-size:0.9em;"><b>Observações Gerais:</b> ${obsVal.replace(/\n/g, '<br>')}</p>`;
          if (melhVal) ambHtml += `<p style="margin:0; font-size:0.9em;"><b>Sugestão de Melhorias do Trabalhador:</b> ${melhVal.replace(/\n/g, '<br>')}</p>`;
          ambHtml += `</div>`;
        }
        
        ambHtml += '</div>';
        html += ambHtml;
      }

      // Checklists rendering (Seções 5-9) - Text Summary
      for (let s = 5; s <= 9; s++) {
        if (sMap[s] && sMap[s].checklist) {
          let adequados = [];
          let inadequados = [];
          let observacoes = [];
          
          for (const [k, v] of Object.entries(sMap[s].checklist)) {
            if (v.status) {
              const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
              const itemTitle = clItem ? clItem.label : k.replace(/_/g, ' ');

              if (v.status === 'adequate') adequados.push(itemTitle);
              else if (v.status === 'inadequate') inadequados.push(itemTitle);
              
              if (v.obs && v.obs.trim() !== '') {
                observacoes.push(`<li><b>${itemTitle}:</b> ${v.obs.trim()}</li>`);
              }
            }
          }
          
          let resumoHtml = '';
          if (adequados.length > 0 || inadequados.length > 0) {
            resumoHtml += '<p style="font-size: 0.95em; line-height: 1.5; color: #333;">';
            
            if (inadequados.length > 0) {
              resumoHtml += `Foram identificadas <b>inadequações</b> (fatores de risco) referentes a: <i>${inadequados.join('; ')}</i>. `;
              if (adequados.length > 0) {
                resumoHtml += `Por outro lado, os seguintes aspectos encontram-se <b>adequados</b>: <i>${adequados.join('; ')}</i>.`;
              }
            } else if (adequados.length > 0) {
              resumoHtml += `Na avaliação desta dimensão, todos os itens analisados (sendo eles: <i>${adequados.join('; ')}</i>) encontram-se <b>adequados</b>, não sendo observados fatores de risco significativos.`;
            }
            
            resumoHtml += '</p>';
            
            if (observacoes.length > 0) {
              resumoHtml += `<div style="margin-top: 10px;"><p style="font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Observações Específicas:</p><ul style="font-size: 0.9em; color: #555; margin-top: 0;">${observacoes.join('')}</ul></div>`;
            }
          }

          if (s === 5) {
            let orgDetHtml = '<table style="margin-top:10px; font-size:0.9em; width:100%; border-collapse:collapse;">';
            orgDetHtml += '<tr><th colspan="2" style="background:#eef2e8;">Detalhamento de Ritmo e Esforço</th></tr>';
            orgDetHtml += `<tr><td><b>Ritmo Livre?</b></td><td>${sMap[5].ritmo_livre === 'sim' ? 'Sim' : (sMap[5].ritmo_livre === 'nao' ? 'Não' : '-')}</td></tr>`;
            orgDetHtml += `<tr><td><b>Ritmo Imposto pela Máquina?</b></td><td>${sMap[5].ritmo_imposto_maquina === 'sim' ? 'Sim' : (sMap[5].ritmo_imposto_maquina === 'nao' ? 'Não' : '-')}</td></tr>`;
            orgDetHtml += `<tr><td><b>Esforço Percebido:</b></td><td>${sMap[5].esforco_percebido || '-'}</td></tr>`;
            orgDetHtml += `<tr><td><b>Exigência de Tempo?</b></td><td>${sMap[5].exigencia_tempo === 'sim' ? 'Sim' : (sMap[5].exigencia_tempo === 'nao' ? 'Não' : '-')}</td></tr>`;
            
            let monText = '-';
            if (sMap[5].monotonia_pergunta === 'a') monText = 'a) A tarefa é considerada monótona, sem enriquecimento.';
            else if (sMap[5].monotonia_pergunta === 'b') monText = 'b) A tarefa possui conteúdo simples, com pequena monotonia.';
            else if (sMap[5].monotonia_pergunta === 'c') monText = 'c) A tarefa possui variações de conteúdo e de movimentos.';
            else if (sMap[5].monotonia_pergunta === 'd') monText = 'd) A tarefa é estimulante, exigindo concentração/decisão.';
            orgDetHtml += `<tr><td><b>Monotonia da Tarefa:</b></td><td>${monText}</td></tr>`;
            orgDetHtml += '</table>';
            resumoHtml += orgDetHtml;
          }

          if (s === 7 && sMap[7]) {
            const tipoAep = sMap[1]?.tipo_aep || 'operacional';
            if (tipoAep !== 'administrativo') {
              let cargasDetHtml = '<table style="margin-top:10px; font-size:0.9em; width:100%; border-collapse:collapse;">';
              cargasDetHtml += '<tr><th colspan="2" style="background:#eef2e8;">Detalhamento de Levantamento de Cargas</th></tr>';
              cargasDetHtml += `<tr><td><b>Peso do Objeto/Carga:</b></td><td>${sMap[7].cargas_levantamento_peso || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Distância das mãos ao chão no início:</b></td><td>${sMap[7].cargas_levantamento_distancia_chao || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Distância vertical origem/destino:</b></td><td>${sMap[7].cargas_levantamento_distancia_vertical || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Frequência de levantamento:</b></td><td>${sMap[7].cargas_levantamento_frequencia || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Qualidade da Pega:</b></td><td>${sMap[7].cargas_levantamento_pega || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Apenas uma mão?</b></td><td>${sMap[7].cargas_levantamento_uma_mao === 'sim' ? 'Sim' : (sMap[7].cargas_levantamento_uma_mao === 'nao' ? 'Não' : '-')}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Por dois trabalhadores?</b></td><td>${sMap[7].cargas_levantamento_dois_trab === 'sim' ? 'Sim' : (sMap[7].cargas_levantamento_dois_trab === 'nao' ? 'Não' : '-')}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Horas no Turno:</b></td><td>${sMap[7].cargas_levantamento_horas_turno || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Ações por Minuto:</b></td><td>${sMap[7].cargas_levantamento_acoes_minuto || '-'}</td></tr>`;
              
              cargasDetHtml += '<tr><th colspan="2" style="background:#eef2e8;">Detalhamento de Transporte de Cargas</th></tr>';
              cargasDetHtml += `<tr><td><b>Qtd. vezes por dia:</b></td><td>${sMap[7].cargas_transporte_vezes_dia || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Distância total por dia:</b></td><td>${sMap[7].cargas_transporte_distancia_dia || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Peso da carga:</b></td><td>${sMap[7].cargas_transporte_peso || '-'}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Velocidade do transporte:</b></td><td>${sMap[7].cargas_transporte_velocidade === 'lenta' ? 'Carga Lenta' : (sMap[7].cargas_transporte_velocidade === 'rapida' ? 'Carga Rápida' : '-')}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Posição do tronco:</b></td><td>${sMap[7].cargas_transporte_postura_tronco === 'reto' ? 'Reto' : (sMap[7].cargas_transporte_postura_tronco === 'inclinado' ? 'Inclinado' : '-')}</td></tr>`;
              cargasDetHtml += `<tr><td><b>Condições de trabalho:</b></td><td>${sMap[7].cargas_transporte_condicoes === 'adequado' ? 'Adequado' : (sMap[7].cargas_transporte_condicoes === 'inadequado' ? 'Inadequado' : '-')}</td></tr>`;
              cargasDetHtml += '</table>';
              resumoHtml += cargasDetHtml;
            }
          }

          const obsKey = s === 5 ? 'obs_organizacao' : (s === 6 ? 'obs_fisicas' : (s === 7 ? 'obs_cargas' : (s === 8 ? 'obs_ferramentas' : 'obs_mobiliario')));
          const melhKey = s === 5 ? 'melhorias_organizacao' : (s === 6 ? 'melhorias_fisicas' : (s === 7 ? 'melhorias_cargas' : (s === 8 ? 'melhorias_ferramentas' : 'melhorias_mobiliario')));
          const obsVal = sMap[s]?.[obsKey] || '';
          const melhVal = sMap[s]?.[melhKey] || '';
          
          let extraHtml = '';
          if (obsVal || melhVal) {
            extraHtml += `<div style="background:#f5f7f2; padding:12px; border-radius:5px; margin-top:10px; border-left:4px solid #5B8C3E;">`;
            if (obsVal) extraHtml += `<p style="margin:0 0 8px 0; font-size:0.9em;"><b>Observações Gerais:</b> ${obsVal.replace(/\n/g, '<br>')}</p>`;
            if (melhVal) extraHtml += `<p style="margin:0; font-size:0.9em;"><b>Sugestão de Melhorias do Trabalhador:</b> ${melhVal.replace(/\n/g, '<br>')}</p>`;
            extraHtml += `</div>`;
          }

          if (adequados.length > 0 || inadequados.length > 0) {
            const title = CHECKLISTS[s] ? CHECKLISTS[s].title : 'Checklist ' + s;
            html += '<div class="section"><h3>' + title + '</h3>' + resumoHtml + extraHtml + '</div>';
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

      
      // Matriz de Risco (Seção 12)
      const SECTION_TITLE_MAP = {
        4: 'Ambiente de Trabalho',
        5: 'Organização do Trabalho',
        6: 'Exigências Físicas',
        7: 'Manipulação de Cargas',
        8: 'Ferramentas e Equipamentos',
        9: 'Mobiliário',
        10: 'Fatores Psicossociais'
      };

      const riskMeta = {};
      const rMap = (sMap[12] && sMap[12].risks) ? sMap[12].risks : {};

      // Seções 5 a 9 (Checklists)
      for (let s = 5; s <= 9; s++) {
        if (sMap[s] && sMap[s].checklist) {
          for (const [k, v] of Object.entries(sMap[s].checklist)) {
            if (v && (v.status === 'inadequate' || v.status === 'warning')) {
              const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
              const descProf = (typeof NORMATIVE_ASSOCIATIONS !== 'undefined' && NORMATIVE_ASSOCIATIONS[k] && NORMATIVE_ASSOCIATIONS[k].descricaoProfissional)
                ? NORMATIVE_ASSOCIATIONS[k].descricaoProfissional
                : (clItem ? clItem.label : k.replace(/_/g, ' '));
              riskMeta[`risk_${s}_${k}`] = {
                name: descProf,
                section: SECTION_TITLE_MAP[s] || CHECKLISTS[s]?.title || ('Seção ' + s)
              };
            }
          }
        }
      }
      // Seção 4 (Ambiente)
      if (sMap[4] && sMap[4].ratings) {
        ENVIRONMENT_ITEMS.forEach(item => {
          const rating = sMap[4].ratings[item.id];
          if (rating && (rating.value === 1 || rating.value === 2 || rating.value === 3)) {
            riskMeta[`risk_4_${item.id}`] = { name: `Conforto ambiental: ${item.label}`, section: 'Ambiente de Trabalho' };
          }
        });
      }
      // Seção 10 (Psicossociais)
      if (sMap[10]) {
        for (let i = 1; i <= 6; i++) {
          const r = sMap[10][`psico_dim${i}_riscos`];
          if (r) {
            r.split(',').forEach((item, idx) => {
              if (item.trim()) {
                riskMeta[`risk_psico_${i}_${idx}`] = { name: item.trim(), section: 'Fatores Psicossociais' };
              }
            });
          }
        }
      }

        // Sync rMap with riskMeta
        Object.keys(riskMeta).forEach(id => {
          if (!rMap[id]) rMap[id] = {};
        });

        const entries = Object.entries(rMap);
        if (entries.length > 0) {
          html += '<div class="section page-break"><h3>Matriz de Risco Ergonômico</h3>';
          html += '<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">';
          html += '<thead><tr style="background:#f5f5f5;"><th>Origem</th><th>Fator de Risco</th><th>Fator de Proteção</th><th>Perfil de Exposição</th><th>Probabilidade</th><th>Severidade</th><th>Classificação de Risco</th><th>Medidas / Diretrizes</th><th>Procedimentos</th></tr></thead><tbody>';
          
          for (const [id, r] of entries) {
            const meta = riskMeta[id] || { name: r.name || id, section: r.section || '-' };
            const f_prot = r.f_prot || '';
            const p_exp = r.p_exp || r.prob || '';
            const grav = r.grav || '';

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
            const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null, id, meta.section);

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

      // Queixas
      if (queixas && queixas.length > 0) {
        html += '<div class="section"><h3>Queixas Osteomusculares</h3><table><tr><th>Região</th><th>Intensidade</th><th>Tipo</th><th>Anotação</th></tr>';
        queixas.forEach(q => {
          const label = BODY_REGIONS.find(r => r.id === q.regiao)?.label || q.regiao || '-';
          html += '<tr><td>' + label + '</td><td>' + (q.intensidade || '0') + '/5</td><td>' + (q.tipo || '-') + '</td><td>' + (q.descricao || '-') + '</td></tr>';
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
          if (!imgSrc && p.blob && p.blob instanceof Blob) {
            try {
              imgSrc = await blobToBase64(p.blob);
            } catch (err) {
              console.warn('Erro ao converter foto para base64 no relatório:', err);
            }
          }
          if (imgSrc) {
            html += `
              <div class="photo-item">
                <img src="${imgSrc}" alt="Foto ${p.ordem || ''}">
                <p><b>Legenda:</b> ${p.legenda || '-'}</p>
                <p><small>${p.observacao || ''}</small></p>
              </div>
            `;
          }
        }
        html += '</div></div>';
      }
      


      // Conclusão
      let conclHtml = '<div class="section page-break"><h3>Conclusão Preliminar</h3>';
      
      let sinteseGeral = `<p style="font-size: 0.95em; line-height: 1.5; color: #333; margin-bottom: 15px; border-left: 4px solid var(--color-primary); padding-left: 10px; background: #f9f9f9; padding: 15px;">`;
      if (red > 0) {
        sinteseGeral += `<b>Síntese dos Achados:</b> A avaliação identificou <b>${red} aspecto(s) inadequado(s)</b> que requerem acompanhamento preventivo. Recomenda-se a adoção das medidas de prevenção e controle estabelecidas na matriz de risco. `;
      } else if (yellow > 0) {
        sinteseGeral += `<b>Síntese dos Achados:</b> A avaliação não identificou inadequações críticas, mas aponta <b>${yellow} aspecto(s) em estado de atenção</b> que requerem monitoramento preventivo. `;
      } else {
        sinteseGeral += `<b>Síntese dos Achados:</b> A avaliação indicou total adequação do posto de trabalho aos critérios ergonômicos analisados, não sendo detectados riscos significativos no momento da análise. `;
      }
      sinteseGeral += `</p>`;
      
      conclHtml += sinteseGeral;
      
      if (sMap[14] && sMap[14].conclusao) {
        conclHtml += '<p>' + sMap[14].conclusao.replace(/\n/g, '<br>') + '</p>';
      }
      conclHtml += '</div>';
      html += conclHtml;
      if (sMap[15] && sMap[15].recomendacoes) {
        const recomendacoesList = sMap[15].recomendacoes.split('\n').filter(line => line.trim() !== '').map(line => `<li>${line.replace(/^[-*]\s*/, '')}</li>`).join('');
        html += '<div class="section"><h3>Plano de Ação / Recomendações (Avaliador)</h3><ul>' + recomendacoesList + '</ul></div>';
      }
      
      html += '</body></html>';
      return html;
    } catch (e) {
      console.error(e);
      alert('Erro interno ao gerar o relatório: ' + e.message);
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
    const matches = empresas.filter(emp => emp.nome.toLowerCase().includes(val));
    if (matches.length > 0) {
      dropdown.innerHTML = matches.map(m => `<div class="dropdown-item" onclick="document.getElementById('empresa').value='${m.nome}'; document.getElementById('empresaDropdown').classList.remove('active'); triggerAutoSave();">${m.nome}</div>`).join('');
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

  async function generateAutoConclusion() {
    if (!currentAssessmentId) return;
    try {
      // Garante a persistência do estado atual da avaliação antes de rodar o motor
      await saveCurrentSection();

      const sections = await SecaoDB.getAllForAssessment(currentAssessmentId);
      if (!sections || sections.length === 0) {
        alert('Os dados disponíveis nesta avaliação não são suficientes para gerar uma conclusão interpretativa automática. Revise o preenchimento ou elabore a conclusão manualmente.');
        return;
      }
      
      const sMap = {};
      let totalCheckpointsAnswered = 0;
      sections.forEach(s => {
        sMap[s.secao] = s.dados;
        if (s.dados) {
          if (s.dados.checklist) {
            Object.values(s.dados.checklist).forEach(item => {
              if (item.status === 'adequate' || item.status === 'inadequate' || item.status === 'warning') {
                totalCheckpointsAnswered++;
              }
            });
          }
          if (s.dados.ratings) {
            Object.values(s.dados.ratings).forEach(rating => {
              if (rating && rating.value > 0) {
                totalCheckpointsAnswered++;
              }
            });
          }
        }
      });

      const complaints = await QueixaDB.getAll(currentAssessmentId);
      const hasTaskDesc = !!(sMap[3] && sMap[3].descricao_tarefa);
      const hasComplaints = complaints && complaints.length > 0;

      // Validação de dados insuficientes: exige pelo menos um checkpoint ou descrição ou queixa
      if (totalCheckpointsAnswered === 0 && !hasTaskDesc && !hasComplaints) {
        alert('Os dados disponíveis nesta avaliação não são suficientes para gerar uma conclusão interpretativa automática. Revise o preenchimento ou elabore a conclusão manualmente.');
        return;
      }

      // Executa o motor interpretativo revisado sem inferência quantitativa
      const result = ErgonomicConclusionEngine.generateInterpretiveConclusion(sMap, complaints);
      
      // Formata a conclusão limpa
      const formattedConclusion = result.conclusao;

      const el = document.getElementById('conclusao');
      if (el) {
        const existingText = el.value.trim();
        if (!existingText) {
          el.value = formattedConclusion;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          triggerAutoSave();
          showToast('Conclusão interpretativa auto-gerada com sucesso!');
        } else {
          // Salva temporariamente o texto gerado
          window._tempGeneratedConclusion = formattedConclusion;
          
          // Exibir modal tríplice de decisão (Padrão: Cancelar)
          const modalHtml = `
            <div class="modal-header">
              <h3>⚠️ Atenção: Texto Existente</h3>
              <button class="modal-close" onclick="AET.closeModal()">✕</button>
            </div>
            <p style="margin-bottom: var(--space-4);">O campo de conclusão já possui conteúdo. O que deseja fazer com a nova conclusão interpretativa gerada?</p>
            <div style="display:flex; flex-direction:column; gap: var(--space-2); margin-bottom: var(--space-4);">
              <button class="btn btn-primary" onclick="AET.resolveConclusionConflict('replace')">Substituir o texto atual</button>
              <button class="btn btn-secondary" onclick="AET.resolveConclusionConflict('append')">Acrescentar ao final do texto existente</button>
              <button class="btn btn-ghost" onclick="AET.closeModal()" style="border: 1px solid var(--color-border);">Cancelar (Manter original)</button>
            </div>
          `;
          openModal(modalHtml);
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao gerar conclusão interpretativa');
    }
  }

  function resolveConclusionConflict(action) {
    const el = document.getElementById('conclusao');
    if (el && window._tempGeneratedConclusion) {
      if (action === 'replace') {
        el.value = window._tempGeneratedConclusion;
      } else if (action === 'append') {
        el.value = el.value + '\n\n' + window._tempGeneratedConclusion;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      triggerAutoSave();
      showToast(action === 'replace' ? 'Conclusão substituída com sucesso!' : 'Conclusão anexada com sucesso!');
    }
    delete window._tempGeneratedConclusion;
    closeModal();
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

  async function saveDraftAndExit() {
    if (!currentAssessmentId) return;
    await saveCurrentSection();
    showToast('Rascunho salvo com sucesso!');
    goHome();
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
    generateAutoConclusion,
    resolveConclusionConflict,
    showSubmitConfirm,
    saveDraftAndExit,
    setChecklistStatus,
    setRating,
    selectIntensity,
    selectComplaintType,
    saveComplaint,
    removeComplaint,
    openCensorModal,
    updatePhoto,
    deletePhoto,
    handlePhotoUpload,
    setupSpeechRecognitionForTextarea,
    exportHTMLReport,
    exportCSV: async function() {
      if (!currentAssessmentId) return;
      try {
        const data = await ExportDB.getFullAssessment(currentAssessmentId);
        if (!data) return;
        const { avaliacao, secoes } = data;
        const sMap = {};
        secoes.forEach(s => sMap[s.secao] = s.dados);

        let csvContent = 'Origem;Fator de Risco;Fator de Protecao;Perfil de Exposicao;Probabilidade;Severidade;Classificacao de Risco;Medidas / Diretrizes;Procedimentos\n';
        
        if (sMap[12] && sMap[12].risks) {
          const SECTION_TITLE_MAP = {
            4: 'Ambiente de Trabalho',
            5: 'Organização do Trabalho',
            6: 'Exigências Físicas',
            7: 'Manipulação de Cargas',
            8: 'Ferramentas e Equipamentos',
            9: 'Mobiliário',
            10: 'Fatores Psicossociais'
          };
          const riskMeta = {};
          for (let s = 5; s <= 9; s++) {
            if (sMap[s] && sMap[s].checklist) {
              for (const [k, v] of Object.entries(sMap[s].checklist)) {
                if (v && (v.status === 'inadequate' || v.status === 'warning')) {
                  const clItem = CHECKLISTS[s]?.items?.find(i => i.id === k);
                  const descProf = (typeof NORMATIVE_ASSOCIATIONS !== 'undefined' && NORMATIVE_ASSOCIATIONS[k] && NORMATIVE_ASSOCIATIONS[k].descricaoProfissional)
                    ? NORMATIVE_ASSOCIATIONS[k].descricaoProfissional
                    : (clItem ? clItem.label : k.replace(/_/g, ' '));
                  riskMeta[`risk_${s}_${k}`] = {
                    name: descProf,
                    section: SECTION_TITLE_MAP[s] || CHECKLISTS[s]?.title || ('Seção ' + s)
                  };
                }
              }
            }
          }
          if (sMap[4] && sMap[4].ratings) {
            ENVIRONMENT_ITEMS.forEach(item => {
              const rating = sMap[4].ratings[item.id];
              if (rating && (rating.value === 1 || rating.value === 2 || rating.value === 3)) {
                riskMeta[`risk_4_${item.id}`] = { name: `Conforto ambiental: ${item.label}`, section: 'Ambiente de Trabalho' };
              }
            });
          }
          if (sMap[10]) {
            for (let i = 1; i <= 6; i++) {
              const r = sMap[10][`psico_dim${i}_riscos`];
              if (r) {
                r.split(',').forEach((item, idx) => {
                  if (item.trim()) {
                    riskMeta[`risk_psico_${i}_${idx}`] = { name: item.trim(), section: 'Fatores Psicossociais' };
                  }
                });
              }
            }
          }

          Object.entries(sMap[12].risks).forEach(([id, r]) => {
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
              const guideObj = getRiskGuidelinesAndProcedures(classObj ? classObj.level : null, id, meta.section);

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

              csvContent += `"${meta.section}";"${meta.name}";"${fpLabel}";"${peLabel}";"${probLabel}";"${sevLabel}";"${lvl}";"${mon}";"${act}"\n`;
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
