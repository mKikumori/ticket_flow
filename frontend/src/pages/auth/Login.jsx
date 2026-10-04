import { Link } from "react-router";

const Login = () => {
  return (
    <div>
      <button onClick={() => {}}>Login</button>
      <div>
        <small>
          Ainda não possui uma conta?
          <Link to="/register">Crie uma agora!</Link>
        </small>
      </div>
      <div>
        <small>
          <Link to="/forgotpsw">Esqueci minha senha</Link>
        </small>
      </div>
    </div>
  );
};
export default Login;
