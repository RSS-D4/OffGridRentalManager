from flask import Blueprint, jsonify, request
from app import db
from models import Customer, BatteryRental, WaterSale, InternetAccess
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import random

bp = Blueprint('main', __name__)

def add_sample_data():
    # Check if there's already data in the database
    if Customer.query.first() is None:
        # Add sample customers
        customers = [
            Customer(name="John Doe", phone="1234567890", address="123 Main St"),
            Customer(name="Jane Smith", phone="0987654321", address="456 Elm St"),
            Customer(name="Bob Johnson", phone="1122334455", address="789 Oak St")
        ]
        db.session.add_all(customers)
        db.session.commit()

        # Add sample transactions for the last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        for _ in range(50):  # Add 50 random transactions
            transaction_date = start_date + timedelta(seconds=random.randint(0, int((end_date - start_date).total_seconds())))
            customer = random.choice(customers)
            
            transaction_type = random.choice(['rental', 'water', 'internet'])
            if transaction_type == 'rental':
                rental = BatteryRental(customer_id=customer.id, battery_type=random.choice(['Phone Charge', '200wh Anker', 'Large Battery', 'Phone Bank']), rented_at=transaction_date)
                db.session.add(rental)
            elif transaction_type == 'water':
                sale = WaterSale(customer_id=customer.id, size=random.choice([0.5, 1.5]), sold_at=transaction_date)
                db.session.add(sale)
            else:
                access = InternetAccess(customer_id=customer.id, purchased_at=transaction_date)
                db.session.add(access)
        
        db.session.commit()

@bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    rentals = BatteryRental.query.filter(BatteryRental.rented_at >= start_date).count()
    water_sales = WaterSale.query.filter(WaterSale.sold_at >= start_date).count()
    internet_accesses = InternetAccess.query.filter(InternetAccess.purchased_at >= start_date).count()
    
    return jsonify({
        'rentals': rentals,
        'water_sales': water_sales,
        'internet_accesses': internet_accesses
    })

# Add other route handlers here
