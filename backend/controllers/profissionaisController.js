const { query } = require("../database");

// Campos aceitos no corpo das requisições (na ordem de inserção).
// epc_epcm  = "EPC/EPCM ou Contrato Direto"
// ilha      = "Ilha/Local"
// efetivo   = "Efetivo da Ilha/Local"
const CAMPOS = [
  "projeto",
  "data",
  "responsavel",
  "epc_epcm",
  "contratada",
  "subcontratada",
  "ilha",
  "efetivo",
  "nome",
  "cargo",
  "telefone",
  "email",
  "observacao",
];

// Remove espaços extras de strings; datas vazias viram NULL.
function normalizar(body) {
  const dados = {};
  for (const campo of CAMPOS) {
    let valor = body[campo];
    if (typeof valor === "string") valor = valor.trim().replace(/\s+/g, " ");
    if (campo === "data" && !valor) valor = null;
    dados[campo] = valor ?? null;
  }
  return dados;
}

async function listar(_req, res, next) {
  try {
    const { rows } = await query(
      "SELECT * FROM profissionais ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const d = normalizar(req.body);
    if (!d.projeto)
      return res.status(400).json({ error: "Campo 'projeto' é obrigatório." });

    const valores = CAMPOS.map((c) => d[c]);
    const placeholders = CAMPOS.map((_, i) => `$${i + 1}`).join(", ");
    const { rows } = await query(
      `INSERT INTO profissionais (${CAMPOS.join(", ")})
       VALUES (${placeholders}) RETURNING *`,
      valores
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const d = normalizar(req.body);
    if (!d.projeto)
      return res.status(400).json({ error: "Campo 'projeto' é obrigatório." });

    const setClause = CAMPOS.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const valores = CAMPOS.map((c) => d[c]);
    valores.push(id);
    const { rows } = await query(
      `UPDATE profissionais SET ${setClause}, updated_at = NOW()
       WHERE id = $${CAMPOS.length + 1} RETURNING *`,
      valores
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Registro não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await query(
      "DELETE FROM profissionais WHERE id = $1",
      [id]
    );
    if (rowCount === 0)
      return res.status(404).json({ error: "Registro não encontrado." });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, remover };
