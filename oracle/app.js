import Koa from 'koa';
import co from 'co';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
import cors from 'koa-cors';
import _ from 'lodash';

import * as twilio from './twilio';

const app = new Koa();
const router = require('koa-router')();

app.use(convert(cors()));
app.use(convert(bodyparser()));
app.use(convert(json()));

app.use(co.wrap(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
}));

router.get('/', async (ctx) => {
  ctx.body = `Lava Oracle ${process.env.npm_package_version}`;
});

router.get('/sim/iccid/:iccid', async (ctx) => {
  try {
    const iccid = ctx.params.iccid;

    const SIM = await twilio.getSIMByIccid(iccid);

    if (!SIM) {
      throw new Error();
    }

    ctx.status = 200;
    ctx.body = SIM;
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      error: 'failed to get sim',
    };
  }
});

router.get('/sim/sid/:sid', async (ctx) => {
  try {
    const sid = ctx.params.sid;

    const SIM = await twilio.getSIM(sid);

    if (!SIM) {
      throw new Error();
    }

    ctx.status = 200;
    ctx.body = SIM;
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      error: 'failed to get sim',
    };
  }
});

app.use(router.routes(), router.allowedMethods());

app.on('error', (err, ctx) => {
  console.log('server error', err, ctx);
});

export default app;
