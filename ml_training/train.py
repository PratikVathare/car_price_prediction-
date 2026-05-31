import os
import random
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
import joblib

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)
tf.random.set_seed(42)

def generate_mock_dataset(filepath, num_records=3000):
    print(f"Generating realistic mock dataset with {num_records} records...")
    
    # Vocabulary for realistic car generator
    brands = {
        "Maruti": {"models": ["Swift", "Baleno", "Alto", "Dzire", "WagonR", "Brezza"], "base_price": 500000},
        "Hyundai": {"models": ["i10", "i20", "Creta", "Verna", "Venue", "Elantra"], "base_price": 750000},
        "Honda": {"models": ["City", "Civic", "Amaze", "Jazz", "WR-V"], "base_price": 900000},
        "Toyota": {"models": ["Corolla", "Fortuner", "Innova", "Yaris", "Glanza"], "base_price": 1800000},
        "Ford": {"models": ["EcoSport", "Figo", "Endeavour", "Aspire"], "base_price": 850000},
        "BMW": {"models": ["3 Series", "5 Series", "X1", "X3", "X5"], "base_price": 4500000},
        "Mahindra": {"models": ["Thar", "Scorpio", "XUV500", "Bolero", "XUV700"], "base_price": 1200000},
        "Tata": {"models": ["Nexon", "Harrier", "Safari", "Tiago", "Altroz"], "base_price": 800000}
    }
    
    fuels = ["Petrol", "Diesel", "CNG", "LPG"]
    fuel_weights = [0.55, 0.40, 0.04, 0.01]
    
    seller_types = ["Individual", "Dealer", "Trustmark Dealer"]
    seller_weights = [0.65, 0.30, 0.05]
    
    transmissions = ["Manual", "Automatic"]
    transmission_weights = [0.75, 0.25]
    
    owners = ["First Owner", "Second Owner", "Third Owner", "Fourth & Above Owner", "Test Drive Car"]
    owner_weights = [0.70, 0.22, 0.06, 0.018, 0.002]
    
    data = []
    
    for _ in range(num_records):
        brand = random.choice(list(brands.keys()))
        model = random.choice(brands[brand]["models"])
        name = f"{brand} {model}"
        
        # Continuous Variables
        year = random.randint(2010, 2024)
        km_driven = random.randint(5000, 180000)
        
        # Categorical Variables
        fuel = np.random.choice(fuels, p=fuel_weights)
        seller_type = np.random.choice(seller_types, p=seller_weights)
        transmission = np.random.choice(transmissions, p=transmission_weights)
        owner = np.random.choice(owners, p=owner_weights)
        
        # Let's calculate selling_price using a realistic non-linear formulation
        base = brands[brand]["base_price"]
        
        # Age depreciation (compounded ~10% loss per year)
        age = 2026 - year # Using 2026 as current year context
        depreciation_age = (0.90 ** age)
        
        # Mileage depreciation (1% loss per 10,000 km driven)
        depreciation_km = max(0.4, 1.0 - (km_driven / 250000.0) * 0.4)
        
        # Price adjustments
        fuel_multiplier = 1.0
        if fuel == "Diesel":
            fuel_multiplier = 1.15 # Diesel is more expensive
        elif fuel in ["CNG", "LPG"]:
            fuel_multiplier = 0.90
            
        trans_multiplier = 1.25 if transmission == "Automatic" else 1.0
        
        seller_multiplier = 1.05 if seller_type == "Dealer" else (1.10 if seller_type == "Trustmark Dealer" else 1.0)
        
        owner_multipliers = {
            "Test Drive Car": 0.95,
            "First Owner": 1.0,
            "Second Owner": 0.85,
            "Third Owner": 0.70,
            "Fourth & Above Owner": 0.50
        }
        owner_multiplier = owner_multipliers[owner]
        
        # Build price with random noise (+/- 8%)
        noise = random.uniform(0.92, 1.08)
        
        selling_price = int(base * depreciation_age * depreciation_km * fuel_multiplier * trans_multiplier * seller_multiplier * owner_multiplier * noise)
        
        # Bound selling price to be at least a reasonable scrap value
        selling_price = max(40000, selling_price)
        
        data.append({
            "name": name,
            "year": year,
            "selling_price": selling_price,
            "km_driven": km_driven,
            "fuel": fuel,
            "seller_type": seller_type,
            "transmission": transmission,
            "owner": owner
        })
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Mock dataset generated successfully at {filepath}")
    return df

