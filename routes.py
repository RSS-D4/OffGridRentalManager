from flask import Blueprint, jsonify, request, current_app
from app import db
from models import Customer, BatteryRental, WaterSale, InternetAccess
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import logging
import base64

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('main', __name__)

@bp.route('/api/customers', methods=['POST'])
def create_customer():
    logger.info("Received POST request to create customer")
    try:
        # Get form data
        data = request.form.to_dict()

        # Create new customer instance
        customer = Customer(
            name=data['name'],
            phone=data['phone'],
            address=data['address'],
            date_of_birth=data.get('date_of_birth'),
            id_number=data.get('id_number'),
            id_type=data.get('id_type')
        )

        # Handle photo uploads
        if 'selfie_photo' in request.files:
            customer.selfie_photo = request.files['selfie_photo'].read()
        if 'id_photo' in request.files:
            customer.id_photo = request.files['id_photo'].read()
        if 'bill_photo' in request.files:
            customer.bill_photo = request.files['bill_photo'].read()

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
    customer = Customer.query.get_or_404(customer_id)
    data = request.json
    logger.debug(f"Updating customer {customer_id} with data: {data}")
    try:
        if 'name' not in data or 'phone' not in data or 'address' not in data:
            raise KeyError('Missing required fields')
        customer.name = data['name']
        customer.phone = data['phone']
        customer.address = data['address']
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
        return jsonify({'error': 'An unexpected error occurred'}), 500