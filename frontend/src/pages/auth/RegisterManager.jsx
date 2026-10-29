import { Link, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

const RegisterManager = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    psw: "",
    cpf: "",
    profile_img: "",
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
    <div>
      <form onSubmit={registerManager}>
        <input
          type="text"
          placeholder="Nome"
          name="name"
          value={userData.name}
          onChange={changeInputHandler}
          autoFocus
        />
        <input
          type="text"
          placeholder="Sobrenome"
          name="last_name"
          value={userData.last_name}
          onChange={changeInputHandler}
          autoFocus
        />
        <input
          type="text"
          placeholder="Email"
          name="email"
          value={userData.email}
          onChange={changeInputHandler}
        />
        <input
          type="password"
          placeholder="Password"
          name="psw"
          value={userData.psw}
          onChange={changeInputHandler}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name="psw2"
          value={userData.psw2}
          onChange={changeInputHandler}
        />
        <input
          type="text"
          placeholder="CPF"
          name="cpf"
          value={userData.cpf}
          onChange={changeInputHandler}
        />
        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
      <div>
        <small>
          Já possui uma conta? <Link to="/login">Faça login agora!</Link>
        </small>
      </div>
    </div>
  );
};

export default RegisterManager;
