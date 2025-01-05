import aio_pika
import asyncio
import json
from app.tasks.vectorization import handle_vectorization_task
from app.tasks.deletion import handle_deletion_task  # Import the deletion task handler
import os


async def start_rabbitmq_consumer():
    # Connect to RabbitMQ
    connection = await aio_pika.connect_robust(
        os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672")
    )
    channel = await connection.channel()

    # Declare the exchange
    exchange = await channel.declare_exchange(
        "processing-exchange", aio_pika.ExchangeType.DIRECT, durable=True
    )

    # Declare the vectorization queue
    vectorization_queue = await channel.declare_queue(
        "vectorization-task", durable=True
    )

    # Bind the vectorization queue to the exchange
    await vectorization_queue.bind(exchange, routing_key="vectorization-task")

    # Declare the deletion queue
    deletion_queue = await channel.declare_queue("deletion-task", durable=True)

    # Bind the deletion queue to the exchange
    await deletion_queue.bind(exchange, routing_key="deletion-task")

    # Declare the RPC queue for API vectorization tasks
    api_vectorization_queue = await channel.declare_queue(
        "api-vectorization-task", durable=True
    )

    # Bind the API vectorization queue to the exchange
    await api_vectorization_queue.bind(exchange, routing_key="api-vectorization-task")

    # Define async callback for vectorization tasks
    async def vectorization_callback(message: aio_pika.IncomingMessage):
        async with message.process():
            task = json.loads(message.body)
            await handle_vectorization_task(task)

    # Define async callback for deletion tasks
    async def deletion_callback(message: aio_pika.IncomingMessage):
        async with message.process():
            task = json.loads(message.body)
            await handle_deletion_task(task)

    # Define async callback for API vectorization tasks (RPC)
    async def api_vectorization_callback(message: aio_pika.IncomingMessage):
        async with message.process():
            try:
                task = json.loads(message.body)
                # result = await handle_vectorization_task(task)  # Process the task
                response = json.dumps({"status": "success", "data": "hi"})
            except Exception as e:
                response = json.dumps({"status": "error", "message": str(e)})

            # Send the response back to the reply-to queue
            if message.reply_to:
                await channel.default_exchange.publish(
                    aio_pika.Message(
                        body=response.encode(),
                        correlation_id=message.correlation_id,
                    ),
                    routing_key=message.reply_to,
                )

    # Start consuming for all queues
    await vectorization_queue.consume(vectorization_callback)
    await deletion_queue.consume(deletion_callback)
    await api_vectorization_queue.consume(api_vectorization_callback)

    print("RabbitMQ consumers are running...")

    # Keep the consumer running
    await asyncio.Future()
