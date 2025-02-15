from flask import Blueprint, jsonify, request
from app import db
from app.models import Customer, BatteryRental, WaterSale, InternetAccess
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('main', __name__)

@bp.route('/api/dashboard/stats')
def get_dashboard_stats():
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)

        rentals = BatteryRental.query.filter(
            BatteryRental.rented_at >= start_date,
            BatteryRental.rented_at <= end_date
        ).count()

        water_sales = WaterSale.query.filter(
            WaterSale.sold_at >= start_date,
            WaterSale.sold_at <= end_date
        ).count()

        internet_accesses = InternetAccess.query.filter(
            InternetAccess.purchased_at >= start_date,
            InternetAccess.purchased_at <= end_date
        ).count()

        return jsonify({
            'rentals': rentals,
            'water_sales': water_sales,
            'internet_accesses': internet_accesses
        })
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({'error': 'Failed to load dashboard statistics'}), 500

@bp.route('/api/customers', methods=['GET'])
def list_customers():
    try:
        customers = Customer.query.all()
        return jsonify([{
            'id': customer.id,
            'first_name': customer.first_name,
            'middle_name': customer.middle_name,
            'family_name': customer.family_name,
            'phone': customer.phone,
            'address': customer.address,
            'city': customer.city,
            'date_of_birth': customer.date_of_birth,
            'city_of_birth': customer.city_of_birth,
            'id_type': customer.id_type,
            'id_number': customer.id_number
        } for customer in customers])
    except Exception as e:
        logger.error(f"Error listing customers: {str(e)}")
        return jsonify({'error': 'Failed to load customers'}), 500

@bp.route('/api/customers/<int:customer_id>')
def get_customer(customer_id):
    try:
        customer = Customer.query.get_or_404(customer_id)
        return jsonify({
            'id': customer.id,
            'first_name': customer.first_name,
            'middle_name': customer.middle_name,
            'family_name': customer.family_name,
            'phone': customer.phone,
            'address': customer.address,
            'city': customer.city,
            'date_of_birth': customer.date_of_birth,
            'city_of_birth': customer.city_of_birth,
            'id_type': customer.id_type,
            'id_number': customer.id_number
        })
    except Exception as e:
        logger.error(f"Error getting customer {customer_id}: {str(e)}")
        return jsonify({'error': f'Failed to load customer {customer_id}'}), 500

@bp.route('/api/customers', methods=['POST'])
def create_customer():
    logger.info("Received POST request to create customer")
    try:
        data = request.form.to_dict()
        logger.debug(f"Received form data: {data}")

        # Create new customer instance
        customer = Customer(
            first_name=data['first_name'],
            middle_name=data.get('middle_name'),
            family_name=data['family_name'],
            phone=data['phone'],
            address=data.get('address'),
            city=data.get('city'),
            date_of_birth=data['date_of_birth'],
            city_of_birth=data['city_of_birth'],
            id_type=data['id_type'],
            id_number=data['id_number']
        )

        # Handle optional photo uploads
        if 'selfie_photo' in request.files:
            file = request.files['selfie_photo']
            if file.filename:
                customer.selfie_photo = file.read()
        
        if 'id_photo' in request.files:
            file = request.files['id_photo']
            if file.filename:
                customer.id_photo = file.read()
        
        if 'bill_photo' in request.files:
            file = request.files['bill_photo']
            if file.filename:
                customer.bill_photo = file.read()

        db.session.add(customer)
        db.session.commit()
        logger.info(f"Customer created successfully with ID: {customer.id}")

        return jsonify({
            'message': 'Customer created successfully',
            'customer_id': customer.id
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"IntegrityError while creating customer: {str(e)}")
        return jsonify({'error': 'Phone number already exists'}), 400
    except KeyError as e:
        db.session.rollback()
        logger.error(f"KeyError while creating customer: {str(e)}")
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error while creating customer: {str(e)}")
        return jsonify({'error': str(e)}), 500
