from flask import Flask
from flask_cors import CORS
from app.routes.tickets import tickets_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(tickets_bp)

@app.route("/")
def home():
    return "DevTrackHub backend is running!"
