from aio_pika import connect_robust, Message, ExchangeType
import json
import os


async def send_task(queue_name: str, task_data: dict) -> str:
    """
    Sends a task to the RabbitMQ queue.

    :param queue_name: Name of the RabbitMQ queue.
    :param task_data: The data to send as part of the task.
    :return: A confirmation message after the task is sent.
    """
    try:
        # Establish connection to RabbitMQ
        connection = await connect_robust(os.getenv("RABBITMQ_URL"))
        async with connection:
            # Create a channel
            channel = await connection.channel()

            # Declare a durable queue
            await channel.declare_queue(queue_name, durable=True)

            # Send the message
            message = Message(
                json.dumps(task_data).encode(),
                content_type="application/json",
                delivery_mode=2,  # Persistent message
            )
            await channel.default_exchange.publish(message, routing_key=queue_name)

        return f"Task sent to {queue_name}"
    except Exception as e:
        raise RuntimeError(f"Failed to send task to {queue_name}: {e}")
