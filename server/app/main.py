from flask import Flask, request, jsonify
from flask_cors import CORS
from app.routes.tickets import tickets_bp
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv();

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # Match frontend port

app.register_blueprint(tickets_bp)

@app.route("/")
def home():
    return "DevTrackHub backend is running!";

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get the prompt from the request body
        data = request.get_json();
        prompt = data.get('prompt');
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400;

        # Call Hugging Face Inference API
        api_key = os.getenv("HF_API_KEY");
        if not api_key:
            return jsonify({"error": "Hugging Face API key not configured"}), 500;

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        };
        payload = {
            "inputs": f"<s>[INST] You are a helpful assistant for a ticket tracking dashboard. {prompt} [/INST]",
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "return_full_text": False
            }
        };
        response = requests.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
            headers=headers,
            json=payload
        );
        response.raise_for_status();

        # Log raw response for debugging
        raw_response = response.json();
        print("Hugging Face raw response:", raw_response);

        # Extract response text
        chat_response = raw_response[0]["generated_text"].strip();

        # Log response length
        print("Response length (characters):", len(chat_response));

        # Return JSON response
        return jsonify({"response": chat_response});

    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"Hugging Face API error: {str(e)}"}), 500;
    except Exception as e:
        return jsonify({"error": str(e)}), 500;