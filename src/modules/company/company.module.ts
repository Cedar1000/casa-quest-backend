import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyController } from './controllers/company.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashingService } from 'src/common/libs/hashing';

import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Company]),
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
  ],
  providers: [CompanyService, ConfigService, HashingService, JwtService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
