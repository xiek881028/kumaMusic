'use strict';

const Router = require('koa-router');

const router = module.exports = new Router();

[
  require('./musicWY'),
  require('./musicQQ'),
  require('./musicKG'),
  require('./musicXM'),
  require('./musicBD'),
].forEach(controller => router.use(controller.routes(), controller.allowedMethods()));
