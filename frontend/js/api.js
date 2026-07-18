// Camada de acesso à API. Todas as chamadas usam CONFIG.API_URL.
const API = {
  async _request(path, options = {}) {
    const res = await fetch(`${CONFIG.API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const body = await res.json();
        if (body.error) msg = body.error;
      } catch (_) {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  listarProfissionais() {
    return this._request("/profissionais");
  },

  criarProfissional(dados) {
    return this._request("/profissionais", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizarProfissional(id, dados) {
    return this._request(`/profissionais/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  removerProfissional(id) {
    return this._request(`/profissionais/${id}`, { method: "DELETE" });
  },

  dashboard() {
    return this._request("/dashboard");
  },
};
