from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    car_name = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    km_driven = Column(Integer, nullable=False)
    fuel = Column(String(20), nullable=False)
    seller_type = Column(String(30), nullable=False)
    transmission = Column(String(20), nullable=False)
    owner = Column(String(30), nullable=False)
    predicted_price = Column(DECIMAL(12, 2), nullable=False) # Precision DECIMAL matching database schema
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="predictions")
