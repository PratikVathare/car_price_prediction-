from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from backend.database.connection import get_db
from backend.models.db_models import Prediction, User
from backend.models.schemas import PredictionResponse, AnalyticsDashboard, PriceTrendItem
from backend.services.auth_service import get_current_user, get_required_user

router = APIRouter(
    tags=["Prediction Logs & Stats"]
)

@router.get("/history/all", response_model=List[PredictionResponse])
def get_global_prediction_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve global logs of all past vehicle evaluations (public history)."""
    logs = db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/history/me", response_model=List[PredictionResponse])
def get_private_prediction_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_required_user) # Forces JWT authentication
):
    """Retrieve logs of vehicle evaluations made specifically by the logged-in user profile."""
    logs = db.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/analytics", response_model=AnalyticsDashboard)
def get_charts_aggregates(db: Session = Depends(get_db)):
    """Return compiled statistical matrices to feed visual charts."""
    total = db.query(Prediction).count()
    
    if total == 0:
        return AnalyticsDashboard(
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
    
    # Categorical aggregates (brand name substring parsing)
    brand_counts = db.query(
        func.substring_index(Prediction.car_name, ' ', 1),
        func.count(Prediction.id)
    ).group_by(func.substring_index(Prediction.car_name, ' ', 1)).all()
    brand_stats = {brand: count for brand, count in brand_counts if brand}
    
    fuel_counts = db.query(Prediction.fuel, func.count(Prediction.id)).group_by(Prediction.fuel).all()
    fuel_stats = {fuel: count for fuel, count in fuel_counts if fuel}
    
    trans_counts = db.query(Prediction.transmission, func.count(Prediction.id)).group_by(Prediction.transmission).all()
    transmission_stats = {trans: count for trans, count in trans_counts if trans}
    
    # Manufacturing Year trend lines
    trends_query = db.query(
        Prediction.year,
        func.avg(Prediction.predicted_price),
        func.count(Prediction.id)
    ).group_by(Prediction.year).order_by(Prediction.year.asc()).all()
    
    historical_trends = [
        PriceTrendItem(year=year, avg_price=float(round(avg, 2)), count=count)
        for year, avg, count in trends_query
    ]
    
    return AnalyticsDashboard(
        total_predictions=total,
        avg_predicted_price=float(round(avg_price, 2)),
        max_predicted_price=float(round(max_price, 2)),
        min_predicted_price=float(round(min_price, 2)),
        brand_stats=brand_stats,
        fuel_stats=fuel_stats,
        transmission_stats=transmission_stats,
        historical_trends=historical_trends
    )
