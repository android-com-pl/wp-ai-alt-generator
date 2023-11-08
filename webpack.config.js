const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
  ...defaultConfig,
  entry: {
    media: "./src/media/index.js",
    editor: "./src/editor/index.tsx",
  },
};
