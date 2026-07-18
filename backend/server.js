require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { initDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Healthcheck simples.
app.get("/", (_req, res) => res.json({ status: "ok", service: "SESMT APP API" }));

app.use("/api", routes);

// Handler central de erros.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno no servidor." });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
  } catch (err) {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  }
}

start();
