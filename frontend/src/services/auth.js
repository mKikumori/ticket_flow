import { api } from "./api";
import { clearSession } from "./session";

export async function signOut() {
  try {
    await api.post("/api/auth/logout", null, { timeout: 4000 });
  } catch {
    // A sessão local encerra mesmo se a API não responder.
  }
  clearSession();
}
