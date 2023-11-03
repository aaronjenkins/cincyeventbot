# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Python script and requirements file into the container at /usr/src/app
COPY index.py ./
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run index.py when the container launches
CMD ["python", "./index.py"]
