import { useEffect, useState } from "react";
import { api } from "../../services/api";

const EMPTY = { name: "", last_name: "", email: "", psw: "", psw2: "" };

function validate(form) {
  const name = form.name.trim();
  const lastName = form.last_name.trim();
  const email = form.email.trim().toLowerCase();
  const letters = /^\p{L}+$/u;

  if (!letters.test(name)) return "O nome deve ter apenas letras.";
  if (!letters.test(lastName)) return "O sobrenome deve ter apenas letras.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um e-mail válido.";
  if (form.psw.length < 12 || form.psw.length > 128) {
    return "A senha precisa ter de 12 a 128 caracteres.";
  }
  if (!/[a-z]/.test(form.psw) || !/[A-Z]/.test(form.psw) || !/[0-9]/.test(form.psw) || !/[^a-zA-Z0-9]/.test(form.psw)) {
    return "A senha precisa de maiúscula, minúscula, número e símbolo.";
  }
  if (form.psw !== form.psw2) return "As senhas não coincidem.";
  return "";
}

function messageFrom(error) {
  const text = error.response?.data?.message || "";
  if (text === "Access denied") return "Só um gerente consegue concluir este cadastro.";
  if (text === "Email already exists") return "Este e-mail já está cadastrado.";
  if (text === "Passwords do not match") return "As senhas não coincidem.";
  return text || "Não foi possível cadastrar o analista.";
}

export default function AnalystModal({ onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/api/auth/register_analyst", {
        name: form.name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        psw: form.psw,
        psw2: form.psw2,
      });
      setDone(true);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="manager-backdrop" onClick={onClose}>
      <section
        className="manager-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-analista"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="manager-head">
          <div>
            <p className="dash-kicker">Equipe de suporte</p>
            <h2 id="novo-analista">Cadastrar analista</h2>
          </div>
          <button type="button" className="manager-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        {done ? (
          <div className="manager-done">
            <span className="manager-done-check" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h3>Analista cadastrado</h3>
            <p>
              <strong>{form.name.trim()} {form.last_name.trim()}</strong> já pode entrar com o e-mail{" "}
              <strong>{form.email.trim().toLowerCase()}</strong>.
            </p>
            <ol>
              <li>A conta foi criada no sistema.</li>
              <li>O analista entra com o e-mail e a senha definidos aqui.</li>
              <li>Você continua neste painel.</li>
            </ol>
            <button type="button" className="manager-submit" onClick={onClose}>
              Concluir
            </button>
          </div>
        ) : (
          <form className="manager-form" onSubmit={submit}>
            <p>Preencha os dados para incluir um analista na equipe de suporte.</p>
            <div className="analyst-grid">
              <label>
                Nome
                <input name="name" value={form.name} onChange={change} placeholder="Digite o nome" required />
              </label>
              <label>
                Sobrenome
                <input name="last_name" value={form.last_name} onChange={change} placeholder="Digite o sobrenome" required />
              </label>
              <label className="is-wide">
                E-mail
                <input name="email" type="email" value={form.email} onChange={change} placeholder="analista@email.com" required />
              </label>
              <label>
                Senha
                <input name="psw" type="password" value={form.psw} onChange={change} placeholder="Digite uma senha" required />
              </label>
              <label>
                Confirmar senha
                <input name="psw2" type="password" value={form.psw2} onChange={change} placeholder="Confirme a senha" required />
              </label>
            </div>
            {error && <p className="manager-error">{error}</p>}
            <button type="submit" className="manager-submit" disabled={saving}>
              {saving ? "Cadastrando..." : "Cadastrar analista"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
