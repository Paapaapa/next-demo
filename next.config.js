// const config = {
//   distDir: '',// 编译文件输出目录
//   generateEtags: true,// 是否给每个路由生成Etag
//   onDemandEntries: {// 页面内容缓存配置
//     maxInactiveAge: 25 * 1000,// 内容在内存中缓存得我市场（ms）
//     pagesBufferLength: 2,// 同时缓存多少页面
//   },
//   pageExtensions: ['jsx', 'js'],// 在pages目录下哪种后缀格式文件会被认为是页面
//   // 配置buildId
//   generateBuildId: async () => {
//     if (process.env.YOUR_BUILD_ID) {
//       return process.env.YOUR_BUILD_ID;
//     }
//     // 返回null使用默认的unique id
//     return null;
//   },
//   // 手动修改webpack config
//   webpack(config, options) {
//     return config;
//   },
//   // 修改webpackDevMiddleware
//   webpackDevMiddleware(config) {
//     return config;
//   },
//   // 可以在页面上通过process.env.customKey获取
//   env: {
//     customKey: 'value',
//   },
//   // 下面两个要通过'next/config'读取
//   // 只有在服务端渲染时才会获取的配置
//   serverRuntimeConfig: {
//     mySecret: 'secret',
//     secondSecret: process.env.SECOND_SECRET,
//   },
//   // 在服务端渲染和客户端渲染都可以获取的配置
//   publicRuntimeConfig: {
//     staticFolder: '/static',
//   },
// };

const { GITHUB_OAUTH_URL, OAUTH_URL } = require("./config");

const withCSS = require("@zeit/next-css");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
const webpack = require("webpack");

module.exports = withBundleAnalyzer(
  withCSS({
    webpack(config) {
      config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
      return config;
    },
    publicRuntimeConfig: {
      GITHUB_OAUTH_URL,
      OAUTH_URL,
    },
    analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE),
    analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig: {
      server: {
        analyzerMode: "static",
        reportFilename: "./bundles/server.html",
      },
      browser: {
        analyzerMode: "static",
        reportFilename: "./bundles/client.html",
      },
    },
  })
);
