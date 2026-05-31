from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas.prediction import PredictionCreate, PredictionResponse
from backend.app.models.prediction import Prediction
from backend.app.database import get_db
from backend.app.ml.engine import ml_engine

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_car_price(payload: PredictionCreate, db: Session = Depends(get_db)):
    """
    Predict the selling price of a car using deep learning ANN, log the result in MySQL, and return predicted price.
    """
    try:
        # Get ML prediction
        predicted_price = ml_engine.predict(
            name=payload.name,
            year=payload.year,
            km_driven=payload.km_driven,
            fuel=payload.fuel,
            seller_type=payload.seller_type,
            transmission=payload.transmission,
            owner=payload.owner
        )
        
        # Save to database (matches new predictions table columns exactly)
        db_prediction = Prediction(
            user_id=None, # Public prediction log
            car_name=payload.name,
            year=payload.year,
            km_driven=payload.km_driven,
            fuel=payload.fuel,
            seller_type=payload.seller_type,
            transmission=payload.transmission,
            owner=payload.owner,
            predicted_price=predicted_price
        )
        
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference and Logging failed: {str(e)}"
        )
