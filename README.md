# TicketFlow

Sistema de Tickets voltado a **HelpDesk** que roda em tempo real. Permite gerenciar todo o ciclo de vida do ticket e visualizar registros e informações dos tickets de forma individual e geral.

> Projeto em desenvolvimento · SP - 2026

## Sumário

- [Público-alvo](#público-alvo)
- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Fluxos principais](#fluxos-principais)
- [Telas por perfil](#telas-por-perfil)
- [Stack](#stack)
- [Como instalar e rodar](#como-instalar-e-rodar)
- [Modelo de dados](#modelo-de-dados)
- [Plano de lançamento](#plano-de-lançamento)
- [Time](#time)
- [Gestão e hospedagem](#gestão-e-hospedagem)

## Público-alvo

| Perfil | Descrição |
|---|---|
| **Usuário** | Abre tickets para obter suporte e conversa com o analista pelo chat do ticket. |
| **Analista** | Responsável pelos tickets: recebe, gerencia status, criticidade, comentários e registros. |
| **Gerente** | Tem todos os acessos de um analista, além de métricas do time, transferência de tickets, gestão de contas de analistas e logs. |

## Funcionalidades

Priorização por MoSCoW.

| Funcionalidade | Perfil | Prioridade |
|---|---|---|
| Gerenciamento de criticidade do ticket | Analista | Must Have |
| Comentários em tickets | Analista | Must Have |
| Lista de tickets com filtros | Analista | Must Have |
| Análise de métricas dos analistas | Gerente | Must Have |
| Chat do ticket | Usuário / Analista | Must Have |
| Gerenciamento de status do ticket | Analista | Must Have |
| Transferência de ticket por gerente | Gerente | Should Have |
| Opções pré-estabelecidas na criação de tickets | Usuário | Should Have |
| Visualização dos tickets de outros analistas | Analista | Should Have |
| Análise de problemas dos tickets | Gerente | Should Have |
| Criação de conta para analistas | Gerente | Should Have |
| Anexo de imagens e vídeos (ticket e chat) | Usuário / Analista | Could Have |
| Logs do ticket | Gerente | Could Have |

## Regras de negócio

### Criticidade
- Apenas o analista designado ao ticket pode alterar a criticidade.
- Níveis: **Urgente**, **Médio**, **Baixo**. Por padrão, o ticket chega como **Médio**.
- Toda mudança de nível exige uma breve descrição do motivo.

### Status
- Apenas o analista designado gerencia o status: **Aberto → Em progresso → Fechado**.
- Uma descrição do motivo é exigida **somente** ao fechar o ticket.

### Comentários
- O analista designado pode fazer até **5 comentários por ticket**, sem limite de caracteres.
- Comentários só podem ser criados e apagados (não são editáveis).

### Chat do ticket
- Analista designado e usuário criador são adicionados ao chat quando o analista inicia o status **Em progresso**.
- O autor da mensagem pode apagá-la, desde que tenham passado **menos de 5 minutos**.
- Não é permitido enviar mensagens após o fechamento do ticket.
- Usuário e analista designado podem anexar imagens no chat.

### Transferência de ticket
- O gerente pode trocar o analista designado.
- O novo analista entra no chat automaticamente e tem acesso a todo o histórico de mensagens.

### Times
- Gerentes são responsáveis por times de analistas.
- Cada gerente e cada analista pertencem a **apenas um time**.
- Um time existe quando o gerente é responsável por 1 ou mais analistas.

### Contas
- O gerente cria contas de analistas com **e-mail e senha**.
- A senha deve ter **exatamente 6 dígitos, apenas números**.

### Dashboard do gerente
- Exibe: status dos tickets, criticidade, pessoas designadas, quantidade de tickets por pessoa e total, e tipo de problema.

### Logs do ticket
- O gerente visualiza os logs ao acessar um ticket: abertura do ticket, primeira mensagem do analista no chat, níveis de criticidade e transferências de analista.

### Criação de ticket

| Campo | Tipo / Opções |
|---|---|
| **Título do Ticket** | Texto corrido |
| **Nome do usuário** | Coletado automaticamente via SSO |
| **Descrição** | Texto corrido e envio de imagem |
| **Tipo de Problema** | DropDown: Problemas com periférico (Teclado, Mouse, Monitor, Headphone), Computador não liga, Computador não sai som, Internet com Problema |
| **Marca do computador** | DropDown: Dell, HP, Positivo, Asus, Lenovo |
| **Possui monitor?** | DropDown: Sim, Não |

### Filtros e buscas

| Perfil | Filtros |
|---|---|
| **Usuário** (3) | Busca (nome, título, ID, descrição); mais novo/mais velho; status |
| **Analista** (6) | Busca (nome, título, ID, descrição); mais novo/mais velho; calendário; status; tipo de problema; por analista |
| **Gerente** (6) | Os mesmos do analista |

Na aba **Geral**, o padrão é listar os tickets de todos os analistas em ordem crescente. 

## Fluxos principais

**Cadastro**
- **Usuário:** URL padrão → preenche o *Register* → verifica o e-mail por código → confirma → pop-up e redirecionamento ao Login.
- **Analista:** recebe e-mail e senha do gerente.
- **Gerente:** acessa o link enviado pelo administrador → confirma identidade via CPF → cria e-mail e senha → verifica o e-mail por código.

**Login:** URL padrão para todos os perfis → e-mail e senha.

**Recuperação/troca de senha:** botão de recuperação → e-mail → envio de código → código → nova senha → pop-up e redirecionamento ao Login.

**Criação de ticket (usuário):** Home → *Criar Ticket* → preenche os campos → pop-up de confirmação → redireciona para detalhes do ticket + chat.

**Transferência de ticket (gerente):** Home → seleciona o ticket → botão de transferência → escolhe o analista no dropdown → *Transferir* → pop-up de confirmação e atualização do analista.

## Telas por perfil

- **Usuário:** Login, Register, Home (filtros), Criação do ticket, Detalhes do ticket + Chat, Profile, Recuperação de senha.
- **Analista:** Login, Home (filtros), Detalhes do ticket + Chat, Profile, Recuperação de senha.
- **Gerente:** Login, Register, Home, Dashboard, Profile, Criar analista, Detalhes do ticket + Chat, Recuperação de senha.

### Campos de cadastro e perfil

| Tela | Perfil | Campos |
|---|---|---|
| Register | Usuário | Departamento (Comercial, Marketing, Facilities, Engenharia, Financeiro, Fiscal, Legal), CPF, Nome, Sobrenome, E-mail, Número, Senha |
| Register | Gerente | E-mail, Nome, Sobrenome, Senha, Nome do time |
| Criar analista | Gerente | E-mail, Senha, Nome, Sobrenome |
| Profile | Usuário | Foto, departamento, nome, total de tickets abertos, e-mail, role, logout |
| Profile | Analista | Foto, time, nome, total de tickets, e-mail, role, logout |
| Profile | Gerente | Foto, time, nome, número de analistas, e-mail, role, logout |
| Home | Usuário | Lista de tickets (título e data), filtros, criar ticket, profile |
| Home | Analista | Lista de tickets (título e data), filtros, profile |

## Stack

| Item | Tecnologia |
|---|---|
| Linguagem | JavaScript |
| Ambiente de execução | Node.js + Express.js |
| Banco de dados | MongoDB |
| Bibliotecas, frameworks e ferramentas de teste | Uso livre |

## Como instalar e rodar

Para **ver as telas**, basta o frontend. Para **entrar, cadastrar ou criar chamado**, o frontend e o backend precisam estar rodando, com o MongoDB ativo.

### O que você precisa

| Ferramenta | Versão | Para quê |
|---|---|---|
| [Node.js](https://nodejs.org/) | 22.22 ou mais recente | O `react-router` 8 declara essa versão mínima. |
| npm | vem com o Node | Instala dependências e roda os scripts. |
| [MongoDB Community](https://www.mongodb.com/try/download/community) | 7 ou mais recente | Banco usado pela API. Porta local padrão: `27017`. |

Confira no PowerShell:

```powershell
node -v
npm -v
```

Se o Node for anterior à 22.22, o `npm install` do frontend avisa `EBADENGINE`. O Vite ainda sobe. Para ficar alinhado com a dependência, use Node 22 ou mais novo e rode o `npm install` de novo.

Os comandos abaixo partem da pasta do repositório (`projeto-ticket-flow`). Use **dois terminais**: um para o frontend e outro para o backend.

### Estrutura

```text
ticket_flow/
├── frontend/          React 19 + Vite. Interface em http://localhost:5173
├── backend/           API Express + Mongoose. Porta 5001
│   ├── src/server.js
│   └── .env           Variáveis locais. Não vai para o Git.
├── qa-automation/     Testes Cypress. Não é necessário para subir o sistema.
└── README.md
```

### 1. Instalar as dependências

Cada pasta tem o próprio `package.json`. `node_modules` não entra no Git.

**Frontend**

```powershell
cd ticket_flow\frontend
npm install
```

**Backend**

```powershell
cd ticket_flow\backend
npm install
```

### 2. Subir o MongoDB

A API só escuta a porta depois de conectar no banco. Sem o MongoDB, o backend imprime `ECONNREFUSED 127.0.0.1:27017` e encerra.

No Windows, depois de instalar o MongoDB Community, o serviço costuma se chamar `MongoDB`. Confira se a porta 27017 está aberta:

```powershell
Get-Service MongoDB
```

Se o serviço estiver parado:

```powershell
Start-Service MongoDB
```

Quem usar um banco na nuvem (MongoDB Atlas) pode pular o serviço local e colocar a connection string em `MONGO_URI`, no passo seguinte.

### 3. Criar o arquivo de ambiente do backend

O script de desenvolvimento lê `ticket_flow\backend\.env`. Esse arquivo está no `.gitignore`. Se ele não existir, crie com o conteúdo abaixo.

Gere as três chaves no terminal (cada comando imprime um valor):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use o primeiro valor em `DATA_ENCRYPTION_KEY`, o segundo em `DATA_HASH_SECRET` e o terceiro em `TOKEN`.

`ticket_flow\backend\.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/ticketflow
CORS_ORIGIN_URL=http://localhost:5173
TOKEN=cole_aqui_o_terceiro_valor
DATA_ENCRYPTION_KEY=cole_aqui_o_primeiro_valor
DATA_HASH_SECRET=cole_aqui_o_segundo_valor
```

| Variável | Regra |
|---|---|
| `PORT` | Porta da API. O frontend chama `http://localhost:5001`. |
| `MONGO_URI` | Endereço do MongoDB. O banco `ticketflow` é criado no primeiro cadastro. |
| `CORS_ORIGIN_URL` | Tem de ser exatamente o endereço do Vite, incluindo a porta. |
| `TOKEN` | Segredo do JWT. Qualquer texto longo serve em desenvolvimento. |
| `DATA_ENCRYPTION_KEY` | Base64 de **32 bytes**. Outro tamanho faz o servidor recusar a subir. |
| `DATA_HASH_SECRET` | Texto com pelo menos 32 caracteres. |

Se o Vite avisar `Port 5173 is in use` e abrir em `5174` (ou outra), troque `CORS_ORIGIN_URL` para essa URL e reinicie o backend.

### 4. Rodar o frontend

No primeiro terminal:

```powershell
cd ticket_flow\frontend
npm run dev
```

Abra [http://localhost:5173/](http://localhost:5173/). Deixe o terminal aberto. Para encerrar, use `Ctrl+C`.

| Endereço | Tela |
|---|---|
| [http://localhost:5173/](http://localhost:5173/) | Home, com os atalhos do sistema. |
| [http://localhost:5173/login](http://localhost:5173/login) | Login. |
| [http://localhost:5173/register](http://localhost:5173/register) | Cadastro de usuário. |
| [http://localhost:5173/register_manager](http://localhost:5173/register_manager) | Cadastro de gerente. |
| [http://localhost:5173/forgotpsw](http://localhost:5173/forgotpsw) | Recuperação de senha. |
| [http://localhost:5173/create_ticket](http://localhost:5173/create_ticket) | Criar chamado. Exige login. |
| [http://localhost:5173/profile](http://localhost:5173/profile) | Perfil. Exige login. |
| [http://localhost:5173/register_analyst](http://localhost:5173/register_analyst) | Cadastro de analista. Só entra quem estiver logado como gerente. |

Outros scripts, na pasta `frontend`:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento, com recarregamento automático. |
| `npm run build` | Gera a pasta `dist` para publicação. |
| `npm run preview` | Serve o build de `dist`. Rode o `build` antes. |
| `npm run lint` | Roda o ESLint. |

### 5. Rodar o backend

No segundo terminal, com o MongoDB já ativo e o `.env` criado:

```powershell
cd ticket_flow\backend
npm run dev
```

Quando a conexão der certo, o terminal mostra `DB CONNECTED SUCCESSFULY` e `Server initiated on PORT: 5001`.

A API fica em `http://localhost:5001`. As rotas usadas pelas telas:

| Método e caminho | Uso |
|---|---|
| `POST /api/auth/register` | Cadastro de usuário. |
| `POST /api/auth/register_manager` | Cadastro de gerente. |
| `POST /api/auth/register_analyst` | Cadastro de analista. Exige token de gerente. |
| `POST /api/auth/login` | Login. Devolve o token. |
| `POST /api/auth/logout` | Logout. |
| `POST /api/ticket/createTicket` | Cria chamado. Exige token. |
| `GET /api/user` | Dados do usuário logado. |

O script `npm test` do backend só avisa que não há testes e termina com erro. Isso é o placeholder do npm.

### O que sobe com cada processo

| O que você quer fazer | Frontend | Backend | MongoDB |
|---|---|---|---|
| Ver a home, o login e os formulários | sim | não | não |
| Cadastrar, entrar, ver perfil ou criar chamado | sim | sim | sim |

O frontend chama a API em `http://localhost:5001`. Com a API parada, a tela abre e o envio do formulário falha.

### Problemas comuns

**A home não abre e o terminal do Vite cita `axios`.**  
As dependências da branch atual não foram instaladas. Rode `npm install` de novo dentro de `ticket_flow\frontend`.

**O backend cai com `ECONNREFUSED 127.0.0.1:27017`.**  
O MongoDB não está rodando, ou o `MONGO_URI` aponta para outro endereço.

**O backend cai com `DATA_ENCRYPTION_KEY deve conter uma chave Base64 de 32 bytes`.**  
Gere a chave de novo com o primeiro comando `node -e` da seção 3 e cole o valor inteiro no `.env`, sem aspas e sem espaço.

**Login ou cadastro falha no navegador com erro de CORS.**  
`CORS_ORIGIN_URL` está diferente do endereço que aparece no terminal do Vite. Os dois têm de ser iguais, por exemplo `http://localhost:5173`.

**O Vite não usa a porta 5173.**  
Outro processo já ocupou a porta. Use a URL que o Vite imprimir (`Local:`) e atualize `CORS_ORIGIN_URL`.

## Modelo de dados

Entidades principais e seus campos:

| Entidade | Campos |
|---|---|
| **User** | User ID (PK), Foto de perfil, Email, CPF, Senha, Nome, Sobrenome, Departamento, Telefone, Ticket ID (FK) |
| **Gerente** | Gerente ID (PK), CPF, Foto de perfil, Email, Senha, Filtro salvo, Nome, Sobrenome, Time ID (FK) |
| **Time** | Time ID (PK), Nome, Gerente ID (FK), Analista ID (FK) |
| **Analista** | Analista ID (PK), Foto de perfil, Email, Senha, Filtro salvo, Nome, Sobrenome, Time ID (FK), Ticket ID (FK) |
| **Ticket** | Ticket ID (PK), Chat criado, Título, Tipo do problema, Anexo, Descrição, Marca do computador, Possui monitor, Nível de criticidade, Status, Created At, Comentários, Log ID (FK), Analista ID (FK), Chat ID (FK), User ID (FK) |
| **Chat** | Chat ID (PK), Created At, Membros, Ticket ID (FK), Mensagem ID (FK) |
| **Mensagens** | Mensagem ID (PK), Conteúdo, Created At, Remetente, Chat ID (FK) |
| **Logs** | Log ID (PK), Ação, Created At, Responsável pela ação, Ticket ID (FK) |

## Plano de lançamento

Pontos de história estimados em horas (mais horas adicionais de front-end, em média).

### Lançamento 1 · ETA 31/10/2026
Total: 16 pontos (+ ~6 h de front)

| Sprint | Story | Pontos | Responsável |
|---|---|---|---|
| 1 · Criar uma conta | Criar conta de usuário | 1 | Matheus |
| 1 | Criar conta de analista | 1 | Matheus |
| 1 | Criar conta de gerente | 1 | Patrick |
| 2 · Criar e visualizar tickets | User creates ticket | 2 | Matheus |
| 2 | Ticket list display | 1 | Patrick |
| 2 | Filtro inicial dos tickets | 2 | Patrick |
| 3 · Filtro de tickets | Filtro avançado de tickets | 8 | Matheus + Patrick |

### Lançamento 2 · ETA 30/11/2026
Total: 24 pontos (+ ~3 h de front)

| Sprint | Story | Pontos | Responsável |
|---|---|---|---|
| 4 · Features do gerente | Gerente transfer ticket | 2 | Patrick |
| 4 | CRUD das contas de analista pelo gerente | 4 | Patrick |
| 4 | Dashboard de tickets/analistas do gerente | 8 | Matheus |
| 5 · Gerenciamento dos tickets | Gerenciamento de criticidade | 1 | Patrick |
| 5 | Gerenciamento de status | 1 | Patrick |
| 5 | Gerenciamento de responsável | 4 | Matheus |
| 5 | Comentários do ticket | 4 | Patrick |

### Lançamento 3 · ETA a confirmar
Total: 28 pontos (+ ~1 h de front)

<!-- TODO: o planejamento original indica 31/11/2026 (data inexistente) e total de 28, mas a soma das stories é 24. Confirmar com o time. -->

| Sprint | Story | Pontos | Responsável |
|---|---|---|---|
| 6 · Ticket special features | Usuário cria ticket com imagem | 4 | Patrick |
| 6 | Gerente/analista ticket log | 4 | Matheus |
| 6 | Chat real-time | 16 | Matheus |

## Time

| Nome | Função |
|---|---|
| Matheus | Full stack |
| Patrick | Full stack |
| Lucas Migalis | Front-end |
| Diego Mota | QA / QC |

## Gestão e hospedagem

- **Kanban:** Trello — [link do board](#)
- **Wireframe:** [link do Figma](#)
- **Hospedagem:** própria (responsabilidade do time)
- **URL do sistema:** em desenvolvimento
