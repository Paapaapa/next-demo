import LRU from "lru-cache";

const cache = new LRU({
  maxAge: 1000 * 60 * 60, // 缓存60分钟
});

export function setCache(repo) {
  const { full_name } = repo;
  cache.set(full_name, repo);
}

export function getCache(full_name) {
  return cache.get(full_name);
}

export function cacheArray(repos) {
  repos && Array.isArray(repos) && repos.forEach((repo) => setCache(repo));
}
