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

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app