import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { Conversation } from '../entities/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest, GetManyDefaultResponse } from '@dataui/crud';
import { DeepPartial, In } from 'typeorm';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { Message } from '../entities/message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { MessageService } from './message.service';
import { Lead } from 'src/modules/user/entities/lead';

@Injectable()
export class ChatService extends TypeOrmCrudService<Conversation> {
  constructor(
    @InjectRepository(Conversation) repo,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    super(repo);
  }

  async createOne(
    req: CrudRequest | undefined,
    dto: DeepPartial<CreateConversationDto>,
  ): Promise<Conversation> {
    const memberIds = dto.members.map((member: Lead) => member.id);
    const foundUsers = await this.userService.find({
      where: { id: In(memberIds) },
      select: ['id'],
    });
    // Check to ensure all the users exist
    if (foundUsers.length !== memberIds.length) {
      for (const member of dto.members) {
        const exists = foundUsers.some((user) => user.id === member.id);
        if (exists) {
          continue;
        }
        // TODO: complete this. Create the user as a lead on the db.
        // const newLead: User = {
        //     fullName: `${member.firstName} ${member.lastName}`,
        //     email: member.email,
        //     username: member.email,
        //     role: member.role || 'Lead',
        //     companyName: 'Test Company',
        //     company: { id: 'test-company' },
        //     brand: { id: 'test-brand' },
        // }
      }
    }
    dto.users = foundUsers;
    const conversationInstance = await this.repo.create(dto);
    return await this.repo.save(conversationInstance);
  }

  async getManyChats(req: CrudRequest, currentUser: string) {
    req.options = {
      ...req.options,
      query: {
        join: {
          conversations: {
            eager: true,
          },
          'conversations.users': {
            eager: true,
            allow: ['fullName', 'profileImage'],
          },
          'conversations.messages': {
            eager: true,
          },
        },
      },
    };
    req.parsed.paramsFilter.push({
      field: 'id',
      operator: '$eq',
      value: currentUser,
    });

    req.parsed.search.$and.push({ id: { $eq: currentUser } });

    let resp: User;

    try {
      resp = await this.userService.getOne(req);
    } catch (error) {
      return [];
    }

    const conversations = resp.conversations;
    const chatsWithLatestMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const latestMessage = await this.messageService.getLatestMessage({
          conversation_id: conversation.id,
        });
        return {
          ...conversation,
          latestMessage,
        };
      }),
    );

    return chatsWithLatestMessage;
  }
}
