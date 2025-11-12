import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  brandId: string;
}
