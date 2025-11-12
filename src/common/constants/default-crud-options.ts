import { CrudRequest } from '@dataui/crud';

export const DEFAULT_CRUD: CrudRequest = {
  options: {
    query: {
      maxLimit: 500,
      cache: 2000,
      alwaysPaginate: true,
    },
  },
  parsed: {
    fields: [],
    paramsFilter: [],
    search: { $and: [null, {}] },
    filter: [],
    or: [],
    join: [],
    sort: [],
    limit: undefined,
    authPersist: undefined,
    cache: undefined,
    offset: undefined,
    page: undefined,
    classTransformOptions: undefined,
    includeDeleted: 0,
  },
};
