import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.routers import predict, history
from backend.app.ml.engine import ml_engine

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-Stack AI Car Price Prediction REST API using TensorFlow/Keras & MySQL."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle Event Handlers
@app.on_event("startup")
def startup_event():
    print("FastAPI Backend Booting...")
    # Initialize MySQL schema
    init_db()
    # Reload model weights in case they were trained just now
    ml_engine.load_model_and_preprocessor()

# Register Routers
app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["General"])
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "healthy",
        "api_documentation": "/docs"
    }

@app.get("/health", tags=["General"])
def health_check():
    return {
        "status": "online",
        "database": "connected",
        "model_loaded": ml_engine.is_loaded
    }

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
