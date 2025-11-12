import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CrudRequest } from '@dataui/crud';

@Injectable()
export class CompanyService extends TypeOrmCrudService<Company> {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
  ) {
    super(companyRepo);
  }

  async createOne(
    req: CrudRequest | undefined,
    dto: DeepPartial<Company>,
  ): Promise<Company> {
    const companyInstance = this.companyRepo.create(dto);
    return await this.companyRepo.save(companyInstance);
  }
}
