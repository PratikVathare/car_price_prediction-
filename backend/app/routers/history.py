from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from backend.app.schemas.prediction import PredictionResponse, AnalyticsSummary, PriceHistoryItem
from backend.app.models.prediction import Prediction
from backend.app.database import get_db

router = APIRouter(
    tags=["History & Analytics"]
)

@router.get("/history", response_model=List[PredictionResponse])
def get_prediction_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated logs of past car price predictions.
    """
    history = db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return history

@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics_dashboard(db: Session = Depends(get_db)):
    """
    Return global aggregated metrics to feed interactive graphs in the React frontend.
    """
    total = db.query(Prediction).count()
    
    if total == 0:
        return AnalyticsSummary(
            total_predictions=0,
            avg_predicted_price=0.0,
            max_predicted_price=0.0,
            min_predicted_price=0.0,
            brand_stats={},
            fuel_stats={},
            transmission_stats={},
            historical_trends=[]
        )
        
    # Standard stats
    avg_price = db.query(func.avg(Prediction.predicted_price)).scalar() or 0.0
    max_price = db.query(func.max(Prediction.predicted_price)).scalar() or 0.0
    min_price = db.query(func.min(Prediction.predicted_price)).scalar() or 0.0
    
    # Categorical groupings
    # Using SUBSTRING_INDEX to extract first word (brand) from car_name column
    brand_counts = db.query(
        func.substring_index(Prediction.car_name, ' ', 1), 
        func.count(Prediction.id)
    ).group_by(func.substring_index(Prediction.car_name, ' ', 1)).all()
    brand_stats = {brand: count for brand, count in brand_counts if brand}
    
    fuel_counts = db.query(Prediction.fuel, func.count(Prediction.id)).group_by(Prediction.fuel).all()
    fuel_stats = {fuel: count for fuel, count in fuel_counts if fuel}
    
    trans_counts = db.query(Prediction.transmission, func.count(Prediction.id)).group_by(Prediction.transmission).all()
    transmission_stats = {trans: count for trans, count in trans_counts if trans}
    
    # Historical Year trends (average price per manufacturing year)
    trends_query = db.query(
        Prediction.year,
        func.avg(Prediction.predicted_price),
        func.count(Prediction.id)
    ).group_by(Prediction.year).order_by(Prediction.year.asc()).all()
    
    historical_trends = [
        PriceHistoryItem(year=year, avg_price=round(avg, 2), count=count)
        for year, avg, count in trends_query
    ]
    
    return AnalyticsSummary(
        total_predictions=total,
        avg_predicted_price=round(avg_price, 2),
        max_predicted_price=round(max_price, 2),
        min_predicted_price=round(min_price, 2),
        brand_stats=brand_stats,
        fuel_stats=fuel_stats,
        transmission_stats=transmission_stats,
        historical_trends=historical_trends
    )
