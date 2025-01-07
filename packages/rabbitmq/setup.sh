# Wait for RabbitMQ to start
sleep 10

# Declare the exchange (processing-exchange)
if ! rabbitmqadmin declare exchange name=processing-exchange type=direct durable=true; then
  echo "Failed to declare exchange"
  exit 1
fi

# Declare the vectorization queue
if ! rabbitmqadmin declare queue name=vectorization_queue durable=true; then
  echo "Failed to declare vectorization_queue"
  exit 1
fi

# Bind the vectorization queue to the exchange with the routing key
if ! rabbitmqadmin declare binding source=processing-exchange destination=vectorization_queue routing_key=vectorization-task; then
  echo "Failed to bind vectorization_queue"
  exit 1
fi

# Declare the deletion queue
if ! rabbitmqadmin declare queue name=deletion_queue durable=true; then
  echo "Failed to declare deletion_queue"
  exit 1
fi

# Bind the deletion queue to the exchange with the routing key
if ! rabbitmqadmin declare binding source=processing-exchange destination=deletion_queue routing_key=deletion-task; then
  echo "Failed to bind deletion_queue"
  exit 1
fi

echo "RabbitMQ setup complete: Exchange and Queues created!"
