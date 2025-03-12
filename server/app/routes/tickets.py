from flask import Blueprint, request, jsonify
from utils.storage import load_tickets, save_tickets

tickets_bp = Blueprint("tickets", __name__)

# Load existing tickets from file
tickets = load_tickets()
ticket_id_counter = max((t["id"] for t in tickets), default=0) + 1

# Order of statuses for advancing logic
STATUS_ORDER = ["To Do", "In Progress", "Testing", "Deployed"]

@tickets_bp.route("/api/tickets/", methods=["GET", "POST"])
def handle_tickets():
    global ticket_id_counter

    if request.method == "GET":
        return jsonify(tickets)

    if request.method == "POST":
        data = request.get_json()
        title = data.get("title", "").strip()
        status = data.get("status", "").strip()

        if not title or not status:
            return jsonify({"error": "Missing title or status"}), 400

        ticket = {
            "id": ticket_id_counter,
            "title": title,
            "status": status,
        }
        tickets.append(ticket)
        ticket_id_counter += 1
        save_tickets(tickets)
        return jsonify(ticket), 201

@tickets_bp.route("/api/tickets/<int:ticket_id>/advance", methods=["PATCH"])
def advance_ticket(ticket_id):
    for ticket in tickets:
        if ticket["id"] == ticket_id:
            current_index = STATUS_ORDER.index(ticket["status"])
            if current_index < len(STATUS_ORDER) - 1:
                ticket["status"] = STATUS_ORDER[current_index + 1]
                save_tickets(tickets)
                return jsonify(ticket)
            else:
                return jsonify({"error": "Ticket is already in final status"}), 400
    return jsonify({"error": "Ticket not found"}), 404

@tickets_bp.route("/api/tickets/<int:ticket_id>", methods=["PATCH", "DELETE"])
def modify_ticket(ticket_id):
    global tickets
    ticket = next((t for t in tickets if t["id"] == ticket_id), None)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if request.method == "PATCH":
        data = request.get_json()
        ticket["title"] = data.get("title", ticket["title"]).strip()
        ticket["status"] = data.get("status", ticket["status"]).strip()
        save_tickets(tickets)
        return jsonify(ticket)

    if request.method == "DELETE":
        tickets = [t for t in tickets if t["id"] != ticket_id]
        save_tickets(tickets)
        return jsonify({"message": "Deleted"}), 204