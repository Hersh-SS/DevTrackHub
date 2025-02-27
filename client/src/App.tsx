import { useEffect, useState } from "react";
import { fetchTickets } from "./api";

interface Ticket {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Testing" | "Deployed";
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchTickets()
      .then((data) => setTickets(data))
      .catch(console.error);
  }, []);

  const grouped = {
    "To Do": tickets.filter((t) => t.status === "To Do"),
    "In Progress": tickets.filter((t) => t.status === "In Progress"),
    "Testing": tickets.filter((t) => t.status === "Testing"),
    "Deployed": tickets.filter((t) => t.status === "Deployed"),
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>DevTrackHub Ticket Board</h1>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
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