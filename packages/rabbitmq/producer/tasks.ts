import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

export async function sendVectorizationTask(
    amqpConnection: AmqpConnection,
    provider: string,
    fileId: string,
    userId: number
): Promise<void> {
    try {
        await amqpConnection.request<{ text: string; images: Buffer[] }>({
            exchange: 'processing-exchange',
            routingKey: 'vectorization-task',
            payload: {
                fileId,
                userId,
                provider,
            },
            timeout: 1000000,
        });
    } catch (error) {
        console.error('Failed to send vectorization task:', error);
        throw error;
    }
}

export async function sendDeletionTask(
    amqpConnection: AmqpConnection,
    provider: string,
    fileId: string,
    userId: number
): Promise<void> {
    try {
        await amqpConnection.request<{ fileId: string; userId: number; provider: string }>({
            exchange: 'processing-exchange',
            routingKey: 'deletion-task',
            payload: {
                fileId,
                userId,
                provider,
            },
            timeout: 1000000,
        });
    } catch (error) {
        console.error('Failed to send deletion task:', error);
        throw error;
    }
}
