from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

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
    predicted_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="predictions")
