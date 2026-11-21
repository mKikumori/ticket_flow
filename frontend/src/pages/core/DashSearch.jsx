import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../services/api";

function textOf(ticket) {
  const id = String(ticket._id || ticket.rawId || ticket.id || "");
  const short = ticket.code || (id.length > 6 ? id.slice(-6).toUpperCase() : id);

  return {
    key: id || `${ticket.title}-${short}`,
    id,
    short,
    title: ticket.title || "Sem título",
    status: ticket.status || "",
    haystack: [
      short,
      id,
      ticket.title,
      ticket.description,
      ticket.detail,
      ticket.message,
      ticket.requester,
      ticket.problem_type,
      ticket.type,
      ticket.status,
      ticket.criticality,
      ticket.analyst,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

export default function DashSearch({
  tickets,
  value,
  onChange,
  onPick,
  placeholder = "Buscar tickets ou ID...",
}) {
  const navigate = useNavigate();
  const [local, setLocal] = useState("");
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const term = value === undefined ? local : value;

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onPointer = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  useEffect(() => {
    if (tickets || !open || remote) return undefined;
    let active = true;
    setLoading(true);
    api
      .get("/api/ticket/tickets")
      .then((response) => {
        if (!active) return;
        setRemote(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (active) setRemote([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, tickets, remote]);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return (tickets || remote || [])
      .map(textOf)
      .filter((item) => item.haystack.includes(q))
      .slice(0, 8);
  }, [tickets, remote, term]);

  const change = (next) => {
    if (onChange) onChange(next);
    else setLocal(next);
    setOpen(true);
  };

  const pick = (item) => {
    setOpen(false);
    if (onPick) {
      onPick(item);
      return;
    }
    if (onChange) onChange(item.title);
    else setLocal(item.title);
    navigate(`/tickets?q=${encodeURIComponent(item.title)}`);
  };

  const submit = (event) => {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    if (results[0]) {
      pick(results[0]);
      return;
    }
    setOpen(false);
    navigate(`/tickets?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="dash-search-box" ref={boxRef}>
      <form className="dash-search" onSubmit={submit}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={term}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setOpen(true)}
        />
        <kbd>Ctrl K</kbd>
      </form>
      {open && term.trim() && (
        <div className="dash-search-results" role="listbox">
          {loading && <p>Buscando tickets...</p>}
          {!loading && results.length === 0 && <p>Nenhum ticket encontrado.</p>}
          {results.map((item) => (
            <button key={item.key} type="button" onClick={() => pick(item)}>
              <strong>{item.title}</strong>
              <span>
                {item.short}
                {item.status ? ` · ${item.status}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
