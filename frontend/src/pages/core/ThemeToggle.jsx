import { useState } from "react";

function Icon({ children }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "night" ? "night" : "day",
  );

  const toggleTheme = () => {
    const next = theme === "night" ? "day" : "night";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ticketflow-theme", next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="dash-icon-btn"
      aria-label={theme === "night" ? "Ativar modo dia" : "Ativar modo noturno"}
      aria-pressed={theme === "night"}
      onClick={toggleTheme}
    >
      {theme === "night" ? (
        <Icon>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </Icon>
      ) : (
        <Icon>
          <path d="M16 13.5A6.5 6.5 0 0 1 9.2 5 6.5 6.5 0 1 0 16 13.5z" />
        </Icon>
      )}
    </button>
  );
}
