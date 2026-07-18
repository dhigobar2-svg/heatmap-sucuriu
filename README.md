# SESMT APP

Sistema web (MVP) para cadastro, consulta e acompanhamento de profissionais
em campo, com dashboard de indicadores e exportação de dados.

## Tecnologias

- **Frontend:** HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, JavaScript Vanilla
- **Backend:** Node.js, Express
- **Banco:** PostgreSQL (biblioteca `pg`)
- **Exportações (no frontend):** SheetJS (xlsx), jsPDF + jspdf-autotable
- **Tabelas:** DataTables

## Estrutura

```
sesmt-app/
├── README.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── config.js        # URL da API (única fonte)
│       ├── api.js           # camada de acesso à API
│       ├── app.js           # navegação, cadastro, consulta, edição/exclusão
│       └── dashboard.js     # indicadores e exportações
└── backend/
    ├── server.js            # inicialização do Express
    ├── database.js          # conexão via DATABASE_URL
    ├── routes.js            # rotas da API
    ├── schema.sql           # tabela profissionais
    ├── package.json
    └── controllers/
        ├── profissionaisController.js
        └── dashboardController.js
```

## API REST

Base: `/api`

| Método | Rota                     | Descrição                         |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/api/profissionais`     | Lista todos os profissionais      |
| POST   | `/api/profissionais`     | Cria um profissional              |
| PUT    | `/api/profissionais/:id` | Atualiza um profissional          |
| DELETE | `/api/profissionais/:id` | Remove um profissional            |
| GET    | `/api/dashboard`         | Retorna os indicadores do resumo  |

O `/api/dashboard` retorna: total de profissionais, EPC/EPCM, contratos
diretos, subcontratadas, ilhas e cargos.

## Executando localmente

### Backend

```
cd backend
npm install
npm start
```

Crie um arquivo `.env` na pasta `backend/` (baseado em `.env.example`):

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/sesmt
PORT=3000
NODE_ENV=development
```

O `schema.sql` é executado automaticamente no start, criando a tabela
`profissionais` caso ela não exista.

### Frontend

Em `frontend/js/config.js`, aponte `API_URL` para o backend. Para uso local,
descomente a linha:

```js
CONFIG.API_URL = "http://localhost:3000/api";
```

Sirva a pasta `frontend/` com qualquer servidor estático, por exemplo:

```
cd frontend
npx serve .
```

## Deploy

- **Código → GitHub:** todo o versionamento do projeto.
- **Backend → Railway:** hospede a pasta `backend/`. Configure as variáveis
  `DATABASE_URL`, `PORT` e `NODE_ENV=production`. O comando de start é
  `npm start`.
- **Banco → PostgreSQL Railway:** provisione um PostgreSQL na Railway e use a
  `DATABASE_URL` fornecida por ela. Toda conexão usa apenas essa variável.
- **Frontend → Netlify:** publique a pasta `frontend/`. Antes do deploy, ajuste
  `frontend/js/config.js` com a URL pública do backend na Railway:

```js
const CONFIG = {
  API_URL: "https://SEU_BACKEND.up.railway.app/api",
};
```

### Variáveis de ambiente (backend)

```
DATABASE_URL=
PORT=3000
NODE_ENV=production
```

## Funcionalidades

- Cadastrar vários profissionais de uma vez (tabela dinâmica).
- Editar e excluir registros (com confirmação via modal).
- Consultar com pesquisa instantânea, ordenação e paginação.
- Dashboard com indicadores e últimos registros.
- Exportar para Excel, PDF e JSON diretamente no navegador.
