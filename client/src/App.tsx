import { useEffect, useState } from "react";
import { fetchTickets } from "./api";

interface Ticket {
  id: number;
  title: string;
  status: string;
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchTickets()
      .then((data) => {
        console.log("Tickets received:", data); // ✅ Debug log
        setTickets(data);
      })
      .catch((err) => {
        console.error("Failed to load tickets:", err);
      });
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>DevTrackHub Tickets</h1>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <strong>{ticket.title}</strong> — {ticket.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;