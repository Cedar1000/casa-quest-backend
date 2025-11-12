import { Crud, CrudController } from '@dataui/crud';
import { Company } from '../entities/company.entity';
import { Controller, UseGuards } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { AuthGuard } from '@nestjs/passport';

@Crud({
  model: {
    type: Company,
  },
  query: {
    join: {},
  },
})
@Controller('companies')
@UseGuards(AuthGuard())
export class CompanyController implements CrudController<Company> {
  constructor(public service: CompanyService) {}
}
