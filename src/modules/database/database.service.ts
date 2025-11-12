import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { loadEntities } from 'src/load-entities';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  private logger = new Logger(DatabaseService.name);
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const isProduction = this.configService.get('STAGE') === 'prod';
    const config: TypeOrmModuleOptions = {
      ssl: isProduction,
      extra: {
        ssl: isProduction ? { rejectUnauthorized: false } : null,
      },
      type: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      entities: loadEntities(),
      migrations: [
        join(__dirname, './migrations/*.ts'),
        join(__dirname, '/dist/modules/database/migrations/*.js'),
      ],
      logging: true,
      logger: 'advanced-console',
    };
    return config;
  }
}
