import Koa from 'koa';
import co from 'co';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
import cors from 'koa-cors';

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

app.use(router.routes(), router.allowedMethods());

app.on('error', (err, ctx) => {
  console.log('server error', err, ctx);
});

export default app;
