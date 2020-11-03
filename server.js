const Koa = require("koa");
const next = require("next");
const Router = require("koa-router");
const session = require("koa-session");
const Redis = require("ioredis");
const koaBody = require("koa-body");
const atob = require("atob");

const RedisSessionStore = require("./server/session-store");
const auth = require("./server/auth");
const api = require("./server/api");

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

const redis = new Redis();

global.atob = atob;

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();

  server.use(koaBody());

  server.keys = ["zyn next demo"];
  const SESSION_CONFIG = {
    key: "jid",
    // maxAge: 5 * 1000,
    store: new RedisSessionStore(redis),
  };

  server.use(session(SESSION_CONFIG, server));

  auth(server);

  api(server);

  // server.use(async (ctx, next) => {
  //   console.log('session is:', ctx.session)
  //   await next();
  // });

  router.get("/a/:id", async (ctx) => {
    const id = ctx.params.id;
    await handle(ctx.req, ctx.res, {
      pathname: "/a",
      query: {
        id,
      },
    });
    ctx.respond = false;
  });

  router.get("/api/user/info", async (ctx) => {
    const user = ctx.session.userInfo;
    if (user) {
      ctx.body = user;
      ctx.set("Content-Type", "application/json");
    } else {
      ctx.status = 401;
      ctx.body = "Need login";
    }
  });

  // router.get('/set/user', async ctx => {
  //   ctx.session.user = {
  //     name: 'zyn',
  //     age: 22,
  //   };
  //   ctx.body = 'set session successfully';
  // });

  // router.get('/delete/user', async ctx => {
  //   ctx.session = null;
  //   ctx.body = 'delete session successfully';
  // });

  server.use(router.routes());

  server.use(async (ctx) => {
    const { req, res } = ctx;
    ctx.req.session = ctx.session;
    await handle(req, res);

    ctx.respond = false;
  });

  server.listen(3000, () => {
    console.log("http://localhost:3000");
  });
});
