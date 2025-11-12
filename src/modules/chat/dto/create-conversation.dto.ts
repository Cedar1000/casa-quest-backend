import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Lead } from 'src/modules/user/entities/lead';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsBoolean()
  isGroup: boolean;

  @IsOptional()
  @IsString()
  groupName: string;

  @IsOptional()
  @IsArray()
  users: User[];

  @IsArray()
  members: Lead[];
}
