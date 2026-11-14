import { Link } from "react-router";
import { useState } from "react";
import { api } from "../../services/api";

const CreateTicket = () => {
  const [ticketData, setTicketData] = useState({
    title: "",
    problem_type: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle and save the user's input
  const changeInputHandler = (e) => {
    const { name, value } = e.target;

    setTicketData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Create ticket
  const createTicket = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Você precisa fazer login antes de criar um chamado.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/ticket/createTicket", ticketData);

      console.log("Ticket created:", response.data);

      setSuccess("Chamado criado com sucesso!");

      setTicketData({
        title: "",
        problem_type: "",
        description: "",
      });
    } catch (err) {
      console.error("Ticket creation error:", err);

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Não foi possível criar o chamado. Tente novamente."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ticket-page">
      <header className="ticket-header">
        <Link to="/home" className="brand-logo">
          <span>Ticket</span>
          <span className="brand-flow">Flow</span>
        </Link>

        <Link to="/home" className="ticket-back-link">
          <span>←</span> Voltar para Home
        </Link>
      </header>

      <section className="ticket-content">
        <div className="ticket-heading">
          <span className="ticket-label">
            TICKET<span className="brand-flow">FLOW</span> PLATFORM
          </span>

          <h1>
            Criar <span>chamado</span>
          </h1>

          <p>
            Descreva o problema encontrado para que nossa equipe possa analisar
            e oferecer suporte.
          </p>
        </div>

        <form className="ticket-form" onSubmit={createTicket}>
          <div className="form-field">
            <label htmlFor="title">Título do chamado</label>

            <input
              id="title"
              type="text"
              placeholder="Ex: Problema ao acessar o sistema"
              name="title"
              value={ticketData.title}
              onChange={changeInputHandler}
              maxLength={120}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="problem_type">Tipo de problema</label>

            <select
              id="problem_type"
              name="problem_type"
              value={ticketData.problem_type}
              onChange={changeInputHandler}
              required
            >
              <option value="" disabled>
                Selecione o tipo de problema
              </option>

              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={`Problema ${index + 1}`}>
                  Problema {index + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field ticket-description-field">
            <label htmlFor="description">Descrição</label>

            <textarea
              id="description"
              placeholder="Descreva detalhadamente o problema encontrado..."
              name="description"
              value={ticketData.description}
              onChange={changeInputHandler}
              rows={7}
              required
            />
          </div>

          {error && (
            <p className="ticket-message ticket-error" role="alert">
              {String(error)}
            </p>
          )}

          {success && (
            <p className="ticket-message ticket-success" role="status">
              {success}
            </p>
          )}

          <button type="submit" className="ticket-submit" disabled={loading}>
            {loading ? "Criando chamado..." : "Criar chamado"}
          </button>
        </form>

        <p className="ticket-note">
          Após a criação, seu chamado ficará disponível para acompanhamento na
          plataforma.
        </p>
      </section>

      <footer className="ticket-footer">
        <span>
          © {new Date().getFullYear()} Ticket<span className="brand-flow">Flow</span>
        </span>
        <span>Licenças de uso · Aviso de privacidade</span>
      </footer>
    </main>
  );
};

export default CreateTicket;
