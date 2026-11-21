import iconTicket from "../assets/icon-ticket-flow.png";

const AuthHero = () => {
  return (
    <section className="login-hero" aria-label="Apresentação do TicketFlow">
      <div className="login-brand">
        <img src={iconTicket} alt="" />
        <span>
          Ticket<span className="brand-flow">Flow</span>
        </span>
      </div>

      <div className="login-hero-body">
        <div className="login-floaters">
          <article className="login-card login-card-resolved">
            <span className="login-check" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 12.2 10.3 15.5 17 8.4" />
              </svg>
            </span>
            <div>
              <strong>Problema resolvido</strong>
              <span>Tempo de solução: 1h 24min</span>
            </div>
          </article>

          <div className="login-shield" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 4.5 17 6.6v4.4c0 3.1-2 5.5-5 6.6-3-1.1-5-3.5-5-6.6V6.6L12 4.5z" />
              <path d="M9.2 12.1 11.1 14l3.8-4.2" />
            </svg>
          </div>

          <article className="login-card login-card-open">
            <span className="login-ticket" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="6" y="7" width="12" height="10" rx="1.6" />
                <path d="M9 11.2h6M9 14h4" />
              </svg>
            </span>
            <div>
              <strong>Novo chamado</strong>
              <span>#TF-1048 · Agora</span>
            </div>
            <em className="login-status">Aberto</em>
          </article>
        </div>

        <div className="login-hero-copy">
          <h1>
            Suporte que flui.
            <br />
            Times que <span>avançam.</span>
          </h1>
          <p>
            Centralize solicitações, conecte equipes e resolva problemas com
            mais agilidade.
          </p>
        </div>
      </div>

      <p className="login-legal">
        © 2026 Ticket<span className="brand-flow">Flow</span>. Todos os direitos reservados.
      </p>
    </section>
  );
};

export default AuthHero;
