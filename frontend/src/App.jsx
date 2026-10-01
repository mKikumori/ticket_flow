import { Route, Routes } from "react-router";
import Register from "./pages/auth/Register";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
