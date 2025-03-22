import { useEffect, useState } from "react";
import { fetchTickets, advanceTicket } from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Ticket {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Testing" | "Deployed";
}

const STATUS_COLORS: Record<Ticket["status"], string> = {
  "To Do": "#f39c12",
  "In Progress": "#2980b9",
  "Testing": "#8e44ad",
  "Deployed": "#27ae60",
};

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Ticket["status"]>("To Do");
  const [darkMode, setDarkMode] = useState(false);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets()
      .then((data) => setTickets(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const response = await fetch(`http://localhost:5000/api/tickets/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status }),
        });
        const updated = await response.json();
        updated.status = capitalizeStatus(updated.status);
        setTickets(tickets.map(t => (t.id === editingId ? updated : t)));
        toast.success("Ticket updated successfully!");
        setEditingId(null);
      } else {
        const response = await fetch("http://localhost:5000/api/tickets/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status }),
        });
        const newTicket = await response.json();
        newTicket.status = capitalizeStatus(newTicket.status);
        setTickets([...tickets, newTicket]);
        toast.success("Ticket created successfully!");
      }

      setTitle("");
      setStatus("To Do");
    } catch (err) {
      toast.error("Failed to submit ticket.");
    }
  };

  const handleAdvance = async (id: number) => {
  try {
    setAnimatingId(id);
    const updated = await advanceTicket(id);
    updated.status = capitalizeStatus(updated.status);
    setTimeout(() => {
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setAnimatingId(null);
      toast.success(`Ticket moved to ${updated.status}`);
    }, 150);
  } catch (err) {
    console.error("Error advancing ticket:", err);
    toast.error("Failed to move ticket.");
  }
};

  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setTitle(ticket.title);
    setStatus(ticket.status);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/tickets/${id}`, { method: "DELETE" });
      setTickets(tickets.filter((t) => t.id !== id));
      toast.success("Ticket deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete ticket.");
    }
  };

  const capitalizeStatus = (status: string): Ticket["status"] =>
    status
      .split(" ")
      .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
      .join(" ") as Ticket["status"];

  const grouped = {
    "To Do": tickets.filter((t) => t.status === "To Do"),
    "In Progress": tickets.filter((t) => t.status === "In Progress"),
    "Testing": tickets.filter((t) => t.status === "Testing"),
    "Deployed": tickets.filter((t) => t.status === "Deployed"),
  };

  const theme = {
    bg: darkMode ? "#1a1a2c" : "#f4f4f4",
    panel: darkMode ? "#2a2a3e" : "#ffffff",
    text: darkMode ? "#ffffff" : "#1a1a2c",
    border: darkMode ? "#444" : "#ccc",
  };

  return (
  <>
    <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        backgroundColor: theme.bg,
        color: theme.text,
        minHeight: "100vh",
        padding: "2rem",
        transition: "all 0.4s ease",
      }}
    >
      <style>{`
        .toggle {
          position: relative;
          width: 50px;
          height: 26px;
          background: ${darkMode ? "#444" : "#ccc"};
          border-radius: 30px;
          transition: background 0.3s ease;
        }
        .toggle::before {
          content: "";
          position: absolute;
          top: 3px;
          left: ${darkMode ? "26px" : "3px"};
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: left 0.3s ease;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "1.5rem" }}>DevTrackHub</h1>
        <div className="toggle" onClick={() => setDarkMode((d) => !d)} style={{ cursor: "pointer" }} />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
          flexWrap: "wrap",
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          padding: "1rem",
          borderRadius: "12px",
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ticket title"
          required
          style={{
            flex: "1",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
            fontSize: "1rem",
            background: darkMode ? "#3b3b4f" : "#fff",
            color: theme.text,
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Ticket["status"])}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "1rem",
            background: darkMode ? "#3b3b4f" : "#fff",
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        >
          {Object.keys(grouped).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            backgroundColor: "#2ecc71",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(46,204,113,0.4)",
          }}
        >
          {editingId ? "Update" : "+ Create"} Ticket
        </button>
      </form>

      {/* Board */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <div
          style={{
            width: "65vw",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
          }}
        >
        {Object.entries(grouped).map(([status, items]) => (
          <div
            key={status}
            style={{
              background: theme.panel,
              border: `1px solid ${theme.border}`,
              padding: "1rem",
              borderRadius: "12px",
              height: "100%",
              minHeight: "180px",
              overflowY: "auto",
            }}
          >
            <h2 style={{
              color: STATUS_COLORS[status as Ticket["status"]],
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>
              {status}
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {items.map((ticket) => (
                <li
                  key={ticket.id}
                  style={{
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    backgroundColor: darkMode ? "#3a3a4f" : "#ffffff",
                    padding: "0.75rem 1rem",
                    margin: "0.5rem 0",
                    border: `1px solid ${darkMode ? "#fff" : "#000"}`,
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    opacity: ticket.id === animatingId ? 0.3 : 1,
                    transform: ticket.id === animatingId ? "translateX(10px)" : "translateX(0)",
                    transition: "all 0.3s ease",
                    wordWrap: "break-word",
                    maxWidth: "100%",
                  }}
                >
                  <span
                    style={{
                      marginRight: "1rem",
                      flex: 1,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      overflow: "hidden",
                    }}
                  >
                    {ticket.title}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEdit(ticket)}
                      style={{
                        marginRight: "0.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: 0,
                        display: "inline-flex",
                      }}
                    >
                      <img
                        src="/icons/edit.png"
                        alt="Edit"
                        style={{
                          width: "35px",
                          height: "35px",
                          display: "block",
                          objectFit: "contain",
                          transform: "translateY(2px)",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      style={{
                        marginRight: "0.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: 0,
                        display: "inline-flex",
                      }}
                    >
                      <img
                        src="/icons/delete.png"
                        alt="Edit"
                        style={{
                          width: "22px",
                          height: "22px",
                          display: "block",
                          objectFit: "contain",
                          transform: "translateY(-4px)",
                        }}
                      />
                    </button>
                    {ticket.status !== "Deployed" && (
                      <button
                        onClick={() => handleAdvance(ticket.id)}
                        style={{
                        marginRight: "0.5rem",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: 0,
                        display: "inline-flex",
                        }}
                      >
                        <img
                          src="/icons/advance.png"
                          alt="Edit"
                          style={{
                            width: "30px",
                            height: "30px",
                            display: "block",
                            objectFit: "contain",
                            transform: "translateX(4px)",
                          }}
                        />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    </div>
  </>
);
}

export default App;