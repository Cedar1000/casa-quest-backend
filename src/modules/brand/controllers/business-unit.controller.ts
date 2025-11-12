import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { BusinessUnit } from '../entities/business-unit.entity';
import { BusinessUnitService } from '../services/business-unit.service';
import { CreateBusinessUnitDto } from '../dto/create-business-unit.dto';

@Crud({
  model: {
    type: BusinessUnit,
  },
  dto: {
    create: CreateBusinessUnitDto,
  },
  query: {
    join: {
      brand: {
        eager: true,
        allow: ['name'],
      },
    },
  },
})
@Controller('business-units')
export class BusinessUnitController implements CrudController<BusinessUnit> {
  constructor(public service: BusinessUnitService) {}
}
