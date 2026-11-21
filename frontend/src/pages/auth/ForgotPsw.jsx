import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import AuthHero from "../../components/AuthHero";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;

const emptyCode = () => Array.from({ length: CODE_LENGTH }, () => "");

const formatTime = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const ForgotPsw = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(emptyCode);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [alert, setAlert] = useState(null);
  const inputsRef = useRef([]);

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

  const openCodeStep = (message) => {
    setDigits(emptyCode());
    setSeconds(RESEND_SECONDS);
    setAlert({
      type: "success",
      title: "Código enviado",
      text: message,
    });
    setStep("code");
  };

  const sendResetEmail = async (event) => {
    event.preventDefault();
    setAlert(null);

    const normalized = email.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

    if (!emailIsValid) {
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text: "Informe um email válido para receber o código.",
      });
      return;
    }

    openCodeStep(`Enviamos um código de 6 dígitos para ${normalized}.`);

    try {
      await api.post(
        "/api/auth/forgot_password",
        { email: normalized },
        { timeout: 4000 },
      );
    } catch (err) {
      const status = err.response?.status;

      if (!err.response || status === 404) return;

      setStep("email");
      setAlert({
        type: "error",
        title: "Não foi possível enviar",
        text:
          err.response?.data?.message ||
          "Não foi possível enviar o código. Tente novamente.",
      });
    }
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
    setDigits(Array.from({ length: CODE_LENGTH }, (_, index) => pasted[index] || ""));
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
      text: `Enviamos um novo código para ${email.trim().toLowerCase()}.`,
    });
    inputsRef.current[0]?.focus();
  };

  const confirmCode = (event) => {
    event.preventDefault();
    const code = digits.join("");

    if (code.length < CODE_LENGTH) {
      setAlert({
        type: "error",
        title: "Código incompleto",
        text: "Digite os 6 dígitos enviados para o seu e-mail.",
      });
      return;
    }

    setAlert({
      type: "success",
      title: "Código confirmado",
      text: "Seu e-mail foi confirmado. Você já pode entrar na sua conta.",
    });
  };

  return (
    <main className="login-page">
      <AuthHero />

      <section className="login-panel" aria-label="Recuperação de senha">
        {step === "email" ? (
          <form className="login-form" onSubmit={sendResetEmail}>
            <p className="login-kicker">
              Ticket<span className="brand-flow">flow</span>
            </p>
            <h2>Recupere sua senha</h2>
            <p className="login-lead">
              Enviaremos um link de recuperação para seu e-mail
            </p>

            {alert && <AuthAlert alert={alert} />}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="login-input">
                <MailIcon />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button className="login-submit" type="submit">
              Enviar link de recuperação
              <ArrowIcon />
            </button>

            <p className="recover-login">
              Já possui uma conta? <Link to="/login">Fazer login</Link>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={confirmCode}>
            <p className="login-kicker">
              Ticket<span className="brand-flow">flow</span>
            </p>
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

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
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

export default ForgotPsw;
