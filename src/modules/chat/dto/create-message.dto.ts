import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsString()
  @IsNotEmpty()
  conversationId?: string;

  @IsString()
  @IsOptional()
  conversation_id?: string;

  @IsString()
  @IsNotEmpty()
  sender_id?: string;

  @IsObject()
  @IsNotEmpty()
  sender: User;
}
