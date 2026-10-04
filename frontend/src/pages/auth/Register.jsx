import { Link } from "react-router";

const Register = () => {
  return (
    <div>
      <button onClick={() => {}}>Registrar</button>
      <div>
        <small>
          Já possui uma conta? <Link to="/login">Faça login agora!</Link>
        </small>
      </div>
    </div>
  );
};

export default Register;
