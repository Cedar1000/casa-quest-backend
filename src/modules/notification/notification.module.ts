import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [FirebaseModule, ConfigModule],
  providers: [FirebaseService, ConfigService],
})
export class NotificationModule {}
