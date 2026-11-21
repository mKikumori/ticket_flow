import { useNavigate } from "react-router";
import AnalystModal from "../core/AnalystModal";
import "../core/Home.css";

const RegisterAnalyst = () => {
  const navigate = useNavigate();

  return <AnalystModal onClose={() => navigate("/analysts")} />;
};

export default RegisterAnalyst;
