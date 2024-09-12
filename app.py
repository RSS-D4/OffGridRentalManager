from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///offgrid.db"
    db.init_app(app)

    with app.app_context():
        import models
        db.create_all()

        from routes import bp, add_sample_data
        app.register_blueprint(bp)
        
        # Initialize sample data
        add_sample_data()

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app
