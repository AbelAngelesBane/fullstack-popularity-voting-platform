// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // If you are using Reanimated (which most Expo apps do), 
      // this MUST be at the very bottom of the plugins array.
      "react-native-reanimated/plugin", 
    ],
  };
};