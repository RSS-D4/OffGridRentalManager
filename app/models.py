from app import db
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, LargeBinary, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timedelta

class Customer(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Name fields
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    middle_name: Mapped[str] = mapped_column(String(50), nullable=True)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    second_last_name: Mapped[str] = mapped_column(String(50), nullable=True)

    # Contact information
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # Including country code
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=True)

    # Address information
    address_line1: Mapped[str] = mapped_column(String(200), nullable=False)
    address_line2: Mapped[str] = mapped_column(String(200), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    state_province: Mapped[str] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=True)

    # Authentication
    pin: Mapped[str] = mapped_column(String(6), nullable=False)  # 6-digit PIN

    # KYC Information
    date_of_birth: Mapped[str] = mapped_column(String(10), nullable=False)  # MM/DD/YYYY format
    birth_city: Mapped[str] = mapped_column(String(100), nullable=False)
    id_type: Mapped[str] = mapped_column(String(50), nullable=True)  # 'passport', 'national_id', 'drivers_license'
    id_number: Mapped[str] = mapped_column(String(50), nullable=True)

    # Photo storage - explicitly marked as nullable
    selfie_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    id_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    bill_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    rentals: Mapped[list["BatteryRental"]] = relationship("BatteryRental", back_populates="customer")
    water_purchases: Mapped[list["WaterSale"]] = relationship("WaterSale", back_populates="customer")
    internet_purchases: Mapped[list["InternetAccess"]] = relationship("InternetAccess", back_populates="customer")
    health_visits: Mapped[list["HealthAccess"]] = relationship("HealthAccess", back_populates="customer")


class BatteryType(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'battery' or 'charging'
    capacity: Mapped[str] = mapped_column(String(50), nullable=True)
    rental_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    delivery_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Relationship with batteries
    batteries: Mapped[list["Battery"]] = relationship("Battery", back_populates="battery_type")

class Battery(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    battery_type_id: Mapped[int] = mapped_column(Integer, ForeignKey('battery_type.id'), nullable=False)
    unit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default='available')  # 'available', 'rented', 'maintenance'

    # Relationship with battery type
    battery_type: Mapped["BatteryType"] = relationship("BatteryType", back_populates="batteries")
    rentals: Mapped[list["BatteryRental"]] = relationship("BatteryRental", back_populates="battery")

class BatteryRental(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    battery_id: Mapped[int] = mapped_column(Integer, ForeignKey('battery.id'), nullable=True)
    battery_type_id: Mapped[int] = mapped_column(Integer, ForeignKey('battery_type.id'), nullable=False)
    rental_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    delivery_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    rented_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    returned_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="rentals")
    battery: Mapped["Battery"] = relationship("Battery", back_populates="rentals")
    battery_type: Mapped["BatteryType"] = relationship("BatteryType")

class WaterSale(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sold_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer: Mapped["Customer"] = relationship("Customer", back_populates="water_purchases")

class InternetAccess(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    purchased_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    wifi_password: Mapped[str] = mapped_column(String(20), nullable=False)
    duration_type: Mapped[str] = mapped_column(String(20), nullable=False)  # '24h', '3d', '1w', '1m'
    price: Mapped[float] = mapped_column(Float, nullable=False)
    customer: Mapped["Customer"] = relationship("Customer", back_populates="internet_purchases")

class HealthAccess(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    visit_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    symptoms: Mapped[str] = mapped_column(Text, nullable=False)
    treatments: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer: Mapped["Customer"] = relationship("Customer", back_populates="health_visits")