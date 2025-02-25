from flask import Blueprint, jsonify

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")

@tickets_bp.route("/", methods=["GET"])
def get_tickets():
    sample_tickets = [
        {"id": 1, "title": "Set up CI pipeline", "status": "In Progress"},
        {"id": 2, "title": "Create ticket board UI", "status": "To Do"},
        {"id": 3, "title": "Build Docker container", "status": "Testing"},
    ]
    return jsonify(sample_tickets)