import { Link, useNavigate } from "react-router";
import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import AuthHero from "../../components/AuthHero";

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
  });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/auth/login`,
        userData,
      );

      const { token, id, name } = response.data;

      if (!token) {
        throw new Error("O servidor não retornou um token de autenticação.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, name }));

      setCurrentUser({
        id: response.data.id,
        name: response.data.name,
        token: response.data.token,
        role: response.data.role,
      });

      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <AuthHero />

      <section className="login-panel" aria-label="Acesso à plataforma">
        <form className="login-form" onSubmit={loginUser}>
          <p className="login-kicker">Ticketflow</p>
          <h2>Bem-vindo ao TicketFlow</h2>
          <p className="login-lead">
            Entre para acompanhar chamados e resolver com o seu time.
          </p>

          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <div className="login-input">
              <MailIcon />
              <input
                id="login-email"
                type="email"
                placeholder="voce@empresa.com"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <div className="login-input">
              <LockIcon />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                name="psw"
                value={userData.psw}
                onChange={changeInputHandler}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Manter conectado
            </label>
            <Link to="/forgotpsw">Esqueci minha senha</Link>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar na plataforma"}
            {!loading && <ArrowIcon />}
          </button>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <Link className="login-create" to="/register">
            <UserIcon />
            Criar conta de usuário
          </Link>
        </form>

        <p className="login-help">
          Precisa de ajuda para acessar?{" "}
          <a href="mailto:suporte@ticketflow.com">Falar com o suporte</a>
        </p>
      </section>
    </main>
  );
};

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

export default Login;
