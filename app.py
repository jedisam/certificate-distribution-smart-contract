"""Flask application for the web interface."""
# coding=utf-8
import sys
import os

# Flask utils
from flask import Flask, request, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from controllers.account import create_account, closeout_account
from controllers.nft import Nft

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "./scripts"))
)

mnemo = create_account()
# Initialize Nft class
nft = Nft(mnemo)

# Define a flask app
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Load pickle model
UPLOAD_FOLDER = "./uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/", methods=["GET"])
def index():
    """Render the index page."""
    # Main page
    return {"status": "sucess", "message": "Welcome to the Flask API!"}


@app.route("/create-nft", methods=["GET"])
def create():
    """Create a new NFT."""
    nft.create_non_fungible_token()
    """Render the index page."""
    # Main page



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 33507))
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.run(host="0.0.0.0", debug=True, port=port)
