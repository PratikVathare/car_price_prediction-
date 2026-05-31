import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlalchemy

# Load Database Configs from environment variables
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "mysql@123")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "car_prediction_db")

# Dynamic URL-encoding to handle special characters (e.g. '@') in passwords safely
encoded_password = urllib.parse.quote_plus(MYSQL_PASSWORD)

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# SQLAlchemy Engine & Session Setup
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Yield database session to routes and close it on requests completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Auto-creates the MySQL database if not present and sets up tables."""
    base_connection_url = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}"
    temp_engine = create_engine(base_connection_url)
    
    try:
        with temp_engine.connect() as conn:
            conn.execute(sqlalchemy.text(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}"))
        print(f"Verified database existence: {MYSQL_DATABASE}")
    except Exception as e:
        print(f"Warning: Auto-creation warning ({e}). Proceeding assuming DB exists...")
    finally:
        temp_engine.dispose()
        
    # Compile schemas declarative models
    Base.metadata.create_all(bind=engine)
    print("MySQL database structures successfully compiled.")
