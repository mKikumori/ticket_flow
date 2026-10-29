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
      <button>
        <Link to={"/create_ticket"}>Create Ticket</Link>
      </button>
      <button>
        <Link to={"/register_manager"}>Register Manager</Link>
      </button>
      <button>
        <Link to={"/register_analyst"}>Register Analyst</Link>
      </button>
    </div>
  );
};
export default Home;
