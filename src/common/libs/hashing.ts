import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  public generateSalt(saltRounds: number) {
    return bcrypt.genSalt(saltRounds);
  }

  public async hashPassword(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  public async compare(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }
}
