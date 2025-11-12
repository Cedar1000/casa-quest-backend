import { Crud, CrudController } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Brand } from '../entities/brand.entity';
import { BrandService } from '../services/brand.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBrandDto } from '../dto/create-brand.dto';

@Crud({
  model: {
    type: Brand,
  },
  dto: {
    create: CreateBrandDto,
  },
  query: {
    join: {
      company: {
        eager: false,
        allow: ['name'],
      },
    },
  },
})
@Controller('brands')
export class BrandController implements CrudController<Brand> {
  constructor(public service: BrandService) {}
}
