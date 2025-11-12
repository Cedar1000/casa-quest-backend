import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { CustomBaseEntity } from 'src/common/libs/base-entity';
import { Brand } from 'src/modules/brand/entities/brand.entity';

@Entity('companies')
export class Company extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Brand, (brand) => brand.company)
  brands: Brand[];
}
