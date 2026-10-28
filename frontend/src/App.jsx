import { Route, Routes } from "react-router";
import Register from "./pages/auth/RegisterUser";
import Home from "./pages/core/Home";
import Login from "./pages/auth/Login";
import ForgotPsw from "./pages/auth/ForgotPsw";
import CreateTicket from "./pages/core/CreateTicket";
import RegisterManager from "./pages/auth/RegisterManager";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpsw" element={<ForgotPsw />} />
        <Route path="/create_ticket" element={<CreateTicket />} />
        <Route path="/register_manager" element={<RegisterManager />} />
      </Routes>
    </div>
  );
};

export default App;
