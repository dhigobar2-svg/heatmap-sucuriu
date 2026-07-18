// ===================== Utilitários =====================

// Escapa HTML para inserção segura em templates.
function esc(v) {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Remove espaços extras.
function limpar(v) {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telefone: 10 ou 11 dígitos (com ou sem máscara).
function telefoneValido(tel) {
  const digitos = (tel || "").replace(/\D/g, "");
  return digitos.length >= 10 && digitos.length <= 11;
}
function emailValido(email) {
  return EMAIL_RE.test(email || "");
}

let toastInstance = null;
function showToast(msg, tipo = "success") {
  const el = document.getElementById("toast-app");
  el.className = `toast text-bg-${tipo}`;
  document.getElementById("toast-msg").textContent = msg;
  toastInstance = toastInstance || new bootstrap.Toast(el);
  toastInstance.show();
}

// Campos do cabeçalho do cadastro (nome no banco).
const CAMPOS_CABECALHO = [
  "projeto",
  "data",
  "responsavel",
  "epc_epcm",
  "contratada",
  "subcontratada",
  "ilha",
  "efetivo",
];
// Campos por profissional (linha da tabela dinâmica).
const CAMPOS_PROFISSIONAL = ["nome", "cargo", "telefone", "email", "observacao"];

// ===================== Navegação =====================

const MENU = [
  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { id: "cadastro", label: "Cadastro", icon: "bi-pencil-square" },
  { id: "consulta", label: "Consulta", icon: "bi-search" },
];

function montarMenu() {
  const html = MENU.map(
    (m) =>
      `<a class="nav-link" href="#" data-view="${m.id}"><i class="bi ${m.icon}"></i> ${m.label}</a>`
  ).join("");
  document.getElementById("menu-desktop").innerHTML = html;
  document.getElementById("menu-mobile").innerHTML = html;

  document.querySelectorAll("[data-view]").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navegar(link.dataset.view);
      const off = document.getElementById("sidebarOffcanvas");
      bootstrap.Offcanvas.getInstance(off)?.hide();
    })
  );
  document.querySelectorAll("[data-goto]").forEach((btn) =>
    btn.addEventListener("click", () => navegar(btn.dataset.goto))
  );
}

function navegar(view) {
  document
    .querySelectorAll(".view")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document
    .querySelectorAll("[data-view]")
    .forEach((l) => l.classList.toggle("active", l.dataset.view === view));

  if (view === "dashboard") Dashboard.carregar();
  if (view === "consulta") Consulta.carregar();
  if (view === "cadastro" && !document.querySelector("#linhas-cadastro tr"))
    Cadastro.adicionarLinha();
}

// ===================== Cadastro =====================

const Cadastro = {
  adicionarLinha() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="form-control form-control-sm" data-c="nome" placeholder="Nome completo"></td>
      <td><input class="form-control form-control-sm" data-c="cargo" placeholder="Cargo"></td>
      <td><input class="form-control form-control-sm" data-c="telefone" placeholder="(00) 00000-0000"></td>
      <td><input class="form-control form-control-sm" data-c="email" placeholder="email@exemplo.com"></td>
      <td><input class="form-control form-control-sm" data-c="observacao" placeholder="Obs."></td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-outline-danger btn-remover-linha"><i class="bi bi-trash"></i></button>
      </td>`;
    tr.querySelector(".btn-remover-linha").addEventListener("click", () =>
      tr.remove()
    );
    document.getElementById("linhas-cadastro").appendChild(tr);
  },

  coletarCabecalho() {
    const form = document.getElementById("form-cadastro");
    const dados = {};
    CAMPOS_CABECALHO.forEach((c) => (dados[c] = limpar(form.elements[c].value)));
    return dados;
  },

  coletarLinhas() {
    return [...document.querySelectorAll("#linhas-cadastro tr")].map((tr) => {
      const obj = {};
      tr.querySelectorAll("[data-c]").forEach(
        (i) => (obj[i.dataset.c] = limpar(i.value))
      );
      return obj;
    });
  },

  validar(cab, linhas) {
    if (!cab.projeto) return "Informe o Projeto.";
    if (!cab.epc_epcm) return "Informe o EPC/EPCM ou Contrato Direto.";
    if (!cab.ilha) return "Informe a Ilha/Local.";
    if (linhas.length === 0) return "Adicione ao menos um profissional.";
    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i];
      const n = i + 1;
      if (!l.nome) return `Linha ${n}: informe o Nome.`;
      if (!l.cargo) return `Linha ${n}: informe o Cargo.`;
      if (!l.telefone) return `Linha ${n}: informe o Telefone.`;
      if (!telefoneValido(l.telefone)) return `Linha ${n}: telefone inválido.`;
      if (!l.email) return `Linha ${n}: informe o Email.`;
      if (!emailValido(l.email)) return `Linha ${n}: email inválido.`;
    }
    return null;
  },

  async salvar(e) {
    e.preventDefault();
    const cab = Cadastro.coletarCabecalho();
    const linhas = Cadastro.coletarLinhas();
    const erro = Cadastro.validar(cab, linhas);
    if (erro) return showToast(erro, "danger");

    try {
      await Promise.all(
        linhas.map((l) => API.criarProfissional({ ...cab, ...l }))
      );
      showToast(`${linhas.length} profissional(is) salvo(s) com sucesso.`);
      document.getElementById("form-cadastro").reset();
      document.getElementById("linhas-cadastro").innerHTML = "";
      Cadastro.adicionarLinha();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Erro ao salvar.", "danger");
    }
  },
};

// ===================== Consulta =====================

const Consulta = {
  tabela: null,

  async carregar() {
    try {
      const dados = await API.listarProfissionais();
      const linhas = dados.map((p) => [
        esc(p.nome),
        esc(p.cargo),
        esc(p.epc_epcm),
        esc(p.contratada),
        esc(p.subcontratada),
        esc(p.ilha),
        esc(p.efetivo),
        esc(p.telefone),
        esc(p.email),
        esc(p.observacao),
        `<button class="btn btn-sm btn-outline-sesmt btn-editar" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
         <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${p.id}"><i class="bi bi-trash"></i></button>`,
      ]);

      if (this.tabela) {
        this.tabela.clear().rows.add(linhas).draw();
      } else {
        this.tabela = new DataTable("#tabela-consulta", {
          data: linhas,
          language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/pt-BR.json",
          },
          columnDefs: [{ orderable: false, targets: 10 }],
        });
        // Busca instantânea via input externo.
        document
          .getElementById("busca-consulta")
          .addEventListener("input", (e) =>
            this.tabela.search(e.target.value).draw()
          );
      }
      // Guarda os dados para edição.
      this.cache = Object.fromEntries(dados.map((p) => [p.id, p]));
    } catch (err) {
      console.error(err);
      showToast("Falha ao carregar registros.", "danger");
    }
  },
};

