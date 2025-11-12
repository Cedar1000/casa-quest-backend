import { CustomBaseEntity } from 'src/common/libs/base-entity';
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserRoles } from '../enums/user.enum';
import { Brand } from 'src/modules/brand/entities/brand.entity';
import { BusinessUnit } from 'src/modules/brand/entities/business-unit.entity';
import { Conversation } from 'src/modules/chat/entities/conversation.entity';
import { Company } from 'src/modules/company/entities/company.entity';
import { Message } from 'src/modules/chat/entities/message.entity';
import { UsersConversations } from 'src/modules/chat/entities/conversation-users.entity';

@Entity('users')
export class User extends CustomBaseEntity {
  @Column({ default: 'Unknown' })
  title: string;

  @Column({ nullable: true })
  fullName: string;

  @Index({ unique: true })
  @Column()
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: UserRoles.Agent })
  role: UserRoles;

  @Column({ nullable: true })
  whatsAppNumber: string;

  @Column({ nullable: true })
  telegramNumber: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: true })
  isTestProfile: boolean;

  @Column({ default: true })
  isTrusted: boolean;

  @Column({ nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', nullable: true })
  extraData: Object;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  accessToken: string;

  @ManyToOne(() => Brand, (brand) => brand.agents)
  brand: Brand;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.agents)
  businessUnit: BusinessUnit;

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  conversations: Conversation[];

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(
    () => UsersConversations,
    (conversationUsers) => conversationUsers.user,
  )
  userConversations: UsersConversations[];
}
