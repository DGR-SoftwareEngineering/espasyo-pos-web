module.exports = function (api) {
  api.cache(true);
  // Only apply web presets during Jest runs; let React Native apps use their own babel.config.js
  if (!api.env("test")) return {};
  return {
    presets: [
      "@babel/preset-env",
      ["@babel/preset-react", { runtime: "automatic" }],
      "@babel/preset-typescript",
    ],
  };
};
