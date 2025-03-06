from flask import Blueprint, request, jsonify

tickets_bp = Blueprint("tickets", __name__)

# In-memory ticket store
tickets = []
ticket_id_counter = 1

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