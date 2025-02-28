import { useEffect, useState } from "react";
import { fetchTickets } from "./api";

interface Ticket {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Testing" | "Deployed";
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Ticket["status"]>("To Do");

  useEffect(() => {
    fetchTickets()
      .then((data) => setTickets(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/tickets/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status }),
    });
    const newTicket = await response.json();
    setTickets([...tickets, newTicket]);
    setTitle("");
    setStatus("To Do");
  };

  const grouped = {
    "To Do": tickets.filter((t) => t.status === "To Do"),
    "In Progress": tickets.filter((t) => t.status === "In Progress"),
    "Testing": tickets.filter((t) => t.status === "Testing"),
    "Deployed": tickets.filter((t) => t.status === "Deployed"),
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>DevTrackHub Ticket Board</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ticket title"
          required
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Ticket["status"])}
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        >
          {Object.keys(grouped).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Create Ticket
        </button>
      </form>

      {/* Board */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {Object.entries(grouped).map(([status, items]) => (
          <div
            key={status}
            style={{
              flex: 1,
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <h2>{status}</h2>
            <ul>
              {items.map((ticket) => (
                <li key={ticket.id}>
                  <strong>{ticket.title}</strong>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;