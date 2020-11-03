const axios = require("axios");

const isServer = typeof window === "undefined";

const github_base_url = "https://api.github.com";

async function requestGithub(method, url, data, headers) {
  return await axios({
    method,
    url: `${github_base_url}${url}`,
    data,
    headers,
  });
}

async function request({ method = "GET", url, data }, req, res) {
  if (!url) {
    throw new Error("url!!!");
  }

  if (isServer) {
    const {
      session: { githubAuth = {} },
    } = req;
    const { token_type, access_token } = githubAuth;

    let headers = {};

    if (access_token) {
      headers.Authorization = `${token_type} ${access_token}`;
    }

    return await requestGithub(method, url, data, headers);
  } else {
    return await axios({
      method,
      url: `/github${url}`,
      data,
    });
  }
}

module.exports = {
  request,
  requestGithub,
};
