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
    profile_img: "",
    name: "",
    last_name: "",
    phone: "",
    psw2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

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
    <div>
      <form onSubmit={registerUser}>
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
        <input
          type="text"
          placeholder="Departamento"
          name="department"
          value={userData.department}
          onChange={changeInputHandler}
        />
        <input
          type="text"
          placeholder="Número de Celular"
          name="phone"
          value={userData.phone}
          onChange={changeInputHandler}
        />
        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Registrar"}
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

export default Register;
