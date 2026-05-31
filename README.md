# AutoValuate AI: Car Price Prediction System 🚗

AutoValuate AI is a high-fidelity, full-stack Artificial Intelligence application that predicts car values based on specifications (model name, year, mileage, fuel type, transmission type, seller type, and ownership tier). It features a multi-layered deep learning regressor built with TensorFlow/Keras and a beautiful visual dashboard that aggregates logged data dynamically from MySQL.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Axios, Lucide Icons
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Uvicorn, Pydantic validation
- **Database**: MySQL (relational schema logging search history and analytics)
- **Deep Learning**: TensorFlow, Keras, Scikit-learn (preprocessors, Scalers, and One-Hot encoders)
- **Containerization**: Docker, Docker Compose, Nginx (frontend reverse proxy)
- **API Testing**: Postman Collection (pre-configured endpoint assertions)

---

## 🏗️ Project Architecture
```
                  ┌───────────────────┐
                  │   React Frontend  │
                  └─────────┬─────────┘
                            │ (JSON / HTTP Proxy)
                            ▼
                  ┌───────────────────┐
                  │  FastAPI Backend  │
                  └────┬──────────┬───┘
                       │          │
        (SQLAlchemy)   │          │ (Pickle + Keras Load)
                       ▼          ▼
             ┌───────────┐      ┌─────────────┐
             │ MySQL DB  │      │  ANN Model  │
             └───────────┘      └─────────────┘
```

---

## 📂 Repository Structure
```
car_price_prediction/
├── backend/                   # FastAPI Web Service
│   ├── app/
│   │   ├── config.py          # App configuration keys & environment vars
│   │   ├── database.py        # MySQL ORM connection engine
│   │   ├── main.py            # CORS middleware & Router mounts
│   │   ├── models/            # SQLAlchemy Declarative models
│   │   ├── schemas/           # Pydantic schema validation layers
│   │   ├── routers/           # Predict and History logs routers
│   │   └── ml/                # TensorFlow model loaders & processors
│   ├── requirements.txt
│   └── Dockerfile             # Multi-stage Uvicorn container builder
├── frontend/                  # Vite + React Client
│   ├── src/
│   │   ├── components/        # Calculator forms, history grids, charts
│   │   ├── utils/             # Axios request bindings
│   │   ├── App.jsx            # Routing and wrapper glows
│   │   └── App.css            # Custom premium glassmorphic styles
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf             # Nginx reverse proxy
│   └── Dockerfile             # Multistage Nginx build container
├── ml_training/               # ML Pipeline Sandbox
│   ├── train.py               # Generates mock data, encodes variables, trains ANN
│   └── requirements.txt
├── postman/
│   └── Car_Price_Prediction.postman_collection.json # Exported tests
├── docker-compose.yml         # Containerized orchestration rules
└── README.md
```

---

## 🚀 Quick Start Guide

### 🐳 Option 1: Complete Containerized Run (Recommended)
This method boots MySQL, compiles frontend bundles, links the Nginx proxy, and fires up the FastAPI service in one click.

1. Ensure **Docker Desktop** is installed and active on your system.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and navigate to:
   - **Frontend Dashboard**: `http://localhost`
   - **Interactive API Docs (Swagger)**: `http://localhost:8000/docs`

---

### 💻 Option 2: Local Development Setup (Manual)

#### Step 1: Pre-train the Deep Learning ANN
1. Set up a Python 3.11 virtual environment and install ML requirements:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate

   pip install -r backend/requirements.txt
   ```
2. Run the dataset generator and TensorFlow pipeline script:
   ```bash
   python ml_training/train.py
   ```
   *This automatically generates `car_details.csv`, processes features, fits a dense regression network, outputs evaluation metrics (R² score, MAE, RMSE), and saves the serialized weights directly to `backend/app/ml/model/`.*

#### Step 2: Boot the FastAPI REST API
1. Set your environment variables in `.env` (copying `.env.example`).
2. Make sure you have a local **MySQL** instance running and credentials match.
3. Start the API service:
   ```bash
   uvicorn backend.app.main:app --reload
   ```

#### Step 3: Run the React Development Client
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Boot Vite's hot-reloading development server:
   ```bash
   npm run dev
   ```
3. Access `http://localhost:5173`.

---

## 📊 Deep Learning Regression Architecture
The Keras Sequential Artificial Neural Network (ANN) regressor maps categorical parameters through optimized dimensions:
1. **Input Dimension**: Encoded state of features (Brands, fuel categories, transmission gears).
2. **Hidden Layer 1**: Dense (128 neurons), ReLU, Batch Normalization, Dropout (0.2).
3. **Hidden Layer 2**: Dense (64 neurons), ReLU, Batch Normalization, Dropout (0.2).
4. **Hidden Layer 3**: Dense (32 neurons), ReLU.
5. **Output**: Dense (1 neuron), Linear activation predicting logarithmic prices.

Target prices are log-transformed during training using $\ln(1 + \text{selling\_price})$ to balance variance scales. Predictions undergo exponential inverse conversion $\exp(\hat{y}) - 1$ at runtime.

---

## 🧪 Postman API Testing Suite
Imports the pre-loaded collection found inside `postman/` into your Postman client:
- Pre-configured variables: `{{base_url}} = http://localhost:8000`
- Configured scripts containing JS test assertions validating JSON headers and 200/201 response states automatically.
