const USER_KEY = "user";
const TOKEN_KEY = "token";
const REMEMBER_KEY = "remember";

function clearKeys(store) {
  store.removeItem(USER_KEY);
  store.removeItem(TOKEN_KEY);
}

export function saveSession(user, remember) {
  clearKeys(localStorage);
  clearKeys(sessionStorage);
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");

  const store = remember ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
  store.setItem(TOKEN_KEY, user.token);
}

export function loadSession() {
  const stores = [sessionStorage, localStorage];

  for (const store of stores) {
    const token = store.getItem(TOKEN_KEY);
    const rawUser = store.getItem(USER_KEY);
    if (!token || !rawUser) continue;

    try {
      const user = JSON.parse(rawUser);
      return { ...user, token: user.token || token };
    } catch {
      clearKeys(store);
    }
  }

  return null;
}

export function clearSession() {
  clearKeys(localStorage);
  clearKeys(sessionStorage);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function remembered() {
  return localStorage.getItem(REMEMBER_KEY) === "1";
}