def train_pipeline():
    dataset_path = "ml_training/dataset/car_details.csv"
    if not os.path.exists(dataset_path):
        df = generate_mock_dataset(dataset_path)
    else:
        print(f"Loading existing dataset from {dataset_path}...")
        df = pd.read_csv(dataset_path)
        
    # 1. Feature Engineering
    print("Pre-processing and engineering features...")
    # Extract brand as the first word
    df['brand'] = df['name'].apply(lambda x: x.split()[0])
    
    # 2. Separate Target and Features
    X = df.drop(columns=['selling_price', 'name'])
    y = df['selling_price'].values
    
    # Define mapping for owner
    owner_map = {
        "Test Drive Car": 0,
        "First Owner": 1,
        "Second Owner": 2,
        "Third Owner": 3,
        "Fourth & Above Owner": 4
    }
    X['owner_encoded'] = X['owner'].map(owner_map)
    X = X.drop(columns=['owner'])
    
    # Categorical columns to one-hot encode
    cat_cols = ['brand', 'fuel', 'seller_type', 'transmission']
    num_cols = ['year', 'km_driven']
    
    # OneHotEncoding categorical columns
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    X_encoded_cat = ohe.fit_transform(X[cat_cols])
    cat_feature_names = ohe.get_feature_names_out(cat_cols)
    X_encoded_cat_df = pd.DataFrame(X_encoded_cat, columns=cat_feature_names)
    
    # Scaling numerical columns
    scaler = StandardScaler()
    X_scaled_num = scaler.fit_transform(X[num_cols])
    X_scaled_num_df = pd.DataFrame(X_scaled_num, columns=num_cols)
    
    # Combine back
    X_processed = pd.concat([X_scaled_num_df, X_encoded_cat_df, X['owner_encoded'].reset_index(drop=True)], axis=1)
    feature_columns = list(X_processed.columns)
    
    print(f"Processed feature matrix shape: {X_processed.shape}")
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X_processed.values, y, test_size=0.2, random_state=42)
    
    # Define neural network
    print("Constructing TensorFlow/Keras ANN architecture...")
    input_dim = X_train.shape[1]
    
    model = Sequential([
        Dense(128, input_dim=input_dim, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1, activation='linear')
    ])
    
    # Compile
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.005),
        loss='mse',
        metrics=['mae']
    )
    
    # Callbacks
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    print("Training ANN Regressor...")
    # Target log-transform to stabilize training (since car prices have high variance)
    # We will log-transform the target, train, and then inverse log transform (exp) in inference!
    y_train_log = np.log1p(y_train)
    y_test_log = np.log1p(y_test)
    
    history = model.fit(
        X_train, y_train_log,
        validation_split=0.15,
        epochs=60,
        batch_size=32,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Evaluation
    print("Evaluating trained model on test split...")
    y_pred_log = model.predict(X_test)
    y_pred = np.expm1(y_pred_log).flatten()
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\n--- ANN Performance Metrics ---")
    print(f"Mean Absolute Error (MAE): Rs. {mae:,.2f}")
    print(f"Root Mean Squared Error (RMSE): Rs. {rmse:,.2f}")
    print(f"R-squared (R2) Score: {r2:.4f}")
    print("--------------------------------\n")
    
    # Create export directories
    os.makedirs("backend/app/ml/model", exist_ok=True)
    os.makedirs("ml_training/models", exist_ok=True)
    
    # Save the pipeline preprocessor
    preprocessor = {
        "brand_encoder": ohe,
        "scaler": scaler,
        "owner_map": owner_map,
        "feature_columns": feature_columns,
        "cat_cols": cat_cols,
        "num_cols": num_cols
    }
    
    joblib.dump(preprocessor, "ml_training/models/preprocessor.pkl")
    joblib.dump(preprocessor, "backend/app/ml/model/preprocessor.pkl")
    print("Serialized preprocessor and saved to training & backend locations.")
    
    # Save TensorFlow/Keras model
    model.save("ml_training/models/car_price_ann.keras")
    model.save("backend/app/ml/model/car_price_ann.keras")
    print("Exported TensorFlow ANN weights to training & backend locations.")

if __name__ == "__main__":
    train_pipeline()
