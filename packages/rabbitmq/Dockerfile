# Use RabbitMQ official image with the management plugin
FROM rabbitmq:management

# Copy custom configuration
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf

# Copy the setup script to the container
COPY setup.sh /docker-entrypoint-init.d/setup.sh

# Make the script executable
RUN chmod +x /docker-entrypoint-init.d/setup.sh