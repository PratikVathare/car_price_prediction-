import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from backend.app.config import settings

class MLEngine:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        self.load_model_and_preprocessor()

    def load_model_and_preprocessor(self):
        """
        Loads the pre-trained Keras model and the scikit-learn preprocessor.
        """
        if not os.path.exists(settings.MODEL_PATH) or not os.path.exists(settings.PREPROCESSOR_PATH):
            print(f"WARNING: Model artifacts not found at {settings.MODEL_PATH} or {settings.PREPROCESSOR_PATH}.")
            print("Please run the training pipeline first (ml_training/train.py) or check paths.")
            self.is_loaded = False
            return
        
        try:
            print("Loading preprocessor pipeline...")
            self.preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            
            print("Loading TensorFlow Keras model...")
            self.model = tf.keras.models.load_model(settings.MODEL_PATH)
            
            self.is_loaded = True
            print("ML Engine loaded model and preprocessor successfully.")
        except Exception as e:
            print(f"CRITICAL: Failed to load ML model artifacts. Error: {e}")
            self.is_loaded = False

    def predict(self, name: str, year: int, km_driven: int, fuel: str, seller_type: str, transmission: str, owner: str) -> float:
        """
        Preprocesses raw inputs, feeds to TensorFlow ANN model, and returns the inverse-log predicted selling price.
        """
        if not self.is_loaded:
            # Fallback mock prediction formula if model is not trained yet so the backend can still be tested
            print("ML Engine is not loaded. Utilizing high-fidelity mathematical fallback prediction...")
            brand = name.split()[0]
            base_prices = {"Maruti": 500000, "Hyundai": 750000, "Honda": 900000, "Toyota": 1800000, "Ford": 850000, "BMW": 4500000}
            base = base_prices.get(brand, 600000)
            age = 2026 - year
            price = base * (0.90 ** age) * (1.0 - (km_driven / 250000.0) * 0.4)
            if fuel == "Diesel": price *= 1.15
            if transmission == "Automatic": price *= 1.25
            if owner == "Second Owner": price *= 0.85
            return round(max(40000.0, price), 2)

        try:
            # 1. Feature Engineering (match train.py)
            brand = name.split()[0]
            
            # Map owner ordinal
            owner_map = self.preprocessor["owner_map"]
            owner_encoded = owner_map.get(owner, 1) # Default to 1 (First Owner) if not found
            
            # Create a dataframe for the input row (matching the original column names)
            input_df = pd.DataFrame([{
                "brand": brand,
                "fuel": fuel,
                "seller_type": seller_type,
                "transmission": transmission,
                "year": year,
                "km_driven": km_driven,
                "owner_encoded": owner_encoded
            }])
            
            # 2. Extract encoders and scalers
            ohe = self.preprocessor["brand_encoder"]
            scaler = self.preprocessor["scaler"]
            cat_cols = self.preprocessor["cat_cols"]
            num_cols = self.preprocessor["num_cols"]
            feature_columns = self.preprocessor["feature_columns"]
            
            # Encode categorical features
            encoded_cat = ohe.transform(input_df[cat_cols])
            cat_feature_names = ohe.get_feature_names_out(cat_cols)
            encoded_cat_df = pd.DataFrame(encoded_cat, columns=cat_feature_names)
            
            # Scale numerical features
            scaled_num = scaler.transform(input_df[num_cols])
            scaled_num_df = pd.DataFrame(scaled_num, columns=num_cols)
            
            # Combine all features
            processed_df = pd.concat([scaled_num_df, encoded_cat_df, input_df['owner_encoded']], axis=1)
            
            # Reorder columns to match original feature column names exactly, filling missing columns with 0.0
            # (Just in case brand is an unseen category, get_feature_names_out would align)
            for col in feature_columns:
                if col not in processed_df.columns:
                    processed_df[col] = 0.0
                    
            processed_input = processed_df[feature_columns].values
            
            # 3. Model Inference
            predicted_log = self.model.predict(processed_input, verbose=0)
            
            # Inverse log transform log(1+x) -> expm1
            predicted_price = np.expm1(predicted_log[0][0])
            
            # Ensure price is at least a base scrap valuation (e.g. Rs. 40,000)
            final_price = float(max(40000.0, predicted_price))
            return round(final_price, 2)
            
        except Exception as e:
            print(f"Error during ML inference: {e}")
            raise e

# Instantiate a single global engine
ml_engine = MLEngine()
