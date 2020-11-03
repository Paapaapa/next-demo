const Redis = require("ioredis");

const redis = new Redis({
  port: 6379,
});

(async function () {
  await redis.set("test", 123);
  const result = await redis.keys("*");

  console.log(result);
})();
