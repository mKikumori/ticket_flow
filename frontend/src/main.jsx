import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import UserProvider from "./context/UserProvider.jsx";

const savedTheme = localStorage.getItem("ticketflow-theme");
document.documentElement.dataset.theme = savedTheme === "night" ? "night" : "day";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
);
