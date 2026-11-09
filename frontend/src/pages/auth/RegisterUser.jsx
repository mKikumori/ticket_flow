import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
    cpf: "",
    department: "",
    name: "",
    last_name: "",
    phone: "",
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
  const registerUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/auth/register`,
        userData,
      );

      const newUser = await response.data;

      if (!newUser) {
        setError("Couldn't register User. Please try again");
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
      {/* LEFT PANEL */}
      <section className="register-main" aria-label="Cadastro de usuário">
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

        <div className="register-content">
          {/* Logo */}
          <h1 className="brand-logo" aria-label="TicketFlow">
            <span>Ticket</span>
            <span>Flow</span>
          </h1>

          <h2 className="register-title">Criar conta</h2>

          <p className="register-subtitle">
            Preencha seus dados para acessar o TicketFlow.
          </p>

          {/* Register Form */}
          <form className="register-form" onSubmit={registerUser}>
            {/* First Name */}
            <div className="form-field">
              <label htmlFor="register-name">Nome</label>

              <input
                id="register-name"
                type="text"
                placeholder="Nome"
                name="name"
                value={userData.name}
                onChange={changeInputHandler}
                autoFocus
                required
              />
            </div>

            {/* Last Name */}
            <div className="form-field">
              <label htmlFor="register-last-name">Sobrenome</label>

              <input
                id="register-last-name"
                type="text"
                placeholder="Sobrenome"
                name="last_name"
                value={userData.last_name}
                onChange={changeInputHandler}
                required
              />
            </div>

            {/* Email */}
            <div className="form-field register-full-width">
              <label htmlFor="register-email">E-mail</label>

              <input
                id="register-email"
                type="email"
                placeholder="Email"
                name="email"
                value={userData.email}
                onChange={changeInputHandler}
                autoComplete="email"
                required
              />
            </div>

            {/* CPF */}
            <div className="form-field">
              <label htmlFor="register-cpf">CPF</label>

              <input
                id="register-cpf"
                type="text"
                placeholder="Somente números"
                name="cpf"
                value={userData.cpf}
                onChange={changeInputHandler}
                inputMode="numeric"
                maxLength={11}
                pattern="[0-9]{11}"
                title="O CPF deve conter 11 números."
                required
              />
            </div>

            {/* Phone */}
            <div className="form-field">
              <label htmlFor="register-phone">Número de celular</label>

              <input
                id="register-phone"
                type="tel"
                placeholder="Somente números"
                name="phone"
                value={userData.phone}
                onChange={changeInputHandler}
                inputMode="numeric"
                maxLength={11}
                pattern="[0-9]{11}"
                title="O telefone deve conter 11 números."
                required
              />
            </div>

            {/* Department */}
            <div className="form-field register-full-width">
              <label htmlFor="register-department">Departamento</label>

              <select
                id="register-department"
                name="department"
                value={userData.department}
                onChange={changeInputHandler}
                required
              >
                <option value="" disabled>
                  Selecione seu departamento
                </option>

                <option value="Comercial">Comercial</option>

                <option value="Marketing">Marketing</option>

                <option value="Facilities">Facilities</option>

                <option value="Engenharia">Engenharia</option>

                <option value="Financeiro">Financeiro</option>

                <option value="Fiscal">Fiscal</option>

                <option value="Legal">Legal</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-field">
              <label htmlFor="register-password">Senha</label>

              <input
                id="register-password"
                type="password"
                placeholder="Senha"
                name="psw"
                value={userData.psw}
                onChange={changeInputHandler}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label htmlFor="register-password-confirm">Confirmar senha</label>

              <input
                id="register-password-confirm"
                type="password"
                placeholder="Confirme sua senha"
                name="psw2"
                value={userData.psw2}
                onChange={changeInputHandler}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p className="register-error register-full-width" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              className="register-submit register-full-width"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Criar conta"}
            </button>

            {/* Login */}
            <p className="register-login-text register-full-width">
              Já possui uma conta? <Link to="/login">Faça login aqui.</Link>
            </p>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <aside className="register-aside">
        <div className="aside-copy">
          <h2>Bem-vindo ao TicketFlow</h2>

          <p>
            Organize, acompanhe e gerencie solicitações de suporte em um único
            lugar. Simplifique a comunicação entre equipes e acompanhe cada
            chamado com facilidade.
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

export default Register;
