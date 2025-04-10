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
        from app.models import Customer, BatteryRental, WaterSale, InternetAccess, BatteryType, Battery

        try:
            # Drop all tables and recreate them with the new schema
            db.drop_all()
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            raise

        # Initialize default battery types
        try:
            default_battery_types = [
                {
                    'name': 'Phone Charge at Waypoint',
                    'type': 'charging',
                    'capacity': None,
                    'rental_price': 0.28,
                    'delivery_fee': 0.00,
                    'units': 0
                },
                {
                    'name': '250 Wh Anker Battery',
                    'type': 'battery',
                    'capacity': '250 Wh',
                    'rental_price': 0.56,
                    'delivery_fee': 0.84,
                    'units': 80
                },
                {
                    'name': 'Small Portable Battery',
                    'type': 'battery',
                    'capacity': '100 Wh',
                    'rental_price': 0.28,
                    'delivery_fee': 0.84,
                    'units': 5
                }
            ]

            for battery_type_data in default_battery_types:
                units = battery_type_data.pop('units')
                battery_type = BatteryType(**battery_type_data)
                db.session.add(battery_type)
                db.session.flush()  # Get the ID of the battery type

                # Create battery units if it's a physical battery
                if battery_type.type == 'battery':
                    for i in range(units):
                        battery = Battery(
                            battery_type_id=battery_type.id,
                            unit_number=i + 1,
                            status='available'
                        )
                        db.session.add(battery)

            db.session.commit()
            logger.info("Default battery types and units initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing default battery types: {str(e)}")
            db.session.rollback()

        # Import routes after models are initialized
        from app.routes import bp
        app.register_blueprint(bp)

        @app.route('/')
        def index():
            return app.send_static_file('index.html')

    return app