import os
import json

TICKETS_FILE = os.path.join(os.path.dirname(__file__), "../data/tickets.json")

def load_tickets():
    if not os.path.exists(TICKETS_FILE):
        return []
    with open(TICKETS_FILE, "r") as f:
        return json.load(f)

def save_tickets(tickets):
    os.makedirs(os.path.dirname(TICKETS_FILE), exist_ok=True)
    with open(TICKETS_FILE, "w") as f:
        json.dump(tickets, f, indent=2)