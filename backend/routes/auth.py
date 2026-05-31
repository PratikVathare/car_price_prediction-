from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.db_models import User
from backend.models.schemas import UserRegister, UserLogin, UserResponse, Token
from backend.services.auth_service import AuthService, get_required_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    """Create a new user account with unique credentials and hashed password."""
    # Check if username exists
    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already registered."
        )
        
    # Check if email exists
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
        
    # Create user record
    hashed_password = AuthService.hash_password(payload.password)
    db_user = User(
        username=payload.username,
        email=payload.email,
        password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and issue JWT Access Token."""
    user = AuthService.authenticate_user(db, payload.username_or_email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, email, or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Issue JWT token, placing the user ID inside the subject claim 'sub'
    access_token = AuthService.create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
def get_authenticated_profile(current_user: User = Depends(get_required_user)):
    """Retrieve logged-in profile context via JWT verification."""
    return current_user
