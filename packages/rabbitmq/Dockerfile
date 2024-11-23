FROM rabbitmq:management

# Copy the setup script into the container
COPY setup.sh /docker-entrypoint-init.d/setup.sh

# Make the setup script executable
RUN chmod +x /docker-entrypoint-init.d/setup.sh
