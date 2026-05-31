from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.connection import get_db
from backend.models.db_models import Prediction, User
from backend.models.schemas import PredictionCreate, PredictionResponse
from backend.services.auth_service import get_current_user
from backend.ml_model.predictor import ann_predictor

router = APIRouter(
    prefix="/predict",
    tags=["Prediction Engine"]
)

@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def evaluate_car_valuation(
    payload: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user) # Optional JWT login tracking
):
    """
    Evaluate automobile valuation using the TensorFlow ANN.
    Automatically links prediction records to the authenticated profile if a JWT header is present.
    """
    try:
        # 1. Trigger ANN prediction
        predicted_val = ann_predictor.predict(
            name=payload.name,
            year=payload.year,
            km_driven=payload.km_driven,
            fuel=payload.fuel,
            seller_type=payload.seller_type,
            transmission=payload.transmission,
            owner=payload.owner
        )
        
        # 2. Extract user ID if logged in, else None
        active_user_id = current_user.id if current_user else None
        
        # 3. Log values to MySQL predictions table
        db_prediction = Prediction(
            user_id=active_user_id,
            car_name=payload.name,
            year=payload.year,
            km_driven=payload.km_driven,
            fuel=payload.fuel,
            seller_type=payload.seller_type,
            transmission=payload.transmission,
            owner=payload.owner,
            predicted_price=predicted_val
        )
        
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Automobile evaluation pipeline failed: {str(e)}"
        )
