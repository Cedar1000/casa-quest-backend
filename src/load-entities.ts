import { join } from 'path';
import { readdirSync } from 'fs';
import { EntitySchema } from 'typeorm';
import { globSync } from 'glob';

export function loadEntities(): (Function | EntitySchema<any>)[] {
  const entities: (Function | EntitySchema<any>)[] = [];
  const files = globSync(join(__dirname, '**/*.entity.{ts,js}'));

  files.forEach((file) => {
    const entityModule = require(file);
    Object.values(entityModule).forEach((entity) => {
      if (typeof entity === 'function' || entity instanceof EntitySchema) {
        entities.push(entity);
      }
    });
  });

  return entities;
}
