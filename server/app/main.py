from flask import Flask
from app.routes.tickets import tickets_bp

app = Flask(__name__)
app.register_blueprint(tickets_bp)

@app.route("/")
def home():
    return "DevTrackHub backend is running!"