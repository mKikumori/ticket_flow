import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

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
    <div>
      <form onSubmit={loginUser}>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={userData.email}
          onChange={changeInputHandler}
          autoFocus
          required
        />

        <input
          type="password"
          placeholder="Password"
          name="psw"
          value={userData.psw}
          onChange={changeInputHandler}
          required
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Login"}
        </button>
      </form>

      <div>
        <small>
          Ainda não possui uma conta?{" "}
          <Link to="/register">Crie uma agora!</Link>
        </small>
      </div>

      <div>
        <small>
          <Link to="/forgotpsw">Esqueci minha senha</Link>
        </small>
      </div>

      <button type="button" onClick={() => navigate("/")}>
        Home
      </button>
    </div>
  );
};

export default Login;
