import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
