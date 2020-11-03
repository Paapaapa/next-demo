const axios = require("axios");
const {
  github: { client_id, client_secret, request_token_url },
  OAUTH_URL,
} = require("../config");

module.exports = (server) => {
  server.use(async (ctx, next) => {
    if (ctx.path === "/auth") {
      const code = ctx.query.code;
      if (!code) {
        ctx.body = "code not exist";
        return;
      }
      const result = await axios({
        method: "POST",
        url: request_token_url,
        data: {
          code,
          client_id,
          client_secret,
        },
        headers: {
          Accept: "application/json",
        },
      });

      if (result.status === 200 && !(result.data && result.data.error)) {
        ctx.session.githubAuth = result.data;
        const { token_type, access_token } = result.data;
        const userInfoRes = await axios({
          method: "GET",
          url: "https://api.github.com/user",
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
        });
        console.log(userInfoRes.data);
        ctx.session.userInfo = userInfoRes.data;
        ctx.redirect((ctx.session && ctx.session.urlBeforeOAuth) || "/");
        ctx.session.urlBeforeOAuth = "";
      } else {
        const errorMsg = result.data && result.data.error;
        ctx.body = `request token failed ${errorMsg}`;
      }
    } else {
      await next();
    }
  });

  server.use(async (ctx, next) => {
    const { method, path } = ctx;
    if (path === "/logout" && method === "POST") {
      ctx.session = null;
      ctx.body = "logout success";
    } else {
      await next();
    }
  });

  server.use(async (ctx, next) => {
    const { method, path } = ctx;
    if (path === "/prepare-auth" && method === "GET") {
      const {
        query: { url },
      } = ctx;
      ctx.session.urlBeforeOAuth = url;
      // ctx.body = 'ready auth';
      ctx.redirect(OAUTH_URL);
    } else {
      await next();
    }
  });
};
