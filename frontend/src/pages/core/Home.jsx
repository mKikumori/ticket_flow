import { Link } from "react-router";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

const Home = () => {
  const { currentUser } = useContext(UserContext);

  const menuItems = [
    {
      title: "Login",
      description: "Acesse sua conta no TicketFlow.",
      path: "/login",
      icon: "🔐",
    },
    {
      title: "Registrar usuário",
      description: "Crie uma nova conta na plataforma.",
      path: "/register",
      icon: "👤",
    },
    {
      title: "Recuperar senha",
      description: "Recupere o acesso à sua conta.",
      path: "/forgotpsw",
      icon: "🔑",
    },
    {
      title: "Criar chamado",
      description: "Registre uma nova solicitação de suporte.",
      path: "/create_ticket",
      icon: "🎫",
    },
    {
      title: "Registrar gerente",
      description: "Cadastre um novo gerente.",
      path: "/register_manager",
      icon: "👔",
    },
    {
      title: "Registrar analista",
      description: "Cadastre um novo analista.",
      path: "/register_analyst",
      icon: "💻",
    },
    {
      title: "Perfil",
      description: "Veja o seu Perfil.",
      path: "/profile",
    },
  ];

  return (
    <main className="home-page">
      {/* HEADER */}
      <header className="home-header">
        <Link to="/" className="home-logo">
          <span>Ticket</span>
          <span>Flow</span>
        </Link>

        <nav className="home-header-nav">
          {currentUser ? (
            <>
              <span className="home-user-name">Olá, {currentUser.name}</span>

              <button
                className="home-logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="home-login-link">
              Entrar
            </Link>
          )}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <section className="home-content">
        <div className="home-welcome">
          <span className="home-label">TICKETFLOW PLATFORM</span>

          <h1>
            Bem-vindo ao <span>TicketFlow</span>
          </h1>

          <p>
            Gerencie solicitações, acompanhe chamados e simplifique a
            comunicação entre equipes em uma única plataforma.
          </p>
        </div>

        {/* MENU CARDS */}
        <div className="home-section">
          <div className="home-section-header">
            <h2>Acesso rápido</h2>

            <p>Selecione uma funcionalidade para continuar.</p>
          </div>

          <div className="home-grid">
            {menuItems.map((item) => (
              <Link to={item.path} className="home-card" key={item.path}>
                <div className="home-card-icon">{item.icon}</div>

                <div className="home-card-content">
                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                </div>

                <span className="home-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <span>© {new Date().getFullYear()} TicketFlow</span>

        <div>
          <Link to="/terms">Licenças de uso</Link>

          <Link to="/privacy">Aviso de privacidade</Link>
        </div>
      </footer>
    </main>
  );
};

export default Home;
