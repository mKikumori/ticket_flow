import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../../services/api";
import { UserContext } from "../../context/UserContext";
import convertToBase64 from "../../../base64/converter.js";

const Profile = () => {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Profile picture states
  const [isPfpTouched, setIsPfpTouched] = useState(false);
  const [pfpFile, setPfpFile] = useState(null);
  const [savingPfp, setSavingPfp] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    name: "",
    last_name: "",
    email: "",
    profile_img: null,
    phone: null,
    department: null,
  });

  // Page states
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    navigate("/login");
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/user");

      setProfile(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Não foi possível carregar os dados do perfil.",
      );
    }
  };

  // Initial profile loading
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await api.get("/api/user");

        if (!cancelled) {
          setProfile(response.data);
        }
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCurrentUser(null);
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Não foi possível carregar os dados do perfil.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate, setCurrentUser]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save profile information
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        name: profile.name,
        last_name: profile.last_name,
      };

      if (currentUser?.role === "user") {
        updateData.phone = profile.phone;
      }
      const response = await api.put("/api/user", updateData);

      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setCurrentUser((previous) => ({
        ...previous,
        name: updatedProfile.name,
      }));

      setSuccess("Perfil atualizado com sucesso!");
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel profile editing
  const handleCancel = async () => {
    setEditing(false);
    setError("");
    setSuccess("");
    setLoading(true);

    await fetchProfile();

    setLoading(false);
  };

  // Format account role
  const formatRole = (role) => {
    const roles = {
      user: "Usuário",
      analyst: "Analista",
      manager: "Gerente",
    };

    return roles[role] || "Usuário";
  };

  // Handle profile picture selection
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      setError("Selecione uma imagem PNG ou JPEG.");
      return;
    }

    if (file.size > 500000) {
      setError("A imagem deve ter no máximo 500 KB.");
      return;
    }

    try {
      const base64 = await convertToBase64(file);

      setPfpFile(base64);

      setProfile((previous) => ({
        ...previous,
        profile_img: base64,
      }));

      setIsPfpTouched(true);
      setError("");
    } catch {
      setError("Não foi possível processar a imagem.");
    }
  };

  // Upload profile picture
  const changePfpHandler = async () => {
    if (!pfpFile) {
      setError("Selecione uma imagem primeiro.");
      return;
    }

    setSavingPfp(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/api/user/profile-picture", {
        profile_img: pfpFile,
      });

      setProfile((previous) => ({
        ...previous,
        profile_img: response.data.profile_img,
      }));

      setPfpFile(null);
      setIsPfpTouched(false);

      setSuccess("Foto de perfil atualizada com sucesso!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Não foi possível atualizar a foto de perfil.",
      );
    } finally {
      setSavingPfp(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="profile-page">
        <p className="profile-loading">Carregando perfil...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <Link to="/home" className="brand-logo">
          <span>Ticket</span>
          <span className="brand-flow">Flow</span>
        </Link>

        <nav className="profile-header-nav">
          <Link to="/home" className="profile-back-link">
            Voltar ao início
          </Link>

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            Sair
          </button>
        </nav>
      </header>

      {/* Main content */}
      <section className="profile-content">
        {/* Page heading */}
        <div className="profile-heading">
          <span className="profile-label">Minha conta</span>

          <h1 className="profile-title">Meu perfil</h1>

          <p className="profile-subtitle">
            Visualize e gerencie suas informações pessoais.
          </p>
        </div>

        {/* Profile card */}
        <section className="profile-card">
          {/* User header */}
          <div className="profile-user-header">
            <div className="profile-avatar">
              {profile.profile_img ? (
                <img src={profile.profile_img} alt="Foto de perfil" />
              ) : (
                <span>{profile.name?.charAt(0)?.toUpperCase() || "U"}</span>
              )}
            </div>

            {/* Profile picture actions */}
            <div className="profile-picture-actions">
              <input
                type="file"
                name="profile_img"
                id="profile_img"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
                hidden
              />

              <label htmlFor="profile_img" className="profile-picture-label">
                Alterar foto
              </label>

              {isPfpTouched && (
                <button
                  type="button"
                  onClick={changePfpHandler}
                  disabled={savingPfp}
                  className="profile-save-button"
                >
                  {savingPfp ? "Enviando..." : "Salvar foto"}
                </button>
              )}
            </div>

            {/* User information */}
            <div className="profile-user-info">
              <h2>
                {profile.name} {profile.last_name}
              </h2>

              <p>{profile.email}</p>

              <span className="profile-role">
                {formatRole(profile.role || currentUser?.role)}
              </span>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditing(true);
                }}
              >
                Editar perfil
              </button>
            )}
          </div>

          <div className="profile-divider" />

          {/* Profile form */}
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-section-heading">
              <h3>Informações pessoais</h3>

              <p>Seus dados cadastrados na plataforma.</p>
            </div>

            <div className="profile-fields">
              {/* Name */}
              <div className="form-field">
                <label htmlFor="name">Nome</label>

                <input
                  id="name"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              {/* Last name */}
              <div className="form-field">
                <label htmlFor="last_name">Sobrenome</label>

                <input
                  id="last_name"
                  name="last_name"
                  value={profile.last_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-field">
                <label htmlFor="email">E-mail</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                />
              </div>

              {/* User-specific fields */}
              {currentUser?.role === "user" && (
                <>
                  <div className="form-field">
                    <label htmlFor="department">Departamento</label>

                    <input
                      id="department"
                      name="department"
                      value={profile.department || ""}
                      disabled
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">Telefone</label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profile.phone || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Feedback messages */}
            {error && <p className="profile-error">{error}</p>}

            {success && <p className="profile-success">{success}</p>}

            {/* Form actions */}
            {editing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            )}
          </form>
        </section>
      </section>

      {/* Footer */}
      <footer className="profile-footer">
        <span>
          © 2026 Ticket<span className="brand-flow">Flow</span>. Todos os direitos reservados.
        </span>
      </footer>
    </main>
  );
};

export default Profile;
