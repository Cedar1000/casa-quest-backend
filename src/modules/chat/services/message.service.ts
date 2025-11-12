import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CrudRequest } from '@dataui/crud';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Conversation } from '../entities/conversation.entity';
import { GetMessagesDto } from '../dto/get-messages.dto';

@Injectable()
export class MessageService extends TypeOrmCrudService<Message> {
  constructor(
    @InjectRepository(Message) repo: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) {
    super(repo);
  }

  async createOne(
    req: CrudRequest | undefined,
    dto: DeepPartial<CreateMessageDto>,
  ): Promise<Message> {
    const foundConversation = await this.conversationRepo.findOne({
      where: { id: dto.conversationId },
    });
    if (!foundConversation) {
      throw new NotFoundException('Conversation not found');
    }
    delete dto.conversationId;
    const messageInstance = this.repo.create(dto);
    messageInstance.conversation = foundConversation;
    const savedMessage = await this.repo.save(messageInstance);
    return savedMessage;
  }

  async findMany(query: GetMessagesDto) {
    const [messages, count] = await this.repo.findAndCount({
      where: { conversation: { id: query.conversationId } },
      relations: ['conversation'],
    });
    return {
      messages,
      count,
    };
  }

  async getUnreadMessagesByConversationId(
    conversationIds: string[],
    userId: string,
  ): Promise<Message[]> {
    try {
      if (conversationIds.length > 0) {
        const messages = await this.repo
          .createQueryBuilder('message')
          .where('message.conversationId IN (:...conversationIds)', {
            conversationIds,
          })
          .andWhere('(:userId != ALL(message.readBy))', { userId })
          .leftJoinAndSelect('message.sender', 'sender')
          .leftJoinAndSelect('message.conversation', 'conversation')
          .getMany();
        return messages;
      }
      return [];
    } catch (error) {
      throw new InternalServerErrorException(
        'UNABLE TO FETCH OFFLINE MESSSAGES',
      );
    }
  }

  async markMessagesAsRead(
    messageIds: string[],
    userId: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Message)
      .set({
        readBy: () => `array_append("readBy", :userId)`,
      })
      .where('id IN (:...messageIds)', { messageIds })
      .andWhere(':userId != ALL("readBy")', { userId }) // Ensure the userId is not already in the array
      .setParameters({ userId })
      .execute();
  }

  async markMessagesAsDelivered(
    messageIds: string[],
    userId: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder('message')
      .update(Message)
      .set({
        deliveredTo: () => `array_append("deliveredTo", :userId)`,
      })
      .where('id IN (:...messageIds)', { messageIds })
      .andWhere(':userId != ALL("deliveredTo")', { userId }) // Ensure the userId is not already in the array
      .setParameters({ userId })
      .execute();
  }

  async getLatestMessage(query: GetMessagesDto) {
    const latestChat = await this.repo.findOne({
      where: { conversation_id: query.conversation_id },
      order: { createdAt: 'DESC' },
    });
    return latestChat;
  }
}
