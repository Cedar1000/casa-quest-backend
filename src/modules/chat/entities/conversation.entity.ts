import { CustomBaseEntity } from 'src/common/libs/base-entity';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersConversations } from './conversation-users.entity';

@Entity('conversations')
export class Conversation extends CustomBaseEntity {
  @Column({ default: false })
  isGroup: boolean;

  @Column({ nullable: true })
  groupName: string;

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable({
    name: 'conversations_users',
    joinColumn: {
      name: 'conversationId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'agentId',
      referencedColumnName: 'id',
    },
  })
  users: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(
    () => UsersConversations,
    (conversationUsers) => conversationUsers.conversation,
  )
  conversationUsers: UsersConversations;
}
