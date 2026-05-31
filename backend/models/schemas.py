from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List, Dict

# --- Authentication Schemas ---

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="carlover123")
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(..., min_length=6, example="secret123")

class UserLogin(BaseModel):
    username_or_email: str = Field(..., example="user@example.com")
    password: str = Field(..., example="secret123")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str # username or user_id
    exp: int

# --- Prediction Schemas ---

class PredictionCreate(BaseModel):
    name: str = Field(..., example="Maruti Swift VXI")
    year: int = Field(..., ge=2000, le=2026, example=2018)
    km_driven: int = Field(..., ge=100, le=1000000, example=45000)
    fuel: str = Field(..., example="Petrol")
    seller_type: str = Field(..., example="Individual")
    transmission: str = Field(..., example="Manual")
    owner: str = Field(..., example="First Owner")

class PredictionResponse(BaseModel):
    id: int
    user_id: Optional[int]
    car_name: str
    year: int
    km_driven: int
    fuel: str
    seller_type: str
    transmission: str
    owner: str
    predicted_price: float
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analytics Schemas ---

class PriceTrendItem(BaseModel):
    year: int
    avg_price: float
    count: int

class AnalyticsDashboard(BaseModel):
    total_predictions: int
    avg_predicted_price: float
    max_predicted_price: float
    min_predicted_price: float
    brand_stats: Dict[str, int]
    fuel_stats: Dict[str, int]
    transmission_stats: Dict[str, int]
    historical_trends: List[PriceTrendItem]
