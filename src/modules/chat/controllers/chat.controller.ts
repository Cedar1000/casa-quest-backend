import {
  Crud,
  CrudController,
  CrudRequest,
  CrudRequestInterceptor,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@dataui/crud';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Conversation } from '../entities/conversation.entity';
import { ChatService } from '../services/chat.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { GetUser } from 'src/modules/auth/get-user.decorator';
import { User } from 'src/modules/user/entities/user.entity';

@Crud({
  model: {
    type: Conversation,
  },
  dto: {
    create: CreateConversationDto,
  },
  query: {
    join: {
      users: {
        eager: true,
        allow: ['fullName', 'profileImage'],
      },
      messages: {
        eager: false,
      },
      'messages.sender': {
        eager: false,
        allow: ['fullName', 'profileImage'],
      },
    },
  },
})
@Controller('chats')
@UseGuards(AuthGuard())
export class ChatController implements CrudController<Conversation> {
  constructor(public service: ChatService) {}

  @Post('create')
  createOne(@Body() body: CreateConversationDto, @GetUser() user: User) {
    body.members.push(user);
    return this.service.createOne(undefined, body);
  }

  @Get()
  @UseInterceptors(CrudRequestInterceptor)
  getUserConversations(
    @ParsedRequest() req: CrudRequest,
    @GetUser() user: User,
  ) {
    return this.service.getManyChats(req, user.id);
  }
}
