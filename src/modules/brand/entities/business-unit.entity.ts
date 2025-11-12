import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('businessunits')
export class BusinessUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  country: string;

  @OneToMany(() => User, (user) => user.businessUnit)
  agents: User[];

  @ManyToOne(() => Brand, (brand) => brand.businessUnit)
  brand: Brand;
}
