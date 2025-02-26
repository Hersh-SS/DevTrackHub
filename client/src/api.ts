export async function fetchTickets() {
  const response = await fetch("http://localhost:5000/api/tickets/");
  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }
  return response.json();
}