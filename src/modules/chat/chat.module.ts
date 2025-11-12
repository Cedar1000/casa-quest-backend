import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/services/user.service';
import { User } from '../user/entities/user.entity';
import { BusinessUnit } from '../brand/entities/business-unit.entity';
import { HashingService } from 'src/common/libs/hashing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { Message } from './entities/message.entity';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { AuthService } from '../auth/services/auth.services';
import { CacheModule } from '@nestjs/cache-manager';
import { CompanyService } from '../company/services/company.service';
import { JwtService } from '@nestjs/jwt';
import { Company } from '../company/entities/company.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';
const redisStore = require('cache-manager-redis-store').redisStore;

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      User,
      BusinessUnit,
      Message,
      Company,
    ]),
    AuthModule,
    forwardRef(() => UserModule),
    RedisModule,
    RabbitmqModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          isGlobal: true,
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
          ttl: Number(configService.get('REDIS_TTL')),
          max: 10,
        };
      },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    RequestModule,
    // ChatModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    UserService,
    HashingService,
    ConfigService,
    MessageService,
    RedisService,
    AuthService,
    CompanyService,
    JwtService,
    RabbitMQService,
    RequestService,
    // HttpService,
  ],
  controllers: [ChatController, MessageController],
  exports: [ChatService],
})
export class ChatModule {}
