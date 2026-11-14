# Mock do TicketFlow

Este servidor imita a API do backend para você testar o sistema na sua máquina, sem banco de dados. O frontend continua fazendo as mesmas chamadas. O que muda é o endereço.

| Ambiente | Como sobe | Para onde aponta |
| --- | --- | --- |
| Local | `npm run dev` | `http://localhost:5050` (este mock) |
| Produção | `npm run build` | `http://localhost:5001` (backend real) |

O endereço fica em `frontend/.env.development` e `frontend/.env.production`. O arquivo que decide isso no código é `frontend/src/services/api.js`.

## Como subir

Abra dois terminais dentro de `ticket_flow/frontend`.

No primeiro:

```bash
npm run mock
```

Você deve ver:

```text
Mock do TicketFlow em http://localhost:5050
```

No segundo:

```bash
npm run dev
```

Abra `http://localhost:5173`. A tela de login mostra as contas de teste enquanto o endereço for o do mock.

O mock precisa estar no ar antes de entrar. Se ele estiver desligado, o painel avisa que não conseguiu carregar os dados.

Para usar outra porta:

```bash
# PowerShell
$env:MOCK_PORT=5060; node ../mock/server.js
```

Se mudar a porta, atualize também `VITE_API_URL` em `frontend/.env.development` e reinicie o `npm run dev`. O Vite só lê o `.env` quando o servidor de desenvolvimento inicia.

## Contas para testar

A senha das três é `123456`.

| Email | Papel | O que dá para ver |
| --- | --- | --- |
| `gerente@ticketflow.com` | Gerente | Painel, perfil, novo chamado e o card **Novo analista** |
| `analista@ticketflow.com` | Analista | Painel, perfil e novo chamado. O card de analista não aparece |
| `usuario@ticketflow.com` | Usuário | Painel, perfil (com telefone e departamento) e novo chamado |

## O que cada menu exercita

1. Entre com uma das contas. O login chama `POST /api/auth/login` e guarda o token no navegador.
2. **Visão geral** lê `GET /api/ticket/tickets` e monta os números, o gráfico e o volume dos últimos 7 dias.
3. **Tickets** desce até os chamados recentes. A busca filtra essa lista.
4. **Analistas** desce até a equipe, vinda de `GET /api/analysts`.
5. **Meu perfil** lê e salva em `GET` e `PUT /api/user`. A foto usa `PATCH /api/user/profile-picture`.
6. **Novo chamado** envia `POST /api/ticket/createTicket`. O chamado entra na lista na hora.
7. **Novo analista** (só gerente) envia `POST /api/auth/register_analyst`. A pessoa passa a conseguir entrar com o email cadastrado.
8. **Esqueci minha senha** chama `POST /api/auth/forgot_password`. Só um email que já existe no mock recebe sucesso.

Cadastro de usuário e cadastro de gerente ainda são telas locais: eles não gravam conta neste mock.

## Como o mock funciona

Ao iniciar, o servidor lê os JSON de `mock/data` e monta uma cópia na memória.

- `data/accounts.json` — as três contas e a senha em texto, só para teste.
- `data/analysts.json` — Lucas, Ana e Juliana, com a produtividade do card da equipe.
- `data/tickets.json` — os dois chamados que aparecem no topo (`TT-1048` e `TT-1047`) e as faixas que geram o restante.

As faixas somam os números do painel em **Últimos 30 dias**: 64 abertos, 98 em progresso, 86 fechados e 18 urgentes. Os chamados mais antigos existem para o filtro de 7 e de 90 dias mudar esses totais.

Tudo o que você criar ou editar (chamado, perfil, analista) fica só na memória. Fechar o `npm run mock` apaga essas alterações e volta para os JSON. Editar um JSON e reiniciar o mock é a forma de mudar a base de teste.

O token começa com `mock.`. Ele só vale neste servidor. O backend real continua exigindo o JWT dele.

## Rotas disponíveis

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Entrar |
| `POST` | `/api/auth/forgot_password` | Pedir o código de senha |
| `POST` | `/api/auth/register_analyst` | Cadastrar analista (gerente) |
| `GET` | `/api/user` | Ler o perfil logado |
| `PUT` | `/api/user` | Atualizar nome e sobrenome. Usuário também atualiza o telefone |
| `PATCH` | `/api/user/profile-picture` | Trocar a foto |
| `GET` | `/api/ticket/tickets` | Listar chamados |
| `GET` | `/api/ticket/:id` | Ler um chamado |
| `POST` | `/api/ticket/createTicket` | Abrir chamado |
| `GET` | `/api/analysts` | Listar a equipe do painel |

`GET /api/analysts` existe neste mock para a tela de desempenho. O backend ainda não tem essa rota. Em produção o painel segue com os chamados e, se a equipe não responder, mostra que nenhum analista foi encontrado.

## Voltar para o backend

No build de produção o frontend usa `frontend/.env.production`:

```env
VITE_API_URL=http://localhost:5001
```

Troque esse valor quando o backend estiver em outro endereço. Gere o build com `npm run build`.

Para apontar o `npm run dev` para o backend em vez do mock, mude `frontend/.env.development` para `http://localhost:5001` e reinicie o Vite. O aviso com as contas de teste some, porque ele só aparece quando o endereço é o do mock.
