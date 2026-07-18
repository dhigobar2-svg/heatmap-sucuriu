const { query } = require("../database");

// Conta valores não vazios de uma coluna. Distinto quando indicado.
function contarNaoVazio(coluna, distinto = false) {
  const alvo = distinto ? `DISTINCT ${coluna}` : coluna;
  return `COUNT(${alvo}) FILTER (WHERE ${coluna} IS NOT NULL AND TRIM(${coluna}) <> '')`;
}

async function resumo(_req, res, next) {
  try {
    const sql = `
      SELECT
        COUNT(*)                                    AS total_profissionais,
        ${contarNaoVazio("epc_epcm")}               AS total_epc_epcm,
        ${contarNaoVazio("contrato_direto")}        AS total_contratos_diretos,
        ${contarNaoVazio("subcontratada")}          AS total_subcontratadas,
        ${contarNaoVazio("ilha", true)}             AS total_ilhas,
        ${contarNaoVazio("cargo", true)}            AS total_cargos
      FROM profissionais`;
    const { rows } = await query(sql);
    const r = rows[0];

    res.json({
      totalProfissionais: Number(r.total_profissionais),
      totalEpcEpcm: Number(r.total_epc_epcm),
      totalContratosDiretos: Number(r.total_contratos_diretos),
      totalSubcontratadas: Number(r.total_subcontratadas),
      totalIlhas: Number(r.total_ilhas),
      totalCargos: Number(r.total_cargos),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumo };
