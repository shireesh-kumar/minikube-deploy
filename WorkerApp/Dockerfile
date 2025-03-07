# Use the official Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy files
COPY workerapp.py requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Run the worker
CMD ["python","-u","workerapp.py"]
