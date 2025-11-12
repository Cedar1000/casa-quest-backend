import { CustomBaseEntity } from 'src/common/libs/base-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('messages')
export class Message extends CustomBaseEntity {
  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ default: false })
  isRead: boolean;

  @Column('uuid', { array: true, default: () => 'ARRAY[]::UUID[]' }) // UUID array type for PostgreSQL
  readBy: string[];

  @Column('uuid', { array: true, default: () => 'ARRAY[]::UUID[]' }) // UUID array type for PostgreSQL
  deliveredTo: string[];

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @Column({ type: 'uuid', nullable: true })
  sender_id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  conversation_id: string;
}
