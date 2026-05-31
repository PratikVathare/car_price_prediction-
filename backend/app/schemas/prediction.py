from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class PredictionCreate(BaseModel):
    name: str = Field(..., example="Maruti Swift Dzire VDI")
    year: int = Field(..., ge=2000, le=2026, example=2015)
    km_driven: int = Field(..., ge=100, le=1000000, example=65000)
    fuel: str = Field(..., example="Diesel") # Petrol, Diesel, CNG, LPG
    seller_type: str = Field(..., example="Individual") # Individual, Dealer, Trustmark Dealer
    transmission: str = Field(..., example="Manual") # Manual, Automatic
    owner: str = Field(..., example="First Owner") # First Owner, Second Owner, etc.

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

class PriceHistoryItem(BaseModel):
    year: int
    avg_price: float
    count: int

class AnalyticsSummary(BaseModel):
    total_predictions: int
    avg_predicted_price: float
    max_predicted_price: float
    min_predicted_price: float
    brand_stats: Dict[str, int]
    fuel_stats: Dict[str, int]
    transmission_stats: Dict[str, int]
    historical_trends: List[PriceHistoryItem]
