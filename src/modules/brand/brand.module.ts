import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandService } from './services/brand.service';
import { BrandController } from './controllers/brand.controller';
import { AuthModule } from '../auth/auth.module';
import { BusinessUnitService } from './services/business-unit.service';
import { BusinessUnitController } from './controllers/business-unit.controller';
import { BusinessUnit } from './entities/business-unit.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand, BusinessUnit, Company]),
    // AuthModule,
  ],
  providers: [BrandService, BusinessUnitService],
  controllers: [BrandController, BusinessUnitController],
  exports: [BusinessUnitService],
})
export class BrandModule {}
