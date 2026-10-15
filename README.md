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

### Filtros e buscas

| Perfil | Filtros |
|---|---|
| **Usuário** (3) | Busca (nome, título, ID, descrição); mais novo/mais velho; status |
| **Analista** (6) | Busca (nome, título, ID, descrição); mais novo/mais velho; calendário; status; tipo de problema; por analista |
| **Gerente** (6) | Os mesmos do analista |

Na aba **Geral**, o padrão é listar os tickets de todos os analistas em ordem crescente. Todas as abas possuem busca pelo nome do ticket.

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

## Modelo de dados

Entidades principais e seus campos:

| Entidade | Campos |
|---|---|
| **User** | ID, Nome, Login, Senha, Ticket ID (FK) |
| **Analista** | ID, Nome, Filtros, Login, Senha, Ticket ID (FK), Gerente ID (FK), Time ID (FK) |
| **Gerente** | ID, Nome, Filtros, Login, Senha, Time ID (FK) |
| **Time** | ID, Nome, Gerente ID (FK), Analista ID (FK) |
| **Ticket** | ID, Nível (criticidade), Título, Descrição, Chat, Comentários, Problema, Imagem, Marca do dispositivo, Logs, Monitor, Created At, Analista ID (FK), User ID (FK) |

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
