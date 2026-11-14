import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { api } from "../../services/api";

const RegisterAnalyst = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
    name: "",
    last_name: "",
    psw2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle and save te user's input
  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // funciton to register the user
  const registerAnalyst = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/register_analyst", userData);

      const newManager = await response.data;

      if (!newManager) {
        setError("Couldn't register Analyst. Please try again");
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Não foi possível registrar.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="register-page">
      <section className="register-main">
        <Link to="/home" className="brand-logo">
          <span>Ticket</span>
          <span className="brand-flow">Flow</span>
        </Link>

        <div className="register-content">
          <div className="register-heading">
            <span className="register-label">
              TICKET<span className="brand-flow">FLOW</span> PLATFORM
            </span>

            <h1 className="register-title">Registrar analista</h1>

            <p className="register-subtitle">
              Cadastre um novo analista para integrar sua equipe de suporte e
              gerenciar os chamados da plataforma.
            </p>
          </div>

          <form className="register-form" onSubmit={registerAnalyst}>
            <div className="form-field">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                placeholder="Digite o nome"
                name="name"
                value={userData.name}
                onChange={changeInputHandler}
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="last_name">Sobrenome</label>
              <input
                id="last_name"
                type="text"
                placeholder="Digite o sobrenome"
                name="last_name"
                value={userData.last_name}
                onChange={changeInputHandler}
                required
              />
            </div>

            <div className="form-field register-full-width">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="analista@email.com"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="psw">Senha</label>
              <input
                id="psw"
                type="password"
                placeholder="Digite uma senha"
                name="psw"
                value={userData.psw}
                onChange={changeInputHandler}
                minLength={12}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="psw2">Confirmar senha</label>
              <input
                id="psw2"
                type="password"
                placeholder="Confirme a senha"
                name="psw2"
                value={userData.psw2}
                onChange={changeInputHandler}
                minLength={12}
                required
              />
            </div>

            {error && (
              <p className="register-error register-full-width">{error}</p>
            )}

            <button
              className="register-submit register-full-width"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar analista"}
            </button>
          </form>

          <p className="register-login-text">
            Já possui uma conta? <Link to="/login">Faça login agora!</Link>
          </p>
        </div>

        <div className="aside-footer">
          <span>
            © {new Date().getFullYear()} Ticket<span className="brand-flow">Flow</span>
          </span>
          <span>Licenças de uso · Aviso de privacidade</span>
        </div>
      </section>

      <aside className="register-aside">
        <div className="aside-copy">
          <span className="aside-label">EQUIPE DE SUPORTE</span>

          <h2>
            Uma equipe conectada resolve <span>mais.</span>
          </h2>

          <p>
            Adicione analistas à sua equipe e facilite o acompanhamento,
            atendimento e resolução de chamados.
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

export default RegisterAnalyst;
