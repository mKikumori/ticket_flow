import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { clearSession, loadSession, saveSession } from "../services/session";

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload.exp) return true;

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = loadSession();

    if (!user?.token || isTokenExpired(user.token)) {
      clearSession();
      return null;
    }

    return user;
  });

  useEffect(() => {
    if (currentUser === null) {
      clearSession();
      return;
    }

    saveSession(currentUser, localStorage.getItem("remember") !== "0");
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
