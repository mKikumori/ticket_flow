import { Link } from "react-router";
import { useState } from "react";
import AuthHero from "../../components/AuthHero";

const RegisterManager = () => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    psw: "",
  });
  const [alert, setAlert] = useState(null);
  const [sent, setSent] = useState(false);

  const changeInput = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const requestApproval = (event) => {
    event.preventDefault();

    if (sent) return;

    const name = form.name.trim();
    const company = form.company.trim();
    const email = form.email.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2) {
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text: "Informe seu nome completo.",
      });
      return;
    }

    if (company.length < 2) {
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text: "Informe o nome da empresa.",
      });
      return;
    }

    if (!emailIsValid) {
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text: "Informe um email válido.",
      });
      return;
    }

    if (form.psw.trim().length < 6) {
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text: "A senha precisa ter pelo menos 6 caracteres.",
      });
      return;
    }

    setSent(true);
    setAlert({
      type: "success",
      title: "Solicitação enviada",
      text: "Seu pedido foi enviado para um administrador. A conta de gestor só é criada depois da aprovação.",
    });
  };

  return (
    <main className="login-page">
      <AuthHero />

      <section className="login-panel register-panel" aria-label="Cadastro de gestor">
        <form className="login-form" onSubmit={requestApproval}>
          <p className="login-kicker">
            Ticket<span className="brand-flow">flow</span>
          </p>
          <h2>Cadastre sua empresa</h2>
          <p className="login-lead">Configure o acesso gerencial do seu time</p>

          {alert && <AuthAlert alert={alert} />}

          <div className="form-field">
            <label htmlFor="manager-name">Nome completo</label>
            <div className="login-input">
              <UserIcon />
              <input
                id="manager-name"
                type="text"
                name="name"
                placeholder="Como podemos chamar você?"
                value={form.name}
                onChange={changeInput}
                autoComplete="name"
                autoFocus
                disabled={sent}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="manager-company">Empresa</label>
            <div className="login-input">
              <BuildingIcon />
              <input
                id="manager-company"
                type="text"
                name="company"
                placeholder="Nome da sua empresa"
                value={form.company}
                onChange={changeInput}
                autoComplete="organization"
                disabled={sent}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="manager-email">Email</label>
            <div className="login-input">
              <MailIcon />
              <input
                id="manager-email"
                type="email"
                name="email"
                placeholder="voce@empresa.com"
                value={form.email}
                onChange={changeInput}
                autoComplete="email"
                disabled={sent}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="manager-password">Senha</label>
            <div className="login-input">
              <LockIcon />
              <input
                id="manager-password"
                type="password"
                name="psw"
                placeholder="••••••••"
                value={form.psw}
                onChange={changeInput}
                autoComplete="new-password"
                disabled={sent}
              />
            </div>
          </div>

          <button className="login-submit" type="submit" disabled={sent}>
            {sent ? "Solicitação enviada" : "Criar minha conta"}
            {!sent && <ArrowIcon />}
          </button>

          <p className="register-note">
            A conta de gestor só é liberada depois que um administrador aprovar
            a solicitação.
          </p>

          <p className="recover-login">
            Já possui uma conta? <Link to="/login">Fazer login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

const AuthAlert = ({ alert }) => {
  const isError = alert.type === "error";

  return (
    <div
      className={`auth-alert auth-alert-${alert.type}`}
      role={isError ? "alert" : "status"}
    >
      <span className="auth-alert-icon" aria-hidden="true">
        {isError ? <ErrorIcon /> : <CheckIcon />}
      </span>
      <div>
        <strong>{alert.title}</strong>
        <p>{alert.text}</p>
      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20.5h16" />
    <path d="M6.5 20.5V7.2c0-.7.6-1.2 1.2-1.2h8.6c.6 0 1.2.5 1.2 1.2v13.3" />
    <path d="M10 9.5h.01M14 9.5h.01M10 13h.01M14 13h.01M10 16.5h4v4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.5 12.5 10 16l7.5-8" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 8l8 8M16 8l-8 8" />
  </svg>
);

export default RegisterManager;
