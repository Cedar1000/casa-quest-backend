import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HashingService } from 'src/common/libs/hashing';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { BrandModule } from '../brand/brand.module';
import { BusinessUnit } from '../brand/entities/business-unit.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { ChatModule } from '../chat/chat.module';
import { ChatService } from '../chat/services/chat.service';
import { Message } from '../chat/entities/message.entity';
import { HttpModule } from '@nestjs/axios';
import { RequestService } from '../request/request.service';
import { RequestModule } from '../request/request.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, BusinessUnit, Conversation, Message]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 60 * 60 * 24,
        },
      }),
    }),
    BrandModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    RequestModule,
  ],
  providers: [
    ConfigService,
    HashingService,
    JwtService,
    UserService,
    RequestService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
