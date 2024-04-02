from flask import Blueprint, request, jsonify
from app.models import Ticket
from app.db import db

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")

STATUS_ORDER = ["To Do", "In Progress", "Testing", "Deployed"]

@tickets_bp.route("/", methods=["GET", "POST"])
def handle_tickets():
    if request.method == "GET":
        tickets = Ticket.query.all()
        return jsonify([t.to_dict() for t in tickets])

    if request.method == "POST":
        data = request.get_json()
        title = data.get("title", "").strip()
        status = data.get("status", "").strip()

        if not title or not status:
            return jsonify({"error": "Missing title or status"}), 400

        ticket = Ticket(title=title, status=status)
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.to_dict()), 201

@tickets_bp.route("/<int:ticket_id>/advance", methods=["PATCH"])
def advance_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    try:
        current_index = STATUS_ORDER.index(ticket.status)
        if current_index < len(STATUS_ORDER) - 1:
            ticket.status = STATUS_ORDER[current_index + 1]
            db.session.commit()
            return jsonify(ticket.to_dict())
        else:
            return jsonify({"error": "Ticket is already in final status"}), 400
    except ValueError:
        return jsonify({"error": "Invalid status value"}), 400

@tickets_bp.route("/<int:ticket_id>", methods=["PATCH", "DELETE"])
def modify_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if request.method == "PATCH":
        data = request.get_json()
        title = data.get("title", "").strip()
        status = data.get("status", "").strip()

        if title:
            ticket.title = title
        if status:
            ticket.status = status

        db.session.commit()
        return jsonify(ticket.to_dict())

    if request.method == "DELETE":
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({"message": "Deleted"}), 204