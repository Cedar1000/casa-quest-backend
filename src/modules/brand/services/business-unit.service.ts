import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessUnit } from '../entities/business-unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CrudRequest } from '@dataui/crud';
import { CreateBusinessUnitDto } from '../dto/create-business-unit.dto';

@Injectable()
export class BusinessUnitService extends TypeOrmCrudService<BusinessUnit> {
  constructor(
    @InjectRepository(BusinessUnit) repo: Repository<BusinessUnit>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
  ) {
    super(repo);
  }

  async createOne(
    req: CrudRequest,
    dto: DeepPartial<CreateBusinessUnitDto>,
  ): Promise<BusinessUnit> {
    const foundBrand = await this.brandRepo.findOne({
      where: { id: dto.brandId },
    });
    if (!foundBrand) {
      throw new NotFoundException('Brand not Found');
    }
    const businessUnitData = { ...dto, brand: foundBrand };

    const businessUnitInstance = this.repo.create(businessUnitData);
    return await this.repo.save(businessUnitInstance);
  }
}
