FROM python:3.11-slim

WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend sub-folders and files into container workspace
COPY ./database ./backend/database
COPY ./models ./backend/models
COPY ./services ./backend/services
COPY ./ml_model ./backend/ml_model
COPY ./routes ./backend/routes
COPY ./main.py ./backend/main.py

# Set PYTHONPATH environment variable to resolve backend module imports properly
ENV PYTHONPATH=/workspace

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
