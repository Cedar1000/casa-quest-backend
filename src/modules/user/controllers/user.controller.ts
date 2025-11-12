import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';

import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { UserRoles } from '../enums/user.enum';
import { GetUser } from 'src/modules/auth/get-user.decorator';

@Crud({
  model: {
    type: User,
  },
  query: {
    join: {
      company: {
        eager: false,
      },
      conversations: {
        eager: false,
      },
    },
  },
})
@Controller('users')
// @UseGuards(AuthGuard())
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}

  @Post('create-agent')
  createAgent(@Body() body: CreateUserDTO) {
    body.role = UserRoles.Agent;
    return this.service.signup(body);
  }

  @Get('no-chats')
  @UseGuards(AuthGuard())
  getUsersNotInSameConversations(@GetUser() user: User) {
    return this.service.getUsersNotInSameConversations(user.id);
  }

  @Get('leads')
  @UseGuards(AuthGuard())
  getLeads(@GetUser() user: User, @Headers() headers) {
    const serverUrl = headers['x-crm-company'];
    return this.service.getLeads(
      user.id,
      user.accessToken,
      serverUrl.toUpperCase(),
    );
  }
}
