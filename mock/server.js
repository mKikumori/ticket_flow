import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.MOCK_PORT || 5050);
const DAY = 24 * 60 * 60 * 1000;

const seedAccounts = JSON.parse(readFileSync(join(root, "data", "accounts.json"), "utf8"));
const seedAnalysts = JSON.parse(readFileSync(join(root, "data", "analysts.json"), "utf8"));
const ticketRecipe = JSON.parse(readFileSync(join(root, "data", "tickets.json"), "utf8"));

const REQUESTERS = [
  "Marina Alves",
  "Rafael Lima",
  "Ana Beatriz",
  "Lucas Mendes",
  "Juliana Costa",
  "Paulo Henrique",
];

const WEEK_WEIGHTS = [30, 54, 62, 72, 46, 78, 100];

const state = {
  accounts: structuredClone(seedAccounts),
  analysts: structuredClone(seedAnalysts),
  tickets: buildTickets(ticketRecipe),
};

function buildTickets(recipe) {
  const now = new Date();
  const featured = recipe.featured.map((ticket) => stamp(ticket, now));
  const generated = [];
  let sequence = 2000;

  recipe.bands.forEach((band, bandIndex) => {
    const slots = [];
    const urgentOpen = Math.min(band.urgent, band.open);
    const urgentProgress = Math.min(band.urgent - urgentOpen, band.progress);

    pushSlots(slots, urgentOpen, "Open", "High");
    pushSlots(slots, band.open - urgentOpen, "Open", "Low");
    pushSlots(slots, urgentProgress, "In Progress", "High");
    pushSlots(slots, band.progress - urgentProgress, "In Progress", "Low");
    pushSlots(slots, band.closed, "Closed", "Low");

    slots.forEach((slot, index) => {
      const daysAgo = bandIndex === 0
        ? weightedDay(index, slots.length)
        : spreadDay(band.from, band.to, index, slots.length);

      generated.push(
        stamp(
          {
            id: `TT-${sequence}`,
            title: `Chamado de suporte ${sequence}`,
            description: "Solicitação gerada para o ambiente local de testes.",
            problem_type: "Problema 1",
            status: slot.status,
            criticality: slot.criticality,
            requester: REQUESTERS[index % REQUESTERS.length],
            user_id: "user-1",
            daysAgo,
          },
          now,
        ),
      );
      sequence += 1;
    });
  });

  return [...featured, ...generated].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  );
}

function pushSlots(slots, count, status, criticality) {
  for (let index = 0; index < count; index += 1) {
    slots.push({ status, criticality });
  }
}

function weightedDay(index, total) {
  const weightTotal = WEEK_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  let cursor = ((index + 0.5) / total) * weightTotal;

  for (let day = 0; day < WEEK_WEIGHTS.length; day += 1) {
    cursor -= WEEK_WEIGHTS[day];
    if (cursor <= 0) return day;
  }

  return WEEK_WEIGHTS.length - 1;
}

function spreadDay(from, to, index, total) {
  if (total <= 1) return from;
  return Math.round(from + ((to - from) * index) / (total - 1));
}

function stamp(ticket, now) {
  const created = new Date(now.getTime() - ticket.daysAgo * DAY - (ticket.daysAgo === 0 ? 0 : 60 * 60 * 1000));
  return {
    _id: ticket.id,
    id: ticket.id,
    code: ticket.id,
    title: ticket.title,
    description: ticket.description,
    problem_type: ticket.problem_type,
    status: ticket.status,
    criticality: ticket.criticality,
    requester: ticket.requester,
    user_id: ticket.user_id,
    analyst_id: null,
    createdAt: created.toISOString(),
    updatedAt: created.toISOString(),
  };
}

function tokenFor(account) {
  const payload = Buffer.from(
    JSON.stringify({
      id: account.id,
      name: fullName(account),
      role: account.role,
      exp: Date.now() + DAY,
    }),
  ).toString("base64url");

  return `mock.${payload}`;
}

