import { useEffect, useState, useRef } from "react";
import { fetchTickets } from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = "https://devtrackhub.onrender.com/";
interface Ticket {
  id: number;
  title: string;
  status: "To Do" | "In Progress" | "Testing" | "Deployed";
}

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Initial cold-start ping
    fetch(`${import.meta.env.VITE_API_URL}/`)
      .then(() => console.log("Backend pinged to prevent cold start"))
      .catch(console.error);

    // Load tickets
    fetchTickets().then(setTickets).catch(console.error);

    // Interval ping every 10 minutes
    const interval = setInterval(() => {
      fetch(`${import.meta.env.VITE_API_URL}/`)
        .then(() => console.log("Backend pinged again"))
        .catch(console.error);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const response = await fetch(`${BASE_URL}/api/tickets/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Update failed: ${response.status} - ${errorText}`);
        }

        const updated = await response.json();
        updated.status = capitalizeStatus(updated.status);
        setTickets(tickets.map((t) => (t.id === editingId ? updated : t)));
        setEditingId(null);
        toast.success("Ticket updated successfully!");
      } else {
        const response = await fetch(`${BASE_URL}/api/tickets/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Create failed: ${response.status} - ${errorText}`);
        }

        const newTicket = await response.json();
        newTicket.status = capitalizeStatus(newTicket.status);
        setTickets([...tickets, newTicket]);
        toast.success("Ticket created successfully!");
      }

      setTitle("");
      setStatus("To Do");
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error("Failed to submit ticket.");
    }
  };

  const handleAdvance = async (id: number) => {
    try {
      setAnimatingId(id);
      const response = await fetch(`${BASE_URL}/api/tickets/${id}/advance`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Advance failed: ${response.status} - ${errorText}`);
      }

      const updated = await response.json();
      updated.status = capitalizeStatus(updated.status);

      setTimeout(() => {
        setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setAnimatingId(null);
        toast.success(`Ticket moved to ${updated.status}`);
      }, 150);
    } catch (err: any) {
      console.error("Advance error:", err);
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
      const response = await fetch(`${BASE_URL}/api/tickets/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }

      setTickets(tickets.filter((t) => t.id !== id));
      toast.success("Ticket deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error("Failed to delete ticket.");
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: Message = { role: "user", content: chatInput };
    setMessages([...messages, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      toast.success("Message received!");
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not get response" }]);
      toast.error("Failed to get response.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const capitalizeStatus = (status: string): Ticket["status"] =>
    status.split(" ").map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(" ") as Ticket["status"];

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
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", height: "100%", gap: "2rem" }}>
          <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "2.4rem" }}>DevTrackHub</h1>
              <div
                onClick={() => setDarkMode((d) => !d)}
                style={{
                  width: "50px",
                  height: "26px",
                  background: darkMode ? "#444" : "#ccc",
                  borderRadius: "30px",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: darkMode ? "26px" : "3px",
                    transition: "left 0.3s ease",
                  }}
                />
              </div>
            </div>

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
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  fontSize: "1rem",
                  background: darkMode ? "#3a3a4f" : "#fff",
                  color: theme.text,
                }}
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Ticket["status"])}
                style={{
                  padding: "0.6rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: darkMode ? "#3a3a4f" : "#fff",
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {Object.keys(grouped).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={{
                  backgroundColor: "#2ecc71",
                  color: "#fff",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {editingId ? "Update" : "+ Create"} Ticket
              </button>
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", width: "100%" }}>
              {Object.entries(grouped).map(([status, items]) => (
                <div
                  key={status}
                  style={{
                    background: theme.panel,
                    border: `1px solid ${theme.border}`,
                    padding: "1rem",
                    borderRadius: "12px",
                    minHeight: "180px",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <h2 style={{ color: STATUS_COLORS[status as Ticket["status"]], fontSize: "1.2rem", fontWeight: 600 }}>{status}</h2>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {items.map((ticket) => (
                      <li
                        key={ticket.id}
                        style={{
                          backgroundColor: darkMode ? "#3a3a4f" : "#ffffff",
                          padding: "0.75rem 1rem",
                          margin: "0.5rem 0",
                          border: `1px solid ${darkMode ? "#fff" : "#000"}`,
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          transition: "all 0.3s ease",
                          opacity: ticket.id === animatingId ? 0.3 : 1,
                          transform: ticket.id === animatingId ? "translateX(10px)" : "none",
                          minHeight: "60px",
                        }}
                      >
                        <span style={{ flex: 1, marginRight: "1rem" }}>{ticket.title}</span>
                        <div>
                          <button onClick={() => handleEdit(ticket)} style={iconBtnStyle}>
                            <img src="/icons/edit.png" alt="Edit" style={iconStyle(35, "translateY(2px)")} />
                          </button>
                          <button onClick={() => handleDelete(ticket.id)} style={iconBtnStyle}>
                            <img src="/icons/delete.png" alt="Delete" style={iconStyle(22, "translateY(-4px)")} />
                          </button>
                          {ticket.status !== "Deployed" && (
                            <button onClick={() => handleAdvance(ticket.id)} style={iconBtnStyle}>
                              <img src="/icons/advance.png" alt="Advance" style={iconStyle(30, "translateX(4px)")} />
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

          <div
            style={{
              width: "30%",
              display: "flex",
              flexDirection: "column",
              height: "calc(100% - 1rem)",
              backgroundColor: theme.panel,
              border: `1px solid ${theme.border}`,
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: theme.text }}>AI Assistant (Mistral-7B)</div>
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                marginBottom: "1rem",
                padding: "0.5rem",
                backgroundColor: darkMode ? "#2a2a3e" : "#f9f9f9",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
              }}
            >
              {messages.length === 0 && (
                <p style={{ color: theme.text, fontSize: "0.95rem" }}>
                  You can ask about ticket statuses, summaries, or next actions!
                </p>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    margin: "0.5rem 0",
                    padding: "0.75rem",
                    background: msg.role === "user" ? (darkMode ? "#3a3a4f" : "#e0f7fa") : darkMode ? "#444" : "#e0e0e0",
                    color: theme.text,
                    borderRadius: "8px",
                    maxWidth: "85%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    display: "inline-block",
                    fontSize: "0.95rem",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    overflow: "visible",
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {isChatLoading && (
                <div style={{ color: theme.text, fontSize: "0.95rem", fontStyle: "italic" }}>
                  Loading...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isChatLoading}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  fontSize: "1rem",
                  backgroundColor: darkMode ? "#3a3a4f" : "#fff",
                  color: theme.text,
                }}
              />
              <button
                type="submit"
                disabled={isChatLoading}
                style={{
                  backgroundColor: isChatLoading ? theme.border : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1rem",
                  cursor: isChatLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const iconBtnStyle = {
  marginRight: "0.5rem",
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "6px",
  padding: 0,
  display: "inline-flex",
};

const iconStyle = (size: number, transform: string): React.CSSProperties => ({
  width: `${size}px`,
  height: `${size}px`,
  display: "block",
  objectFit: "contain" as const,
  transform,
});

export default App;