import { Link } from "react-router";
import { useState } from "react";
import axios from "axios";

const CreateTicket = () => {
  const [ticketData, setTicketData] = useState({
    title: "",
    problem_type: "",
    description: "",
    criticality: "Low",
    status: "Open",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const changeInputHandler = (e) => {
    const { name, value } = e.target;

    setTicketData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const createTicket = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must log in before creating a ticket.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5001/api/ticket/createTicket",
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Ticket created:", response.data);
      setSuccess("Ticket created successfully!");

      setTicketData({
        title: "",
        problem_type: "",
        description: "",
        criticality: "Low",
        status: "Open",
        log_id: null,
        analyst_id: null,
        chat_id: null,
      });
    } catch (err) {
      console.error("Ticket creation error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to create ticket. Please try again.",
      );
    }
  };

  return (
    <div>
      <form onSubmit={createTicket}>
        <input
          type="text"
          placeholder="Title"
          name="title"
          value={ticketData.title}
          onChange={changeInputHandler}
          required
        />

        <input
          type="text"
          placeholder="Problem type"
          name="problem_type"
          value={ticketData.problem_type}
          onChange={changeInputHandler}
          required
        />

        <textarea
          placeholder="Description"
          name="description"
          value={ticketData.description}
          onChange={changeInputHandler}
          required
        />

        <select
          name="criticality"
          value={ticketData.criticality}
          onChange={changeInputHandler}
          required
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
          <option value="Critical">Critical</option>
        </select>

        <select
          name="status"
          value={ticketData.status}
          onChange={changeInputHandler}
          required
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <button type="submit" className="btn primary">
          Create Ticket
        </button>
      </form>

      {error && <p role="alert">{String(error)}</p>}
      {success && <p role="status">{success}</p>}

      <Link to="/">Home</Link>
    </div>
  );
};

export default CreateTicket;
