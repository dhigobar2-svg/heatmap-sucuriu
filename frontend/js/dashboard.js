// Dashboard: indicadores, últimos registros e exportações (tudo no frontend).

const Dashboard = {
  async carregar() {
    try {
      const [resumo, lista] = await Promise.all([
        API.dashboard(),
        API.listarProfissionais(),
      ]);
      this.preencherIndicadores(resumo);
      this.preencherUltimos(lista);
    } catch (err) {
      console.error(err);
      showToast("Não foi possível carregar o dashboard.", "danger");
    }
  },

  preencherIndicadores(r) {
    document.getElementById("ind-profissionais").textContent =
      r.totalProfissionais;
    document.getElementById("ind-epc-contrato").textContent = r.totalEpcContrato;
    document.getElementById("ind-contratadas").textContent = r.totalContratadas;
    document.getElementById("ind-subcontratadas").textContent =
      r.totalSubcontratadas;
    document.getElementById("ind-ilhas").textContent = r.totalIlhas;
    document.getElementById("ind-cargos").textContent = r.totalCargos;
  },

  preencherUltimos(lista) {
    const tbody = document.getElementById("dash-tbody");
    const ultimos = lista.slice(0, 10);
    if (ultimos.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center text-muted">Nenhum registro.</td></tr>';
      return;
    }
    tbody.innerHTML = ultimos
      .map(
        (p) => `
      <tr>
        <td>${esc(p.nome)}</td>
        <td>${esc(p.cargo)}</td>
        <td>${esc(p.epc_epcm)}</td>
        <td>${esc(p.contratada)}</td>
        <td>${esc(p.subcontratada)}</td>
        <td>${esc(p.ilha)}</td>
        <td>${esc(p.efetivo)}</td>
        <td>${esc(p.observacao)}</td>
      </tr>`
      )
      .join("");
  },
};

// ---------- Exportações ----------

const COLUNAS_EXPORT = [
  ["projeto", "Projeto"],
  ["data", "Data de lançamento"],
  ["responsavel", "Responsável pelo lançamento"],
  ["epc_epcm", "EPC/EPCM ou Contrato Direto"],
  ["contratada", "Contratada"],
  ["subcontratada", "Subcontratada"],
  ["ilha", "Ilha/Local"],
  ["efetivo", "Efetivo da Ilha/Local"],
  ["nome", "Nome"],
  ["cargo", "Cargo"],
  ["telefone", "Telefone"],
  ["email", "Email"],
  ["observacao", "Obs."],
];

async function comDados(fn) {
  try {
    const dados = await API.listarProfissionais();
    if (!dados.length) return showToast("Nenhum registro para exportar.", "danger");
    fn(dados);
  } catch (err) {
    console.error(err);
    showToast("Falha ao obter dados para exportação.", "danger");
  }
}

function exportarExcel() {
  comDados((dados) => {
    const linhas = dados.map((p) => {
      const obj = {};
      COLUNAS_EXPORT.forEach(([campo, titulo]) => (obj[titulo] = p[campo] ?? ""));
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profissionais");
    XLSX.writeFile(wb, "profissionais.xlsx");
    showToast("Excel exportado.");
  });
}

function exportarPDF() {
  comDados((dados) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("SESMT APP - Profissionais", 14, 12);
    doc.autoTable({
      startY: 18,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [114, 128, 70] },
      head: [COLUNAS_EXPORT.map(([, titulo]) => titulo)],
      body: dados.map((p) => COLUNAS_EXPORT.map(([campo]) => p[campo] ?? "")),
    });
    doc.save("profissionais.pdf");
    showToast("PDF exportado.");
  });
}

function exportarJSON() {
  comDados((dados) => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profissionais.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON exportado.");
  });
}
