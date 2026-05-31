import os
import random
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
import matplotlib.pyplot as plt

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

def generate_or_load_dataset():
    dataset_path = "ml_training/dataset/car_details.csv"
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Generating realistic mock dataset...")
        os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
        
        # Vocabularies for mock data
        brands = ["Maruti", "Hyundai", "Honda", "Toyota", "Ford", "BMW", "Mahindra", "Tata"]
        models = ["Swift", "Baleno", "City", "Fortuner", "EcoSport", "3 Series", "Thar", "Nexon"]
        fuels = ["Petrol", "Diesel", "CNG", "LPG"]
        seller_types = ["Individual", "Dealer", "Trustmark Dealer"]
        transmissions = ["Manual", "Automatic"]
        owners = ["First Owner", "Second Owner", "Third Owner", "Fourth & Above Owner", "Test Drive Car"]
        
        data = []
        for _ in range(2500):
            brand = random.choice(brands)
            model = random.choice(models)
            name = f"{brand} {model}"
            year = random.randint(2010, 2024)
            km_driven = random.randint(10000, 150000)
            fuel = random.choice(fuels)
            seller_type = random.choice(seller_types)
            transmission = random.choice(transmissions)
            owner = random.choice(owners)
            
            # Base price correlation
            base_price = 400000 if brand in ["Maruti", "Hyundai", "Tata"] else (700000 if brand in ["Honda", "Figo", "Mahindra"] else 2000000)
            age = 2026 - year
            depreciation = (0.88 ** age) * (1.0 - (km_driven / 300000.0) * 0.3)
            price_mult = 1.2 if transmission == "Automatic" else 1.0
            price_mult *= 1.1 if fuel == "Diesel" else 1.0
            
            selling_price = int(base_price * depreciation * price_mult * random.uniform(0.9, 1.1))
            selling_price = max(45000, selling_price)
            
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
        df.to_csv(dataset_path, index=False)
        print(f"Generated mock dataset successfully at {dataset_path}")
    else:
        print(f"Loading existing dataset from {dataset_path}...")
        df = pd.read_csv(dataset_path)
    return df

def main():
    # 1. Load Dataset
    df = generate_or_load_dataset()
    
    # 2. Data Preprocessing & Label Encoding
    print("\nProcessing categorical columns using Label Encoding...")
    categorical_cols = ["name", "fuel", "seller_type", "transmission", "owner"]
    
    label_encoders = {}
    df_encoded = df.copy()
    
    for col in categorical_cols:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df[col])
        label_encoders[col] = le
        print(f" - Encoded column: '{col}' (uniques: {len(le.classes_)})")
        
    # Separate Features and Target
    X = df_encoded.drop(columns=["selling_price"])
    y = df_encoded["selling_price"].values
    
    # 3. Train/Test Split
    print("\nSplitting dataset into Train (80%) and Test (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f" - Train set shape: {X_train.shape}")
    print(f" - Test set shape: {X_test.shape}")
    
    # 4. Feature Scaling
    print("\nScaling features using StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 5. Build ANN Model
    print("\nConstructing Artificial Neural Network (ANN) architecture...")
    input_dim = X_train_scaled.shape[1]
    
    model = Sequential([
        Dense(64, input_dim=input_dim, activation='relu'),
        Dense(32, activation='relu'),
        Dense(16, activation='relu'),
        Dense(1, activation='linear') # Output layer for regression (selling_price)
    ])
    
    # 6. MSE Loss and Adam Optimizer
    print("Compiling ANN model with MSE loss and Adam optimizer...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
        loss='mse',
        metrics=['mae']
    )
    
    # 7. Model Training
    epochs = 60
    batch_size = 32
    print(f"\nTraining model for {epochs} epochs...")
    
    history = model.fit(
        X_train_scaled, y_train,
        validation_split=0.2,
        epochs=epochs,
        batch_size=batch_size,
        verbose=1
    )
    
    # 8. Save Model as car_price_model.h5
    os.makedirs("ml_training/models", exist_ok=True)
    model_path = "ml_training/models/car_price_model.h5"
    model.save(model_path)
    print(f"\nSaved trained TensorFlow ANN model weights to: {model_path}")
    
    # 9. Save Scaler and Encoders using Pickle
    scaler_path = "ml_training/models/scaler.pkl"
    encoders_path = "ml_training/models/label_encoders.pkl"
    
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"Saved fitted StandardScaler to: {scaler_path}")
        
    with open(encoders_path, "wb") as f:
        pickle.dump(label_encoders, f)
    print(f"Saved fitted LabelEncoders dictionary to: {encoders_path}")
    
    # 10. Generate Performance Metrics
    print("\nEvaluating model on test partition...")
    y_pred = model.predict(X_test_scaled).flatten()
    
    # Ensure there are no negative values predicted
    y_pred = np.clip(y_pred, 40000, None)
    
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print("\n================== ANN Performance Metrics ==================")
    print(f"Mean Absolute Error (MAE)     : Rs. {mae:,.2f}")
    print(f"Mean Squared Error (MSE)       : {mse:,.2f}")
    print(f"Root Mean Squared Error (RMSE) : Rs. {rmse:,.2f}")
    print(f"R-squared (R2) Regression Score: {r2:.4f}")
    print("=============================================================")
    
    # 11. Plot Training Loss and Validation Loss
    print("\nGenerating training history plot...")
    plt.figure(figsize=(10, 6))
    plt.plot(history.history['loss'], label='Training Loss (MSE)', color='#6366f1', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validation Loss (MSE)', color='#ec4899', linewidth=2)
    plt.title('ANN Training vs Validation Loss', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Epochs', fontsize=12)
    plt.ylabel('Mean Squared Error (Loss)', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.legend(fontsize=11)
    
    plot_path = "ml_training/models/loss_plot.png"
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    print(f"Loss visualization graph saved successfully to: {plot_path}")
    plt.close()

if __name__ == "__main__":
    main()
