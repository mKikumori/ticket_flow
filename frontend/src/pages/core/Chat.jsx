import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import ThemeToggle from "./ThemeToggle";
import "./Home.css";
import "./Tickets.css";
import "./Chat.css";

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TF";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChatPage = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [applied, setApplied] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ticketId: "", message: "" });
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    return Promise.all([api.get("/api/ticket/chats"), api.get("/api/ticket/tickets")])
      .then(([chatsResponse, ticketsResponse]) => {
        setChats(Array.isArray(chatsResponse.data) ? chatsResponse.data : []);
        const list = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : [];
        setTickets(
          list.map((ticket) => ({
            rawId: ticket._id,
            label: `${String(ticket._id).slice(-6).toUpperCase()} · ${ticket.title}`,
            hasChat: Boolean(ticket.chat_id || ticket.has_chat),
          })),
        );
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Não foi possível carregar os chats.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!currentUser?.token) return undefined;
    let active = true;
    Promise.all([api.get("/api/ticket/chats"), api.get("/api/ticket/tickets")])
      .then(([chatsResponse, ticketsResponse]) => {
        if (!active) return;
        setChats(Array.isArray(chatsResponse.data) ? chatsResponse.data : []);
        const list = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : [];
        setTickets(
          list.map((ticket) => ({
            rawId: ticket._id,
            label: `${String(ticket._id).slice(-6).toUpperCase()} · ${ticket.title}`,
            hasChat: Boolean(ticket.chat_id || ticket.has_chat),
          })),
        );
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || "Não foi possível carregar os chats.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.token]);

  const visible = useMemo(() => {
    const term = applied.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter((chat) =>
      [chat.code, chat.title, chat.analyst, chat.status, chat.message].join(" ").toLowerCase().includes(term),
    );
  }, [applied, chats]);

  if (!currentUser?.token) return <Navigate to="/login" replace />;

  const roleLabel = ROLE_LABEL[currentUser.role] || "Usuário";
  const displayName = currentUser.name || "Usuário";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const createChat = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.post(`/api/ticket/${form.ticketId}/chat`, { message: form.message });
      setForm({ ticketId: "", message: "" });
      setCreating(false);
      setNotice("Chat aberto.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível abrir o chat.");
    } finally {
      setSaving(false);
    }
  };

  const download = (kind) => {
    const header = ["Ticket", "Analista", "Status", "Última interação"];
    const rows = visible.map((chat) => [chat.title, chat.analyst, chat.status, formatWhen(chat.updated)]);
    if (kind === "csv") {
      const csv = [header, ...rows]
        .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "chats.csv";
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }
    const table = `<table><thead><tr>${header.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows
      .map((line) => `<tr>${line.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
    const blob = new Blob([`<!doctype html><meta charset="utf-8"><title>Chats</title>${table}`], {
      type: "text/html;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chats.html";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const opened = visible.find((chat) => chat.id === openId);

  return (
    <div className="dash">
      {sideOpen && (
        <button type="button" className="dash-backdrop" aria-label="Fechar menu" onClick={() => setSideOpen(false)} />
      )}
      <aside className={sideOpen ? "dash-side is-open" : "dash-side"}>
        <Link className="dash-brand" to="/home">
          <span className="dash-brand-mark">
            <LayersIcon />
          </span>
          <span>
            Ticket<span className="brand-flow">Flow</span>
          </span>
        </Link>
        <nav className="dash-nav" aria-label="Menu principal">
          <p className="dash-nav-label">Menu principal</p>
          <Link className="dash-nav-item" to="/home">
            <GridIcon />
            Visão geral
          </Link>
          <Link className="dash-nav-item" to="/tickets">
            <TicketIcon />
            Tickets
          </Link>
          <Link className="dash-nav-item is-active" to="/chat" aria-current="page">
            <MessageIcon />
            Chat
          </Link>
          <Link className="dash-nav-item" to="/analysts">
            <UsersIcon />
            Analistas
          </Link>
          <Link className="dash-nav-item" to="/profile">
            <UserIcon />
            Meu perfil
          </Link>
        </nav>
        <div className="dash-side-foot">
          <div className="dash-help">
            <span className="dash-help-icon">
              <MessageIcon />
            </span>
            <strong>Precisa de ajuda?</strong>
            <p>Acesse nossa central de suporte.</p>
            <a href="mailto:suporte@ticketflow.com">Falar com suporte</a>
          </div>
          <div className="dash-rolebox">
            <span>Visualizar como</span>
            <div>
              <strong>{roleLabel}</strong>
              <ChevronIcon />
            </div>
          </div>
        </div>
      </aside>

      <div className="dash-shell">
        <header className="dash-top">
          <button type="button" className="dash-burger" aria-label="Abrir menu" onClick={() => setSideOpen(true)}>
            <MenuIcon />
          </button>
          <label className="dash-search">
            <SearchIcon />
            <input
              type="search"
              value={filter}
              placeholder="Buscar chats ou tickets..."
              aria-label="Buscar chats"
              onChange={(event) => setFilter(event.target.value)}
            />
          </label>
          <div className="dash-actions">
            <ThemeToggle />
            <div className="dash-anchor">
              <button
                type="button"
                className="dash-user"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span className="dash-avatar">{initials(displayName)}</span>
                <span className="dash-user-text">
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </span>
                <ChevronIcon />
              </button>
              {menuOpen && (
                <div className="dash-pop" role="menu">
                  <Link role="menuitem" to="/profile" onClick={() => setMenuOpen(false)}>
                    Meu perfil
                  </Link>
                  <button type="button" role="menuitem" className="is-danger" onClick={logout}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dash-content">
          <div className="chat-head">
            <div>
              <p className="dash-kicker">Conversas</p>
              <h1>Chat</h1>
              <p className="dash-lead">Confira os chats abertos ou inicie um novo chat sobre um ticket.</p>
            </div>
            <button type="button" className="chat-new" onClick={() => setCreating((current) => !current)}>
              Novo chat
            </button>
          </div>

          {error && <p className="dash-load-error">{error}</p>}
          {notice && <p className="tickets-notice">{notice}</p>}

          {creating && (
            <section className="dash-card tickets-panel tickets-form-card">
              <h2>Abertura de chat</h2>
              <p>Escolha o ticket e escreva a primeira mensagem.</p>
              <form className="tickets-form" onSubmit={createChat}>
                <label className="is-wide">
                  Selecione o ticket
                  <select
                    value={form.ticketId}
                    onChange={(event) => setForm((current) => ({ ...current, ticketId: event.target.value }))}
                    required
                  >
                    <option value="">Selecione um ticket</option>
                    {tickets
                      .filter((ticket) => !ticket.hasChat)
                      .map((ticket) => (
                        <option key={ticket.rawId} value={ticket.rawId}>
                          {ticket.label}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="is-wide">
                  Primeira mensagem
                  <textarea
                    rows={4}
                    placeholder="Insira a primeira mensagem"
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    required
                  />
                </label>
                <div className="tickets-form-actions">
                  <button type="submit" className="is-primary" disabled={saving}>
                    {saving ? "Abrindo..." : "Abrir chat"}
                  </button>
                  <button type="button" onClick={() => setCreating(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="dash-card tickets-panel">
            <form
              className="chat-filter"
              onSubmit={(event) => {
                event.preventDefault();
                setApplied(filter);
              }}
            >
              <label>
                Analistas
                <input
                  value={filter}
                  placeholder="Nome, ticket ou status"
                  onChange={(event) => setFilter(event.target.value)}
                />
              </label>
              <button type="submit">Filtrar</button>
            </form>

            <h2>Histórico de conversas</h2>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Analista</th>
                    <th>Status</th>
                    <th>Última interação</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="dash-empty" colSpan={5}>
                        Carregando chats...
                      </td>
                    </tr>
                  )}
                  {!loading && visible.length === 0 && (
                    <tr>
                      <td className="dash-empty" colSpan={5}>
                        Nenhum chat encontrado.
                      </td>
                    </tr>
                  )}
                  {visible.map((chat) => (
                    <tr key={chat.id}>
                      <td>
                        <strong>{chat.code}</strong>
                        <span className="chat-title">{chat.title}</span>
                      </td>
                      <td>{chat.analyst}</td>
                      <td>{chat.status}</td>
                      <td>{formatWhen(chat.updated)}</td>
                      <td>
                        <button type="button" className="chat-open" onClick={() => setOpenId(chat.id)}>
                          Abrir chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {opened && (
              <article className="chat-preview">
                <strong>
                  {opened.code} · {opened.title}
                </strong>
                <p>{opened.message || "Sem mensagens ainda."}</p>
              </article>
            )}

            <div className="tickets-export">
              <button type="button" onClick={() => window.print()}>
                Exportar PDF
              </button>
              <button type="button" onClick={() => download("csv")}>
                Exportar CSV
              </button>
              <button type="button" onClick={() => download("html")}>
                Exportar HTML
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

function Svg({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function LayersIcon() {
  return (
    <Svg>
      <path d="M12 3l8 4.5-8 4.5L4 7.5 12 3z" />
      <path d="M4 12l8 4.5L20 12" />
      <path d="M4 16.5L12 21l8-4.5" />
    </Svg>
  );
}

function GridIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

function TicketIcon() {
  return (
    <Svg>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2 2 0 0 0 0-3.6V8z" />
    </Svg>
  );
}

function UsersIcon() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 19a4.2 4.2 0 0 1 6-1.2" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </Svg>
  );
}

function MessageIcon() {
  return (
    <Svg>
      <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg size={16}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

export default ChatPage;
