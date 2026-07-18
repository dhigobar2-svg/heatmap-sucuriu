const express = require("express");
const profissionais = require("./controllers/profissionaisController");
const dashboard = require("./controllers/dashboardController");

const router = express.Router();

router.get("/profissionais", profissionais.listar);
router.post("/profissionais", profissionais.criar);
router.put("/profissionais/:id", profissionais.atualizar);
router.delete("/profissionais/:id", profissionais.remover);

router.get("/dashboard", dashboard.resumo);

module.exports = router;
