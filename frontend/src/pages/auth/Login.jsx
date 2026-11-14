import { Link, useNavigate } from "react-router";
import { useState, useContext } from "react";
import { api } from "../../services/api";
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
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    setError("");
    if (e.target.name === "email") setEmailError("");
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");

    const email = userData.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setEmailError("Informe um email válido, no formato nome@empresa.com.");
      return;
    }

    setEmailError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", userData);

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
      const message = err.response?.data?.message;

      if (message === "Invalid email or password") {
        setError("O email ou a senha estão incorretos. Confira os dados e tente novamente.");
      } else if (message === "Fill in all fields") {
        setError("Preencha o email e a senha para continuar.");
      } else {
        setError(message || "Não foi possível entrar agora. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <AuthHero />

      <section className="login-panel" aria-label="Acesso à plataforma">
        <form className="login-form" onSubmit={loginUser} noValidate>
          <p className="login-kicker">
            Ticket<span className="brand-flow">flow</span>
          </p>
          <h2>
            Bem-vindo ao Ticket<span className="brand-flow">Flow</span>
          </h2>
          <p className="login-lead">
            Entre para acompanhar chamados e resolver com o seu time.
          </p>

          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <div className={`login-input${emailError ? " is-invalid" : ""}`}>
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
                aria-invalid={emailError ? "true" : "false"}
                aria-describedby={emailError ? "login-email-error" : undefined}
              />
            </div>
            {emailError && (
              <p className="field-warning" id="login-email-error" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <div className="login-input">
              <LockIcon />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                name="psw"
                value={userData.psw}
                onChange={changeInputHandler}
                autoComplete="current-password"
                required
              />
              <button
                className="login-reveal"
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
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
            <div className="login-error" role="alert">
              <span className="login-error-icon" aria-hidden="true">
                <AlertIcon />
              </span>
              <span>
                <strong>Não foi possível entrar</strong>
                {error}
              </span>
            </div>
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

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16.5h.01" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 3l18 18" />
    <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a18.4 18.4 0 0 1-4.1 4.6" />
    <path d="M6.1 6.7C3.6 8.3 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8" />
    <path d="M9.9 9.9a2.5 2.5 0 0 0 3.2 3.2" />
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
