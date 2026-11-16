import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import { getToken } from "../../services/session";
import ThemeToggle from "./ThemeToggle";
import "./Home.css";
import "./Tickets.css";
import "./CreateTicket.css";

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

const PROBLEMS = Array.from({ length: 8 }, (_, index) => `Problema ${index + 1}`);

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TF";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const CreateTicket = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [ticketData, setTicketData] = useState({
    title: "",
    problem_type: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser?.token && !getToken()) {
    return <Navigate to="/login" replace />;
  }

  const roleLabel = ROLE_LABEL[currentUser?.role] || "Usuário";
  const displayName = currentUser?.name || "Usuário";

  const changeInputHandler = (event) => {
    const { name, value } = event.target;
    setTicketData((previous) => ({ ...previous, [name]: value }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const createTicket = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!getToken()) {
      setError("Você precisa fazer login antes de criar um chamado.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/ticket/createTicket", ticketData);
      setSuccess("Chamado criado com sucesso!");
      setTicketData({ title: "", problem_type: "", description: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Não foi possível criar o chamado. Tente novamente."),
      );
    } finally {
      setLoading(false);
    }
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
          <Link className="dash-nav-item" to="/tickets">
            <TicketIcon />
            Tickets
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
        </div>
      </aside>

      <div className="dash-shell">
        <header className="dash-top">
          <button type="button" className="dash-burger" aria-label="Abrir menu" onClick={() => setSideOpen(true)}>
            <MenuIcon />
          </button>
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
          <div className="create-head">
            <div>
              <p className="dash-kicker">Novo atendimento</p>
              <h1>Criar chamado</h1>
              <p className="dash-lead">Descreva o problema para a equipe analisar e oferecer suporte.</p>
            </div>
            <Link className="create-back" to="/tickets">
              Ver tickets
            </Link>
          </div>

          <section className="dash-card create-card">
            {success && (
              <div className="create-success" role="status">
                <span aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <strong>{success}</strong>
                  <p>O chamado já pode ser acompanhado na lista de tickets.</p>
                </div>
              </div>
            )}

            <form className="tickets-form create-form" onSubmit={createTicket}>
              <label>
                Título do chamado
                <input
                  id="title"
                  name="title"
                  placeholder="Ex: Problema ao acessar o sistema"
                  value={ticketData.title}
                  onChange={changeInputHandler}
                  maxLength={120}
                  required
                />
              </label>
              <label>
                Tipo de problema
                <select
                  id="problem_type"
                  name="problem_type"
                  value={ticketData.problem_type}
                  onChange={changeInputHandler}
                  required
                >
                  <option value="" disabled>
                    Selecione o tipo de problema
                  </option>
                  {PROBLEMS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="is-wide">
                Descrição
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Descreva detalhadamente o problema encontrado..."
                  value={ticketData.description}
                  onChange={changeInputHandler}
                  required
                />
              </label>
              {error && (
                <p className="create-error is-wide" role="alert">
                  {String(error)}
                </p>
              )}
              <div className="tickets-form-actions">
                <button type="submit" className="is-primary" disabled={loading}>
                  {loading ? "Criando chamado..." : "Criar chamado"}
                </button>
                <Link to="/home">Cancelar</Link>
              </div>
            </form>
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

export default CreateTicket;
