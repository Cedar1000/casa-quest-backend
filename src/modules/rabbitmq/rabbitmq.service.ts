// rabbitmq.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService {
  private channel: amqplib.Channel;
  private logger = new Logger(RabbitMQService.name);

  async connect(uri: string) {
    try {
      const connection = await amqplib.connect(uri);
      this.channel = await connection.createChannel();
      this.logger.log('RabbitMQ Connected');
    } catch (error) {
      this.logger.error({ error });
    }
  }

  async sendMessage(queue: string, message: any) {
    this.logger.log({ queue, message });
    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        },
      );
    } catch (error) {
      this.logger.error({ error });
    }
  }

  async receiveMessages(queue: string, callback: (msg) => void) {
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }

  async assertQueue(queue: string) {
    await this.channel.assertQueue(queue);
  }
}
