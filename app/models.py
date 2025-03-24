from app import db
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, LargeBinary, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timedelta

class Customer(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    middle_name: Mapped[str] = mapped_column(String(50), nullable=True)
    family_name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    address: Mapped[str] = mapped_column(String(200), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)

    # KYC Information
    date_of_birth: Mapped[str] = mapped_column(String(10), nullable=False)
    city_of_birth: Mapped[str] = mapped_column(String(100), nullable=False)
    id_type: Mapped[str] = mapped_column(String(50), nullable=False)
    id_number: Mapped[str] = mapped_column(String(50), nullable=False)

    # Photo storage - explicitly marked as nullable
    selfie_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    id_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    bill_photo: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    customer: Mapped["Customer"] = relationship("Customer", backref="rentals")
    battery: Mapped["Battery"] = relationship("Battery", backref="rentals")
    battery_type: Mapped["BatteryType"] = relationship("BatteryType")

class WaterSale(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sold_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer: Mapped["Customer"] = relationship("Customer", backref="water_purchases")

class InternetAccess(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    purchased_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    wifi_password: Mapped[str] = mapped_column(String(20), nullable=False)
    duration_type: Mapped[str] = mapped_column(String(20), nullable=False)  # '24h', '3d', '1w', '1m'
    price: Mapped[float] = mapped_column(Float, nullable=False)
    customer: Mapped["Customer"] = relationship("Customer", backref="internet_purchases")

class HealthAccess(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    visit_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    symptoms: Mapped[str] = mapped_column(Text, nullable=False)
    treatments: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship with customer
    customer: Mapped["Customer"] = relationship("Customer", backref="health_visits")