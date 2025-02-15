from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os

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
        from . import models
        db.drop_all()  # Drop existing tables
        db.create_all()  # Create new tables

    from . import routes
    app.register_blueprint(routes.bp)

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app