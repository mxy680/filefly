import pika
import asyncio
import json
from app.tasks.vectorization import handle_vectorization_task


async def start_rabbitmq_consumer():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, rabbitmq_consumer)


def rabbitmq_consumer():
    # Connect to RabbitMQ
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="localhost")
    )
    channel = connection.channel()

    # Declare the exchange
    channel.exchange_declare(
        exchange="processing-exchange", exchange_type="direct", durable=True
    )

    # Declare the queues
    channel.queue_declare(queue="vectorization-task", durable=True)

    # Bind queues to the exchange with routing keys
    channel.queue_bind(
        exchange="processing-exchange",
        queue="vectorization-task",
        routing_key="vectorization-task",
    )

    # Define callback functions for each queue
    async def vectorization_callback(ch, method, properties, body):
        task = json.loads(body)
        await handle_vectorization_task(task)

        # Send response back to producer
        if properties.reply_to:
            ch.basic_publish(
                exchange="",
                routing_key=properties.reply_to,
                properties=pika.BasicProperties(
                    correlation_id=properties.correlation_id
                ),
                body=json.dumps({"status": "success"}),
            )
        ch.basic_ack(delivery_tag=method.delivery_tag)

    # Bind queues to their respective callbacks
    channel.basic_consume(
        queue="vectorization-task", on_message_callback=vectorization_callback
    )

    print("RabbitMQ consumers are running...")
    channel.start_consuming()
