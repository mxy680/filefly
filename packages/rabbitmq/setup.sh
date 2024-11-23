#!/bin/bash

# Wait for RabbitMQ to start
sleep 10

# Declare the exchange (processing-exchange)
rabbitmqadmin declare exchange name=processing-exchange type=direct durable=true

# Declare queues and bind them to the exchange
rabbitmqadmin declare queue name=vectorization_queue durable=true
rabbitmqadmin declare queue name=extraction_queue durable=true

rabbitmqadmin declare binding source=processing-exchange destination=vectorization_queue routing_key=vectorization-task
rabbitmqadmin declare binding source=processing-exchange destination=extraction_queue routing_key=extraction-task

echo "RabbitMQ setup complete: Exchange and Queues created!"
