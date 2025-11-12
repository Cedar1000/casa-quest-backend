import { Module } from '@nestjs/common';
import { CompanyModule } from '../company/company.module';

import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashingService } from 'src/common/libs/hashing';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.services';
import { JwtStrategy } from './jwt-strategy';
import { UserService } from '../user/services/user.service';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { CompanyService } from '../company/services/company.service';
import { Company } from '../company/entities/company.entity';
import { BrandModule } from '../brand/brand.module';
import { BusinessUnitService } from '../brand/services/business-unit.service';
import { BusinessUnit } from '../brand/entities/business-unit.entity';
import { Brand } from '../brand/entities/brand.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';

@Module({
  imports: [
    CompanyModule,
    TypeOrmModule.forFeature([
      User,
      Company,
      BusinessUnit,
      Brand,
      Conversation,
    ]),
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
    UserModule,
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
    AuthService,
    JwtStrategy,
    UserService,
    CompanyService,
    BusinessUnitService,
    RequestService,
    // HttpService,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
