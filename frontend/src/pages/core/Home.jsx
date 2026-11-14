import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import "./Home.css";

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

const PERIODS = [
  { id: "7", label: "Últimos 7 dias" },
  { id: "30", label: "Últimos 30 dias" },
  { id: "90", label: "Últimos 90 dias" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ANALYST_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b"];
const EMPTY_SNAPSHOT = {
  total: { value: "…", delta: "", down: false },
  open: { value: "…", delta: "", down: false },
  progress: { value: "…", delta: "", down: false },
  closed: { value: "…", delta: "", down: false },
  urgent: { value: "…", delta: "", down: false },
  parts: [0, 0, 0],
};

const STATS = [
  { key: "total", label: "Total de tickets", tone: "tone-blue", icon: LayersIcon },
  { key: "open", label: "Tickets abertos", tone: "tone-amber", icon: AlertIcon },
  { key: "progress", label: "Em progresso", tone: "tone-purple", icon: ClockIcon },
  { key: "closed", label: "Tickets fechados", tone: "tone-green", icon: CheckIcon },
  { key: "urgent", label: "Tickets urgentes", tone: "tone-red", icon: AlertIcon },
];

const LEGEND = [
  { label: "Em progresso", tone: "is-blue" },
  { label: "Abertos", tone: "is-amber" },
  { label: "Fechados", tone: "is-green" },
];

const CRITICALITY = {
  Urgente: "is-urgent",
  Médio: "is-medium",
  Baixo: "is-low",
};

const STATUS = {
  "Em progresso": "is-progress",
  Aberto: "is-open",
  Fechado: "is-closed",
};

const BASE_QUICK = [
  {
    title: "Novo chamado",
    text: "Registrar uma solicitação",
    to: "/create_ticket",
    tone: "tone-blue",
    icon: PlusIcon,
  },
  {
    title: "Tickets",
    text: "Chamados recentes",
    section: "tickets",
    tone: "tone-amber",
    icon: TicketIcon,
  },
  {
    title: "Analistas",
    text: "Desempenho da equipe",
    to: "/analysts",
    tone: "tone-purple",
    icon: UsersIcon,
  },
  {
    title: "Meu perfil",
    text: "Dados da sua conta",
    to: "/profile",
    tone: "tone-green",
    icon: UserIcon,
  },
  {
    title: "Novo gerente",
    text: "Cadastrar um gerente",
    to: "/register_manager",
    tone: "tone-slate",
    icon: BadgeIcon,
  },
];

function normalizePercents(values) {
  const sum = values.reduce((total, value) => total + value, 0);
  if (!sum) return values.map(() => 0);
  const raw = values.map((value) => Math.round((value / sum) * 100));
  raw[0] += 100 - raw.reduce((total, value) => total + value, 0);
  return raw;
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatWhen(date) {
  if (!date) return "—";
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return `Hoje, ${time}`;
  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}, ${time}`;
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
    id: ticket.code || ticket.id || ticket._id,
    title: ticket.title || "Sem título",
    requester: ticket.requester || ticket.user_name || "Solicitante",
    when: formatWhen(created),
    created,
    criticality: criticalityMap[ticket.criticality] || ticket.criticality || "Baixo",
    status: statusMap[ticket.status] || ticket.status || "Aberto",
    detail: ticket.description || ticket.detail || "",
  };
}

function countStatus(list) {
  return {
    open: list.filter((ticket) => ticket.status === "Aberto").length,
    progress: list.filter((ticket) => ticket.status === "Em progresso").length,
    closed: list.filter((ticket) => ticket.status === "Fechado").length,
    urgent: list.filter((ticket) => ticket.criticality === "Urgente").length,
  };
}

function metric(current, previous) {
  if (!previous) {
    return {
      value: String(current),
      delta: current ? "+100,0%" : "0,0%",
      down: false,
    };
  }

  const value = ((current - previous) / previous) * 100;
  const down = value < 0;
  return {
    value: String(current),
    delta: `${down ? "-" : "+"}${Math.abs(value).toFixed(1).replace(".", ",")}%`,
    down,
  };
}

function inWindow(ticket, days, offset = 0) {
  if (!ticket.created) return offset === 0;
  const time = ticket.created.getTime();
  const end = Date.now() - offset * 86400000;
  const start = end - days * 86400000;
  return time >= start && time <= end;
}

function buildSnapshot(tickets, periodId) {
  const days = Number(periodId);
  const current = countStatus(tickets.filter((ticket) => inWindow(ticket, days)));
  const previous = countStatus(tickets.filter((ticket) => inWindow(ticket, days, days)));
  const total = current.open + current.progress + current.closed;
  const totalBefore = previous.open + previous.progress + previous.closed;

  return {
    total: metric(total, totalBefore),
    open: metric(current.open, previous.open),
    progress: metric(current.progress, previous.progress),
    closed: metric(current.closed, previous.closed),
    urgent: metric(current.urgent, previous.urgent),
    parts: [current.progress, current.open, current.closed],
  };
}

function buildVolume(tickets) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const counts = days.map((date) =>
    tickets.filter((ticket) => ticket.created?.toDateString() === date.toDateString()).length,
  );
  const max = Math.max(...counts, 1);
  const peak = Math.max(...counts);

  return {
    total: counts.reduce((sum, count) => sum + count, 0),
    days: days.map((date, index) => ({
      day: WEEKDAYS[date.getDay()],
      value: counts[index] ? Math.max(8, Math.round((counts[index] / max) * 100)) : 8,
      peak: peak > 0 && counts[index] === peak,
    })),
  };
}

function buildNotices(tickets) {
  const urgent = tickets.filter((ticket) => ticket.criticality === "Urgente");
  const notices = [];

  if (urgent.length) {
    notices.push({
      title: `${urgent.length} tickets urgentes`,
      text: "Precisam de atenção neste período.",
      query: "Urgente",
    });
  }

  if (tickets[0]) {
    notices.push({
      title: `${tickets[0].id} atualizado`,
      text: tickets[0].title,
      query: String(tickets[0].id),
    });
  }

  return notices;
}

function normalizeAnalyst(person, index) {
  const name = [person.name, person.last_name].filter(Boolean).join(" ") || person.name || "Analista";
  return {
    id: person.id || name,
    initials: initials(name),
    name,
    done: `${person.resolved ?? 0} resolvidos`,
    percent: person.percent ?? 0,
    color: person.color || ANALYST_COLORS[index % ANALYST_COLORS.length],
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

const Home = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [periodId, setPeriodId] = useState("30");
  const [openMenu, setOpenMenu] = useState(null);
  const [activeNav, setActiveNav] = useState("visao");
  const [sideOpen, setSideOpen] = useState(false);
  const [openTicket, setOpenTicket] = useState(null);
  const searchRef = useRef(null);
  const periodRef = useRef(null);
  const bellRef = useRef(null);
  const userRef = useRef(null);

  const filtered = useMemo(() => {
    const current = tickets.filter((ticket) => inWindow(ticket, Number(periodId)));
    const term = query.trim().toLowerCase();
    const matched = term
      ? current.filter((ticket) =>
          [ticket.id, ticket.title, ticket.requester, ticket.criticality, ticket.status]
            .join(" ")
            .toLowerCase()
            .includes(term),
        )
      : current;

    return matched.slice(0, 8);
  }, [query, tickets, periodId]);

  useEffect(() => {
    if (!currentUser?.token) return undefined;

    let active = true;
    setLoadingData(true);

    Promise.all([
      api.get("/api/ticket/tickets"),
      api.get("/api/analysts").catch(() => ({ data: [] })),
    ])
      .then(([ticketsResponse, analystsResponse]) => {
        if (!active) return;
        const list = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : [];
        const people = Array.isArray(analystsResponse.data) ? analystsResponse.data : [];
        setTickets(list.map(normalizeTicket));
        setAnalysts(people.map(normalizeAnalyst));
        setLoadError("");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(
          error.response?.data?.message ||
            "Não foi possível carregar os dados. Confira se o backend está rodando.",
        );
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.token]);

  useEffect(() => {
    const onPointer = (event) => {
      const inside = [periodRef, bellRef, userRef].some((ref) =>
        ref.current?.contains(event.target),
      );
      if (!inside) setOpenMenu(null);
    };

    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setOpenMenu(null);
        setSideOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!currentUser?.token) {
    return <Navigate to="/login" replace />;
  }

  const snapshot = loadingData ? EMPTY_SNAPSHOT : buildSnapshot(tickets, periodId);
  const volume = buildVolume(tickets);
  const periodTickets = tickets.filter((ticket) => inWindow(ticket, Number(periodId)));
  const notices = buildNotices(periodTickets);
  const period = PERIODS.find((item) => item.id === periodId);
  const sum = snapshot.parts.reduce((total, value) => total + value, 0);
  const p1 = sum ? (snapshot.parts[0] / sum) * 100 : 0;
  const p2 = sum ? ((snapshot.parts[0] + snapshot.parts[1]) / sum) * 100 : 0;
  const percents = normalizePercents(snapshot.parts);
  const displayName = currentUser.name || "Usuário";
  const roleLabel = ROLE_LABEL[currentUser.role] || "Usuário";
  const quickItems =
    currentUser.role === "manager"
      ? [
          ...BASE_QUICK,
          {
            title: "Novo analista",
            text: "Cadastrar um analista",
            to: "/register_analyst",
            tone: "tone-blue",
            icon: UserPlusIcon,
          },
        ]
      : BASE_QUICK;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const showSection = (id) => {
    setActiveNav(id);
    setSideOpen(false);
    setOpenMenu(null);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleMenu = (name) => {
    setOpenMenu((current) => (current === name ? null : name));
  };

  const focusTickets = (term) => {
    setQuery(term);
    setOpenTicket(null);
    showSection("tickets");
  };

  return (
    <div className="dash">
      {sideOpen && (
        <button
          type="button"
          className="dash-backdrop"
          aria-label="Fechar menu"
          onClick={() => setSideOpen(false)}
        />
      )}

      <aside className={sideOpen ? "dash-side is-open" : "dash-side"}>
        <Link className="dash-brand" to="/home" onClick={() => setSideOpen(false)}>
          <span className="dash-brand-mark">
            <LayersIcon />
          </span>
          <span>
            Ticket<span className="brand-flow">Flow</span>
          </span>
        </Link>

        <nav className="dash-nav" aria-label="Menu principal">
          <p className="dash-nav-label">Menu principal</p>
          <button
            type="button"
            className={activeNav === "visao" ? "dash-nav-item is-active" : "dash-nav-item"}
            aria-current={activeNav === "visao" ? "true" : undefined}
            onClick={() => showSection("visao")}
          >
            <GridIcon />
            Visão geral
          </button>
          <button
            type="button"
            className={activeNav === "tickets" ? "dash-nav-item is-active" : "dash-nav-item"}
            aria-current={activeNav === "tickets" ? "true" : undefined}
            onClick={() => showSection("tickets")}
          >
            <TicketIcon />
            Tickets
            <span className="dash-badge">{snapshot.open.value}</span>
          </button>
          <Link className="dash-nav-item" to="/analysts" onClick={() => setSideOpen(false)}>
            <UsersIcon />
            Analistas
          </Link>
          <Link className="dash-nav-item" to="/profile" onClick={() => setSideOpen(false)}>
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
          <button
            type="button"
            className="dash-burger"
            aria-label="Abrir menu"
            onClick={() => setSideOpen(true)}
          >
            <MenuIcon />
          </button>

          <label className="dash-search">
            <SearchIcon />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Buscar tickets, usuários ou ID..."
              aria-label="Buscar tickets, usuários ou ID"
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>Ctrl K</kbd>
          </label>

          <div className="dash-actions">
            <div className="dash-anchor" ref={bellRef}>
              <button
                type="button"
                className="dash-icon-btn"
                aria-label="Notificações"
                aria-expanded={openMenu === "bell"}
                aria-haspopup="menu"
                onClick={() => toggleMenu("bell")}
              >
                <BellIcon />
                <span className="dash-alert" />
              </button>
              {openMenu === "bell" && (
                <div className="dash-pop is-wide" role="menu">
                  <p className="dash-pop-title">Notificações</p>
                  {notices.length === 0 && <p className="dash-pop-title">Sem notificações</p>}
                  {notices.map((notice) => (
                    <button
                      key={notice.title}
                      type="button"
                      role="menuitem"
                      onClick={() => focusTickets(notice.query)}
                    >
                      <strong>{notice.title}</strong>
                      <span>{notice.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-anchor" ref={userRef}>
              <button
                type="button"
                className="dash-user"
                aria-expanded={openMenu === "user"}
                aria-haspopup="menu"
                onClick={() => toggleMenu("user")}
              >
                <span className="dash-avatar">{initials(displayName)}</span>
                <span className="dash-user-text">
                  <strong>{displayName}</strong>
                  <small>{roleLabel}</small>
                </span>
                <ChevronIcon />
              </button>
              {openMenu === "user" && (
                <div className="dash-pop" role="menu">
                  <Link role="menuitem" to="/profile" onClick={() => setOpenMenu(null)}>
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
          <section className="dash-quick" aria-labelledby="acesso-rapido">
            <h2 className="dash-kicker" id="acesso-rapido">
              Acesso rápido
            </h2>
            <p>Escolha uma função para continuar.</p>
            <div className="dash-quick-grid">
              {quickItems.map((item) => (
                <QuickCard
                  key={item.title}
                  item={item}
                  onSection={showSection}
                  onNavigate={() => setSideOpen(false)}
                />
              ))}
            </div>
          </section>

          <section id="visao" aria-labelledby="visao-titulo">
            <p className="dash-kicker">Painel gerencial</p>
            <div className="dash-heading">
              <div>
                <h1 id="visao-titulo">
                  Visão geral<span className="dash-dot-title">.</span>
                </h1>
                <p className="dash-lead">
                  Acompanhe o desempenho da sua equipe em tempo real.
                </p>
                {loadError && <p className="dash-load-error">{loadError}</p>}
              </div>

              <div className="dash-period" ref={periodRef}>
                <button
                  type="button"
                  className="dash-period-btn"
                  aria-expanded={openMenu === "period"}
                  aria-haspopup="menu"
                  onClick={() => toggleMenu("period")}
                >
                  <CalendarIcon />
                  {period.label}
                  <ChevronIcon />
                </button>
                {openMenu === "period" && (
                  <div className="dash-pop" role="menu">
                    {PERIODS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        className={item.id === periodId ? "is-current" : undefined}
                        onClick={() => {
                          setPeriodId(item.id);
                          setOpenMenu(null);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dash-stats">
              {STATS.map((item) => {
                const Icon = item.icon;
                const data = snapshot[item.key];
                return (
                  <article className="dash-stat" key={item.key}>
                    <span className={`dash-stat-icon ${item.tone}`}>
                      <Icon />
                    </span>
                    <p className="dash-stat-label">{item.label}</p>
                    <strong>{data.value}</strong>
                    {data.delta && (
                      <p className={data.down ? "dash-delta is-down" : "dash-delta is-up"}>
                        <span>
                          {data.down ? "↓" : "↑"} {data.delta}
                        </span>
                        <span>vs. mês anterior</span>
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            <div className="dash-charts">
              <article className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <h2>Tickets por status</h2>
                    <p>Distribuição dos chamados no período</p>
                  </div>
                </div>
                <div className="dash-donut-row">
                  <div className={sum ? "dash-donut" : "dash-donut is-empty"} style={{ "--p1": p1, "--p2": p2 }}>
                    <div className="dash-donut-hole">
                      <strong>{snapshot.total.value}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <ul className="dash-legend">
                    {LEGEND.map((item, index) => (
                      <li key={item.label}>
                        <i className={`legend-dot ${item.tone}`} />
                        <span>{item.label}</span>
                        <b>{snapshot.parts[index]}</b>
                        <em>{percents[index]}%</em>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <h2>Volume de tickets</h2>
                    <p>Novos tickets nos últimos 7 dias</p>
                  </div>
                  <span className="dash-note">{volume.total} tickets esta semana</span>
                </div>
                <div className="dash-bars" aria-hidden="true">
                  {volume.days.map((day) => (
                    <div className="dash-bar-col" key={day.day}>
                      <div className="dash-bar-track">
                        <span className={day.peak ? "is-peak" : undefined} style={{ height: `${day.value}%` }} />
                      </div>
                      <small>{day.day}</small>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="dash-split">
              <section className="dash-card" id="tickets" aria-labelledby="tickets-titulo">
                <div className="dash-card-head">
                  <div>
                    <h2 id="tickets-titulo">Tickets recentes</h2>
                    <p>Chamados que precisam da sua atenção</p>
                  </div>
                  <button
                    type="button"
                    className="dash-linkish"
                    onClick={() => {
                      setQuery("");
                      setOpenTicket(null);
                      showSection("tickets");
                    }}
                  >
                    Ver todos
                  </button>
                </div>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Solicitante</th>
                        <th>Data</th>
                        <th>Criticidade</th>
                        <th>Status</th>
                        <th>
                          <span className="dash-sr">Detalhe</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td className="dash-empty" colSpan={7}>
                            Nenhum ticket encontrado para essa busca.
                          </td>
                        </tr>
                      )}
                      {filtered.map((ticket) => (
                        <Fragment key={ticket.id}>
                          <tr>
                            <td>
                              <span className="dash-id">{ticket.id}</span>
                            </td>
                            <td>{ticket.title}</td>
                            <td>{ticket.requester}</td>
                            <td>{ticket.when}</td>
                            <td>
                              <span className={`pill ${CRITICALITY[ticket.criticality]}`}>
                                {ticket.criticality}
                              </span>
                            </td>
                            <td>
                              <span className={`pill ${STATUS[ticket.status]}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={openTicket === ticket.id ? "dash-eye is-open" : "dash-eye"}
                                aria-expanded={openTicket === ticket.id}
                                aria-label={`Ver ${ticket.id}`}
                                onClick={() =>
                                  setOpenTicket((current) => (current === ticket.id ? null : ticket.id))
                                }
                              >
                                <EyeIcon />
                              </button>
                            </td>
                          </tr>
                          {openTicket === ticket.id && (
                            <tr className="dash-detail">
                              <td colSpan={7}>{ticket.detail}</td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="dash-card" id="equipe" aria-labelledby="equipe-titulo">
                <div className="dash-card-head">
                  <div>
                    <h2 id="equipe-titulo">Desempenho da equipe</h2>
                    <p>Produtividade por analista</p>
                  </div>
                  <Link className="dash-linkish" to="/analysts">
                    Ver equipe
                  </Link>
                </div>
                <ul className="dash-team">
                  {analysts.length === 0 && (
                    <li className="dash-note">Nenhum analista encontrado.</li>
                  )}
                  {analysts.map((member) => (
                    <li className="dash-member" key={member.id}>
                      <span className="dash-member-avatar" style={{ background: member.color }}>
                        {member.initials}
                      </span>
                      <div className="dash-member-body">
                        <div className="dash-member-line">
                          <strong>{member.name}</strong>
                          <b>{member.percent}%</b>
                        </div>
                        <small>{member.done}</small>
                        <div className="dash-meter">
                          <span style={{ width: `${member.percent}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </section>
        </main>
      </div>

      <a className="dash-fab" href="mailto:suporte@ticketflow.com">
        <span aria-hidden="true">?</span>
        <span className="dash-sr">Falar com suporte</span>
      </a>
    </div>
  );
};

function QuickCard({ item, onSection, onNavigate }) {
  const Icon = item.icon;
  const content = (
    <>
      <span className={`dash-quick-icon ${item.tone}`}>
        <Icon />
      </span>
      <span className="dash-quick-copy">
        <strong>{item.title}</strong>
        <small>{item.text}</small>
      </span>
    </>
  );

  if (item.to) {
    return (
      <Link className="dash-quick-card" to={item.to} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="dash-quick-card" onClick={() => onSection(item.section)}>
      {content}
    </button>
  );
}

function Svg({ children, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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

function PlusIcon() {
  return (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function UserPlusIcon() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M19 8v6M16 11h6" />
    </Svg>
  );
}

function BadgeIcon() {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M13 11h5M13 14h3" />
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

function BellIcon() {
  return (
    <Svg>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg size={16}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
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

function EyeIcon() {
  return (
    <Svg size={16}>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg>
      <path d="M12 4l8 14H4L12 4z" />
      <path d="M12 10v4M12 16.5v.5" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
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

function MenuIcon() {
  return (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export default Home;
