import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  protected readonly logger = new Logger(FirebaseService.name);

  protected admin = admin;

  public firebaseApp: admin.app.App;

  constructor(configService: ConfigService) {
    if (admin.apps.length === 0) {
      try {
        const firebaseCredential = JSON.parse(
          configService.get('FB_SERVICE_ACCOUNT_CRED'),
        );
        this.firebaseApp = this.admin.initializeApp({
          credential: this.admin.credential.cert(firebaseCredential),
        });
      } catch (error) {
        this.logger.error(
          {
            message: 'Error instantiating firebase',
            error: error.message,
          },
          error.stack,
        );
      }
    }
  }
}
