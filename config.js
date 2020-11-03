const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const SCOPE = "user";
const client_id = "Iv1.1c921f0997d8d126";

module.exports = {
  github: {
    request_token_url: "https://github.com/login/oauth/access_token",
    client_id,
    client_secret: "da74f9f3ddda7137b38d765b7d74e03c17b7ab8d",
  },
  GITHUB_OAUTH_URL,
  OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${client_id}&scope=${SCOPE}`,
};

// token a7048eac85fb6ab2df1ffaaa2b26ae63bcbf7927
