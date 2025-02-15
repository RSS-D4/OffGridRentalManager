from app import db
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

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

class BatteryRental(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    battery_type: Mapped[str] = mapped_column(String(50), nullable=False)
    rented_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    returned_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    customer: Mapped["Customer"] = relationship("Customer", backref="rentals")

class WaterSale(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    sold_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer: Mapped["Customer"] = relationship("Customer", backref="water_purchases")

class InternetAccess(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey('customer.id'), nullable=False)
    purchased_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer: Mapped["Customer"] = relationship("Customer", backref="internet_purchases")