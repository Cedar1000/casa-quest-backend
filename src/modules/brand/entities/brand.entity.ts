import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessUnit } from './business-unit.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { CustomBaseEntity } from 'src/common/libs/base-entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Company } from 'src/modules/company/entities/company.entity';

@Entity('brands')
export class Brand extends CustomBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => BusinessUnit, (businessUnit) => businessUnit.brand)
  businessUnit: BusinessUnit[];

  @OneToMany(() => User, (user) => user.brand)
  agents: User[];

  @ManyToOne(() => Company, (company) => company.brands)
  company: Company;
}
