/* ========================================================================
   AET Database Module
   IndexedDB via Dexie.js — Relational structure
   ======================================================================== */

const db = new Dexie('AET_Database');

// V3 introduces encryption. We change schemas slightly to hold encrypted blobs/strings.
db.version(3).stores({
  empresas: '++id, nome, cnpj',
  avaliacoes: '++id, empresa_id, empresa_nome, setor, area, numero_aet, status, data, avaliador, created_at, updated_at',
  secoes_dados: '++id, avaliacao_id, secao, [avaliacao_id+secao]',
  fotos: '++id, avaliacao_id, ordem',
  queixas: '++id, avaliacao_id',
  config: 'key'
});

// If the user hasn't setup crypto, we wipe the DB to prevent crashes reading unencrypted old data
if (!localStorage.getItem('aet_salt') && !localStorage.getItem('aet_wiped_v3')) {
  db.delete().then(() => {
    localStorage.setItem('aet_wiped_v3', '1');
    location.reload();
  });
}


/* ------- Helper: Generate AET Number ------- */
async function generateAETNumber() {
  const year = new Date().getFullYear();
  const count = await db.avaliacoes
    .where('numero_aet')
    .startsWith(`AET-${year}`)
    .count();
  const num = String(count + 1).padStart(4, '0');
  return `AET-${year}-${num}`;
}

/* ------- CRUD: Empresas ------- */
const EmpresaDB = {
  async getAll() {
    return db.empresas.toArray();
  },

  async search(term) {
    const lower = term.toLowerCase();
    return db.empresas
      .filter(e => e.nome.toLowerCase().includes(lower) || (e.cnpj && e.cnpj.includes(term)))
      .toArray();
  },

  async upsert(nome, cnpj) {
    const existing = await db.empresas.where('nome').equalsIgnoreCase(nome).first();
    if (existing) {
      if (cnpj && cnpj !== existing.cnpj) {
        await db.empresas.update(existing.id, { cnpj });
      }
      return existing.id;
    }
    return db.empresas.add({ nome, cnpj: cnpj || '' });
  }
};

/* ------- CRUD: Avaliações ------- */
const AvaliacaoDB = {
  async create(data) {
    const numero_aet = await generateAETNumber();
    const now = new Date().toISOString();
    const empresaId = await EmpresaDB.upsert(data.empresa || 'Sem nome', data.cnpj);

    const id = await db.avaliacoes.add({
      empresa_id: empresaId,
      empresa_nome: data.empresa || 'Sem nome',
      setor: data.setor || '',
      area: data.area || '',
      numero_aet,
      status: 'draft',
      data: data.data || new Date().toISOString().split('T')[0],
      avaliador: data.avaliador || '',
      created_at: now,
      updated_at: now
    });

    // Initialize all section data
    const sections = [];
    for (let s = 1; s <= 14; s++) {
      sections.push({ avaliacao_id: id, secao: s, dados: {} });
    }
    await db.secoes_dados.bulkAdd(sections);

    return { id, numero_aet };
  },

  async getAll(filter = 'all') {
    let query = db.avaliacoes.orderBy('updated_at').reverse();
    if (filter === 'draft') {
      return query.filter(a => a.status === 'draft').toArray();
    }
    if (filter === 'completed') {
      return query.filter(a => a.status === 'completed').toArray();
    }
    return query.toArray();
  },

  async getById(id) {
    return db.avaliacoes.get(id);
  },

  async update(id, data) {
    data.updated_at = new Date().toISOString();
    return db.avaliacoes.update(id, data);
  },

  async delete(id) {
    await db.secoes_dados.where('avaliacao_id').equals(id).delete();
    await db.fotos.where('avaliacao_id').equals(id).delete();
    await db.queixas.where('avaliacao_id').equals(id).delete();
    return db.avaliacoes.delete(id);
  },

  async search(term) {
    const lower = term.toLowerCase();
    return db.avaliacoes
      .filter(a =>
        (a.empresa_nome && a.empresa_nome.toLowerCase().includes(lower)) ||
        (a.numero_aet && a.numero_aet.toLowerCase().includes(lower)) ||
        (a.avaliador && a.avaliador.toLowerCase().includes(lower)) ||
        (a.setor && a.setor.toLowerCase().includes(lower))
      )
      .toArray();
  },

  async complete(id) {
    return db.avaliacoes.update(id, { 
      status: 'completed', 
      updated_at: new Date().toISOString() 
    });
  }
};

