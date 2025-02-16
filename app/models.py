from app import db
from datetime import datetime

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    family_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.String(200), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=False)  # Changed to Date type
    city_of_birth = db.Column(db.String(100), nullable=False)
    id_type = db.Column(db.String(50), nullable=False)
    id_number = db.Column(db.String(50), nullable=False)
    selfie_photo = db.Column(db.LargeBinary, nullable=True)  # Simplified LargeBinary
    id_photo = db.Column(db.LargeBinary, nullable=True)
    bill_photo = db.Column(db.LargeBinary, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BatteryType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'battery' or 'charging'
    capacity = db.Column(db.String(50), nullable=True)  # Can be null for phone charging options
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    batteries = db.relationship("Battery", backref="battery_type", lazy=True)

class Battery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    battery_type_id = db.Column(db.Integer, db.ForeignKey('battery_type.id'), nullable=False)
    unit_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='available')  # available, rented, maintenance
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BatteryRental(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    battery_id = db.Column(db.Integer, db.ForeignKey('battery.id'), nullable=False)
    rented_at = db.Column(db.DateTime, default=datetime.utcnow)
    returned_at = db.Column(db.DateTime, nullable=True)
    customer = db.relationship("Customer", backref="rentals")
    battery = db.relationship("Battery", backref="rentals")

class WaterSale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    size = db.Column(db.Float, nullable=False)
    sold_at = db.Column(db.DateTime, default=datetime.utcnow)
    customer = db.relationship("Customer", backref="water_purchases")

class InternetAccess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)
    customer = db.relationship("Customer", backref="internet_purchases")