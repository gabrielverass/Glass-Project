# 🪟 Glass Project | Sistema de Gestão, Estoque e Logística Vidreira

> Aplicação web sob medida desenvolvida para resolver gargalos operacionais no setor de vidros e esquadrias, integrando cálculo de orçamentos, controle de insumos e rastreabilidade de pedidos com controle de acesso por perfil.

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Security](https://img.shields.io/badge/RBAC-Access%20Control-orange)

---

## 🎯 Contexto e Desafio de Negócio

Empresas no segmento de vidros e esquadrias lidam com processos operacionais altamente suscetíveis a perdas e gargalos: precificação dependente de cálculos manuais de metros quadrados (m²), descompasso entre entradas e saídas de estoque e falta de visibilidade sobre o estágio real de produção de cada pedido.

O **Glass Project** foi projetado para atuar como uma central operacional unificada, garantindo que cada colaborador acesse apenas as ferramentas necessárias à sua rotina através de permissões granulares de acesso.

---

## ✨ Módulos e Funcionalidades

### 🔐 Autenticação e Controle de Acesso (RBAC)
- Sistema de login com validação no banco de dados e sanitização de consultas.
- Perfis de acesso setorizados para proteger dados sensíveis e segmentar a visão operacional.
- Gestão de sessão temporária via `sessionStorage` para encerramento seguro ao fechar a aba.

### 📊 Dashboard Operacional
- Visão unificada com métricas de pedidos, status em tempo real e indicadores-chave para tomada de decisão rápida.

### 📦 Gestão de Estoque
- Controle de entrada, movimentação e baixa de chapas de vidro e ferragens.
- Monitoramento de níveis críticos para evitar interrupção de produção por falta de insumos.

### 📐 Cotador Técnico
- Cálculo automatizado de medidas e precificação de peças com base em dimensões, acabamentos e componentes associados.
- Padronização de orçamentos, reduzindo a margem de erro em propostas comerciais.

### 📋 Acompanhamento de Pedidos
- Rastreamento completo do ciclo de produção: do orçamento inicial até a expedição e entrega ao cliente.

---

## 🛠️️ Tecnologias Utilizadas

- **Front-end:** [React](https://react.dev/) com empacotamento via [Vite](https://vitejs.dev/).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) para design responsivo e consistente.
- **Ícones & UI:** [Lucide React](https://lucide.dev/).
- **Back-end & Persistência:** [Supabase](https://supabase.com/) com PostgreSQL.
- **Segurança:** Isolamento de credenciais via `.env` e controle de acesso no cliente.

---

## 📁 Estrutura do Projeto

```text
Glass-Project/
├── public/                 # Favicons, ícones SVG e arquivos estáticos
├── src/
│   ├── assets/             # Imagens e mídias visuais
│   ├── lib/
│   │   └── supabaseClient.js # Configuração do cliente Supabase
│   ├── pages/              # Telas e módulos da aplicação
│   │   ├── Login.jsx       # Autenticação e controle de acesso
│   │   ├── Dashboard.jsx   # Indicadores e métricas operacionais
│   │   ├── Estoque.jsx     # Controle de inventário de vidros e ferragens
│   │   ├── Cotador.jsx     # Orçamentos e cálculos técnicos
│   │   └── Pedidos.jsx     # Gestão do ciclo de vida dos pedidos
│   ├── App.jsx             # Roteamento e orquestração dos módulos
│   └── main.jsx            # Ponto de entrada da aplicação React
├── .env.example            # Modelo de variáveis de ambiente obrigatórias
├── .gitignore              # Proteção contra versionamento de credenciais locais
├── package.json            # Dependências e scripts de execução
├── tailwind.config.js      # Customização de temas e componentes Tailwind
├── vite.config.js          # Configuração de build e plugins do Vite
└── README.md               # Documentação técnica do projeto
```

---

## ⚙️ Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `yarn`

### 1. Clonar o repositório
```bash
git clone https://github.com/gabrielverass/Glass-Project.git
cd Glass-Project
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Crie o arquivo `.env` na raiz do projeto com base no modelo de exemplo:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e insira suas credenciais do projeto no Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Executar em modo de desenvolvimento
```bash
npm run dev
```

Abra a URL indicada no terminal (geralmente `http://localhost:5173`) no seu navegador.

---

## 🔒 Segurança e Tratamento de Dados

- **Segredos e Credenciais:** Nenhuma chave privada ou credencial de acesso está versionada neste repositório. O arquivo `.env` é mantido exclusivamente no ambiente local.
- **Isolamento de Dados:** Dados comerciais e registros reais da empresa não constam na base versionada no GitHub, assegurando sigilo e conformidade operacional.

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel Veras**.

- **GitHub:** [@gabrielverass](https://github.com/gabrielverass)
