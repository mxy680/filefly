#!/bin/bash

# Wait for RabbitMQ to start
sleep 10

# Declare the exchange (processing-exchange)
if ! rabbitmqadmin declare exchange name=processing-exchange type=direct durable=true; then
  echo "Failed to declare exchange"
  exit 1
fi

# Declare the queue (vectorization_queue)
if ! rabbitmqadmin declare queue name=vectorization_queue durable=true; then
  echo "Failed to declare queue"
  exit 1
fi

# Bind the queue to the exchange with the routing key
if ! rabbitmqadmin declare binding source=processing-exchange destination=vectorization_queue routing_key=vectorization-task; then
  echo "Failed to create binding"
  exit 1
fi

echo "RabbitMQ setup complete: Exchange and Queues created!"
