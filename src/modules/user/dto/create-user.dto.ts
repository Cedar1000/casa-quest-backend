import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { CreateCompanyDTO } from 'src/modules/company/dto/create-company.dto';
import { UserRoles } from '../enums/user.enum';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEnum(UserRoles)
  role: UserRoles;

  @IsOptional()
  @IsString(null)
  phone: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSeen: Date;

  @IsOptional()
  @Type(() => CreateCompanyDTO)
  company: CreateCompanyDTO;

  @IsString()
  @IsOptional()
  businessUnitId: string;
}
