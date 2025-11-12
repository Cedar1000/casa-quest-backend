import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganMiddleware } from './common/middlewares/morgan.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { RabbitMQService } from './modules/rabbitmq/rabbitmq.service';
import { CompanyModule } from './modules/company/company.module';
import { BrandModule } from './modules/brand/brand.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { UploadModule } from './modules/upload/upload.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './modules/database/database.module';
import { DatabaseService } from './modules/database/database.service';
import { RequestModule } from './modules/request/request.module';
const redisStore = require('cache-manager-redis-store').redisStore;

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: DatabaseService,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          isGlobal: true,
          store: redisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          ttl: configService.get('REDIS_TTL'),
          max: 12,
        };
      },
    }),
    ChatModule,
    AuthModule,
    RabbitmqModule,
    CompanyModule,
    UserModule,
    BrandModule,
    RedisModule,
    NotificationModule,
    FirebaseModule,
    UploadModule,
    DatabaseModule,
    RequestModule,
  ],
  controllers: [AppController],
  providers: [AppService, RabbitMQService, DatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
