import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import AuthHero from "../../components/AuthHero";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;

const emptyCode = () => Array.from({ length: CODE_LENGTH }, () => "");

const formatTime = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", email: "", psw: "" });
  const [digits, setDigits] = useState(emptyCode);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [alert, setAlert] = useState(null);
  const inputsRef = useRef([]);
  const redirectRef = useRef(null);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return undefined;

    const timer = setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "code") {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    return () => clearTimeout(redirectRef.current);
  }, []);

  const changeInput = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const createAccount = (event) => {
    event.preventDefault();
    setAlert(null);

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2) {
      setAlert({
        type: "error",
        title: "Não foi possível criar a conta",
        text: "Informe seu nome completo.",
      });
      return;
    }

    if (!emailIsValid) {
      setAlert({
        type: "error",
        title: "Não foi possível criar a conta",
        text: "Informe um email válido.",
      });
      return;
    }

    if (form.psw.trim().length < 6) {
      setAlert({
        type: "error",
        title: "Não foi possível criar a conta",
        text: "A senha precisa ter pelo menos 6 caracteres.",
      });
      return;
    }

    setDigits(emptyCode());
    setSeconds(RESEND_SECONDS);
    setAlert({
      type: "success",
      title: "Código enviado",
      text: `Enviamos um código de 6 dígitos para ${email}.`,
    });
    setStep("code");
  };

  const changeDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const pasteCode = (event) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    event.preventDefault();
    setDigits(
      Array.from({ length: CODE_LENGTH }, (_, index) => pasted[index] || ""),
    );
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const onDigitKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const resendCode = () => {
    if (seconds > 0) return;

    setDigits(emptyCode());
    setSeconds(RESEND_SECONDS);
    setAlert({
      type: "success",
      title: "Código reenviado",
      text: `Enviamos um novo código para ${form.email.trim().toLowerCase()}.`,
    });
    inputsRef.current[0]?.focus();
  };

  const confirmCode = (event) => {
    event.preventDefault();

    if (digits.join("").length < CODE_LENGTH) {
      setAlert({
        type: "error",
        title: "Não foi possível criar a conta",
        text: "O código está incompleto. Confira os 6 dígitos e tente de novo.",
      });
      return;
    }

    setAlert({
      type: "success",
      title: "Conta criada",
      text: "Sua conta foi criada com sucesso. Vamos te levar para o login.",
    });

    redirectRef.current = setTimeout(() => navigate("/login"), 1400);
  };

  return (
    <main className="login-page">
      <AuthHero />

      <section className="login-panel register-panel" aria-label="Criar conta">
        {step === "form" ? (
          <form className="login-form" onSubmit={createAccount}>
            <p className="login-kicker">Ticketflow</p>
            <h2>Crie sua conta</h2>
            <p className="login-lead">
              Abra e acompanhe seus chamados em um só lugar
            </p>

            {alert && <AuthAlert alert={alert} />}

            <div className="form-field">
              <label htmlFor="register-name">Nome completo</label>
              <div className="login-input">
                <UserIcon />
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Como podemos chamar você?"
                  value={form.name}
                  onChange={changeInput}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="register-email">Email</label>
              <div className="login-input">
                <MailIcon />
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="voce@empresa.com"
                  value={form.email}
                  onChange={changeInput}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="register-password">Senha</label>
              <div className="login-input">
                <LockIcon />
                <input
                  id="register-password"
                  type="password"
                  name="psw"
                  placeholder="••••••••"
                  value={form.psw}
                  onChange={changeInput}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button className="login-submit" type="submit">
              Criar minha conta
              <ArrowIcon />
            </button>

            <div className="login-divider">
              <span>ou</span>
            </div>

            <Link className="login-create" to="/register_manager">
              <UserIcon />
              Sou gestor de uma equipe
            </Link>

            <p className="recover-login">
              Já possui uma conta? <Link to="/login">Fazer login</Link>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={confirmCode}>
            <p className="login-kicker">Ticketflow</p>
            <h2>Confirme seu e-mail</h2>
            <p className="login-lead">
              Enviamos um código de 6 dígitos para seu e-mail
            </p>

            {alert && <AuthAlert alert={alert} />}

            <div className="recover-codes">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Dígito ${index + 1}`}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => changeDigit(index, event.target.value)}
                  onKeyDown={(event) => onDigitKeyDown(index, event)}
                  onPaste={pasteCode}
                />
              ))}
            </div>

            <p className="recover-resend">
              Não recebeu?{" "}
              <button type="button" onClick={resendCode} disabled={seconds > 0}>
                Reenviar código
              </button>
              {seconds > 0 && <span> em {formatTime(seconds)}</span>}
            </p>

            <button className="login-submit" type="submit">
              Confirmar cadastro
              <ArrowIcon />
            </button>

            <p className="recover-login">
              Já possui uma conta? <Link to="/login">Fazer login</Link>
            </p>
          </form>
        )}
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

export default Register;