// ===================== Edição / Exclusão =====================

const CAMPOS_EDICAO = [
  ["projeto", "Projeto"],
  ["data", "Data de lançamento", "date"],
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

let idParaExcluir = null;

function abrirEdicao(id) {
  const p = Consulta.cache[id];
  if (!p) return;
  const form = document.getElementById("form-editar");
  form.elements.id.value = id;
  document.getElementById("campos-edicao").innerHTML = CAMPOS_EDICAO.map(
    ([campo, label, tipo]) => {
      let valor = p[campo] ?? "";
      if (tipo === "date" && valor) valor = String(valor).slice(0, 10);
      return `
      <div class="col-md-4">
        <label class="form-label">${label}</label>
        <input class="form-control" name="${campo}" type="${tipo || "text"}"
               value="${esc(valor)}" placeholder="${label}">
      </div>`;
    }
  ).join("");
  bootstrap.Modal.getOrCreateInstance("#modal-editar").show();
}

async function salvarEdicao(e) {
  e.preventDefault();
  const form = document.getElementById("form-editar");
  const id = form.elements.id.value;
  const dados = {};
  CAMPOS_EDICAO.forEach(([c]) => (dados[c] = limpar(form.elements[c].value)));

  if (!dados.projeto) return showToast("Informe o Projeto.", "danger");
  if (dados.telefone && !telefoneValido(dados.telefone))
    return showToast("Telefone inválido.", "danger");
  if (dados.email && !emailValido(dados.email))
    return showToast("Email inválido.", "danger");

  try {
    await API.atualizarProfissional(id, dados);
    bootstrap.Modal.getInstance("#modal-editar").hide();
    showToast("Registro atualizado.");
    Consulta.carregar();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Erro ao atualizar.", "danger");
  }
}

function pedirExclusao(id) {
  idParaExcluir = id;
  bootstrap.Modal.getOrCreateInstance("#modal-excluir").show();
}

async function confirmarExclusao() {
  if (!idParaExcluir) return;
  try {
    await API.removerProfissional(idParaExcluir);
    bootstrap.Modal.getInstance("#modal-excluir").hide();
    showToast("Registro excluído.");
    Consulta.carregar();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Erro ao excluir.", "danger");
  } finally {
    idParaExcluir = null;
  }
}

// ===================== Inicialização =====================

document.addEventListener("DOMContentLoaded", () => {
  montarMenu();

  document
    .getElementById("btn-add-linha")
    .addEventListener("click", () => Cadastro.adicionarLinha());
  document
    .getElementById("form-cadastro")
    .addEventListener("submit", Cadastro.salvar);
  document
    .getElementById("form-editar")
    .addEventListener("submit", salvarEdicao);
  document
    .getElementById("btn-confirmar-exclusao")
    .addEventListener("click", confirmarExclusao);

  document
    .getElementById("btn-export-excel")
    .addEventListener("click", exportarExcel);
  document
    .getElementById("btn-export-pdf")
    .addEventListener("click", exportarPDF);
  document
    .getElementById("btn-export-json")
    .addEventListener("click", exportarJSON);

  // Delegação para editar/excluir na tabela de consulta.
  document.getElementById("tabela-consulta").addEventListener("click", (e) => {
    const editar = e.target.closest(".btn-editar");
    const excluir = e.target.closest(".btn-excluir");
    if (editar) abrirEdicao(editar.dataset.id);
    if (excluir) pedirExclusao(excluir.dataset.id);
  });

  navegar("dashboard");
});
