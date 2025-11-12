import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Brand } from '../entities/brand.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Company } from 'src/modules/company/entities/company.entity';
import { CrudRequest } from '@dataui/crud';
import { CreateBrandDto } from '../dto/create-brand.dto';

@Injectable()
export class BrandService extends TypeOrmCrudService<Brand> {
  constructor(
    @InjectRepository(Brand) repo,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {
    super(repo);
  }

  async createOne(
    req: CrudRequest,
    dto: DeepPartial<CreateBrandDto>,
  ): Promise<Brand> {
    const foundCompany = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });
    if (!foundCompany) {
      throw new NotFoundException('Company not Found');
    }

    const brandData = { ...dto, company: foundCompany };
    const brandInstance = this.repo.create(brandData);
    return await this.repo.save(brandInstance);
  }
}
