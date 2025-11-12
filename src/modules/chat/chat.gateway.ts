import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/services/auth.services';
import { RedisService } from '../redis/redis.service';
import { ConnectionData } from './enums/caches.enum';
import { MessageService } from './services/message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { UserService } from '../user/services/user.service';
import { ChatService } from './services/chat.service';
import { In, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { SocketChannels } from './enums/socket-channels.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
  path: '/ws',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(
    private authService: AuthService,
    private redisService: RedisService,
    private messageService: MessageService,
    private rabbitMQService: RabbitMQService,
    private userService: UserService,
    private conversationService: ChatService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) {
    this.rabbitMQService.connect(process.env.RABBITMQ_URI);
  }

  // Aggregating for redis
  private connectedUsers: {
    [key: string]: string[];
  } = {};

  afterInit(_server: Server) {
    this.logger.log('Initialized websocket connection');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const connectionId = client.id;
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn('Client has no token');
        client.disconnect();
        return;
      }

      const userData = await this.authService.verify(token);
      const userId = userData.id;
      if (!userId) {
        this.logger.warn('Invalid Auth Token');
        client.disconnect();
      }

      const conversations = await this.conversationService.find({
        where: { users: { id: userId } },
      });

      const conversationIds = conversations.map(
        (conversation: Conversation) => conversation.id,
      );

      // cache conversations here
      // const cacheConversationResponse = await this.handleCacheConversations(
      //   conversations,
      // );

      const offlineMessages =
        await this.messageService.getUnreadMessagesByConversationId(
          conversationIds,
          userId,
        );
      // this.logger.log({ offlineMessages });
      // TODO: Send offline messages via push notifications to user

      await this.cacheUser(userId, connectionId);
      this.logger.log(`Client connected: `, {
        connectedUsers: this.connectedUsers,
      });
      this.logger.log(`Client: ${client.id} Connected to Socket`);
    } catch (error) {
      this.logger.error('Unable to establish websocket connection', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const connectionId = client.id;
      const cachedConnectedIds = JSON.parse(
        await this.redisService.getCachedData(ConnectionData.CONNECTED_IDS),
      );
      const userId = cachedConnectedIds[connectionId];
      const connectedUsers = JSON.parse(
        await this.redisService.getCachedData(ConnectionData.CONNECTED_USERS),
      );
      connectedUsers[userId] = connectedUsers[userId].filter(
        (clientId: string) => clientId !== connectionId,
      );
      await this.redisService.setCacheData(
        ConnectionData.CONNECTED_USERS,
        JSON.stringify(connectedUsers),
      );

      delete cachedConnectedIds[connectionId];
      await this.redisService.setCacheData(
        ConnectionData.CONNECTED_IDS,
        JSON.stringify(cachedConnectedIds),
      );

      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.log(
        `Client disconnected with error: ${client.id}. Error:`,
        error,
      );
    }
  }

  @SubscribeMessage(SocketChannels.MESSAGE)
  async handleMessage(
    client: Socket,
    payload: {
      text: string;
      conversationId: string;
      senderId: string;
    },
  ): Promise<void> {
    try {
      const sender = await this.userService.findOne({
        where: { id: payload.senderId },
        select: ['id'],
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      const conversation = await this.conversationService.findOne({
        where: { id: payload.conversationId },
        relations: ['users'],
      });

      // const conversation: Conversation = await this.conversationRepo
      //   .createQueryBuilder('conversation')
      //   .where('conversation.id = :conversationId', {
      //     conversationId: payload.conversationId,
      //   })
      //   .innerJoin('conversation.users', 'users')
      //   .getOne();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const recipients = conversation.users;

      let cachedUsers = JSON.parse(
        await this.redisService.getCachedData(ConnectionData.CONNECTED_USERS),
      );

      for (const recipient of recipients) {
        if (cachedUsers[recipient.id]?.length) {
          // user is online. Emit message to receiver instantly
          for (const socketId of cachedUsers[recipient.id]) {
            // this inner loop is safe because a user most certainly won't have enough devices to affect the performance of this function.
            if (recipient.id !== sender.id)
              this.server.to(socketId).emit('message', payload);
          }
        }
      }

      const messageInstance: CreateMessageDto = {
        text: payload.text,
        conversationId: payload.conversationId,
        sender,
        sender_id: sender.id,
        conversation_id: payload.conversationId,
      };

      // save message to db now.
      await this.messageService.createOne(undefined, messageInstance);
    } catch (error) {
      this.logger.error(`Unable to Process sent message. Error: ${error}`);
      // TODO: Sends error data to monitoring service for reports
    }
  }

  @SubscribeMessage(SocketChannels.TYPING)
  async handleTyping(
    client: Socket,
    payload: { conversationId: string; senderId: string; isTyping: boolean },
  ) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.users', 'user')
      .where('conversation.id = :conversationId', {
        conversationId: payload.conversationId,
      })
      .getOne();

    let sender: User;

    const recipients = conversations.users.filter((user: User) => {
      if (user.id === payload.senderId) {
        sender = user;
      }
      return user.id !== payload.senderId;
    });

    let cachedUsers = JSON.parse(
      await this.redisService.getCachedData(ConnectionData.CONNECTED_USERS),
    );

    recipients.forEach((recipient) => {
      if (cachedUsers[recipient.id]) {
        for (const socketId of cachedUsers[recipient.id]) {
          this.server.to(socketId).emit(SocketChannels.TYPING, {
            senderName: sender.fullName,
            conversationId: payload.conversationId,
            isTyping: payload.isTyping,
          });
        }
      }
    });
    this.logger.log(`${sender.fullName} is typing...`);
  }

  @SubscribeMessage(SocketChannels.STOP_TYPING)
  async handleStopTyping(
    client: Socket,
    payload: { conversationId: string; senderId: string; isTyping: boolean },
  ) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.users', 'user')
      .where('conversation.id = :conversationId', {
        conversationId: payload.conversationId,
      })
      .getOne();

    let sender: User;

    const recipients = conversations.users.filter((user: User) => {
      if (user.id === payload.senderId) {
        sender = user;
      }
      return user.id !== payload.senderId;
    });

    let cachedUsers = JSON.parse(
      await this.redisService.getCachedData(ConnectionData.CONNECTED_USERS),
    );

    recipients.forEach((recipient) => {
      if (cachedUsers[recipient.id]) {
        for (const socketId of cachedUsers[recipient.id]) {
          this.server.to(socketId).emit(SocketChannels.STOP_TYPING, {
            senderName: sender.fullName,
            conversationId: payload.conversationId,
            isTyping: payload.isTyping,
          });
        }
      }
    });
    this.logger.log(`${sender.fullName} has stopped typing...`);
  }

  @SubscribeMessage(SocketChannels.READ)
  async handleRead(
    client: Socket,
    payload: { userId: string; messageIds: string[] },
  ) {
    await this.messageService.markMessagesAsRead(
      payload.messageIds,
      payload.userId,
    );
  }

  @SubscribeMessage(SocketChannels.DELIVERED)
  async handleDelivered(
    client: Socket,
    payload: { userId: string; messageIds: string[] },
  ) {
    await this.messageService.markMessagesAsDelivered(
      payload.messageIds,
      payload.userId,
    );
  }

  private async cacheUser(userId: string, clientId: string) {
    let cachedUsers = JSON.parse(
      await this.redisService.getCachedData(ConnectionData.CONNECTED_USERS),
    );

    if (!cachedUsers) {
      this.connectedUsers[userId] = [clientId];
      cachedUsers = this.connectedUsers;
      const newCache = await this.redisService.setCacheData(
        ConnectionData.CONNECTED_USERS,
        JSON.stringify(this.connectedUsers),
      );
      this.logger.log({ newCache });
    }

    if (cachedUsers[userId] && !cachedUsers[userId].includes(clientId)) {
      cachedUsers[userId].push(clientId);
    } else {
      cachedUsers[userId] = [clientId];
    }

    await this.redisService.setCacheData(
      ConnectionData.CONNECTED_USERS,
      JSON.stringify(cachedUsers),
    );

    let cachedConnectedIds = await JSON.parse(
      await this.redisService.getCachedData(ConnectionData.CONNECTED_IDS),
    );

    if (!cachedConnectedIds) {
      cachedConnectedIds = {
        [clientId]: userId,
      };
    } else {
      cachedConnectedIds[clientId] = userId;
    }

    const connectedIds = await this.redisService.setCacheData(
      ConnectionData.CONNECTED_IDS,
      JSON.stringify(cachedConnectedIds),
    );
    this.logger.log({ connectedIds });
  }

  private async handleCacheConversations(conversations: Conversation[]) {
    const cachedConversations = JSON.parse(
      await this.redisService.getCachedData(ConnectionData.CONVERSATIONS),
    );

    for (const conversation of conversations) {
      cachedConversations[conversation.id] = conversation;
    }
    return await this.redisService.setCacheData(
      ConnectionData.CONVERSATIONS,
      cachedConversations,
    );
  }
}
