import { CustomBaseEntity } from 'src/common/libs/base-entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('users_conversations')
export class UsersConversations extends CustomBaseEntity {
  @ManyToOne(() => User, (user) => user.userConversations)
  user: User;

  @ManyToOne(
    () => Conversation,
    (conversation) => conversation.conversationUsers,
  )
  conversation: Conversation;
}
