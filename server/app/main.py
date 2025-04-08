from flask import Flask, request, jsonify
from flask_cors import CORS
from app.db import db
from app.models import Ticket
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS: allow localhost during dev and Vercel in production
CORS(app, origins=[
    "https://dev-track-hub.vercel.app"
])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL", "sqlite:///data/tickets.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Register blueprints
from app.routes.tickets import tickets_bp
app.register_blueprint(tickets_bp)

# Health check (root)
@app.route("/")
def home():
    return "DevTrackHub backend is running!"

# Hugging Face chat route
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        api_key = os.getenv("HF_API_KEY")
        if not api_key:
            return jsonify({"error": "Hugging Face API key not configured"}), 500

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": f"<s>[INST] You are a helpful assistant for a ticket tracking dashboard. {prompt} [/INST]",
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        response = requests.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            headers=headers,
            json=payload
        )
        response.raise_for_status()

        raw_response = response.json()
        print("Hugging Face raw response:", raw_response)
        chat_response = raw_response[0]["generated_text"].strip()
        print("Response length (characters):", len(chat_response))

        return jsonify({"response": chat_response})

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Hugging Face API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ensure DB is initialized
with app.app_context():
    db.create_all()