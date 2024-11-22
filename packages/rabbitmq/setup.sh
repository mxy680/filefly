# Wait for RabbitMQ to fully start
sleep 10

# Create an exchange named "processing-exchange" (type: direct)
rabbitmqadmin declare exchange name=processing-exchange type=direct durable=true

# (Optional) Create queues and bind them to the exchange
rabbitmqadmin declare queue name=extraction-queue durable=true
rabbitmqadmin declare binding source=processing-exchange destination=extraction-queue routing_key=extraction

rabbitmqadmin declare queue name=vectorization-queue durable=true
rabbitmqadmin declare binding source=processing-exchange destination=vectorization-queue routing_key=vectorization

echo "RabbitMQ setup complete!"
