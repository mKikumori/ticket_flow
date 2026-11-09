import { Link, useNavigate } from "react-router";
import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle and store the user's inputs
  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // function to login the user
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

      // Salva o JWT no localStorage
      localStorage.setItem("token", token);

      // Salva os dados básicos do usuário em localStorage
      localStorage.setItem("user", JSON.stringify({ id, name }));

      setCurrentUser({
        id: response.data.id,
        name: response.data.name,
        token: response.data.token,
        role: response.data.role,
      });

      // retorne automaticamente para a pagina Home
      navigate("/");
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
      {/* LEFT PANEL */}
      <section className="login-main" aria-label="Acesso à plataforma">
        {/* Language */}
        <button
          className="language-button"
          type="button"
          aria-label="Idioma: português"
          title="Português"
        >
          <span role="img" aria-label="Brasil">
            🇧🇷
          </span>
        </button>

        <div className="login-content">
          {/* Logo */}
          <h1 className="brand-logo" aria-label="TicketFlow">
            <span>Ticket</span>
            <span>Flow</span>
          </h1>

          {/* Login Form */}
          <form className="login-form" onSubmit={loginUser}>
            {/* Email */}
            <div className="form-field">
              <label htmlFor="login-email">Insira seu e-mail:</label>

              <input
                id="login-email"
                type="email"
                placeholder="Email"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="login-password">Insira sua senha:</label>

              <input
                id="login-password"
                type="password"
                placeholder="Senha"
                name="psw"
                value={userData.psw}
                onChange={changeInputHandler}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Forgot Password */}
            <Link className="forgot-password" to="/forgotpsw">
              Esqueceu a senha?
            </Link>

            {/* Error */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {/* Register */}
            <Link className="register-link" to="/register">
              Registre-se aqui
            </Link>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="login-aside">
        <div className="aside-copy">
          <h2>Lorem Ipsum</h2>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            tincidunt quis ipsum ut lacinia. Praesent viverra in tortor
            vestibulum vulputate.
          </p>
        </div>

        {/* Footer */}
        <footer className="aside-footer">
          <Link to="/terms">Licenças de uso</Link>

          <Link to="/privacy">Aviso de privacidade</Link>
        </footer>
      </aside>
    </main>
  );
};

export default Login;
