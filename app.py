"""Flask application for the web interface."""
# coding=utf-8
import sys
import os

# Flask utils
from flask import Flask, request, render_template
from flask_cors import CORS
from sympy import re
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


@app.route("/nft", methods=["GET", "POST"])
def create():
    """Create a new NFT."""
    if request.method == "GET":
        pass
    elif request.method == 'POST':
        nft.create_non_fungible_token()



@app.route("/nft/<token_id>", methods=["GET", "POST"])
def get_nft(token_id):
    """Get a NFT."""
    if request.method == "GET":
        nft.get_non_fungible_token(token_id)

@app.route("/nft/<token_id>/transfer", methods=["POST"])
def transfer_nft(token_id):
    """Transfer a NFT."""
    if request.method == "POST":
        nft.transfer_non_fungible_token(token_id)
        
@app.route("/nft/<token_id>/opt-in", methods=["POST"])
def opt_in_nft(token_id):
    """Opt in a NFT."""
    if request.method == "POST":
        nft.opt_in_non_fungible_token(token_id)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 33507))
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.run(host="0.0.0.0", debug=True, port=port)
