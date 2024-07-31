# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Python script and requirements file into the container at /usr/src/app
COPY index.py ./
COPY requirements.txt ./
COPY cronjob /etc/cron.d/cronjob

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install cron
RUN apt-get update && apt-get install -y cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/cronjob

# Apply cron job
RUN crontab /etc/cron.d/cronjob

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Start cron and keep the container running
CMD ["sh", "-c", "cron && tail -f /var/log/cron.log"]
