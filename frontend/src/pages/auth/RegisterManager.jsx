import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

const RegisterManager = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
    cpf: "",
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
  const registerManager = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/auth/register_manager`,
        userData,
      );

      const newManager = await response.data;

      if (!newManager) {
        setError("Couldn't register Manager. Please try again");
      }

      navigate("/login");
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
        <Link to="/" className="brand-logo">
          <span>Ticket</span>
          <span>Flow</span>
        </Link>

        <div className="register-content">
          <div className="register-heading">
            <span className="register-label">TICKETFLOW PLATFORM</span>

            <h1 className="register-title">Registrar gerente</h1>

            <p className="register-subtitle">
              Crie uma conta de gerente para administrar a plataforma e
              gerenciar as equipes.
            </p>
          </div>

          <form className="register-form" onSubmit={registerManager}>
            <div className="form-field">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                placeholder="Digite seu nome"
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
                placeholder="Digite seu sobrenome"
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
                placeholder="seu@email.com"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                required
              />
            </div>

            <div className="form-field register-full-width">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                type="text"
                placeholder="00000000000"
                name="cpf"
                value={userData.cpf}
                onChange={changeInputHandler}
                inputMode="numeric"
                maxLength={11}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="psw">Senha</label>
              <input
                id="psw"
                type="password"
                placeholder="Digite sua senha"
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
                placeholder="Confirme sua senha"
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
              {loading ? "Registrando..." : "Registrar gerente"}
            </button>
          </form>

          <p className="register-login-text">
            Já possui uma conta? <Link to="/login">Faça login agora!</Link>
          </p>
        </div>

        <div className="aside-footer">
          <span>© {new Date().getFullYear()} TicketFlow</span>
          <span>Licenças de uso · Aviso de privacidade</span>
        </div>
      </section>

      <aside className="register-aside">
        <div className="aside-copy">
          <span className="aside-label">GESTÃO E CONTROLE</span>

          <h2>
            Gerencie sua equipe com <span>eficiência.</span>
          </h2>

          <p>
            Centralize solicitações, acompanhe chamados e mantenha sua equipe
            conectada em um único ambiente.
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

export default RegisterManager;
