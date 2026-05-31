-- AutoValuate AI Car Price Prediction System Database Schema
-- DBMS: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS car_prediction_db;
USE car_prediction_db;

-- 1. Users Table
-- Stores user accounts for authentication and personal prediction history logging.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary Key Constraint
    CONSTRAINT pk_users PRIMARY KEY (id),
    
    -- Unique Constraints
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Predictions Table
-- Stores logged deep learning model inputs and their corresponding predicted valuations.
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT,
    user_id INT NULL, -- Set to NULL if prediction is made anonymously
    car_name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    km_driven INT NOT NULL,
    fuel VARCHAR(20) NOT NULL,
    seller_type VARCHAR(30) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    owner VARCHAR(30) NOT NULL,
    predicted_price DECIMAL(12, 2) NOT NULL, -- Standard DECIMAL for high precision currency
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary Key Constraint
    CONSTRAINT pk_predictions PRIMARY KEY (id),
    
    -- Foreign Key Constraint
    -- If a user is deleted, their prediction records are preserved (user_id set to NULL)
    CONSTRAINT fk_predictions_users 
        FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Optimization Indexes
-- Faster lookups when querying a specific user's histories
CREATE INDEX idx_predictions_user_id ON predictions (user_id);

-- Speed up textual search and aggregation filtering by brand/model
CREATE INDEX idx_predictions_car_name ON predictions (car_name);

-- Speed up multi-variable trend charts sorting (e.g. by year and valuation)
CREATE INDEX idx_predictions_year_price ON predictions (year, predicted_price);
