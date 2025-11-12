import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from 'src/modules/firebase/firebase.service';

@Injectable()
export class PushNotificationService extends FirebaseService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  logger: Logger = new Logger(PushNotificationService.name);
  async sendNotification(token: string, message: string, title: string) {
    const payload = {
      notification: {
        title,
        body: message,
      },
    };

    try {
      await this.admin.messaging().sendToDevice(token, payload);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
