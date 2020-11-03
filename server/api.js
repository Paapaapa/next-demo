// const axios = require('axios');

// const github_base_url = 'https://api.github.com';

const { requestGithub } = require("../lib/api");

module.exports = (server) => {
  server.use(async (ctx, next) => {
    const {
      path,
      url,
      method,
      session: { githubAuth },
    } = ctx;
    if (path.startsWith("/github/")) {
      const { access_token, token_type } = githubAuth;

      let headers = {};

      if (access_token) {
        headers.Authorization = `${token_type} ${access_token}`;
      }

      const res = await requestGithub(
        method,
        url.replace("/github", ""),
        ctx.request.body || {},
        headers
      );

      ctx.status = res.status;
      ctx.body = res.data;
    } else {
      await next();
    }
  });
};

// module.exports = server => {
//   server.use(async (ctx, next) => {
//     const { path, url, session: { githubAuth } } = ctx;
//     if (path.startsWith('/github/')) {
//       const githubPath = `${github_base_url}${url.replace('/github', '')}`;
//       const { access_token, token_type } = githubAuth;

//       let headers = {};

//       if (access_token) {
//         headers.Authorization = `${token_type} ${access_token}`;
//       }

//       try {
//         const result = await axios({
//           method: 'GET',
//           url: githubPath,
//           headers,
//         });
//         ctx.set('Content-Type', 'application/json');
//         if (result.status === 200) {
//           ctx.body = result.data;
//         } else {
//           ctx.status = result.status;
//           ctx.body = {
//             success: false,
//           };
//         }
//       } catch (err) {
//         console.error(err);
//         ctx.body = {
//           success: false,
//         };
//       }
//     }else{
//       await next();
//     }
//   });
// }
