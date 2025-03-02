FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy backend files
COPY ./server /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 5000
EXPOSE 5000

# Run the app
CMD ["python", "run.py"]