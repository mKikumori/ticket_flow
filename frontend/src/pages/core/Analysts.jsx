import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import "./Home.css";
import "./Analysts.css";

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

const FILTERS = [
  { id: "all", label: "Todos os analistas" },
  { id: "Ativo", label: "Ativos" },
  { id: "Inativo", label: "Inativos" },
];

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AN";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDuration(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}min`;
  return `${hours}h ${rest}min`;
}

function formatAverage(value) {
  if (!Number.isFinite(value)) return "0";
  return value.toFixed(1).replace(".", ",");
}

const Analysts = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.token) return undefined;
    let active = true;

    api
      .get("/api/analysts")
      .then((response) => {
        if (!active) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setPeople(
          list.map((person) => {
            const name = [person.name, person.last_name].filter(Boolean).join(" ");
            return {
              id: person.id || person.email,
              name: name || "Analista",
              email: person.email || "",
              assigned: person.assigned ?? 0,
              resolved: person.resolved ?? 0,
              averageMinutes: person.average_minutes ?? 0,
              percent: person.percent ?? 0,
              status: person.status || "Ativo",
              color: person.color || "#3b82f6",
              initials: initials(name),
            };
          }),
        );
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || "Não foi possível carregar a equipe.");
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
    return people.filter((person) => {
      const matchesFilter = filter === "all" || person.status === filter;
      const matchesQuery =
        !term ||
        person.name.toLowerCase().includes(term) ||
        person.email.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [people, query, filter]);

  const summary = useMemo(() => {
    const totalAssigned = people.reduce((sum, person) => sum + person.assigned, 0);
    const totalResolved = people.reduce((sum, person) => sum + person.resolved, 0);
    const totalMinutes = people.reduce((sum, person) => sum + person.averageMinutes, 0);
    const active = people.filter((person) => person.status === "Ativo").length;

    return {
      active,
      online: people.length > 0 && active === people.length,
      ticketsAverage: people.length ? totalAssigned / people.length : 0,
      resolution: totalAssigned ? Math.round((totalResolved / totalAssigned) * 100) : 0,
      averageMinutes: people.length ? Math.round(totalMinutes / people.length) : 0,
    };
  }, [people]);

  if (!currentUser?.token) {
    return <Navigate to="/login" replace />;
  }

  const roleLabel = ROLE_LABEL[currentUser.role] || "Usuário";
  const displayName = currentUser.name || "Usuário";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
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
          <Link className="dash-nav-item" to="/home">
            <TicketIcon />
            Tickets
          </Link>
          <Link className="dash-nav-item is-active" to="/analysts" aria-current="page">
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
              value={query}
              placeholder="Buscar analista por nome ou e-mail..."
              aria-label="Buscar analista por nome ou e-mail"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="dash-actions">
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
          <div className="team-heading">
            <div>
              <p className="dash-kicker">Gestão de equipe</p>
              <h1>
                Analistas<span className="dash-dot-title">.</span>
              </h1>
              <p className="dash-lead">Gerencie sua equipe e acompanhe os indicadores individuais.</p>
              {error && <p className="dash-load-error">{error}</p>}
            </div>
            {currentUser.role === "manager" && (
              <Link className="team-add" to="/register_analyst">
                <PlusIcon />
                Adicionar analista
              </Link>
            )}
          </div>

          <section className="team-stats" aria-label="Indicadores da equipe">
            <article className="dash-stat">
              <p className="dash-stat-label">Analistas ativos</p>
              <strong>{loading ? "…" : summary.active}</strong>
              <p className="team-online">{summary.online ? "Todos online" : "Parte da equipe offline"}</p>
            </article>
            <article className="dash-stat">
              <p className="dash-stat-label">Tickets por analista</p>
              <strong>{loading ? "…" : formatAverage(summary.ticketsAverage)}</strong>
              <p className="team-muted">Média no período</p>
            </article>
            <article className="dash-stat">
              <p className="dash-stat-label">Taxa de resolução</p>
              <strong>{loading ? "…" : `${summary.resolution}%`}</strong>
              <p className="team-muted">Resolvidos sobre os atribuídos</p>
            </article>
            <article className="dash-stat">
              <p className="dash-stat-label">Tempo médio</p>
              <strong>{loading ? "…" : formatDuration(summary.averageMinutes)}</strong>
              <p className="team-muted">Média de atendimento</p>
            </article>
          </section>

          <section className="dash-card team-table-card" aria-labelledby="lista-analistas">
            <div className="team-toolbar">
              <label className="team-filter-search">
                <SearchIcon />
                <input
                  type="search"
                  value={query}
                  placeholder="Buscar analista por nome ou e-mail..."
                  aria-label="Filtrar analistas da tabela"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="team-select">
                <span className="dash-sr">Filtrar por status</span>
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  {FILTERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="dash-table-wrap">
              <table className="dash-table team-table">
                <caption id="lista-analistas" className="dash-sr">
                  Analistas da equipe
                </caption>
                <thead>
                  <tr>
                    <th>Analista</th>
                    <th>Tickets atribuídos</th>
                    <th>Resolvidos</th>
                    <th>Tempo médio</th>
                    <th>Desempenho</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && visible.length === 0 && (
                    <tr>
                      <td className="dash-empty" colSpan={6}>
                        Nenhum analista encontrado.
                      </td>
                    </tr>
                  )}
                  {visible.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <div className="team-person">
                          <span className="dash-member-avatar" style={{ background: person.color }}>
                            {person.initials}
                          </span>
                          <span>
                            <strong>{person.name}</strong>
                            <small>{person.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>{person.assigned}</td>
                      <td>{person.resolved}</td>
                      <td>{formatDuration(person.averageMinutes)}</td>
                      <td>
                        <div className="team-score">
                          <span className="dash-meter">
                            <span style={{ width: `${person.percent}%` }} />
                          </span>
                          <b>{person.percent}%</b>
                        </div>
                      </td>
                      <td>
                        <span className={person.status === "Ativo" ? "team-status is-on" : "team-status"}>
                          {person.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

function PlusIcon() {
  return (
    <Svg size={16}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export default Analysts;