function readToken(header = "") {
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token.startsWith("mock.")) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.slice(5), "base64url").toString());
    if (!payload?.id || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function fullName(account) {
  return [account.name, account.last_name].filter(Boolean).join(" ");
}

function publicAccount(account) {
  return {
    id: account.id,
    name: account.name,
    last_name: account.last_name,
    email: account.email,
    profile_img: account.profile_img,
    role: account.role,
    department: account.department ?? null,
    phone: account.role === "user" ? account.phone : null,
  };
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });

    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    const body = ["POST", "PUT", "PATCH"].includes(req.method) ? await readBody(req) : {};
    const auth = readToken(req.headers.authorization || "");

    if (req.method === "POST" && path === "/api/auth/login") {
      const email = String(body.email || "").trim().toLowerCase();
      const account = state.accounts.find((item) => item.email === email);

      if (!email || !body.psw) {
        send(res, 422, { message: "Preencha todos os campos." });
        return;
      }

      if (!account || account.psw !== body.psw) {
        send(res, 401, { message: "Email ou senha inválidos." });
        return;
      }

      send(res, 200, {
        token: tokenFor(account),
        id: account.id,
        name: fullName(account),
        role: account.role,
      });
      return;
    }

    if (req.method === "POST" && path === "/api/auth/forgot_password") {
      const email = String(body.email || "").trim().toLowerCase();
      const account = state.accounts.find((item) => item.email === email);

      if (!account) {
        send(res, 404, { message: "Email não encontrado." });
        return;
      }

      send(res, 200, { message: `Código enviado para ${email}.` });
      return;
    }

    if (req.method === "POST" && path === "/api/auth/register_analyst") {
      if (!auth || auth.role !== "manager") {
        send(res, 401, { message: "Apenas um gerente pode cadastrar analistas." });
        return;
      }

      const email = String(body.email || "").trim().toLowerCase();
      if (!body.name || !body.last_name || !email || !body.psw) {
        send(res, 422, { message: "Preencha todos os campos." });
        return;
      }

      if (body.psw !== body.psw2) {
        send(res, 422, { message: "As senhas não conferem." });
        return;
      }

      if (state.accounts.some((item) => item.email === email)) {
        send(res, 409, { message: "Email já cadastrado." });
        return;
      }

      const account = {
        id: `analyst-${Date.now()}`,
        name: String(body.name).trim(),
        last_name: String(body.last_name).trim(),
        email,
        psw: body.psw,
        role: "analyst",
        department: "Suporte",
        phone: null,
        profile_img: null,
      };

      state.accounts.push(account);
      state.analysts.push({
        id: account.id,
        name: account.name,
        last_name: account.last_name,
        email,
        assigned: 0,
        resolved: 0,
        average_minutes: 0,
        percent: 0,
        status: "Ativo",
        color: "#2563eb",
      });

      send(res, 201, { message: `Analista ${email} cadastrado.` });
      return;
    }

    if (path === "/api/user") {
      if (!auth) {
        send(res, 401, { message: "Não autenticado." });
        return;
      }

      const account = state.accounts.find((item) => item.id === auth.id);
      if (!account) {
        send(res, 404, { message: "Conta não encontrada." });
        return;
      }

      if (req.method === "GET") {
        send(res, 200, publicAccount(account));
        return;
      }

      if (req.method === "PUT") {
        if (!String(body.name || "").trim() || !String(body.last_name || "").trim()) {
          send(res, 400, { message: "Nome e sobrenome são obrigatórios." });
          return;
        }

        account.name = String(body.name).trim();
        account.last_name = String(body.last_name).trim();

        if (account.role === "user" && body.phone !== undefined) {
          const phone = String(body.phone).replace(/\D/g, "");
          if (phone.length !== 11) {
            send(res, 400, { message: "O telefone deve conter 11 dígitos." });
            return;
          }
          account.phone = phone;
        }

        send(res, 200, publicAccount(account));
        return;
      }
    }

    if (req.method === "PATCH" && path === "/api/user/profile-picture") {
      if (!auth) {
        send(res, 401, { message: "Não autenticado." });
        return;
      }

      const account = state.accounts.find((item) => item.id === auth.id);
      if (!account || !body.profile_img) {
        send(res, 400, { message: "Selecione uma imagem primeiro." });
        return;
      }

      account.profile_img = body.profile_img;
      send(res, 200, { profile_img: account.profile_img });
      return;
    }

    if (req.method === "GET" && path === "/api/ticket/tickets") {
      send(res, 200, state.tickets);
      return;
    }

    if (req.method === "POST" && path === "/api/ticket/createTicket") {
      if (!auth) {
        send(res, 401, { message: "Você precisa fazer login antes de criar um chamado." });
        return;
      }

      if (!body.title || !body.problem_type || !body.description) {
        send(res, 422, { message: "Preencha todos os campos obrigatórios." });
        return;
      }

      const account = state.accounts.find((item) => item.id === auth.id);
      const ticket = stamp(
        {
          id: `TT-${1100 + state.tickets.length}`,
          title: String(body.title).trim(),
          description: String(body.description).trim(),
          problem_type: body.problem_type,
          status: "Open",
          criticality: "Medium",
          requester: account ? fullName(account) : "Solicitante",
          user_id: auth.id,
          daysAgo: 0,
        },
        new Date(),
      );

      state.tickets.unshift(ticket);
      send(res, 201, { message: `Chamado "${ticket.title}" criado.`, ticket });
      return;
    }

    if (req.method === "GET" && path.startsWith("/api/ticket/")) {
      const id = decodeURIComponent(path.slice("/api/ticket/".length));
      const ticket = state.tickets.find((item) => item.id === id || item._id === id);

      if (!ticket) {
        send(res, 404, { message: "Ticket não encontrado." });
        return;
      }

      send(res, 200, ticket);
      return;
    }

    if (req.method === "GET" && path === "/api/analysts") {
      send(res, 200, state.analysts);
      return;
    }

    send(res, 404, { message: "Rota não encontrada no mock." });
  } catch (error) {
    send(res, 400, { message: error.message || "Requisição inválida." });
  }
});

server.listen(PORT, () => {
  console.log(`Mock do TicketFlow em http://localhost:${PORT}`);
  console.log("Contas: gerente@ticketflow.com, analista@ticketflow.com, usuario@ticketflow.com");
  console.log("Senha: 123456");
});
