import os
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf

class ANNPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoders = None
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        """
        Dynamically locates and loads the Keras H5 model and pickled preprocessors
        from either training folders or containerized assets paths.
        """
        # Search paths (supports development workspaces and Docker paths)
        possible_dirs = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "model"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml_training", "models")
        ]
        
        model_dir = None
        for d in possible_dirs:
            if os.path.exists(os.path.join(d, "car_price_model.h5")):
                model_dir = d
                break
                
        if not model_dir:
            print("WARNING: ANN Predictor failed to locate car_price_model.h5 or pickled preprocessors.")
            print("Mathematical fallback pricing mode active until training finishes.")
            self.is_loaded = False
            return
            
        try:
            print(f"Loading StandardScaler & LabelEncoders from: {model_dir}")
            scaler_path = os.path.join(model_dir, "scaler.pkl")
            encoders_path = os.path.join(model_dir, "label_encoders.pkl")
            
            with open(scaler_path, "rb") as f:
                self.scaler = pickle.load(f)
                
            with open(encoders_path, "rb") as f:
                self.label_encoders = pickle.load(f)
                
            print(f"Loading TensorFlow ANN model weights from: {model_dir}")
            model_path = os.path.join(model_dir, "car_price_model.h5")
            self.model = tf.keras.models.load_model(model_path, compile=False)
            
            self.is_loaded = True
            print("ANN Predictor initialized and ready for real-time predictions.")
        except Exception as e:
            print(f"CRITICAL: Failed to compile Keras model artifacts. Error: {e}")
            self.is_loaded = False

    def predict(self, name: str, year: int, km_driven: int, fuel: str, seller_type: str, transmission: str, owner: str) -> float:
        """
        Converts categorical features via Label Encoders, applies standard scaling,
        and triggers the dense TensorFlow network layers.
        """
        if not self.is_loaded:
            # High-fidelity fallback valuation rules
            print("ANN Engine inactive. Serving standard linear depreciation baseline...")
            base_prices = {"Maruti": 500000, "Hyundai": 750000, "Honda": 900000, "Toyota": 1800000, "BMW": 4500000}
            brand = name.split()[0]
            base = base_prices.get(brand, 600000)
            age = 2026 - year
            price = base * (0.88 ** age) * (1.0 - (km_driven / 250000.0) * 0.3)
            if fuel == "Diesel": price *= 1.15
            if transmission == "Automatic": price *= 1.25
            return float(round(max(45000.0, price), 2))

        try:
            # 1. Label Encode categorical features
            # If an unseen textual brand/name is inputted, fall back safely to 0 (avoiding index crashes)
            try:
                name_encoded = self.label_encoders["name"].transform([name])[0]
            except Exception:
                # Substring match if brand matches or fallback default
                brand = name.split()[0]
                matching_classes = [c for c in self.label_encoders["name"].classes_ if brand in c]
                if matching_classes:
                    name_encoded = self.label_encoders["name"].transform([matching_classes[0]])[0]
                else:
                    name_encoded = 0
            
            fuel_encoded = self.label_encoders["fuel"].transform([fuel])[0]
            seller_encoded = self.label_encoders["seller_type"].transform([seller_type])[0]
            trans_encoded = self.label_encoders["transmission"].transform([transmission])[0]
            owner_encoded = self.label_encoders["owner"].transform([owner])[0]
            
            # Assemble feature columns in the exact order fitted:
            # [name, year, km_driven, fuel, seller_type, transmission, owner]
            features = np.array([[
                name_encoded,
                year,
                km_driven,
                fuel_encoded,
                seller_encoded,
                trans_encoded,
                owner_encoded
            ]], dtype=float)
            
            # 2. Apply StandardScaler
            features_scaled = self.scaler.transform(features)
            
            # 3. Model Inference
            pred_log = self.model.predict(features_scaled, verbose=0)
            predicted_price = float(pred_log[0][0])
            
            # Ensure price is at least a base scrap valuation (e.g. Rs. 40,000)
            return float(round(max(40000.0, predicted_price), 2))
            
        except Exception as e:
            print(f"Error during ANN model inference execution: {e}")
            raise e

# Single global predictor instance
ann_predictor = ANNPredictor()
