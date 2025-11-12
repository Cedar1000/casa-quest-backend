import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/common/libs/hashing';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/create-user.dto';
import PostgresErrorCodes from 'src/common/constants/pg-response-codes';
import { BusinessUnit } from 'src/modules/brand/entities/business-unit.entity';
import { CrudRequest, GetManyDefaultResponse } from '@dataui/crud';
import { ChatService } from 'src/modules/chat/services/chat.service';
import { Conversation } from 'src/modules/chat/entities/conversation.entity';
import { HttpService } from '@nestjs/axios';
import { CRMBaseUrls } from 'src/common/constants/crm-server-urls';
import { AxiosResponse } from 'axios';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { axiosErrorHandler } from 'src/common/libs/axios-error-handler';
import { error } from 'console';
import { RequestService } from 'src/modules/request/request.service';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(BusinessUnit)
    private businessUnitRepo: Repository<BusinessUnit>,
    @Inject(HashingService)
    private hashingService: HashingService,
    private configService: ConfigService,
    private requestService: RequestService,
    // private conversationService: ChatService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) {
    super(userRepo);
  }

  async signup(payload: CreateUserDTO) {
    const { password } = payload;

    const userInstance = this.userRepo.create(payload);

    const salt = await this.hashingService.generateSalt(
      Number(this.configService.get('SALT_ROUND')),
    );
    userInstance.password = await this.hashingService.hashPassword(
      password,
      salt,
    );

    if (payload.businessUnitId) {
      const foundBusinessUnit = await this.businessUnitRepo.findOne({
        where: { id: payload.businessUnitId },
        relations: ['brand.company'],
      });
      if (!foundBusinessUnit) {
        throw new NotFoundException('Business Unit not Found');
      }

      userInstance.businessUnit = foundBusinessUnit;
      if (foundBusinessUnit.brand) {
        userInstance.brand = foundBusinessUnit.brand;
      }
      if (foundBusinessUnit.brand.company) {
        userInstance.company = foundBusinessUnit.brand.company;
      }
    }

    try {
      return await this.userRepo.save(userInstance);
    } catch (error) {
      if (error.code === PostgresErrorCodes.UniqueViolation) {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error({ error });
        throw new InternalServerErrorException();
      }
    }
  }

  async getUsersNotInSameConversations(userId: string) {
    try {
      const userConversations = await this.conversationRepo
        .createQueryBuilder('conversation')
        .innerJoin('conversation.users', 'user', 'user.id = :userId', {
          userId,
        })
        .getMany();

      const conversationIds = userConversations.map(
        (conversation) => conversation.id,
      );

      if (conversationIds.length === 0) {
        return await this.userRepo
          .createQueryBuilder('user')
          .where('user.id != :userId', { userId })
          .getMany();
      }

      const usersNotInSameConversations = await this.userRepo
        .createQueryBuilder('user')
        .where('user.id != :userId', { userId })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('subUser.id')
            .from(User, 'subUser')
            .leftJoin('subUser.conversations', 'subConversation')
            .where('subConversation.id IN (:...conversationIds)')
            .getQuery();
          return 'user.id NOT IN ' + subQuery;
        })
        .setParameter('conversationIds', conversationIds)
        .getMany();

      return usersNotInSameConversations;
    } catch (error) {
      throw new InternalServerErrorException('Could not fetch users');
    }
  }

  async getLeads(userId: string, crmToken: string, companyIdentifier: string) {
    const leadsData = await this.requestService.get(
      companyIdentifier,
      crmToken,
      'users',
    );
    return leadsData;
  }
}
