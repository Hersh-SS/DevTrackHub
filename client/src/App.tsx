import { useEffect, useState } from "react";
import { fetchTickets } from "./api";

interface Ticket {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Testing" | "Deployed";
}

const STATUS_COLORS: Record<Ticket["status"], string> = {
  "To Do": "#f1c40f",
  "In Progress": "#3498db",
  "Testing": "#9b59b6",
  "Deployed": "#2ecc71",
};

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
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>🚀 DevTrackHub</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ticket title"
          required
          style={{
            flex: "1",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Ticket["status"])}
          style={{
            padding: "0.6rem",
            borderRadius: "6px",
            fontSize: "1rem",
          }}
        >
          {Object.keys(grouped).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            backgroundColor: "#2ecc71",
            color: "white",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          + Create Ticket
        </button>
      </form>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {Object.entries(grouped).map(([status, items]) => (
          <div
            key={status}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              padding: "1rem",
              minHeight: "200px",
            }}
          >
            <h2 style={{ color: STATUS_COLORS[status as Ticket["status"]] }}>{status}</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {items.map((ticket) => (
                <li
                  key={ticket.id}
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "0.5rem 1rem",
                    margin: "0.5rem 0",
                    borderRadius: "6px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {ticket.title}
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