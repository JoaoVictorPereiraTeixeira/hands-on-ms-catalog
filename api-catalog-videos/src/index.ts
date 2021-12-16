import {RestServer} from '@loopback/rest';
import 'dotenv/config';
import {ApplicationConfig, MicroCatalogApplication} from './application';
import './bootstrap';
'use strict'
const config = require('../config');
export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new MicroCatalogApplication(options);
  await app.boot();
  await app.start();

  const restServer = app.getSync<RestServer>('servers.RestServer')
  const url = restServer.url;
  console.log(`Server is running at a ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
