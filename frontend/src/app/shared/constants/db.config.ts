import { DBConfig } from 'ngx-indexed-db';

export const imageDbConfig: DBConfig = {
  name: 'ImageDb',
  version: 1,
  objectStoresMeta: [{
    store: 'images',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'id', keypath: 'id', options: { unique: true } },
      { name: 'image', keypath: 'image', options: { unique: false } },
    ]
  }]
};
