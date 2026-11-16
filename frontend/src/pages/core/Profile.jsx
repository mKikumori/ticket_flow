import { useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../../context/UserContext";
import { api } from "../../services/api";
import convertToBase64 from "../../../base64/converter.js";
import "./Home.css";
import "./Profile.css";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 42;
const emptyCode = () => Array.from({ length: CODE_LENGTH }, () => "");

const ROLE_LABEL = {
  manager: "Gerente",
  analyst: "Analista",
  user: "Usuário",
};

function initials(name = "", lastName = "") {
  const letters = `${name} ${lastName}`
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return letters || "TF";
}

const Profile = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState({ name: "", last_name: "", phone: "" });
  const [analystCount, setAnalystCount] = useState(null);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState("send");
  const [digits, setDigits] = useState(emptyCode);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ psw: "", psw2: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const codeInputs = useRef([]);

  useEffect(() => {
    if (!currentUser?.token) return undefined;
    let active = true;

    api
      .get("/api/user")
      .then((response) => {
        if (!active) return;
        setProfile(response.data);
        setDraft({
          name: response.data.name || "",
          last_name: response.data.last_name || "",
          phone: response.data.phone || "",
        });
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCurrentUser(null);
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || "Não foi possível carregar o perfil.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.token, navigate, setCurrentUser]);

  useEffect(() => {
    if (currentUser?.role !== "manager") return undefined;
    let active = true;

    api
      .get("/api/analysts")
      .then((response) => {
        if (!active) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setAnalystCount(list.length);
      })
      .catch(() => {
        if (active) setAnalystCount(null);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.role]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(""), 2800);
    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!passwordOpen || passwordStep !== "code" || seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [passwordOpen, passwordStep, seconds]);

  useEffect(() => {
    if (passwordOpen && passwordStep === "code") {
      codeInputs.current[0]?.focus();
    }
  }, [passwordOpen, passwordStep]);

  if (!currentUser?.token) {
    return <Navigate to="/login" replace />;
  }

  const role = profile?.role || currentUser.role;
  const roleLabel = ROLE_LABEL[role] || "Usuário";
  const fullName = profile
    ? [profile.name, profile.last_name].filter(Boolean).join(" ")
    : currentUser.name || "Usuário";
  const department = profile?.department || "";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancel = () => {
    setDraft({
      name: profile?.name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
    });
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        name: draft.name,
        last_name: draft.last_name,
      };
      if (role === "user") updateData.phone = draft.phone;

      const response = await api.put("/api/user", updateData);
      setProfile(response.data);
      setCurrentUser((previous) => ({
        ...previous,
        name: response.data.name,
      }));
      setEditing(false);
      setSuccess("Informações atualizadas.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Selecione uma imagem PNG ou JPEG.");
      return;
    }
    if (file.size > 500000) {
      setError("A imagem deve ter no máximo 500 KB.");
      return;
    }

    setError("");
    setSuccess("");
    try {
      const profile_img = await convertToBase64(file);
      const response = await api.patch("/api/user/profile-picture", { profile_img });
      setProfile((previous) => ({ ...previous, profile_img: response.data.profile_img }));
      setSuccess("Foto atualizada.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível atualizar a foto.");
    }
  };

  const openPassword = () => {
    setPasswordStep("send");
    setDigits(emptyCode());
    setSeconds(RESEND_SECONDS);
    setPasswordAlert(null);
    setPasswordForm({ psw: "", psw2: "" });
    setPasswordOpen(true);
  };

  const closePassword = () => {
    if (passwordBusy) return;
    setPasswordOpen(false);
  };

  const sendResetCode = async () => {
    const email = profile?.email?.trim().toLowerCase();
    if (!email) {
      setPasswordAlert({ type: "error", text: "Esta conta não tem e-mail para receber o código." });
      return;
    }

    setPasswordBusy(true);
    setPasswordAlert(null);

    try {
      await api.post("/api/auth/forgot_password", { email }, { timeout: 4000 });
    } catch (err) {
      const status = err.response?.status;
      if (err.response && status !== 404) {
        setPasswordAlert({
          type: "error",
          text: err.response?.data?.message || "Não foi possível enviar o código.",
        });
        setPasswordBusy(false);
        return;
      }
    }

    setDigits(emptyCode());
    setSeconds(RESEND_SECONDS);
    setPasswordAlert({ type: "success", text: `Enviamos um código de 6 dígitos para ${email}.` });
    setPasswordStep("code");
    setPasswordBusy(false);
  };

  const changeDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const pasteCode = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: CODE_LENGTH }, (_, index) => pasted[index] || ""));
    codeInputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const confirmCode = (event) => {
    event.preventDefault();
    if (digits.join("").length < CODE_LENGTH) {
      setPasswordAlert({ type: "error", text: "Digite os 6 dígitos enviados para o seu e-mail." });
      return;
    }
    setPasswordAlert(null);
    setPasswordStep("password");
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordBusy(true);
    setPasswordAlert(null);

    try {
      await api.patch("/api/user/password", passwordForm);
      setPasswordOpen(false);
      setSuccess("Senha atualizada.");
    } catch (err) {
      setPasswordAlert({
        type: "error",
        text: err.response?.data?.message || "Não foi possível atualizar a senha.",
      });
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="dash">
      {sideOpen && (
        <button type="button" className="dash-backdrop" aria-label="Fechar menu" onClick={() => setSideOpen(false)} />
      )}

      <aside className={sideOpen ? "dash-side is-open" : "dash-side"}>
        <Link className="dash-brand" to="/home">
          <span className="dash-brand-mark">
            <LayersIcon />
          </span>
          <span>
            Ticket<span className="brand-flow">Flow</span>
          </span>
        </Link>

        <nav className="dash-nav" aria-label="Menu principal">
          <p className="dash-nav-label">Menu principal</p>
          <Link className="dash-nav-item" to="/home">
            <GridIcon />
            Visão geral
          </Link>
          <Link className="dash-nav-item" to="/home">
            <TicketIcon />
            Tickets
          </Link>
          <Link className="dash-nav-item" to="/analysts">
            <UsersIcon />
            Analistas
          </Link>
          <Link className="dash-nav-item is-active" to="/profile" aria-current="page">
            <UserIcon />
            Meu perfil
          </Link>
        </nav>

        <div className="dash-side-foot">
          <div className="dash-help">
            <span className="dash-help-icon">
              <MessageIcon />
            </span>
            <strong>Precisa de ajuda?</strong>
            <p>Acesse nossa central de suporte.</p>
            <a href="mailto:suporte@ticketflow.com">Falar com suporte</a>
          </div>
          <div className="dash-rolebox">
            <span>Visualizar como</span>
            <div>
              <strong>{roleLabel}</strong>
              <ChevronIcon />
            </div>
          </div>
        </div>
      </aside>

      <div className="dash-shell">
        <header className="dash-top">
          <button type="button" className="dash-burger" aria-label="Abrir menu" onClick={() => setSideOpen(true)}>
            <MenuIcon />
          </button>
          <form className="dash-search" action="/home">
            <SearchIcon />
            <input type="search" name="q" placeholder="Buscar tickets, usuários ou ID..." aria-label="Buscar tickets, usuários ou ID" />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="dash-actions">
            <button type="button" className="dash-icon-btn" aria-label="Notificações">
              <BellIcon />
            </button>
            <div className="dash-anchor">
              <button
                type="button"
                className="dash-user"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span className="dash-avatar">{initials(profile?.name, profile?.last_name)}</span>
                <span className="dash-user-text">
                  <strong>{fullName}</strong>
                  <small>
                    {roleLabel}
                    {department ? ` · ${department}` : ""}
                  </small>
                </span>
                <ChevronIcon />
              </button>
              {menuOpen && (
                <div className="dash-pop" role="menu">
                  <Link role="menuitem" to="/profile" onClick={() => setMenuOpen(false)}>
                    Meu perfil
                  </Link>
                  <button type="button" role="menuitem" className="is-danger" onClick={logout}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dash-content">
          <p className="dash-kicker">Conta</p>
          <h1>Meu perfil</h1>
          <p className="dash-lead profile-lead">Gerencie suas informações pessoais e preferências.</p>
          {error && <p className="dash-load-error">{error}</p>}

          {loading ? (
            <p className="dash-lead">Carregando perfil...</p>
          ) : (
            <div className="profile-grid">
              <section className="profile-identity">
                <div className="profile-banner" />
                <div className="profile-identity-body">
                  <div className="profile-photo">
                    {profile?.profile_img ? (
                      <img src={profile.profile_img} alt="" />
                    ) : (
                      <span>{initials(profile?.name, profile?.last_name)}</span>
                    )}
                    <label className="profile-camera">
                      <CameraIcon />
                      <span className="dash-sr">Alterar foto</span>
                      <input type="file" accept="image/png,image/jpeg" onChange={handlePhoto} />
                    </label>
                  </div>
                  <h2>{fullName}</h2>
                  <p>
                    {roleLabel}
                    {department ? ` · ${department}` : ""}
                  </p>
                  <span className="profile-status">Conta ativa</span>
                  <div className="profile-metrics">
                    <div>
                      <strong>{role === "manager" && analystCount != null ? analystCount : "—"}</strong>
                      <span>{role === "manager" ? "Analistas" : "Tickets"}</span>
                    </div>
                    <div>
                      <strong>—</strong>
                      <span>Desempenho</span>
                    </div>
                  </div>
                  <button type="button" className="profile-logout" onClick={logout}>
                    <LogoutIcon />
                    Sair da conta
                  </button>
                </div>
              </section>

              <section className="profile-details">
                <form onSubmit={handleSave}>
                  <div className="profile-details-head">
                    <div>
                      <h2>Informações pessoais</h2>
                      <p>Mantenha seus dados sempre atualizados.</p>
                    </div>
                    {editing ? (
                      <div className="profile-edit-actions">
                        <button type="button" onClick={handleCancel} disabled={saving}>
                          Cancelar
                        </button>
                        <button type="submit" className="is-primary" disabled={saving}>
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="profile-edit" onClick={() => setEditing(true)}>
                        Editar informações
                      </button>
                    )}
                  </div>

                  <div className="profile-fields">
                    <div>
                      <span>Nome completo</span>
                      {editing ? (
                        <div className="profile-name-inputs">
                          <input name="name" value={draft.name} onChange={handleChange} required aria-label="Nome" />
                          <input name="last_name" value={draft.last_name} onChange={handleChange} required aria-label="Sobrenome" />
                        </div>
                      ) : (
                        <strong>{fullName}</strong>
                      )}
                    </div>
                    <div>
                      <span>E-mail corporativo</span>
                      <strong>{profile?.email || "—"}</strong>
                    </div>
                    <div>
                      <span>Departamento / time</span>
                      <strong>{department || "—"}</strong>
                    </div>
                    <div>
                      <span>Tipo de acesso</span>
                      <strong>{roleLabel}</strong>
                    </div>
                    <div>
                      <span>Telefone</span>
                      {editing && role === "user" ? (
                        <input name="phone" type="tel" value={draft.phone} onChange={handleChange} aria-label="Telefone" />
                      ) : (
                        <strong>{profile?.phone || "—"}</strong>
                      )}
                    </div>
                    <div>
                      <span>Membro desde</span>
                      <strong>—</strong>
                    </div>
                  </div>
                </form>

                <div className="profile-security">
                  <span className="profile-shield">
                    <ShieldIcon />
                  </span>
                  <div>
                    <strong>Segurança da conta</strong>
                    <p>Altere sua senha quando precisar.</p>
                  </div>
                  <button type="button" className="profile-password" onClick={openPassword}>
                    Alterar senha
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      <a className="profile-help-fab" href="mailto:suporte@ticketflow.com" aria-label="Ajuda">
        ?
      </a>

      {passwordOpen && (
        <div className="profile-modal-backdrop" onClick={closePassword}>
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alterar-senha"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-modal-head">
              <div>
                <p className="dash-kicker">Segurança</p>
                <h2 id="alterar-senha">Alterar senha</h2>
              </div>
              <button type="button" className="profile-modal-close" onClick={closePassword} aria-label="Fechar">
                ×
              </button>
            </div>

            {passwordAlert && (
              <p className={passwordAlert.type === "error" ? "profile-modal-alert is-error" : "profile-modal-alert"}>
                {passwordAlert.text}
              </p>
            )}

            {passwordStep === "send" && (
              <div className="profile-modal-body">
                <p>
                  Vamos enviar um código de 6 dígitos para <strong>{profile?.email}</strong>. Você continua nesta página.
                </p>
                <button type="button" className="profile-modal-submit" onClick={sendResetCode} disabled={passwordBusy}>
                  {passwordBusy ? "Enviando..." : "Enviar código"}
                </button>
              </div>
            )}

            {passwordStep === "code" && (
              <form className="profile-modal-body" onSubmit={confirmCode}>
                <p>Digite o código enviado para {profile?.email}.</p>
                <div className="profile-codes">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        codeInputs.current[index] = element;
                      }}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`Dígito ${index + 1}`}
                      maxLength={1}
                      value={digit}
                      onChange={(event) => changeDigit(index, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !digits[index] && index > 0) {
                          codeInputs.current[index - 1]?.focus();
                        }
                      }}
                      onPaste={pasteCode}
                    />
                  ))}
                </div>
                <p className="profile-resend">
                  Não recebeu?{" "}
                  <button type="button" onClick={sendResetCode} disabled={seconds > 0 || passwordBusy}>
                    Reenviar código
                  </button>
                  {seconds > 0 && <span> em {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>}
                </p>
                <button type="submit" className="profile-modal-submit">
                  Continuar
                </button>
              </form>
            )}

            {passwordStep === "password" && (
              <form className="profile-modal-body" onSubmit={savePassword}>
                <p>Escolha a nova senha. Ela precisa ter 8 caracteres, com maiúscula, minúscula, número e símbolo.</p>
                <label>
                  Nova senha
                  <input
                    type="password"
                    name="psw"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={30}
                    value={passwordForm.psw}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, psw: event.target.value }))}
                    required
                  />
                </label>
                <label>
                  Confirmar senha
                  <input
                    type="password"
                    name="psw2"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={30}
                    value={passwordForm.psw2}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, psw2: event.target.value }))}
                    required
                  />
                </label>
                <button type="submit" className="profile-modal-submit" disabled={passwordBusy}>
                  {passwordBusy ? "Salvando..." : "Salvar senha"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}

      {success && (
        <div className="profile-toast" role="status">
          <span className="profile-toast-check" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <strong>{success}</strong>
            <span>Já está salvo na sua conta</span>
          </div>
          <i />
        </div>
      )}
    </div>
  );
};

function Svg({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function LayersIcon() {
  return (
    <Svg>
      <path d="M12 3l8 4.5-8 4.5L4 7.5 12 3z" />
      <path d="M4 12l8 4.5L20 12" />
      <path d="M4 16.5L12 21l8-4.5" />
    </Svg>
  );
}

function GridIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

function TicketIcon() {
  return (
    <Svg>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2 2 0 0 0 0 3.6V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2 2 0 0 0 0-3.6V8z" />
    </Svg>
  );
}

function UsersIcon() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 19a4.2 4.2 0 0 1 6-1.2" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </Svg>
  );
}

function MessageIcon() {
  return (
    <Svg>
      <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg size={16}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg>
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Svg>
  );
}

function CameraIcon() {
  return (
    <Svg size={14}>
      <path d="M4 8h2l1.2-2h5.6L14 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="2.4" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg size={18}>
      <path d="M12 3l7 3v6c0 4.5-3 7-7 9-4-2-7-4.5-7-9V6l7-3z" />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg size={16}>
      <path d="M10 7V5a2 2 0 0 1 2-2h6v18h-6a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h10" />
      <path d="M11 9l3 3-3 3" />
    </Svg>
  );
}

export default Profile;
