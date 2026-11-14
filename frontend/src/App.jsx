import { Route, Routes } from "react-router";
import Register from "./pages/auth/RegisterUser";
import Home from "./pages/core/Home";
import Login from "./pages/auth/Login";
import ForgotPsw from "./pages/auth/ForgotPsw";
import CreateTicket from "./pages/core/CreateTicket";
import RegisterManager from "./pages/auth/RegisterManager";
import RegisterAnalyst from "./pages/auth/RegisterAnalyst";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/core/Profile";
import Analysts from "./pages/core/Analysts";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpsw" element={<ForgotPsw />} />
        <Route path="/create_ticket" element={<CreateTicket />} />
        <Route path="/register_manager" element={<RegisterManager />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analysts" element={<Analysts />} />

        {/* Manager-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/register_analyst" element={<RegisterAnalyst />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
