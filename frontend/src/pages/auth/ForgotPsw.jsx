import { Link } from "react-router";
import { useState } from "react";
//import axios from "axios";

const ForgotPsw = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Informe seu endereço de email.");
      return;
    }

    setLoading(true);

    try {
      /*await axios.post(
        "http://localhost:5001/api/auth/forgot_password",
        { email: email.trim().toLowerCase() },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );*/

      setSuccess(
        "Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      );

      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Não foi possível enviar o email. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
      <section className="forgot-main">
        <Link to="/" className="brand-logo">
          <span>Ticket</span>
          <span>Flow</span>
        </Link>

        <div className="forgot-content">
          <div className="forgot-icon">
            <span>🔑</span>
          </div>

          <div className="forgot-heading">
            <span className="forgot-label">RECUPERAÇÃO DE CONTA</span>

            <h1>
              Esqueceu sua <span>senha?</span>
            </h1>

            <p>
              Não se preocupe! Informe o email associado à sua conta e
              enviaremos instruções para redefinir sua senha.
            </p>
          </div>

          <form className="forgot-form" onSubmit={sendResetEmail}>
            <div className="form-field">
              <label htmlFor="email">Endereço de email</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="forgot-message forgot-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="forgot-message forgot-success" role="status">
                {success}
              </p>
            )}

            <button type="submit" className="forgot-submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar email"}
            </button>
          </form>

          <Link to="/login" className="forgot-back-link">
            <span>←</span> Retornar ao Login
          </Link>
        </div>

        <div className="aside-footer">
          <span>© {new Date().getFullYear()} TicketFlow</span>
          <span>Licenças de uso · Aviso de privacidade</span>
        </div>
      </section>

      <aside className="forgot-aside">
        <div className="aside-copy">
          <span className="aside-label">RECUPERE SEU ACESSO</span>

          <h2>
            Sua conta está a apenas alguns passos de ser{" "}
            <span>recuperada.</span>
          </h2>

          <p>
            Siga as instruções enviadas para seu email e volte a acompanhar seus
            chamados no TicketFlow.
          </p>
        </div>

        <div className="aside-decoration">
          <div className="decoration-circle decoration-circle-one"></div>
          <div className="decoration-circle decoration-circle-two"></div>
          <div className="decoration-circle decoration-circle-three"></div>
        </div>
      </aside>
    </main>
  );
};

export default ForgotPsw;
