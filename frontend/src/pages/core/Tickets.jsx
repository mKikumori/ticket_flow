import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import { signOut } from "../../services/auth";
import ThemeToggle from "./ThemeToggle";
import DashSearch from "./DashSearch";
import "./Home.css";
import "./Tickets.css";

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

const PROBLEMS = [
  "Problema 1",
  "Problema 2",
  "Problema 3",
  "Problema 4",
  "Problema 5",
  "Problema 6",
  "Problema 7",
  "Problema 8",
];

const VIEWS = [
  { id: "list", label: "Lista" },
  { id: "open", label: "Abrir ticket" },
  { id: "chat", label: "Abrir chat" },
  { id: "report", label: "Relatório" },
];

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWhen(date) {
  if (!date) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeTicket(ticket) {
  const statusMap = {
    Open: "Aberto",
    "In Progress": "Em progresso",
    Closed: "Fechado",
  };
  const criticalityMap = {
    Low: "Baixo",
    Medium: "Médio",
    High: "Urgente",
  };
  const created = parseDate(ticket.createdAt);

  return {
    rawId: ticket._id || ticket.id,
    id: ticket.code || String(ticket._id || ticket.id || "").slice(-6).toUpperCase(),
    title: ticket.title || "Sem título",
    type: ticket.problem_type || "—",
    requester: ticket.requester || ticket.user_name || "Solicitante",
    when: formatWhen(created),
    created,
    criticalityValue: criticalityMap[ticket.criticality] ? ticket.criticality : "Low",
    criticality: criticalityMap[ticket.criticality] || ticket.criticality || "Baixo",
    statusValue: statusMap[ticket.status] ? ticket.status : "Open",
    status: statusMap[ticket.status] || ticket.status || "Aberto",
    detail: ticket.description || "",
  };
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TF";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const Tickets = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") || "");
  const [sort, setSort] = useState("new");
  const [form, setForm] = useState({ title: "", problem_type: PROBLEMS[0], description: "" });
  const [chatForm, setChatForm] = useState({ ticketId: "", message: "" });
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", status: "Todos", type: "Todos" });

  const loadTickets = () => {
    setLoading(true);
    return api
      .get("/api/ticket/tickets")
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        setTickets(list.map(normalizeTicket));
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Não foi possível carregar os tickets.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!currentUser?.token) return undefined;
    let active = true;
    api
      .get("/api/ticket/tickets")
      .then((response) => {
        if (!active) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setTickets(list.map(normalizeTicket));
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || "Não foi possível carregar os tickets.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.token]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = tickets.filter((ticket) => {
      if (!term) return true;
      return [ticket.id, ticket.title, ticket.requester, ticket.type, ticket.status, ticket.detail]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    return list.sort((a, b) => {
      const left = a.created?.getTime() || 0;
      const right = b.created?.getTime() || 0;
      return sort === "old" ? left - right : right - left;
    });
  }, [query, sort, tickets]);

  const reportRows = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.status !== "Todos" && ticket.status !== filters.status) return false;
      if (filters.type !== "Todos" && ticket.type !== filters.type) return false;
      const time = ticket.created?.getTime();
      if (filters.from && time && time < new Date(`${filters.from}T00:00:00`).getTime()) return false;
      if (filters.to && time && time > new Date(`${filters.to}T23:59:59`).getTime()) return false;
      return true;
    });
  }, [filters, tickets]);

  if (!currentUser?.token) return <Navigate to="/login" replace />;

  const roleLabel = ROLE_LABEL[currentUser.role] || "Usuário";
  const displayName = currentUser.name || "Usuário";

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
    navigate("/login");
  };

  const updateTicket = async (ticket, patch) => {
    if (!ticket.rawId) return;
    setSavingId(ticket.rawId);
    setNotice("");
    setError("");
    try {
      const response = await api.put(`/api/ticket/updateTicketById/${ticket.rawId}`, patch);
      const next = normalizeTicket(response.data);
      setTickets((current) => current.map((item) => (item.rawId === ticket.rawId ? next : item)));
      setNotice("Ticket atualizado.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível atualizar o ticket.");
    } finally {
      setSavingId("");
    }
  };

  const createTicket = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await api.post("/api/ticket/createTicket", {
        title: form.title,
        problem_type: form.problem_type,
        description: form.description,
      });
      setForm({ title: "", problem_type: PROBLEMS[0], description: "" });
      setFileName("");
      setNotice("Ticket aberto. Ele já aparece na lista.");
      await loadTickets();
      setView("list");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível abrir o ticket.");
    } finally {
      setSaving(false);
    }
  };

  const openChat = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");
    try {
      await api.post(`/api/ticket/${chatForm.ticketId}/chat`, { message: chatForm.message });
      setNotice("Chat aberto para o ticket selecionado.");
      setChatForm({ ticketId: "", message: "" });
      setView("list");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível abrir o chat.");
    } finally {
      setSaving(false);
    }
  };

  const download = (kind) => {
    const header = ["ID", "Título", "Tipo", "Solicitante", "Data", "Criticidade", "Status"];
    const rows = reportRows.map((ticket) => [
      ticket.id,
      ticket.title,
      ticket.type,
      ticket.requester,
      ticket.when,
      ticket.criticality,
      ticket.status,
    ]);

    if (kind === "csv") {
      const csv = [header, ...rows]
        .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "relatorio-tickets.csv";
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }

    const table = `<table><thead><tr>${header.map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${rows
      .map((line) => `<tr>${line.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
    const blob = new Blob([`<!doctype html><meta charset="utf-8"><title>Relatório de tickets</title>${table}`], {
      type: "text/html;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio-tickets.html";
    link.click();
    URL.revokeObjectURL(link.href);
  };

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
          <Link className="dash-nav-item is-active" to="/tickets" aria-current="page">
            <TicketIcon />
            Tickets
            <span className="dash-badge">{tickets.length}</span>
          </Link>
          <Link className="dash-nav-item" to="/chat">
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
          <DashSearch
            tickets={tickets}
            value={query}
            onChange={setQuery}
            onPick={(item) => setQuery(item.title)}
          />
          <div className="dash-actions">
            <ThemeToggle />
            <div className="dash-anchor">
              <button
                type="button"
                className="dash-user"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
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
          <div className="tickets-head">
            <div>
              <p className="dash-kicker">Atendimentos</p>
              <h1>Tickets</h1>
              <p className="dash-lead">Acompanhe a lista, abra um chamado ou gere um relatório.</p>
            </div>
            <div className="tickets-switch" role="tablist" aria-label="Ações de tickets">
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={view === item.id}
                  className={view === item.id ? "is-on" : undefined}
                  onClick={() => {
                    setNotice("");
                    setView(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="dash-load-error">{error}</p>}
          {notice && <p className="tickets-notice">{notice}</p>}

          {view === "list" && (
            <section className="dash-card tickets-panel">
              <div className="tickets-toolbar">
                <label className="tickets-search">
                  <SearchIcon />
                  <input
                    type="search"
                    value={query}
                    placeholder="Buscar por nome, título, ID ou descrição..."
                    aria-label="Filtrar tickets"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <label className="tickets-select">
                  <span className="dash-sr">Ordenar</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="new">Mais recentes</option>
                    <option value="old">Mais antigos</option>
                  </select>
                </label>
              </div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Solicitante</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Criticidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td className="dash-empty" colSpan={7}>
                          Carregando tickets...
                        </td>
                      </tr>
                    )}
                    {!loading && visible.length === 0 && (
                      <tr>
                        <td className="dash-empty" colSpan={7}>
                          Nenhum ticket encontrado.
                        </td>
                      </tr>
                    )}
                    {visible.map((ticket) => (
                      <tr key={ticket.rawId || `${ticket.id}-${ticket.title}`}>
                        <td>
                          <span className="dash-id">{ticket.id}</span>
                        </td>
                        <td>{ticket.title}</td>
                        <td>{ticket.requester}</td>
                        <td>{ticket.when}</td>
                        <td>{ticket.type}</td>
                        <td>
                          <select
                            className="ticket-edit"
                            aria-label={`Criticidade de ${ticket.title}`}
                            value={ticket.criticalityValue}
                            disabled={!ticket.rawId || savingId === ticket.rawId}
                            onChange={(event) => updateTicket(ticket, { criticality: event.target.value })}
                          >
                            <option value="Low">Baixo</option>
                            <option value="Medium">Médio</option>
                            <option value="High">Urgente</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="ticket-edit"
                            aria-label={`Status de ${ticket.title}`}
                            value={ticket.statusValue}
                            disabled={!ticket.rawId || savingId === ticket.rawId}
                            onChange={(event) => updateTicket(ticket, { status: event.target.value })}
                          >
                            <option value="Open">Aberto</option>
                            <option value="In Progress">Em progresso</option>
                            <option value="Closed">Fechado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="tickets-foot">
                Mostrando {visible.length} de {tickets.length} tickets. A troca de status ou criticidade já salva o chamado.
              </p>
            </section>
          )}

          {view === "open" && (
            <section className="dash-card tickets-panel tickets-form-card">
              <h2>Abertura de ticket</h2>
              <p>Preencha os campos abaixo. O chamado entra na lista assim que for aberto.</p>
              <form className="tickets-form" onSubmit={createTicket}>
                <label>
                  Título
                  <input
                    name="title"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Tipo do problema
                  <select
                    name="problem_type"
                    value={form.problem_type}
                    onChange={(event) => setForm((current) => ({ ...current, problem_type: event.target.value }))}
                  >
                    {PROBLEMS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="is-wide">
                  Descreva o problema enfrentado
                  <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    required
                  />
                </label>
                <label className="tickets-file">
                  Anexar arquivo
                  <input
                    type="file"
                    onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
                  />
                  <span>{fileName || "Nenhum arquivo selecionado"}</span>
                </label>
                <div className="tickets-form-actions">
                  <button type="submit" className="is-primary" disabled={saving}>
                    {saving ? "Abrindo..." : "Abrir ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ title: "", problem_type: PROBLEMS[0], description: "" });
                      setFileName("");
                      setView("list");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {view === "chat" && (
            <section className="dash-card tickets-panel tickets-form-card">
              <h2>Abertura de chat</h2>
              <p>Escolha o ticket e escreva a primeira mensagem. O chat fica ligado a esse chamado.</p>
              <form className="tickets-form" onSubmit={openChat}>
                <label className="is-wide">
                  Selecione o ticket
                  <select
                    value={chatForm.ticketId}
                    onChange={(event) => setChatForm((current) => ({ ...current, ticketId: event.target.value }))}
                    required
                  >
                    <option value="">Selecione um ticket</option>
                    {tickets.map((ticket) => (
                      <option key={ticket.rawId || ticket.id} value={ticket.rawId}>
                        {ticket.id} · {ticket.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="is-wide">
                  Primeira mensagem
                  <textarea
                    rows={5}
                    placeholder="Insira a primeira mensagem"
                    value={chatForm.message}
                    onChange={(event) => setChatForm((current) => ({ ...current, message: event.target.value }))}
                    required
                  />
                </label>
                <div className="tickets-form-actions">
                  <button type="submit" className="is-primary" disabled={saving}>
                    {saving ? "Abrindo..." : "Abrir chat"}
                  </button>
                  <button type="button" onClick={() => setView("list")}>
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {view === "report" && (
            <section className="dash-card tickets-panel">
              <h2>Relatório de tickets</h2>
              <p>Escolha o período e os filtros para montar o relatório.</p>
              <div className="tickets-filters">
                <label>
                  Data inicial
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
                  />
                </label>
                <label>
                  Data final
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option>Todos</option>
                    <option>Aberto</option>
                    <option>Em progresso</option>
                    <option>Fechado</option>
                  </select>
                </label>
                <label>
                  Tipo
                  <select
                    value={filters.type}
                    onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option>Todos</option>
                    {PROBLEMS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.length === 0 && (
                      <tr>
                        <td className="dash-empty" colSpan={5}>
                          Nenhum ticket neste filtro.
                        </td>
                      </tr>
                    )}
                    {reportRows.map((ticket) => (
                      <tr key={`${ticket.id}-report`}>
                        <td>{ticket.id}</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.when}</td>
                        <td>{ticket.type}</td>
                        <td>{ticket.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          )}
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

export default Tickets;
