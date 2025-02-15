from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    db.init_app(app)

    with app.app_context():
        # Import models here to avoid circular imports
        from app.models import Customer, BatteryRental, WaterSale, InternetAccess
        db.create_all()

        # Import routes after models are initialized
        from app.routes import bp
        app.register_blueprint(bp)

        # Ensure the static folder exists
        static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
        if not os.path.exists(static_folder):
            os.makedirs(static_folder)

        # Move static files to the correct location if needed
        html_file = os.path.join(static_folder, 'index.html')
        if not os.path.exists(html_file):
            with open(html_file, 'w') as f:
                f.write('''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Off-Grid Community Management</title>
    <link rel="stylesheet" href="/static/css/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header>
        <img src="/static/images/logo.svg" alt="Logo" class="logo">
        <h1>Off-Grid Community Management</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#" data-page="dashboard">Dashboard</a></li>
            <li><a href="#" data-page="customers">Customers</a></li>
            <li><a href="#" data-page="rentals">Battery Rentals</a></li>
            <li><a href="#" data-page="water">Water Sales</a></li>
            <li><a href="#" data-page="internet">Internet Access</a></li>
        </ul>
    </nav>
    <main id="app">
        <!-- Content will be dynamically loaded here -->
    </main>
    <footer>
        <p>&copy; 2024 Off-Grid Community Management</p>
    </footer>
    <script src="/static/js/app.js"></script>
    <script src="/static/js/charts.js"></script>
    <script src="/static/js/offline.js"></script>
</body>
</html>''')

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app