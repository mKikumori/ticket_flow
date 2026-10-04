import { Link } from "react-router";

const Home = () => {
  return (
    <div>
      <button>
        <Link to={"/login"}>Login</Link>
      </button>
      <button>
        <Link to={"/register"}>Register</Link>
      </button>
      <button>
        <Link to={"/forgotpsw"}>ForgotPsw</Link>
      </button>
    </div>
  );
};
export default Home;
