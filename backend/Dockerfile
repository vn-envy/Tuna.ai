FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run injects the PORT environment variable (default 8080)
# We use uvicorn to serve the FastAPI app on that port
CMD uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}
