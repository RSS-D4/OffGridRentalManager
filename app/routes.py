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
        customer_list = [{
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
        } for customer in customers]
        logger.debug(f"Returning customer list: {customer_list}")
        return jsonify(customer_list)
    except Exception as e:
        logger.error(f"Error listing customers: {str(e)}")
        return jsonify({'error': 'Failed to load customers'}), 500

@bp.route('/api/customers/<int:customer_id>', methods=['GET'])
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
        logger.debug(f"Files received: {list(request.files.keys())}")

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
            if file and file.filename:
                logger.debug(f"Processing selfie photo: {file.filename}")
                customer.selfie_photo = file.read()
                logger.debug("Selfie photo processed successfully")

        if 'id_photo' in request.files:
            file = request.files['id_photo']
            if file and file.filename:
                logger.debug(f"Processing ID photo: {file.filename}")
                customer.id_photo = file.read()
                logger.debug("ID photo processed successfully")

        if 'bill_photo' in request.files:
            file = request.files['bill_photo']
            if file and file.filename:
                logger.debug(f"Processing bill photo: {file.filename}")
                customer.bill_photo = file.read()
                logger.debug("Bill photo processed successfully")

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
        return jsonify({'error': 'An unexpected error occurred'}), 500

@bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    logger.info(f"Received PUT request for customer_id: {customer_id}")
    try:
        customer = Customer.query.get_or_404(customer_id)
        data = request.form.to_dict()
        logger.debug(f"Updating customer {customer_id} with data: {data}")
        logger.debug(f"Files received in update: {list(request.files.keys())}")

        if 'first_name' not in data or 'family_name' not in data or 'phone' not in data:
            raise KeyError('Missing required fields')

        # Update customer information
        customer.first_name = data['first_name']
        customer.middle_name = data.get('middle_name')
        customer.family_name = data['family_name']
        customer.phone = data['phone']
        customer.address = data.get('address')
        customer.city = data.get('city')
        customer.date_of_birth = data.get('date_of_birth')
        customer.city_of_birth = data.get('city_of_birth')
        customer.id_type = data.get('id_type')
        customer.id_number = data.get('id_number')

        # Handle photo updates
        if 'selfie_photo' in request.files:
            file = request.files['selfie_photo']
            if file and file.filename:
                logger.debug(f"Processing updated selfie photo: {file.filename}")
                customer.selfie_photo = file.read()
                logger.debug("Updated selfie photo processed successfully")

        if 'id_photo' in request.files:
            file = request.files['id_photo']
            if file and file.filename:
                logger.debug(f"Processing updated ID photo: {file.filename}")
                customer.id_photo = file.read()
                logger.debug("Updated ID photo processed successfully")

        if 'bill_photo' in request.files:
            file = request.files['bill_photo']
            if file and file.filename:
                logger.debug(f"Processing updated bill photo: {file.filename}")
                customer.bill_photo = file.read()
                logger.debug("Updated bill photo processed successfully")

        db.session.commit()
        logger.info(f"Customer {customer_id} updated successfully")
        return jsonify({'message': 'Customer updated successfully'})
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"IntegrityError while updating customer {customer_id}: {str(e)}")
        return jsonify({'error': 'Phone number already exists'}), 400
    except KeyError as e:
        db.session.rollback()
        logger.error(f"KeyError while updating customer {customer_id}: {str(e)}")
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error while updating customer {customer_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Battery Rental endpoints
@bp.route('/api/rentals', methods=['GET'])
def get_rentals():
    try:
        rentals = BatteryRental.query.all()
        rental_list = [{
            'id': rental.id,
            'customer_name': f"{rental.customer.first_name} {rental.customer.family_name}",
            'battery_type': rental.battery_type,
            'rented_at': rental.rented_at.isoformat(),
            'returned_at': rental.returned_at.isoformat() if rental.returned_at else None
        } for rental in rentals]
        return jsonify(rental_list)
    except Exception as e:
        logger.error(f"Error getting rentals: {str(e)}")
        return jsonify({'error': 'Failed to load rentals'}), 500

# Water Sales endpoints
@bp.route('/api/water-sales', methods=['GET'])
def get_water_sales():
    try:
        sales = WaterSale.query.all()
        sales_list = [{
            'id': sale.id,
            'customer_name': f"{sale.customer.first_name} {sale.customer.family_name}",
            'size': sale.size,
            'sold_at': sale.sold_at.isoformat()
        } for sale in sales]
        return jsonify(sales_list)
    except Exception as e:
        logger.error(f"Error getting water sales: {str(e)}")
        return jsonify({'error': 'Failed to load water sales'}), 500

# Internet Access endpoints
@bp.route('/api/internet-access', methods=['GET'])
def get_internet_access():
    try:
        records = InternetAccess.query.all()
        access_list = [{
            'id': record.id,
            'customer_name': f"{record.customer.first_name} {record.customer.family_name}",
            'purchased_at': record.purchased_at.isoformat(),
            'status': 'Active'  # You might want to add a status field to your model
        } for record in records]
        return jsonify(access_list)
    except Exception as e:
        logger.error(f"Error getting internet access records: {str(e)}")
        return jsonify({'error': 'Failed to load internet access records'}), 500