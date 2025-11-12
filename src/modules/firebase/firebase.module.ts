import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
