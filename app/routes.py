from flask import Blueprint, jsonify, request, send_file
from app import db
from app.models import Customer, BatteryRental, WaterSale, InternetAccess, Battery, BatteryType, HealthAccess
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import logging
import io

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('main', __name__)

@bp.route('/api/battery-types', methods=['GET'])
def list_battery_types():
    try:
        battery_types = BatteryType.query.all()
        return jsonify([{
            'id': bt.id,
            'name': bt.name,
            'type': bt.type,
            'capacity': bt.capacity,
            'available_units': len([b for b in bt.batteries if b.status == 'available'])
        } for bt in battery_types])
    except Exception as e:
        logger.error(f"Error listing battery types: {str(e)}")
        return jsonify({'error': 'Failed to load battery types'}), 500

@bp.route('/api/battery-types', methods=['POST'])
def create_battery_type():
    try:
        data = request.get_json()
        battery_type = BatteryType(
            name=data['name'],
            type=data['type'],
            capacity=data.get('capacity')
        )
        db.session.add(battery_type)
        db.session.flush()  # Get the ID of the battery type

        # If it's a battery type, create the specified number of battery units
        if data['type'] == 'battery' and data.get('quantity', 0) > 0:
            for i in range(data['quantity']):
                battery = Battery(
                    battery_type_id=battery_type.id,
                    unit_number=i + 1,
                    status='available'
                )
                db.session.add(battery)

        db.session.commit()
        return jsonify({
            'message': 'Battery type created successfully',
            'battery_type_id': battery_type.id
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating battery type: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/batteries', methods=['GET'])
def list_available_batteries():
    try:
        batteries = Battery.query.all()
        logger.debug(f"Found {len(batteries)} batteries")
        return jsonify([{
            'id': b.id,
            'type_id': b.battery_type_id,
            'type_name': b.battery_type.name,
            'unit_number': b.unit_number,
            'capacity': b.battery_type.capacity,
            'type': b.battery_type.type,
            'status': b.status
        } for b in batteries])
    except Exception as e:
        logger.error(f"Error listing batteries: {str(e)}")
        return jsonify({'error': 'Failed to load batteries'}), 500

@bp.route('/api/batteries/<int:battery_id>', methods=['PUT'])
def update_battery(battery_id):
    try:
        battery = Battery.query.get_or_404(battery_id)
        data = request.get_json()

        if 'status' in data:
            if battery.status == 'rented':
                return jsonify({'error': 'Cannot update status of rented battery'}), 400
            battery.status = data['status']

        db.session.commit()
        return jsonify({'message': 'Battery updated successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating battery: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/batteries/<int:battery_id>', methods=['DELETE'])
def delete_battery(battery_id):
    try:
        battery = Battery.query.get_or_404(battery_id)

        # Check if battery is currently rented
        if battery.status == 'rented':
            return jsonify({'error': 'Cannot delete a rented battery'}), 400

        # Check if battery has rental history
        if BatteryRental.query.filter_by(battery_id=battery_id).first():
            return jsonify({'error': 'Cannot delete battery with rental history'}), 400

        db.session.delete(battery)
        db.session.commit()
        return jsonify({'message': 'Battery deleted successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting battery: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/rentals', methods=['GET'])
def get_rentals():
    try:
        rentals = BatteryRental.query.all()
        rental_list = [{
            'id': rental.id,
            'customer_name': f"{rental.customer.first_name} {rental.customer.family_name}",
            'battery_name': f"{rental.battery.battery_type.name} (Unit #{rental.battery.unit_number})" if rental.battery else rental.battery_type.name,
            'rental_price': rental.rental_price,
            'delivery_fee': rental.delivery_fee,
            'rented_at': rental.rented_at.isoformat(),
            'returned_at': rental.returned_at.isoformat() if rental.returned_at else None
        } for rental in rentals]
        return jsonify(rental_list)
    except Exception as e:
        logger.error(f"Error getting rentals: {str(e)}")
        return jsonify({'error': 'Failed to load rentals'}), 500

@bp.route('/api/rentals', methods=['POST'])
def create_rental():
    try:
        data = request.get_json()
        logger.debug(f"Received rental data: {data}")

        customer = Customer.query.get_or_404(data['customer_id'])
        battery_type_id = data.get('battery_type_id')

        # Check if this is a battery rental or a charging service
        if data.get('battery_id'):
            # This is a physical battery rental
            battery = Battery.query.get_or_404(data['battery_id'])

            if battery.status != 'available':
                return jsonify({'error': 'Battery is not available for rent'}), 400

            rental = BatteryRental(
                customer_id=customer.id,
                battery_id=battery.id,
                battery_type_id=battery.battery_type_id,
                rental_price=data.get('rental_price', 0.0),
                delivery_fee=data.get('delivery_fee', 0.0)
            )

            # Update battery status
            battery.status = 'rented'

        else:
            # This is a charging service (no physical battery)
            battery_type = BatteryType.query.get_or_404(data['battery_type_id'])

            rental = BatteryRental(
                customer_id=customer.id,
                battery_id=None,
                battery_type_id=battery_type.id,
                rental_price=data.get('rental_price', 0.0),
                delivery_fee=data.get('delivery_fee', 0.0)
            )

        db.session.add(rental)
        db.session.commit()

        return jsonify({
            'message': 'Rental created successfully',
            'rental_id': rental.id
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating rental: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/rentals/<int:rental_id>/return', methods=['POST'])
def return_rental(rental_id):
    try:
        rental = BatteryRental.query.get_or_404(rental_id)
        if rental.returned_at:
            return jsonify({'error': 'Rental already returned'}), 400

        rental.returned_at = datetime.utcnow()

        # If this is a physical battery rental, update the battery status
        if rental.battery:
            rental.battery.status = 'available'

        db.session.commit()
        return jsonify({'message': 'Rental returned successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error returning rental: {str(e)}")
        return jsonify({'error': str(e)}), 500

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

@bp.route('/api/customers')
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
            'city': customer.city
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
        # Get form data
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
        if 'selfie_photo' in request.files and request.files['selfie_photo'].filename:
            customer.selfie_photo = request.files['selfie_photo'].read()
        if 'id_photo' in request.files and request.files['id_photo'].filename:
            customer.id_photo = request.files['id_photo'].read()
        if 'bill_photo' in request.files and request.files['bill_photo'].filename:
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
        return jsonify({'error': str(e)}), 500

@bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    logger.info(f"Received PUT request for customer_id: {customer_id}")
    try:
        customer = Customer.query.get_or_404(customer_id)
        data = request.json
        logger.debug(f"Updating customer {customer_id} with data: {data}")

        if 'first_name' not in data or 'family_name' not in data or 'phone' not in data:
            raise KeyError('Missing required fields')

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

# Water Sales endpoints
@bp.route('/api/water-sales', methods=['GET'])
def get_water_sales():
    try:
        sales = WaterSale.query.all()
        sales_list = [{
            'id': sale.id,
            'customer_name': f"{sale.customer.first_name} {sale.customer.family_name}",
            'size': sale.size,
            'price': sale.price,
            'sold_at': sale.sold_at.isoformat()
        } for sale in sales]
        return jsonify(sales_list)
    except Exception as e:
        logger.error(f"Error getting water sales: {str(e)}")
        return jsonify({'error': 'Failed to load water sales'}), 500

@bp.route('/api/water-sales', methods=['POST'])
def create_water_sale():
    try:
        data = request.get_json()
        logger.debug(f"Received water sale data: {data}")

        customer = Customer.query.get_or_404(data['customer_id'])

        water_sale = WaterSale(
            customer_id=customer.id,
            size=data['size'],
            price=data['price']
        )

        db.session.add(water_sale)
        db.session.commit()

        return jsonify({
            'message': 'Water sale created successfully',
            'water_sale_id': water_sale.id
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating water sale: {str(e)}")
        return jsonify({'error': str(e)}), 500

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

@bp.route('/api/internet-access', methods=['POST'])
def create_internet_access():
    try:
        data = request.get_json()
        logger.debug(f"Received internet access data: {data}")

        customer = Customer.query.get_or_404(data['customer_id'])

        internet_access = InternetAccess(
            customer_id=customer.id
        )

        db.session.add(internet_access)
        db.session.commit()

        return jsonify({
            'message': 'Internet access created successfully',
            'internet_access_id': internet_access.id
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating internet access: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/customers/<int:customer_id>/photos/<photo_type>')
def get_customer_photo(customer_id, photo_type):
    try:
        customer = Customer.query.get_or_404(customer_id)
        if photo_type == 'selfie' and customer.selfie_photo:
            return send_file(io.BytesIO(customer.selfie_photo), mimetype='image/jpeg')
        elif photo_type == 'id' and customer.id_photo:
            return send_file(io.BytesIO(customer.id_photo), mimetype='image/jpeg')
        elif photo_type == 'bill' and customer.bill_photo:
            return send_file(io.BytesIO(customer.bill_photo), mimetype='image/jpeg')
        return jsonify({'error': 'Photo not found'}), 404
    except Exception as e:
        logger.error(f"Error getting customer photo: {str(e)}")
        return jsonify({'error': 'Failed to load photo'}), 500

@bp.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer_details(customer_id):
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
            'id_number': customer.id_number,
            'has_selfie': bool(customer.selfie_photo),
            'has_id_photo': bool(customer.id_photo),
            'has_bill_photo': bool(customer.bill_photo)
        })
    except Exception as e:
        logger.error(f"Error getting customer {customer_id}: {str(e)}")
        return jsonify({'error': f'Failed to load customer {customer_id}'}), 500

# New health access record endpoints
@bp.route('/api/health-access', methods=['GET'])
def get_health_records():
    try:
        records = HealthAccess.query.order_by(HealthAccess.visit_date.desc()).all()
        return jsonify([{
            'id': record.id,
            'customer_name': f"{record.customer.first_name} {record.customer.family_name}",
            'visit_date': record.visit_date.isoformat(),
            'symptoms': record.symptoms,
            'treatments': record.treatments,
            'notes': record.notes
        } for record in records])
    except Exception as e:
        logger.error(f"Error getting health records: {str(e)}")
        return jsonify({'error': 'Failed to load health records'}), 500

@bp.route('/api/health-access', methods=['POST'])
def create_health_record():
    try:
        data = request.get_json()
        customer = Customer.query.get_or_404(data['customer_id'])

        health_record = HealthAccess(
            customer_id=customer.id,
            symptoms=data['symptoms'],
            treatments=data['treatments'],
            notes=data.get('notes', '')
        )

        db.session.add(health_record)
        db.session.commit()

        return jsonify({
            'message': 'Health record created successfully',
            'health_record_id': health_record.id
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating health record: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/health-access/<int:record_id>', methods=['GET'])
def get_health_record(record_id):
    try:
        record = HealthAccess.query.get_or_404(record_id)
        return jsonify({
            'id': record.id,
            'customer_id': record.customer_id,
            'customer_name': f"{record.customer.first_name} {record.customer.family_name}",
            'visit_date': record.visit_date.isoformat(),
            'symptoms': record.symptoms,
            'treatments': record.treatments,
            'notes': record.notes
        })
    except Exception as e:
        logger.error(f"Error getting health record {record_id}: {str(e)}")
        return jsonify({'error': f'Failed to load health record {record_id}'}), 500