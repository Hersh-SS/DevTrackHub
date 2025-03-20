from flask import Blueprint, request, jsonify

tickets_bp = Blueprint("tickets", __name__)

# In-memory ticket store
tickets = []
ticket_id_counter = 1

# Define status order
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

        return jsonify(ticket), 201

@tickets_bp.route("/api/tickets/<int:ticket_id>/advance", methods=["PATCH"])
def advance_ticket(ticket_id):
    for ticket in tickets:
        if ticket["id"] == ticket_id:
            current_index = STATUS_ORDER.index(ticket["status"])
            if current_index < len(STATUS_ORDER) - 1:
                ticket["status"] = STATUS_ORDER[current_index + 1]
                return jsonify(ticket)
            else:
                return jsonify({"error": "Ticket is already in final status"}), 400

    return jsonify({"error": "Ticket not found"}), 404

@tickets_bp.route("/api/tickets/<int:ticket_id>", methods=["PATCH"])
def update_ticket(ticket_id):
    data = request.get_json()
    for ticket in tickets:
        if ticket["id"] == ticket_id:
            ticket["title"] = data.get("title", ticket["title"]).strip()
            ticket["status"] = data.get("status", ticket["status"]).strip()
            return jsonify(ticket)
    return jsonify({"error": "Ticket not found"}), 404

@tickets_bp.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    global tickets
    original_len = len(tickets)
    tickets = [ticket for ticket in tickets if ticket["id"] != ticket_id]
    if len(tickets) < original_len:
        return jsonify({"message": "Deleted"}), 200
    return jsonify({"error": "Ticket not found"}), 404