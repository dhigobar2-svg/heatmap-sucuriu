const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Toda a conexão utiliza exclusivamente a variável DATABASE_URL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway exige SSL em produção; local geralmente não usa.
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Executa o schema.sql no start para garantir que a tabela exista.
async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Banco de dados pronto (tabela profissionais verificada).");
}

// Helper simples para consultas parametrizadas.
function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query, initDatabase };
