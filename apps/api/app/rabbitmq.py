import aio_pika
import asyncio
import json
from app.tasks.vectorization import handle_vectorization_task
import os 

async def start_rabbitmq_consumer():
    # Connect to RabbitMQ
    connection = await aio_pika.connect_robust(os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672"))
    channel = await connection.channel()

    # Declare the exchange
    exchange = await channel.declare_exchange(
        "processing-exchange", aio_pika.ExchangeType.DIRECT, durable=True
    )

    # Declare the queue
    queue = await channel.declare_queue("vectorization-task", durable=True)

    # Bind the queue to the exchange
    await queue.bind(exchange, routing_key="vectorization-task")

    # Define async callback
    async def vectorization_callback(message: aio_pika.IncomingMessage):
        async with message.process():
            task = json.loads(message.body)
            print(f"Received vectorization task for {task.get('fileId')}")
            await handle_vectorization_task(task)

    # Start consuming
    await queue.consume(vectorization_callback)
    print("RabbitMQ consumers are running...")

    # Keep the consumer running
    await asyncio.Future()