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
    app = Flask(__name__, static_folder='static', static_url_path='')

    # Set secret key for sessions
    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

    # Configure SQLAlchemy
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Configure maximum content length for file uploads (16MB)
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    # Initialize the database
    db.init_app(app)

    with app.app_context():
        # Import models here to avoid circular imports
        from app.models import Customer, BatteryRental, WaterSale, InternetAccess

        try:
            # Create tables if they don't exist
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            raise

        # Import routes after models are initialized
        from app.routes import bp
        app.register_blueprint(bp)

        @app.route('/')
        def index():
            return app.send_static_file('index.html')

    return app