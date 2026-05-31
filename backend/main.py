import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import init_database
from backend.ml_model.predictor import ann_predictor
from backend.routes import auth, predict, history

# Initialize FastAPI application
app = FastAPI(
    title="AutoValuate AI Backend Service",
    version="2.0.0",
    description="Microservice Architecture supporting JWT Auth, User Registrations, and TensorFlow ANN Regression."
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust origins list in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle startup hooks
@app.on_event("startup")
def boot_sequence():
    print("Executing AutoValuate AI startup hooks...")
    # Initialize MySQL schema and table connections
    init_database()
    # Trigger model weights loading
    ann_predictor.load_artifacts()

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(history.router, prefix="/api")

@app.get("/", tags=["Liveness Check"])
def read_root():
    return {
        "service": "AutoValuate AI REST API Engine",
        "status": "healthy",
        "interactive_documentation": "/docs"
    }

@app.get("/health", tags=["Liveness Check"])
def liveness_check():
    return {
        "status": "online",
        "model_engine_loaded": ann_predictor.is_loaded
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
