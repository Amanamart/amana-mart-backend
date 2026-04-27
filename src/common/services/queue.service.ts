import amqp, { Channel, Connection } from 'amqplib';

class QueueService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect() {
    if (!this.connection) {
      const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
      this.connection = await amqp.connect(url) as unknown as Connection;
      this.channel = await (this.connection as any).createChannel();
    }
  }

  async sendToQueue(queue: string, message: any) {
    await this.connect();
    if (this.channel) {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true
      });
    }
  }

  async consume(queue: string, callback: (msg: any) => void) {
    await this.connect();
    if (this.channel) {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.consume(queue, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel?.ack(msg);
        }
      });
    }
  }
}

export const queueService = new QueueService();
export const QUEUES = {
  NOTIFICATIONS: 'notifications_queue',
  ORDERS: 'orders_queue',
  DELIVERY_ASSIGNMENT: 'delivery_assignment_queue',
  SEARCH_INDEXING: 'search_indexing_queue'
};