/* ------- CRUD: Seções ------- */
const SecaoDB = {
  async get(avaliacaoId, secao) {
    const entry = await db.secoes_dados.where({ avaliacao_id: avaliacaoId, secao }).first();
    if (entry && entry.dados && typeof entry.dados === 'string') {
      entry.dados = await CryptoDB.decryptObj(entry.dados);
    }
    return entry;
  },

  async save(avaliacaoId, secao, dados) {
    const encDados = await CryptoDB.encryptObj(dados);
    const existing = await db.secoes_dados.where({ avaliacao_id: avaliacaoId, secao }).first();
    if (existing) {
      return db.secoes_dados.update(existing.id, { dados: encDados });
    }
    return db.secoes_dados.add({ avaliacao_id: avaliacaoId, secao, dados: encDados });
  },

  async getAllForAssessment(avaliacaoId) {
    const entries = await db.secoes_dados.where('avaliacao_id').equals(avaliacaoId).toArray();
    for (const entry of entries) {
      if (entry.dados && typeof entry.dados === 'string') {
        entry.dados = await CryptoDB.decryptObj(entry.dados);
      }
    }
    return entries;
  }
};

/* ------- CRUD: Fotos ------- */
const FotoDB = {
  async add(avaliacaoId, blob, legenda = '', observacao = '') {
    const count = await db.fotos.where('avaliacao_id').equals(avaliacaoId).count();
    const encBlob = await CryptoDB.encryptBlob(blob);
    const encMeta = await CryptoDB.encryptObj({ legenda, observacao });
    return db.fotos.add({
      avaliacao_id: avaliacaoId,
      blob: encBlob,
      encMeta,
      ordem: count
    });
  },

  async getAll(avaliacaoId) {
    const fotos = await db.fotos.where('avaliacao_id').equals(avaliacaoId).sortBy('ordem');
    for (const f of fotos) {
      if (f.blob) f.blob = await CryptoDB.decryptBlob(f.blob);
      if (f.encMeta) {
        const meta = await CryptoDB.decryptObj(f.encMeta);
        f.legenda = meta.legenda;
        f.observacao = meta.observacao;
      }
    }
    return fotos;
  },

  async update(id, data) {
    if (data.blob) {
      data.blob = await CryptoDB.encryptBlob(data.blob);
    }
    // If they update meta...
    if (data.legenda !== undefined || data.observacao !== undefined) {
      const existing = await db.fotos.get(id);
      let meta = { legenda: '', observacao: '' };
      if (existing.encMeta) {
         meta = await CryptoDB.decryptObj(existing.encMeta) || meta;
      }
      if (data.legenda !== undefined) meta.legenda = data.legenda;
      if (data.observacao !== undefined) meta.observacao = data.observacao;
      data.encMeta = await CryptoDB.encryptObj(meta);
      delete data.legenda;
      delete data.observacao;
    }
    return db.fotos.update(id, data);
  },

  async delete(id) {
    return db.fotos.delete(id);
  }
};

/* ------- CRUD: Queixas ------- */
const QueixaDB = {
  async add(avaliacaoId, regiao, intensidade, tipo, descricao = '') {
    return db.queixas.add({
      avaliacao_id: avaliacaoId,
      regiao,
      intensidade,
      tipo,
      descricao
    });
  },

  async getAll(avaliacaoId) {
    return db.queixas
      .where('avaliacao_id')
      .equals(avaliacaoId)
      .toArray();
  },

  async delete(id) {
    return db.queixas.delete(id);
  },

  async deleteByRegion(avaliacaoId, regiao) {
    return db.queixas
      .where({ avaliacao_id: avaliacaoId, regiao })
      .delete();
  }
};

/* ------- Export Helpers ------- */
const ExportDB = {
  async getFullAssessment(id) {
    const avaliacao = await AvaliacaoDB.getById(id);
    const secoes = await SecaoDB.getAllForAssessment(id);
    const fotos = await FotoDB.getAll(id);
    const queixas = await QueixaDB.getAll(id);
    
    return { avaliacao, secoes, fotos, queixas };
  },

  async getAllAssessments() {
    const avaliacoes = await AvaliacaoDB.getAll();
    const results = [];
    for (const a of avaliacoes) {
      const full = await this.getFullAssessment(a.id);
      results.push(full);
    }
    return results;
  }
};
