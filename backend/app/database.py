from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sqlalchemy
from backend.app.config import settings

# Create engine
# We use pool_pre_ping=True to prevent stale connection errors
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initializes the database. Creates the database schema if not present,
    and runs declarative creation of tables.
    """
    # Create the database if it doesn't exist (bootstrap helper)
    # Extract base connection url without database name
    import urllib.parse
    encoded_password = urllib.parse.quote_plus(settings.MYSQL_PASSWORD)
    base_url = f"mysql+pymysql://{settings.MYSQL_USER}:{encoded_password}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}"
    temp_engine = create_engine(base_url)
    
    try:
        with temp_engine.connect() as conn:
            conn.execute(sqlalchemy.text(f"CREATE DATABASE IF NOT EXISTS {settings.MYSQL_DATABASE}"))
        print(f"Verified or created database: {settings.MYSQL_DATABASE}")
    except Exception as e:
        print(f"Warning: Failed to auto-create database {settings.MYSQL_DATABASE} ({e}). Proceeding assuming it exists...")
    finally:
        temp_engine.dispose()
        
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
