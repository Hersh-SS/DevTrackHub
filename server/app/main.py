# app/main.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "DevTrackHub backend is running!"