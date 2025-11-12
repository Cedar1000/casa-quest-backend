import { Crud, CrudController } from '@dataui/crud';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageService } from '../services/message.service';
import { GetMessagesDto } from '../dto/get-messages.dto';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_CRUD } from 'src/common/constants/default-crud-options';

@Crud({
  model: {
    type: Message,
  },
  query: {
    ...DEFAULT_CRUD.options.query,
    join: {
      conversation: {
        eager: false,
      },
    },
  },
})
@Controller('messages')
@UseGuards(AuthGuard())
export class MessageController implements CrudController<Message> {
  constructor(public service: MessageService) {}

  @Get('get-all')
  findAll(@Query() query: GetMessagesDto) {
    return this.service.findMany(query);
  }
}
