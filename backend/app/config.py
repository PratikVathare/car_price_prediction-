import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Car Price Prediction System"
    API_V1_STR: str = "/api"
    
    # Database Settings
    # Standard format: mysql+pymysql://user:password@host:port/dbname
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "rootpassword")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "car_prediction_db")
    
    @property
    def DATABASE_URL(self) -> str:
        import urllib.parse
        encoded_password = urllib.parse.quote_plus(self.MYSQL_PASSWORD)
        return f"mysql+pymysql://{self.MYSQL_USER}:{encoded_password}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        
    # ML Model Settings
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "model")
    MODEL_PATH: str = os.path.join(MODEL_DIR, "car_price_ann.keras")
    PREPROCESSOR_PATH: str = os.path.join(MODEL_DIR, "preprocessor.pkl")
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]

    class Config:
        case_sensitive = True
        # Resolve .env relative to this file's folder (backend root) or current working directory
        env_file = (
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
            ".env"
        )

settings = Settings()
