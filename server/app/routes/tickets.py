from flask import Blueprint, jsonify, request

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")

# In-memory store
TICKETS = [
    {"id": 1, "title": "Set up CI pipeline", "status": "In Progress"},
    {"id": 2, "title": "Create ticket board UI", "status": "To Do"},
    {"id": 3, "title": "Build Docker container", "status": "Testing"},
]

@tickets_bp.route("/", methods=["GET"])
def get_tickets():
    return jsonify(TICKETS)

@tickets_bp.route("/", methods=["POST"])
def create_ticket():
    data = request.get_json()
    new_ticket = {
        "id": len(TICKETS) + 1,
        "title": data["title"],
        "status": data["status"]
    }
    TICKETS.append(new_ticket)
    return jsonify(new_ticket), 201